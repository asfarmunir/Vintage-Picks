import { NextRequest, NextResponse } from "next/server";
const coinbase = require("coinbase-commerce-node");
import { dateToFullCronString } from "@/lib/utils";
import { createNotification } from "@/app/api/invoice/create/route";
import { sendNotification } from "@/helper/notifications";
import { AccountStatus, AccountType } from "@prisma/client";
import { connectToDatabase } from "@/lib/database";
import prisma from "@/prisma/client";

const { Webhook } = coinbase;
const webhookSecret = process.env.COINBASE_COMMERCE_SHARED_SECRET;

async function createUserAccount(accountDetails: any, billingDetails: any) {
  const newAcc = await prisma.$transaction(async (prisma) => {
    const createdAccount = await prisma.account.create({
      data: {
        accountType: accountDetails.accountType as AccountType,
        accountSize: accountDetails.accountSize as string,
        status: accountDetails.status as AccountStatus,
        balance: accountDetails.balance as number,
        accountNumber: accountDetails.accountNumber as string,
        userId: accountDetails.userId,
        minBetPeriod: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
        maxBetPeriod: new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    await prisma.billingAddress.create({
      data: {
        address: billingDetails.address,
        city: billingDetails.city,
        country: billingDetails.country,
        email: billingDetails.email,
        firstName: billingDetails.firstName,
        lastName: billingDetails.lastName,
        phone: billingDetails.phone,
        zipCode: billingDetails.postalCode,
        state: billingDetails.state,
        accountId: createdAccount.id,
      },
    });

    return createdAccount;
  });

  try {
    await sendNotification(
      "Account created successfully!",
      "UPDATE",
      accountDetails.userId
    );
  } catch (error) {
    console.error("Error sending notification:", error);
  }
  return newAcc;
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-cc-webhook-signature");

    await connectToDatabase();
    console.log("🚀 ~ Webhook triggered");

    let event = Webhook.verifyEventBody(rawBody, signature, webhookSecret);
    console.log("Received Event:", event);

    // Extract invoice data safely
    const { data } = event;
    const eventId = data?.id;
    const invoiceId = data?.code;
    const userId = data?.metadata?.accountDetails?.userId;


    // Only process successful payments
    if (event.type === "charge:confirmed") {
      console.log("🚀 ~ Charge Confirmed", event);

      // Parse metadata JSON strings
      const accountDetails = JSON.parse(data.metadata.accountDetails);
      const billingDetails = JSON.parse(data.metadata.billingDetails);

      try {
        // Create account invoice
        // await prisma.accountInvoices.create({
        //   data: {
        //     eventId,
        //     invoiceId,
        //     invoiceNumber: data.name,
        //     userId,
        //     amount: Number(data.pricing?.local?.amount),
        //     status: "paid",
        //     paymentMethod: "BTC",
        //     paymentDate: new Date(),
        //   },
        // });

         
        // Send notification
        

        // Create user account
        const newAccount = await createUserAccount(accountDetails, billingDetails);

        // Update invoice status
        await prisma.accountInvoices.updateMany({
          where: { invoiceId },
          data: { status: "paid" },
        });

        // Set CRON jobs for min/max bet periods
        const cronJobs = [
          {
            jobName: `${newAccount.id}_MIN_BET_PERIOD`,
            time: dateToFullCronString(newAccount.minBetPeriod),
            type: "objectiveMin",
            accountId: newAccount.id,
          },
          {
            jobName: `${newAccount.id}_MAX_BET_PERIOD`,
            time: dateToFullCronString(newAccount.maxBetPeriod),
            type: "objectiveMax",
            accountId: newAccount.id,
          },
        ];

        for (const cronJob of cronJobs) {
          const response = await fetch(
            `${process.env.BG_SERVICES_URL}/add-cron-job`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(cronJob),
            }
          );

          if (!response.ok) {
            throw new Error(`Failed to create CRON job: ${await response.text()}`);
          }
        }
      } catch (error) {
        console.error("🚀 Error processing charge:confirmed event:", error);
        return NextResponse.json(
          { success: false, error: "Error processing payment" },
          { status: 400 }
        );
      }
    }

    if (event.type === "charge:pending") {
      console.log("🚀 ~ Charge Pending", event);
    }

    if (event.type === "charge:failed") {
      console.log("🚀 ~ Charge Failed", event);
      
      await prisma.accountInvoices.updateMany({
        where: { invoiceId },
        data: { status: "failed" },
      });
    }

    return NextResponse.json({ success: true, id: event.id });
  } catch (error) {
    console.error("🚀 Webhook Processing Error:", error);
    return NextResponse.json(
      { success: false, error: "Webhook processing failed" },
      { status: 400 }
    );
  }
}







// import { NextRequest, NextResponse } from "next/server";
// const coinbase = require("coinbase-commerce-node");
// import { dateToFullCronString } from "@/lib/utils";
// import { createNotification } from "@/app/api/invoice/create/route";
// import { sendNotification } from "@/helper/notifications";
// import { AccountStatus, AccountType } from "@prisma/client";
// import { connectToDatabase } from "@/lib/database";
// import prisma from "@/prisma/client";


// const { Webhook } = coinbase;

// const webhookSecret = process.env.COINBASE_COMMERCE_SHARED_SECRET;

// type cronJobTypes = "objectiveMin" | "objectiveMax" | "inactivity";
// interface cronJob {
//   jobName: string;
//   time: string;
//   type: cronJobTypes;
//   accountId: string;
// }


// async function createUserAccount(
//    accountDetails: any,
//   billingDetails: any
// ) {

//   const newAcc = await prisma.$transaction(async (prisma) => {
//     // Step 1: Create the new account
//     const createdAccount = await prisma.account.create({
//       data: {
//         accountType: accountDetails.accountType as AccountType,
//         accountSize: accountDetails.accountSize as string,
//         status: accountDetails.status as AccountStatus,
//         balance: accountDetails.balance as number,
//         accountNumber: accountDetails.accountNumber as string,
//         userId: accountDetails.userId,
//         minBetPeriod: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
//         maxBetPeriod: new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
//       },
//     });

//     // Step 2: Create the billing address linked to the account
//     await prisma.billingAddress.create({
//       data: {
//         address: billingDetails.address,
//         city: billingDetails.city,
//         country: billingDetails.country,
//         email: billingDetails.email,
//         firstName: billingDetails.firstName,
//         lastName: billingDetails.lastName,
//         phone: billingDetails.phone,
//         zipCode: billingDetails.postalCode,
//         state: billingDetails.state,
//         accountId: createdAccount.id, // Link to the newly created account
//       },
//     });

//     return createdAccount; // Return the created account
//   });

//   try {
//     await sendNotification(
//       "Account created successfully",
//       "UPDATE",
//       accountDetails.userId
//     );
//   } catch (error) {
//     console.error("Error sending notification:", error);
//   }

//   return newAcc;
// }

// export async function POST(req: NextRequest) {
//   try {
//     const rawBody = await req.text();
//     const signature = req.headers.get("x-cc-webhook-signature");

//     await connectToDatabase();

//     console.log("🚀 ~ POST ~ webhook triggered");
//     console.log("signature", signature);
//     console.log("webhookSecret", webhookSecret);

//     let event = Webhook.verifyEventBody(rawBody, signature, webhookSecret);
//     console.log("event", event);

//     const existingEvent = await prisma.accountInvoices.findFirst({
//       where: {
//         eventId: event?.data?.id
//       },
//     });
//     if (existingEvent) {
//       console.log("Duplicate event received. Skipping...");
//       return NextResponse.json("Event already processed");
//     }

//     if (event.type === "charge:pending") {
//       console.log("🚀 ~ pending payment", event);
//     }

//     if (event.type === "charge:confirmed") {
//       console.log("🚀 ~ charge confirmed", event);
      

//       try {
//         // Create account invoice
//         await prisma.accountInvoices.create({
//           data: {
//             eventId: event?.data?.id,
//             invoiceId: event.data.code,
//             invoiceNumber: event.data.name,
//             userId: event.data.metadata.accountDetails?.userId,
//             amount: Number(event.data.pricing?.local?.amount),
//             status: "paid",
//             paymentMethod: "BTC",
//             paymentDate: new Date(),
//           },
//         });
//       } catch (error) {
//         console.error("Error creating account invoice:", error);
//         throw new Error("Failed to create account invoice");
//       }

//       try {
//         // Create notification
//         await createNotification(
//           "Invoice created successfully. Awaiting payment confirmation.",
//           "UPDATE",
//           event.data.metadata.accountDetails?.userId
//         );
//       } catch (error) {
//         console.error("Error creating notification:", error);
//         throw new Error("Failed to create notification");
//       }

//       let newAccount;
//       try {
//         // Create user account
//         newAccount = await createUserAccount(
//           event.data.metadata.accountDetails,
//           event.data.metadata.billingDetails
//         );
//       } catch (error) {
//         console.error("Error creating user account:", error);
//         throw new Error("Failed to create user account");
//       }

//       try {
//         // Update account invoices
//         await prisma.accountInvoices.updateMany({
//           where: {
//             invoiceId: event.data.code,
//           },
//           data: {
//             status: "paid",
//           },
//         });
//       } catch (error) {
//         console.error("Error updating account invoices:", error);
//         throw new Error("Failed to update account invoices");
//       }

//       try {
//         // Set CRON job for minimum bet period
//         const sevenday_cron_job = {
//           jobName: `${newAccount.id}_MIN_BET_PERIOD`,
//           time: dateToFullCronString(newAccount.minBetPeriod),
//           type: "objectiveMin",
//           accountId: newAccount.id,
//         };

//         const objectiveMinJob = await fetch(
//           `${process.env.BG_SERVICES_URL}/add-cron-job`,
//           {
//             method: "POST",
//             headers: {
//               "Content-Type": "application/json",
//             },
//             body: JSON.stringify(sevenday_cron_job),
//           }
//         );

//         if (!objectiveMinJob.ok) {
//           throw new Error(await objectiveMinJob.text());
//         }
//       } catch (error) {
//         console.error("Error setting CRON job for minimum bet period:", error);
//         throw new Error("Failed to set CRON job for minimum bet period");
//       }

//       try {
//         // Set CRON job for maximum bet period
//         const thirtyday_cron_job = {
//           jobName: `${newAccount.id}_MAX_BET_PERIOD`,
//           time: dateToFullCronString(newAccount.maxBetPeriod),
//           type: "objectiveMax",
//           accountId: newAccount.id,
//         };

//         const objectiveMaxJob = await fetch(
//           `${process.env.BG_SERVICES_URL}/add-cron-job`,
//           {
//             method: "POST",
//             headers: {
//               "Content-Type": "application/json",
//             },
//             body: JSON.stringify(thirtyday_cron_job),
//           }
//         );

//         if (!objectiveMaxJob.ok) {
//           throw new Error(await objectiveMaxJob.text());
//         }
//       } catch (error) {
//         console.error("Error setting CRON job for maximum bet period:", error);
//         throw new Error("Failed to set CRON job for maximum bet period");
//       }
//     }

//     if (event.type === "charge:failed") {
//       console.log("🚀 ~ charge failed", event);
//     }

//     return NextResponse.json({ success: true, id: event.id });
//   } catch (error) {
//     console.error("Error processing webhook:", error);
//     return NextResponse.json(
//       { success: false, error: "Failure to process webhook" },
//       { status: 400 }
//     );
//   }
// }


