import { NextRequest, NextResponse } from "next/server";
const coinbase = require("coinbase-commerce-node");
import { dateToFullCronString } from "@/lib/utils";
import { createNotification } from "@/app/api/invoice/create/route";
import { sendNotification } from "@/helper/notifications";
import { AccountStatus, AccountType } from "@prisma/client";
import { connectToDatabase } from "@/lib/database";
import prisma from "@/prisma/client";
import { NextApiResponse } from "next";


const { Webhook } = coinbase;

const webhookSecret = process.env.COINBASE_COMMERCE_SHARED_SECRET;

type cronJobTypes = "objectiveMin" | "objectiveMax" | "inactivity";
interface cronJob {
  jobName: string;
  time: string;
  type: cronJobTypes;
  accountId: string;
}

// export const config = {
//   api: {
//     bodyParser: false,
//   },
// };

async function createUserAccount(reference: any) {
  const accountDetails = JSON.parse(reference).accountDetails;
  const billinDetails = JSON.parse(reference).billingDetails;

  const newAcc = await prisma.$transaction(async (prisma) => {
    // Step 1: Create the new account
    const createdAccount = await prisma.account.create({
      data: {
        accountType: accountDetails.accountType as AccountType,
        accountSize: accountDetails.accountSize as string,
        status: accountDetails.status as AccountStatus,
        balance: accountDetails.balance as number,
        accountNumber: accountDetails.accountNumber as string,
        userId: accountDetails.userId,
        minBetPeriod: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        maxBetPeriod: new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      },
    });

    // Step 2: Create the billing address linked to the account
    await prisma.billingAddress.create({
      data: {
        address: billinDetails.address,
        city: billinDetails.city,
        country: billinDetails.country,
        email: billinDetails.email,
        firstName: billinDetails.firstName,
        lastName: billinDetails.lastName,
        phone: billinDetails.phone,
        zipCode: billinDetails.postalCode,
        state: billinDetails.state,
        accountId: createdAccount.id, // Link to the newly created account
      },
    });

    return createdAccount; // Return the created account
  });

  try {
    await sendNotification(
      "Account created successfully",
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

    console.log("🚀 ~ POST ~ webhook triggered");
    console.log("signature", signature);
    console.log("webhookSecret", webhookSecret);

    let event = Webhook.verifyEventBody(rawBody, signature, webhookSecret);
    console.log("event", event);

    const existingEvent = await prisma.accountInvoices.findFirst({
      where: {
        coinBaseEventId: event?.id.toString(),
      },
    });
    if (existingEvent) {
      console.log("Duplicate event received. Skipping...");
      return NextResponse.json("Event already processed");
    }

    if (event.type === "charge:pending") {
      console.log("🚀 ~ pending payment", event);
    }

    if (event.type === "charge:confirmed") {
      console.log("🚀 ~ charge confirmed", event);

      try {
        // Create account invoice
        await prisma.accountInvoices.create({
          data: {
            coinBaseEventId: event?.id,
            invoiceNumber: event.data.name,
            userId: event.data.metadata.accountDetails,
            amount: Number(event.data.metadata.amount),
            paymentMethod: "BTC",
            paymentDate: new Date(),
          },
        });
      } catch (error) {
        console.error("Error creating account invoice:", error);
        throw new Error("Failed to create account invoice");
      }

      try {
        // Create notification
        await createNotification(
          "Invoice created successfully. Awaiting payment confirmation.",
          "UPDATE",
          "user.id"
        );
      } catch (error) {
        console.error("Error creating notification:", error);
        throw new Error("Failed to create notification");
      }

      let newAccount;
      try {
        // Create user account
        newAccount = await createUserAccount(event.reference);
      } catch (error) {
        console.error("Error creating user account:", error);
        throw new Error("Failed to create user account");
      }

      try {
        // Update account invoices
        await prisma.accountInvoices.updateMany({
          where: {
            invoiceId: event.invoiceId,
          },
          data: {
            status: "paid",
          },
        });
      } catch (error) {
        console.error("Error updating account invoices:", error);
        throw new Error("Failed to update account invoices");
      }

      try {
        // Set CRON job for minimum bet period
        const sevenday_cron_job = {
          jobName: `${newAccount.id}_MIN_BET_PERIOD`,
          time: dateToFullCronString(newAccount.minBetPeriod),
          type: "objectiveMin",
          accountId: newAccount.id,
        };

        const objectiveMinJob = await fetch(
          `${process.env.BG_SERVICES_URL}/add-cron-job`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(sevenday_cron_job),
          }
        );

        if (!objectiveMinJob.ok) {
          throw new Error(await objectiveMinJob.text());
        }
      } catch (error) {
        console.error("Error setting CRON job for minimum bet period:", error);
        throw new Error("Failed to set CRON job for minimum bet period");
      }

      try {
        // Set CRON job for maximum bet period
        const thirtyday_cron_job = {
          jobName: `${newAccount.id}_MAX_BET_PERIOD`,
          time: dateToFullCronString(newAccount.maxBetPeriod),
          type: "objectiveMax",
          accountId: newAccount.id,
        };

        const objectiveMaxJob = await fetch(
          `${process.env.BG_SERVICES_URL}/add-cron-job`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(thirtyday_cron_job),
          }
        );

        if (!objectiveMaxJob.ok) {
          throw new Error(await objectiveMaxJob.text());
        }
      } catch (error) {
        console.error("Error setting CRON job for maximum bet period:", error);
        throw new Error("Failed to set CRON job for maximum bet period");
      }
    }

    if (event.type === "charge:failed") {
      console.log("🚀 ~ charge failed", event);
    }

    return NextResponse.json({ success: true, id: event.id });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { success: false, error: "Failure to process webhook" },
      { status: 400 }
    );
  }
}
