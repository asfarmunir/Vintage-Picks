import { connectToDatabase } from "@/lib/database";
import prisma from "@/prisma/client";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

const formatDate = (date: Date) => {
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {

    await connectToDatabase();

    const session = await getServerSession();
    if (!session) {
        NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id: accountId } = params;
    if(!accountId) {
        NextResponse.json({ message: "Account ID is required" }, { status: 400 });
    }
    
    try {

        const account = await prisma.account.findUnique({
            where: { id: accountId }
        });
        if(!account) {
            NextResponse.json({ message: "Account not found" }, { status: 404 });
        }

        const graphData = await prisma.balanceHistory.findMany({
            where: { accountId },
            select: {
                balance: true,
                date: true
            },
            orderBy: { createdAt: 'asc' }
        });

        const formattedGraphData = graphData.map(data => {
            return {
                balance: data.balance,
                date: formatDate(new Date(data.date))
            }
        });

        return NextResponse.json(formattedGraphData, { status: 200 });
    } catch (error) {
        NextResponse.json({ message: "Error fetching graph data" }, { status: 500 });
    }
    
}