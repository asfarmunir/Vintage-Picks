import { NextRequest, NextResponse } from "next/server";
const coinbase = require("coinbase-commerce-node");
const { Webhook } = coinbase;

const webhookSecret = process.env.COINBASE_COMMERCE_SHARED_SECRET;

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text(); 
    const signature = req.headers.get("x-cc-webhook-signature");

    console.log("🚀 ~ POST ~ webhook triggered");
    console.log("signature", signature);
    console.log("webhookSecret", webhookSecret);

    const event = Webhook.verifyEventBody(rawBody, signature, webhookSecret);
    console.log("event", event);

    if (event.type === "charge:pending") {
      console.log("🚀 ~ pending payment", event);
    }

    if (event.type === "charge:confirmed") {
      console.log("🚀 ~ charge confirmed", event);
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
