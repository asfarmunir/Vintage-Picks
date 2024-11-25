import { connectToDatabase } from "@/helper/dbconnect";
import { ALL_STEP_CHALLENGES } from "@/lib/constants";
import {
  areStepObjectivesComplete,
  checkObjectivesAndUpgrade,
  getOriginalAccountValue,
} from "@/lib/utils";
import prisma from "@/prisma/client";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

const decimalToAmericanOdds = (decimalOdds: number) => {
  if (decimalOdds >= 2) {
    // Positive American odds
    return ((decimalOdds - 1) * 100);
  } else {
    // Negative American odds
    return (-100 / (decimalOdds - 1));
  }
};

const MAX_BET_AMPLITUDE = 0.1;
export async function POST(req: NextRequest) {
  // connect to database
  await connectToDatabase();

  // authenticate session
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json(
      { error: "You must be logged in to place a bet" },
      { status: 401 }
    );
  }

  // get user details
  const user = session.user;
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // find user using user.email
  const existingUser = await prisma.user.findFirst({
    where: {
      email: user.email,
    },
  });

  if (!existingUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // get bet details
  const { bet, accountNumber } = await req.json();

  // find account Id from account number
  const account = await prisma.account.findFirst({
    where: {
      accountNumber,
    },
  });

  if (!account) {
    return NextResponse.json({ error: "Account not found" }, { status: 404 });
  }

  // reject if dailyLoss > 15% of account value
  const accountValue = getOriginalAccountValue(account);
  if (
    account.dailyLoss &&
    account.dailyLoss >= accountValue * ALL_STEP_CHALLENGES.maxDailyLoss
  ) {
    return NextResponse.json(
      { error: "Daily loss limit reached" },
      { status: 400 }
    );
  }

  // reject if amount is NaN
  if (isNaN(bet.pick)) {
    return NextResponse.json(
      { error: "Bet amount must be a number" },
      { status: 400 }
    );
  }

  // reject if toWin is less than 0 or 0
  if (bet.winnings <= 0) {
    return NextResponse.json(
      { error: "To win amount must be greater than 0" },
      { status: 400 }
    );
  }

  // reject if amount is less than minimum allowed
  const minPickAmount =
    getOriginalAccountValue(account) * ALL_STEP_CHALLENGES.minPickAmount;
  if (bet.pick < minPickAmount) {
    return NextResponse.json(
      { error: `Bet amount must be greater than $${minPickAmount}` },
      { status: 400 }
    );
  }

  // reject if amount is greater than maximum allowed
  const maxPickAmount =
    getOriginalAccountValue(account) * ALL_STEP_CHALLENGES.maxPickAmount;
  if (bet.pick > maxPickAmount) {
    return NextResponse.json(
      { error: `Bet amount must be less than $${maxPickAmount}` },
      { status: 400 }
    );
  }

  // reject if account balance is less than bet.pick
  if (account.balance < bet.pick) {
    return NextResponse.json({ error: "Insufficient funds" }, { status: 400 });
  }

  // reject if account balance is less than 10% of original balance
  if ((account.balance - bet.pick ) < accountValue * MAX_BET_AMPLITUDE) {
    return NextResponse.json(
      { error: "Exceeded max of 10%" },
      { status: 400 }
    );
  }

  // reject if money line is >+2500
  const calculateMoneyLine = (odds: number, oddsFormat: "decimal" | "american", pick: number) => {
    let americanOdds = odds;
    if(oddsFormat.toLowerCase() === "decimal") {
      americanOdds = decimalToAmericanOdds(odds);
    }
    if(americanOdds > 0) {
      return `+${((pick)*(americanOdds/100)).toFixed(2)}`;
    } else {
      return `-${((pick)*(100/Math.abs(americanOdds))).toFixed(2)}`;
    }
  }
  const moneyLine = calculateMoneyLine(bet.odds, bet.oddsFormat.toLowerCase(), bet.pick);
  if (Number(moneyLine)>2500) {
    return NextResponse.json(
      { error: "Parlay's money line must be less than +2500" },
      { status: 400 }
    );
  }


  // select if bet already exists
  const existingBet = await prisma.bets.findFirst({
    where: {
      userId: existingUser.id,
      accountId: account.id,
      eventId: {
        hasSome: bet.eventId,
      },
    },
  });

  if (existingBet) {
    return NextResponse.json(
      { error: "Hedging isn't allowed." },
      { status: 400 }
    );
  }

  // odds validation
  if (account.status === "FUNDED") {
    if (bet.oddsFormat === "AMERICAN" && parseInt(bet.odds) < -800) {
      return NextResponse.json(
        { error: "Odds must be greater than -800" },
        { status: 400 }
      );
    } else if (bet.oddsFormat === "DECIMAL") {
      const americanOdd = (bet.odds - 1) * 100;
      if (americanOdd < -800) {
        return NextResponse.json(
          { error: "Odds must be greater than -800" },
          { status: 400 }
        );
      }
    }
  }

  // Using transaction to place bet and update account balance
  try {
    const [newBet, updatedAccount] = await prisma.$transaction([
      // Create a new bet
      prisma.bets.create({
        data: {
          userId: existingUser.id,
          accountId: account.id,
          betStatus: "OPENED",
          betDate: new Date(),
          ...bet,
        },
      }),
      // Subtract bet.pick from account balance
      prisma.account.update({
        where: {
          id: account.id,
        },
        data: {
          balance: {
            decrement: bet.pick,
          },
          picks: {
            increment: 1,
          },
        },
      }),
    ]);

    // if account is funded, reset inactivity timer
    if (account.status === "FUNDED") {
      const response = await fetch(
        `${process.env.BG_SERVICES_URL}/edit-cron-job`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            jobName: `${account.id}_INACTIVITY`,
            time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          }),
        }
      );
      if (!response.ok) {
        // throw new Error(await response.text());
          console.error(await response.text());
      }
    }

    // After transaction, check objectives
    await checkObjectivesAndUpgrade(prisma, updatedAccount);

    // If the transaction is successful, return success response
    return NextResponse.json(
      { message: "Bet placed successfully", bet: newBet },
      { status: 200 }
    );
  } catch (error) {
    console.error("Transaction error:", error);
    return NextResponse.json({ error: "Failed to place bet" }, { status: 500 });
  }
}
