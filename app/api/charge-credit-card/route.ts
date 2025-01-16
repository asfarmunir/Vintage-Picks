import type { NextApiRequest, NextApiResponse } from 'next';
import * as ApiContracts from 'authorizenet/lib/apicontracts';
import * as ApiControllers from 'authorizenet/lib/apicontrollers';
import * as SDKConstants from 'authorizenet/lib/constants';

type ChargeCreditCardRequest = {
  cardNumber: string;
  expirationDate: string;
  cardCode: string;
  amount: number;
  paymentPlan?: string;
  couponCodeUsed?: string;
  planName?: string;
  login?: boolean;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    const {
      cardNumber,
      expirationDate,
      cardCode,
      amount,
      paymentPlan,
      couponCodeUsed,
      planName,
      login,
    } = req.body as ChargeCreditCardRequest;

    // Simulated User ID and Email (No DB)
    const userID = 'mock-user-id';
    const email = 'mock-user@example.com';

    // Calculate amount based on login
    let amountPayable = amount;
    if (login) {
      amountPayable = 97; // Example logic for amount adjustment
    }

    console.log('Processing credit card transaction...');

    // Authorize.Net Authentication
    const merchantAuthenticationType = new ApiContracts.MerchantAuthenticationType();
    merchantAuthenticationType.setName(process.env.AUTHORIZENET_LOGIN_ID!);
    merchantAuthenticationType.setTransactionKey(process.env.AUTHORIZENET_TRANSACTION_KEY!);

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
    ctrl.setEnvironment(SDKConstants.endpoint.production); // Use sandbox for testing

    let response;
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
      return res.status(200).json({
        success: true,
        message,
        transactionId: transactionResponse.getTransId(),
        amount: amountPayable,
        email,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: `Transaction ${message}`,
        details: transactionResponse,
      });
    }
  } catch (error: any) {
    console.error('Error processing transaction:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong during the transaction process.',
      error: error.message,
    });
  }
}
