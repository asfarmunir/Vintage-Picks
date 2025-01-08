import { NextRequest, NextResponse } from "next/server";
const coinbase = require("coinbase-commerce-node");
import {createNotification}  from "@/app/api/invoice/create/route";
import { connectToDatabase } from "@/lib/database";
import prisma from "@/prisma/client";
import { NextApiResponse } from "next";
const { Webhook } = coinbase;

const webhookSecret = process.env.COINBASE_COMMERCE_SHARED_SECRET;

// export const config = {
//   api: {
//     bodyParser: false,
//   },
// };

export async function POST(req: NextRequest,res:NextApiResponse) {
  try {
    const rawBody = await req.text(); 
    const signature = req.headers.get("x-cc-webhook-signature");

    await connectToDatabase();

    console.log("🚀 ~ POST ~ webhook triggered");
    console.log("signature", signature);
    console.log("webhookSecret", webhookSecret);

    let event = Webhook.verifyEventBody(rawBody, signature, webhookSecret);
    console.log("event", event);

    
    const existingEvent = await prisma.accountInvoices.findUnique({
      where: {
        coinBaseEventId: event?.id
      }
  });
    if (existingEvent) {
      console.log("Duplicate event received. Skipping...");
      return res.status(200).send("Event already processed");
    }

    if (event.type === "charge:pending") {
      console.log("🚀 ~ pending payment", event);
    }

    if (event.type === "charge:confirmed") {
      console.log("🚀 ~ charge confirmed", event);
     
      await prisma.accountInvoices.create({
        data: {
          coinBaseEventId: event?.id,
          invoiceNumber:event.data.name(false, false),
          userId: event.data.metadata.accountDetails,
          amount: Number( event.data.metadata.amount.replace("$", "")),
          paymentMethod: "BTC",
          paymentDate: new Date(),
        },
      });

      await createNotification(
        "Invoice created successfully. Awaiting payment confirmation.",
        "UPDATE",
        "user.id"
      );


    }

    if (event.type === "charge:failed") {
      console.log("🚀 ~ charge failed", event);
    }

    return NextResponse.json({ success: true, id: event.id });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json({ success: false, error: "Failure to process webhook" }, { status: 400 });
  }
}
