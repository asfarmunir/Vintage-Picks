import axios, { AxiosRequestConfig } from "axios";
import { NextResponse } from "next/server";

// Define TypeScript types for the expected request payload
interface CardDetails {
  name: string;
  number: string;
  exp: string; // Format: "MM/YY"
  cvv: number;
  address: {
    country: string;
    state: string;
    city: string;
    street: string;
    zip: string;
  };
}

interface PaymentPayload {
  terminal: {
    id: number;
  };
  amount: string;
  source: string;
  level: number;
  card: CardDetails;
  contact: {
    email: string;
  };
  sendReceipt: string;
}

interface RequestBody {
  amount: string;
  name: string;
  cardNumber: string;
  exp: string;
  cvv: number;
  country: string;
  state: string;
  city: string;
  street: string;
  zip: string;
  email: string;
}

export async function POST(req: Request) {
  try {
    // Parse the request body
    const body: RequestBody = await req.json();

    // Validate the incoming request
    if (
      !body.amount ||
      !body.name ||
      !body.cardNumber ||
      !body.exp ||
      !body.cvv ||
      !body.country ||
      !body.state ||
      !body.city ||
      !body.street ||
      !body.zip ||
      !body.email
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Construct the payload
    const data: PaymentPayload = {
      terminal: {
        id: 24, // Terminal ID
      },
      amount: body.amount,
      source: "Internet",
      level: 1,
      card: {
        name: body.name,
        number: body.cardNumber,
        exp: body.exp,
        cvv: body.cvv,
        address: {
          country: body.country,
          state: body.state,
          city: body.city,
          street: body.street,
          zip: body.zip,
        },
      },
      contact: {
        email: body.email,
      },
      sendReceipt: "Yes",
    };

    // Axios configuration
    const config: AxiosRequestConfig = {
      method: "post",
      maxBodyLength: Infinity,
      url: "https://gateway.zendashboard.com/payment/auth",
      headers: {
        "Content-Type": "application/json",
      },
      data: data,
    };

    // Make the API request
    const response = await axios(config);
    console.log("response", response);

    return NextResponse.json({
      message: "Payment successful!",
      data: response.data,
    });
  } catch (error: any) {
    // Handle JSON parsing and other errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid JSON format" },
        { status: 400 }
      );
    }
    console.log("error", error);

    console.error("Payment failed:", error.response?.data || error.message);

    return NextResponse.json(
      {
        message: "Payment failed",
        error: error.response?.data || error.message,
      },
      { status: 500 }
    );
  }
}
