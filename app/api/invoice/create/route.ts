import { generateCustomId } from "@/helper/keyGenerator";
import { connectToDatabase } from "@/lib/database";
import prisma from "@/prisma/client";
import { NotificationType } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {

    const { customerEmail, invoice, account, billingDetails } = await req.json();

    await connectToDatabase();

    const session = await getServerSession();
    if(!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findFirst({
        where: {
            email: session.user?.email,
        },
    });
    if(!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    const response = await fetch("https://confirmo.net/api/v3/invoices", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.CONFIRMO_API_KEY}`,
        },
        body: JSON.stringify({
            customerEmail,
            invoice: {
                amount: Number(invoice.amount.replace("$", "")),
                currencyFrom: invoice.currencyFrom,
            },
            reference: JSON.stringify({
                accountDetails: {
                    accountType: account.accountType,
                    accountSize: account.accountSize,
                    status: account.status,
                    balance: parseInt(account.accountSize.replace("K", "000")),
                    accountNumber: generateCustomId(),
                    userId: user.id,
                },
                billingDetails: billingDetails,
            }),
            settlement: {
                description: "Settlement to BTC",
                currencyTo: "BTC",
            },
            notifyUrl: `https://app.vantagepicks.com/api/invoice/confirm`,
        }),
    })

    if (!response.ok) {
        console.log(await response.text());
        return NextResponse.json({ error: "Failed to create invoice" }, { status: response.status });
    }

    const data = await response.json();

    await prisma.accountInvoices.create({
        data: {
            userId: user.id,
            invoiceId: data.id,
            amount: Number(invoice.amount.replace("$", "")),
            status: "pending",
            invoiceNumber: generateCustomId(false, false),
            paymentMethod: "BTC",
            paymentDate: new Date(),
        },
    })

    await createNotification("Invoice created successfully. Payment is under review.", "UPDATE", user.id);

    return NextResponse.json(data);    

}

const createNotification = async (message: string, type: NotificationType, userId: string) => {
    try {
        const notification = await prisma.notification.create({
            data: {
                content: message,
                type,
                userId: userId,
                read: false,
            }
        });

        const response = await fetch(`${process.env.BG_SERVICES_URL}/generate-notification`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                userId,
                message: notification.content,
            }),
        })

        if (!response.ok) {
            console.log(await response.text());
            throw new Error("Failed to create notification");
        }
        
    }
    catch (error) {
        console.error(error);
        throw new Error("Failed to create notification");
    }
}