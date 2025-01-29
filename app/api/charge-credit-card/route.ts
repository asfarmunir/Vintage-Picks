import * as ApiContracts from "authorizenet/lib/apicontracts";
import * as ApiControllers from "authorizenet/lib/apicontrollers";
import { NextRequest, NextResponse } from "next/server";
import { dateToFullCronString } from "@/lib/utils";
import { sendNotification } from "@/helper/notifications";
import { AccountStatus, AccountType, NotificationType } from "@prisma/client";
import { connectToDatabase } from "@/lib/database";
import prisma from "@/prisma/client";
import { generateCustomId } from "@/helper/keyGenerator";

type cronJobTypes = "objectiveMin" | "objectiveMax" | "inactivity";
interface cronJob {
  jobName: string;
  time: string;
  type: cronJobTypes;
  accountId: string;
}


async function createUserAccount(
  accountDetails: any,
  billingDetails: any,
  userId: string
) {
  console.log("🚀 ~ billingDetails:", billingDetails)
  console.log("accountDetails", accountDetails);

  const newAcc = await prisma.$transaction(async (prisma) => {
    // Step 1: Create the new account
    const createdAccount = await prisma.account.create({
      data: {
        accountType: accountDetails.accountType as AccountType,
        accountSize: accountDetails.accountSize,
        status: accountDetails.status as AccountStatus,
        balance: parseInt(accountDetails.accountSize.replace("K", "000")),
        // accountNumber: accountDetails.accountNumber,
        accountNumber: generateCustomId(),
        userId: userId,
        minBetPeriod: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        maxBetPeriod: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      },
    });

    // Step 2: Create the billing address linked to the account
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

  // enable it 
  try {
    await sendNotification("Account created successfully", "UPDATE", userId);
  } catch (error) {
    console.error("Error sending notification:", error);
  }

  return newAcc;
}

export async function POST(req: NextRequest) {
  if (req.method !== "POST") {
    return NextResponse.json(
      { message: "Method Not Allowed" },
      { status: 405 }
    );
  }
  // await connectToDatabase();
  try {
    const {
      account,
      billingDetailsData,
      cardCode,
      cardNumber,
      email,
      expirationDate,
      userId,
    } = await req.json();
    // Authorize.Net Authentication
    const merchantAuthentication =
      new ApiContracts.MerchantAuthenticationType();
    merchantAuthentication.setName(
      process.env.AUTHORIZENET_LOGIN_ID_SANDBOX || ""
    );
    merchantAuthentication.setTransactionKey(
      process.env.AUTHORIZENET_TRANSACTION_KEY_SANDBOX || ""
    );

    // Credit Card Information
    const creditCard = new ApiContracts.CreditCardType();
    creditCard.setCardNumber(cardNumber);
    creditCard.setExpirationDate(expirationDate);
    creditCard.setCardCode(cardCode);

    const paymentType = new ApiContracts.PaymentType();
    paymentType.setCreditCard(creditCard);

    // Billing Address Information
    const billTo = new ApiContracts.CustomerAddressType();
    billTo.setFirstName(billingDetailsData.firstName);
    billTo.setLastName(billingDetailsData.lastName);
    billTo.setAddress(billingDetailsData.address);
    billTo.setCity(billingDetailsData.city);
    billTo.setState(billingDetailsData.state);
    billTo.setZip(billingDetailsData.postalCode);
    billTo.setCountry(billingDetailsData.country);
    billTo.setEmail(email);

    // Transaction Request
    const transactionRequest = new ApiContracts.TransactionRequestType();
    transactionRequest.setTransactionType(
      ApiContracts.TransactionTypeEnum.AUTHCAPTURETRANSACTION
    );
    transactionRequest.setPayment(paymentType);
    transactionRequest.setBillTo(billTo);
    transactionRequest.setAmount(
      parseFloat(account.accountPrice.replace("$", ""))
    );

    // API Request
    const createRequest = new ApiContracts.CreateTransactionRequest();
    createRequest.setMerchantAuthentication(merchantAuthentication);
    createRequest.setTransactionRequest(transactionRequest);

    // Execute Transaction
    const controller = new ApiControllers.CreateTransactionController(
      createRequest.getJSON()
    );

    // https://api.authorize.net/xml/v1/request.api  // Production
    controller.setEnvironment(
      "https://apitest.authorize.net/xml/v1/request.api"
    );
    const response = await new Promise<ApiContracts.CreateTransactionResponse>(
      (resolve, reject) => {
        controller.execute(() => {

          const apiResponse = controller.getResponse();
          const transactionResponse =
            new ApiContracts.CreateTransactionResponse(apiResponse);

          if (
            transactionResponse.getMessages().getResultCode() ===
            ApiContracts.MessageTypeEnum.OK
          ) {

            resolve(transactionResponse);
          } else {

            const error =
              transactionResponse.getMessages()?.getMessage()?.[0]?.getText() ||
              "Transaction Failed";
              // if(transactionResponse.TransactionResponse)
              
            reject(new Error(error));
          }
        });
      }
    );

    const transactionResponse = response.getTransactionResponse();
    const transactionId = transactionResponse.getTransId();

    if (transactionResponse.getResponseCode() === "1") {
      // Create Account Invoice
      await prisma.accountInvoices.create({
        data: {
          invoiceNumber: `Invoice-${Date.now()}`,
          userId: userId,
          amount: parseFloat(account.accountPrice.replace("$", "")),
          status: "paid",
          paymentMethod: "CreditCard",
          paymentDate: new Date(),
        },
      });

      // Create User Account
      const newAccount = await createUserAccount(
        account,
        billingDetailsData,
        userId
      );

      // // Set CRON Jobs
      // const cronJobs = [
      //   {
      //     jobName: `${newAccount.id}_MIN_BET_PERIOD`,
      //     time: dateToFullCronString(newAccount.minBetPeriod),
      //     type: "objectiveMin",
      //     accountId: newAccount.id,
      //   },
      //   {
      //     jobName: `${newAccount.id}_MAX_BET_PERIOD`,
      //     time: dateToFullCronString(newAccount.maxBetPeriod),
      //     type: "objectiveMax",
      //     accountId: newAccount.id,
      //   },
      // ];

      // for (const job of cronJobs) {
      //   const cronResponse = await fetch(
      //     `${process.env.BG_SERVICES_URL}/add-cron-job`,
      //     {
      //       method: "POST",
      //       headers: { "Content-Type": "application/json" },
      //       body: JSON.stringify(job),
      //     }
      //   );

      //   if (!cronResponse.ok) {
      //     throw new Error(
      //       `Failed to create cron job: ${await cronResponse.text()}`
      //     );
      //   }
      // }

      // set CRON job for minimum Bet Period
              const sevenday_cron_job: cronJob = {
                jobName: `${newAccount.id}_MIN_BET_PERIOD`,
                time: dateToFullCronString(newAccount.minBetPeriod),
                type: "objectiveMin",
                accountId: newAccount.id,
              };
              const objectiveMinJob =  await fetch(`${process.env.BG_SERVICES_URL}/add-cron-job`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(sevenday_cron_job),
              });
              if (!objectiveMinJob.ok) {
                throw new Error(await objectiveMinJob.text());
              }
      
              // set CRON job for maximum Bet Period
              const thirtyday_cron_job: cronJob = {
                jobName: `${newAccount.id}_MAX_BET_PERIOD`,
                time: dateToFullCronString(newAccount.maxBetPeriod),
                type: "objectiveMax",
                accountId: newAccount.id,
              };
              const objectiveMaxJob = await fetch(`${process.env.BG_SERVICES_URL}/add-cron-job`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(thirtyday_cron_job),
              });
              if (!objectiveMaxJob.ok) {
                throw new Error(await objectiveMaxJob.text());
              }


      console.log("Transaction Approved");
      return NextResponse.json({
        success: true,
        message: "Transaction Approved",
        // transactionId,
        // accountId: newAccount.id,
      });
    } else {
      return NextResponse.json({
        success: false,
        message: "Transaction Failed",
      });
    }
  } catch (error: any) {
    console.error("Transaction Error occured:", error.message);
    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// export const createNotification = async (
//   message: string,
//   type: NotificationType,
//   userId: string
// ) => {
//   console.log("userId", userId);

//   try {
//     const notification = await prisma.notification.create({
//       data: {
//         content: message,
//         type,
//         userId: userId,
//         read: false,
//       },
//     });

//     const response = await fetch(
//       `${process.env.BG_SERVICES_URL}/generate-notification`,
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           userId,
//           message: notification.content,
//         }),
//       }
//     );

//     if (response.ok) {
//       console.log(await response.text());
//       throw new Error("Notification Created Successfully");
//     }
//   } catch (error) {
//     console.error(error);
//     throw new Error("Failed to create notification");
//   }
// };
