import prisma from '@/prisma/client';
import * as ApiContracts from 'authorizenet/lib/apicontracts';
import * as ApiControllers from 'authorizenet/lib/apicontrollers';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const {
      cardNumber,
      expirationDate,
      cardCode,
      amount,
      email,
      account,
      billingDetails
    } = await req.json();

    
    let amountPayable
      amountPayable = amount; // Example logic for amount adjustment
      // const session = await getServerSession();
      // if (!session) {
      //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      // }
  
      // const user = await prisma.user.findFirst({
      //   where: {
      //     email: session.user?.email,
      //   },
      // });
      // if (!user) {
      //   return NextResponse.json({ error: "User not found" }, { status: 404 });
      // }
  

    console.log('Processing credit card transaction...');

    // Authorize.Net Authentication
    const merchantAuthenticationType = new ApiContracts.MerchantAuthenticationType();
    merchantAuthenticationType.setName(process.env.AUTHORIZENET_LOGIN_ID_SANDBOX);
    merchantAuthenticationType.setTransactionKey(process.env.AUTHORIZENET_TRANSACTION_KEY_SANDBOX);

    // Credit Card Information
    const creditCard = new ApiContracts.CreditCardType();
    creditCard.setCardNumber(cardNumber);
    creditCard.setExpirationDate(expirationDate);
    creditCard.setCardCode(cardCode);

    const paymentType = new ApiContracts.PaymentType();
    paymentType.setCreditCard(creditCard);

    // Transaction Request
    const transactionRequestType = new ApiContracts.TransactionRequestType();
    transactionRequestType.setTransactionType(
      ApiContracts.TransactionTypeEnum.AUTHCAPTURETRANSACTION
    );
    transactionRequestType.setPayment(paymentType);
    transactionRequestType.setAmount(amountPayable);

    // API Request
    const createRequest = new ApiContracts.CreateTransactionRequest();
    createRequest.setMerchantAuthentication(merchantAuthenticationType);
    createRequest.setTransactionRequest(transactionRequestType);

    const ctrl = new ApiControllers.CreateTransactionController(createRequest.getJSON());
    ctrl.setEnvironment('https://apitest.authorize.net/xml/v1/request.api'); 

    let response: any;
    await new Promise<void>((resolve, reject) => {
      ctrl.execute(() => {
        const apiResponse = ctrl.getResponse();
        response = apiResponse ? new ApiContracts.CreateTransactionResponse(apiResponse) : null;

        if (
          response &&
          response.getMessages().getResultCode() === ApiContracts.MessageTypeEnum.OK
        ) {
          resolve();
        } else {
          const errorMessage =
            response?.getMessages()?.getMessage()[0]?.getText() || 'Unknown error';
          reject(new Error(errorMessage));
        }
      });
    });

    console.log('Transaction completed.');

    const transactionResponse = response.getTransactionResponse();
    const responseCode = transactionResponse.getResponseCode();

    // Handle transaction response
    let message: string;
    switch (responseCode) {
      case '1':
        message = 'Approved';
        break;
      case '2':
        message = 'Declined';
        break;
      case '3':
        message = 'Error';
        break;
      case '4':
        message = 'Held for Review';
        break;
      default:
        message = 'Unknown';
    }

    if (responseCode === '1') {
      return NextResponse.json({
        success: true,
        message,
        transactionId: transactionResponse.getTransId(),
        amount: amountPayable,
        email,
      });
    } else {
      return NextResponse.json({
        success: false,
        message: `Transaction ${message}`,
        details: transactionResponse,
      });
    }
  } catch (error: any) {
    console.error('Error processing transaction:', error.message);
    return NextResponse.json({
      success: false,
      message: 'Something went wrong during the transaction process.',
      error: error.message,
    });
  }
}
