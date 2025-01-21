import * as ApiContracts from "authorizenet/lib/apicontracts";
import * as ApiControllers from "authorizenet/lib/apicontrollers";
import { NextRequest, NextResponse } from "next/server";


export async function POST(req: NextRequest) {
  if (req.method !== "POST") {
    return NextResponse.json({ message: "Method Not Allowed" });
  }

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
              "Error";
            reject(new Error(error));
          }
        });
      }
    );

    // Extract Response Details
    const transactionResponse = response.getTransactionResponse();
    const transactionId = transactionResponse.getTransId();
    const responseCode = transactionResponse.getResponseCode();

    // console.log("responseCode", responseCode);
    // console.log("transactionResponse", transactionResponse);

    if (responseCode === "1") {
      return NextResponse.json({
        success: true,
        message: "Transaction Approved",
        transactionId,
        amount: account.accountPrice,
        email,
        billingDetailsData,
        account,
      });
    } else {
      return NextResponse.json({
        success: false,
        message: "Transaction Failed",
        responseCode,
      });
    }
  } catch (error: any) {
    console.error("Transaction Error:", error.message);
    return NextResponse.json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
}
