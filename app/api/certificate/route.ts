import { connectToDatabase } from "@/lib/database";
import { NextRequest, NextResponse } from "next/server";

import sgMail from "@sendgrid/mail";
import { getServerSession } from "next-auth";
import prisma from "@/prisma/client";
import { getCompletePhase1Certificate } from "@/lib/certificates/complete-phase1";
import { getCompletePhase2Certificate } from "@/lib/certificates/complete-phase2";
import { getCompletePhase3Certificate } from "@/lib/certificates/complete-phase3";
import { getPayoutCertificate } from "@/lib/certificates/payout";
import { getLifetimePayoutCertificate } from "@/lib/certificates/lifetime-payout";
import { FROM_EMAIL } from "@/lib/constants";
import { Account, User } from "@prisma/client";

export async function POST(req: NextRequest) {
  await connectToDatabase();

  const { certificateType, accountId } = await req.json();

  if (!certificateType) {
    return NextResponse.json(
      { message: "Certificate type is required" },
      { status: 400 }
    );
  }

  // Session authorization
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // Send grid
  const API_KEY = process.env.SENDGRID_API_KEY;
  if (!API_KEY) {
    return NextResponse.json({ message: "API key not found" }, { status: 400 });
  }
  sgMail.setApiKey(API_KEY);

  // User details
  try {
    const user = await prisma.user.findFirst({
      where: {
        email: session.user?.email,
      },
    });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const account = await prisma.account.findFirst({
      where: {
        id: accountId,
      },
    });
    if (!account) {
      return NextResponse.json(
        { message: "Account not found" },
        { status: 404 }
      );
    }

    let certificate = {
      title: "",
      template: "",
    };
    try {
      certificate = await getEmailTitleAndTemplate(
        certificateType,
        account,
        user
      );
    } catch (error: any) {
      return NextResponse.json(
        { message: error.message || "Error" },
        { status: 500 }
      );
    }

    // Send email
    const msg = {
      to: user.email,
      from: FROM_EMAIL,
      subject: certificate.title,
      html: certificate.template,
    };
    sgMail
      .send(msg)
      .then(async () => {
        // Create certificate
        const newCertificate = await prisma.certificateHistory.create({
          data: {
            type: certificateType,
            accountId,
            userId: user.id,
          },
        });
        if (!newCertificate) {
          return NextResponse.json(
            { message: "Certificate not created" },
            { status: 401 }
          );
        }

        return NextResponse.json({ message: "Email sent" }, { status: 200 });
      })
      .catch((error) => {
        console.error(error);
        throw new Error("Error sending email");
      });

    return NextResponse.json({ message: "Email sent" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}

const getEmailTitleAndTemplate = async (
  certificateType: string,
  account: Account,
  user: User
) => {
  let template = "";
  let title = "";
  switch (certificateType) {
    case "FUNDED":
      // template = getBronzeCertificateTemplate();
      break;
    case "PHASE":
      switch (account.phase) {
        case 1:
          throw Error("Phase 1 not yet completed");
        case 2:
          template = getCompletePhase1Certificate(
            user.firstName,
            account
          ).template;
          title = getCompletePhase1Certificate(user.firstName, account).title;
          break;
        case 3:
          template = getCompletePhase2Certificate(
            user.firstName,
            account
          ).template;
          title = getCompletePhase2Certificate(user.firstName, account).title;
          break;
        case 4:
          template = getCompletePhase3Certificate(
            user.firstName,
            account
          ).template;
          title = getCompletePhase3Certificate(user.firstName, account).title;
          break;
      }

      break;
    case "PAYOUT":
      const latestPayoutRequest = await prisma.fundedPayoutRequests.findFirst({
        where: {
          accountId: account.id,
          status: "PAID",
        },
        orderBy: {
          createdAt: "desc",
        },
      });
      if (!latestPayoutRequest) {
        throw Error("No latest payout request found");
      }

      template = getPayoutCertificate(
        user.firstName,
        account,
        latestPayoutRequest.amount
      ).template;
      title = getPayoutCertificate(
        user.firstName,
        account,
        latestPayoutRequest.amount
      ).title;
      break;
    case "LIFETIME_PAYOUT":
      template = getLifetimePayoutCertificate(user.firstName, account).template;
      title = getLifetimePayoutCertificate(user.firstName, account).title;
      break;
    default:
      throw Error("Invalid certificate type");
  }

  return { title, template };
};
