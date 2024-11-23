import { getAccountUnlockedEmailTemplate, getBreachedEmailTemplate, getFundedEmailTemplate } from "@/lib/email-templates/account";
import { getAffiliateSaleEmailTemplate } from "@/lib/email-templates/affiliate";
import { getContractEmailTemplate } from "@/lib/email-templates/contract";
import { getKycEmailTemplate } from "@/lib/email-templates/kyc";
import { getPhaseCompleteEmailTemplate } from "@/lib/email-templates/phase-complete";
import { getPickLossEmailTemplate } from "@/lib/email-templates/pick-loss";
import { getPickWonEmailTemplate } from "@/lib/email-templates/pick-won";
import { getResetPasswordEmailTemplate } from "@/lib/email-templates/reset";
import { getSignupEmailTemplate } from "@/lib/email-templates/signup";
import { getWelcomePhase1EmailTemplate, getWelcomePhase2EmailTemplate, getWelcomePhase3EmailTemplate } from "@/lib/email-templates/welcome";
import formData from "form-data";
import Mailgun from "mailgun.js";

const mailgun = new Mailgun(formData);
const client = mailgun.client({
  username: "api",
  key: process.env.MAILGUN_API_KEY!,
});

export const sendEmail = async (to:string, subject:string, text:string) => {
  try {
    const response = await client.messages.create(process.env.MAILGUN_DOMAIN!, {
      from: `Your App <no-reply@${process.env.MAILGUN_DOMAIN}>`,
      to,
      subject,
      text,
    });
    return response;
  } catch (error) {
    console.error("Mailgun Error:", error);
    throw error;
  }
};

export async function sendGreetingEmail(to: string, name: string) {
    try {

    const response = await client.messages.create(process.env.MAILGUN_DOMAIN!, {
      from: `Your App <no-reply@${process.env.MAILGUN_DOMAIN}>`,
      to,
      subject: getSignupEmailTemplate(name).title,
      html: getSignupEmailTemplate(name).template,
    });

     return response;

    } catch (error) {
        console.error("Mailgun Error:", error);
        throw error;
    }
 
}

export async function send2FACodeEmail(userEmail: string, code: string) {

    try {

    const response = await client.messages.create(process.env.MAILGUN_DOMAIN!, {
      from: `Your App <no-reply@${process.env.MAILGUN_DOMAIN}>`,
      to: userEmail,
     subject: "Your 2FA Code",
    text: `Your 2FA code is: ${code}. It is valid for 10 minutes.`,
    html: `<strong>Your 2FA code is: ${code}</strong>. It is valid for 10 minutes.`,
    });

     return response;

    } catch (error) {
        console.error("Mailgun Error:", error);
        throw error;
    }
 
}

export async function sendPasswordResetEmail(
  userEmail: string,
  resetLink: string
) {

     try {

    const response = await client.messages.create(process.env.MAILGUN_DOMAIN!, {
      from: `Your App <no-reply@${process.env.MAILGUN_DOMAIN}>`,
      to: userEmail,
        subject: getResetPasswordEmailTemplate(resetLink).title,
        text: `You requested a password reset. Click here to reset your password: ${resetLink}`,
        html: getResetPasswordEmailTemplate(resetLink).template,
    });

     return response;

    } catch (error) {
        console.error("Mailgun Error:", error);
        throw error;
    }
}

export async function sendAffiliateSaleEmail(
  userEmail: string,
  firstName: string,
  amount: string
) {

      try {

    const response = await client.messages.create(process.env.MAILGUN_DOMAIN!, {
      from: `Your App <no-reply@${process.env.MAILGUN_DOMAIN}>`,
      to: userEmail,
    subject: getAffiliateSaleEmailTemplate(firstName, amount).title,
    text: `Congratulations! You've earned a commission of ${amount} from a referral.`,
    html: getAffiliateSaleEmailTemplate(firstName, amount).template,
   });

     return response;

    } catch (error) {
        console.error("Mailgun Error:", error);
        throw error;
    }


}

export async function sendAccountBreachedEmail(
  userEmail: string,
  userName: string,
  accountNumber: string
) {

     try {

    const response = await client.messages.create(process.env.MAILGUN_DOMAIN!, {
      from: `Your App <no-reply@${process.env.MAILGUN_DOMAIN}>`,
      to: userEmail,
     subject: getBreachedEmailTemplate(userName, accountNumber).title,
    html: getAffiliateSaleEmailTemplate(userName, accountNumber).template,
   });

     return response;

    } catch (error) {
        console.error("Mailgun Error:", error);
        throw error;
    }

}



export async function sendPhaseUpdateEmail(
  userEmail: string,
  userName: string,
  accountNumber: string,
  startingPhase: number
) {

    
  const subject =
    startingPhase === 1
      ? getWelcomePhase1EmailTemplate(userName).title
      : startingPhase === 2
      ? getWelcomePhase2EmailTemplate(userName).title
      : getWelcomePhase3EmailTemplate(userName).title;
  
  const template =
    startingPhase === 1
      ? getWelcomePhase1EmailTemplate(userName).template
      : startingPhase === 2
      ? getWelcomePhase2EmailTemplate(userName).template
      : getWelcomePhase3EmailTemplate(userName).template;



         try {

    const response = await client.messages.create(process.env.MAILGUN_DOMAIN!, {
      from: `Your App <no-reply@${process.env.MAILGUN_DOMAIN}>`,
      to: userEmail,
    subject: subject,
    html: template,
   });
     await client.messages.create(process.env.MAILGUN_DOMAIN!, {
      from: `Your App <no-reply@${process.env.MAILGUN_DOMAIN}>`,
      to: userEmail,
    subject: getPhaseCompleteEmailTemplate(userName, startingPhase-1, accountNumber).title,
    html: getPhaseCompleteEmailTemplate(userName, startingPhase-1, accountNumber).template,
   });

     return response;

    } catch (error) {
        console.error("Mailgun Error:", error);
        throw error;
    }

}


export async function sendFundedAccountEmail(userEmail:string, userName: string, accountNumber: string) {

       try {

    const response = await client.messages.create(process.env.MAILGUN_DOMAIN!, {
      from: `Your App <no-reply@${process.env.MAILGUN_DOMAIN}>`,
      to: userEmail,
    subject: getFundedEmailTemplate(userName, accountNumber).title,
    html: getFundedEmailTemplate(userName, accountNumber).template,
   });

     return response;

    } catch (error) {
        console.error("Mailgun Error:", error);
        throw error;
    }


}



export async function sendKycVerifiedEmail (userEmail: string, userName: string) {

        try {

    const response = await client.messages.create(process.env.MAILGUN_DOMAIN!, {
      from: `Your App <no-reply@${process.env.MAILGUN_DOMAIN}>`,
      to: userEmail,
   subject: getKycEmailTemplate(userName).title,
    html: getKycEmailTemplate(userName).template,
  });

     return response;

    } catch (error) {
        console.error("Mailgun Error:", error);
        throw error;
    }

  
}


export async function sendPickResultEmail (userEmail: string, userName: string, accountNumber: string, result: "WIN" | "LOSS" ) {
  
  const template = result === "WIN"
    ? getPickWonEmailTemplate(userName, accountNumber).template
    : getPickLossEmailTemplate(userName, accountNumber).template
  const title = result === "WIN"
    ? getPickWonEmailTemplate(userName, accountNumber).title
    : getPickLossEmailTemplate(userName, accountNumber).title
  

      try {

    const response = await client.messages.create(process.env.MAILGUN_DOMAIN!, {
      from: `Your App <no-reply@${process.env.MAILGUN_DOMAIN}>`,
      to: userEmail,
      subject: title,
    html: template,
  });

     return response;

    } catch (error) {
        console.error("Mailgun Error:", error);
        throw error;
    }

 
}


export async function sendAccountUnlockedEmail(userEmail: string) {
  
  const template = getAccountUnlockedEmailTemplate().template
  const title = getAccountUnlockedEmailTemplate().title
  

      try {

    const response = await client.messages.create(process.env.MAILGUN_DOMAIN!, {
      from: `Your App <no-reply@${process.env.MAILGUN_DOMAIN}>`,
      to: userEmail,
      subject: title,
    html: template,
  });

     return response;

    } catch (error) {
        console.error("Mailgun Error:", error);
        throw error;
    }

}



export async function sendContractAwaitsEmail(userEmail: string, userName: string) {
  
  const template = getContractEmailTemplate(userName).template
  const title = getContractEmailTemplate(userName).title


        try {

    const response = await client.messages.create(process.env.MAILGUN_DOMAIN!, {
      from: `Your App <no-reply@${process.env.MAILGUN_DOMAIN}>`,
      to: userEmail,
      subject: title,
    html: template,
  });

     return response;

    } catch (error) {
        console.error("Mailgun Error:", error);
        throw error;
    }

  
}