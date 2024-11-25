const WebSocket = require("ws");
const { PrismaClient } = require("../node_modules/@prisma/client");
const {
  getOriginalBalance,
  sendBreachedEmail,
  getTailoredObjectives,
  areObjectivesComplete,
  sendPhaseUpdateEmail,
  sendFundedAccountEmail,
  sendAppNotification,
  sendPickResultEmail,
  MAX_PROFIT_THRESHOLD,
  MAX_BET_WIN_THRESHOLD,
} = require("./utils");

const prisma = new PrismaClient();

// Store connected clients by their userId
const connectedClients = {};

// Function to broadcast data to all connected WebSocket clients
function broadcast(data, wss) {
  wss.clients.forEach((client) => {
    if (client.readyState === client.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

// Function to send a notification to a specific client by userId
function sendNotification(userId, message) {
  const client = connectedClients[userId];

  if (client && client.readyState === WebSocket.OPEN) {
    client.send(JSON.stringify({ message }));
  } else {
    console.log(`Client with userId: ${userId} is not connected.`);
  }
}

function getNewUserLevel(picksWon) {
  if (picksWon < 10) {
    return "NEWBIE";
  } else if (picksWon < 50) {
    return "BRONZE";
  } else if (picksWon < 100) {
    return "SILVER";
  } else if (picksWon < 200) {
    return "GOLD";
  } else if (picksWon < 350) {
    return "PLATINUM";
  } else {
    return "HERO";
  }
}

// Function to check for match updates and send to clients
async function checkForUpdates(wss) {
  try {
    // Fetch all active bets
    const bets = await prisma.bets.findMany({
      where: {
        betStatus: "OPENED",
      },
    });

    if (!bets.length) {
      console.log("No open bets found.");
      return;
    }

    // Create a map of sportKeys to associated bets
    const groupedBets = bets.reduce((acc, bet) => {
      bet.sportKey.forEach((key, index) => {
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push({
          bet,
          matchIndex: index, // To keep track of which match in the bet
        });
      });
      return acc;
    }, {});

    // Fetch match results from the third-party API
    const results = await Promise.all(
      Object.keys(groupedBets).map(async (sportKey) => {
        try {
          const response = await fetch(
            `https://api.the-odds-api.com/v4/sports/${sportKey}/scores/?apiKey=${
              process.env.NEXT_PUBLIC_PICKS_API_KEY
            }&daysFrom=3&eventIds=${groupedBets[sportKey]
              .map(({ bet, matchIndex }) => bet.eventId[matchIndex])
              .join(",")}`
          );
          if (!response.ok) {
            console.log(response);
            throw new Error(
              `API request failed with status ${response.status}`
            );
          }
          return response.json();
        } catch (error) {
          console.error(`Error fetching results for sport ${sportKey}:`, error);
          return [];
        }
      })
    );

    // Flatten and filter completed games
    const completedGames = results.flat().filter((game) => game.completed);

    if (completedGames.length > 0) {
      // Broadcast the completed game results to all connected WebSocket clients
      broadcast(completedGames, wss);

      // Iterate over each bet and update accordingly
      bets.forEach(async (bet) => {
        try {
          let allMatchesWon = true; // To track if all matches in the bet are won

          for (let i = 0; i < bet.eventId.length; i++) {
            const game = completedGames.find(
              (game) => game.id === bet.eventId[i]
            );
            if (game) {
              // Determine scores for the home and away teams by checking names
              let homeScore = null;
              let awayScore = null;

              for (let score of game.scores) {
                if (score.name === game.home_team) {
                  homeScore = Number(score.score);
                } else if (score.name === game.away_team) {
                  awayScore = Number(score.score);
                }
              }

              // Check if the home and away scores were correctly assigned
              if (homeScore !== null && awayScore !== null) {
                let isHomeTeam = bet.team[i] === game.home_team;

                // Determine if the selected team won based on their home/away status
                let matchWon =
                  (isHomeTeam && homeScore > awayScore) ||
                  (!isHomeTeam && homeScore < awayScore);

                if (!matchWon) {
                  allMatchesWon = false; // If any match is lost, mark the entire bet as lost
                  break;
                }
              } else {
                console.error("Scores for home or away team not found");
              }
            }
          }

          let betResult = allMatchesWon ? "WIN" : "LOSE";

          const account = await prisma.account.findUnique({
            where: { id: bet.accountId },
          });

          // Update the bet in the database
          await prisma.bets.update({
            where: { id: bet.id },
            data: { betResult, betStatus: "CLOSED" },
          });

          // If the bet is won, update the account balance and increment picks won
          if (betResult === "WIN") {
            const accountSize = getOriginalBalance(account);
            const maxMonthlyProfit = accountSize * MAX_PROFIT_THRESHOLD;
            const maxBetWin = maxMonthlyProfit * MAX_BET_WIN_THRESHOLD;
            const discardBet = bet.winnings > maxBetWin;
            const updatedAccount = await prisma.account.update({
              where: { id: bet.accountId },
              data: {
                balance: { increment: bet.pick + bet.winnings },
                totalFundedAmount: {
                  increment:
                    account.status === "FUNDED" && !discardBet
                      ? bet.winnings
                      : 0,
                },
              },
            });
            const updatedUser = await prisma.user.update({
              where: {
                id: bet.userId,
              },
              data: {
                picksWon: {
                  increment: 1,
                },
              },
            });
            const updateLevelUser = await prisma.user.update({
              where: {
                id: bet.userId,
              },
              data: {
                profileLevel: {
                  set: getNewUserLevel(updatedUser.picksWon),
                },
              },
            });

            await sendAppNotification(
              bet.userId,
              "WIN",
              `Congratulations! You won ${bet.winnings} picks.`
            );
            await sendPickResultEmail(bet.userId, "WIN");

            if (account.status === "CHALLENGE") {
              const objectivesComplete = areObjectivesComplete(updatedAccount);
              if(objectivesComplete) {
                let goFunded = false;
                let newPhase = updatedAccount.phaseNumber + 1;

                if(account.accountType === "TWO_STEP" && newPhase === 3) {
                  goFunded = true;
                } else if (
                  account.accountType === "THREE_STEP" &&
                  newPhase === 4
                ) {
                  goFunded = true;
                }

                if(goFunded) {
                  await prisma.account.update({
                    where: {
                      id: bet.accountId,
                    },
                    data: {
                      status: "FUNDED",
                      phaseNumber: newPhase,
                       balance: getOriginalBalance(account),
                      dailyLoss: 0,
                      totalLoss: 0,
                      totalFundedPayout: 0,
                      totalFundedAmount: getOriginalBalance(account),
                      picks: 0,
                      fundedPayoutTimer: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
                    },
                  });
                  await sendFundedAccountEmail(account.id);
                  await sendAppNotification(
                    bet.userId,
                    "UPDATE",
                    "Congratulations! Your account has been funded."
                  );
                } else {
                  await prisma.account.update({
                    where: {
                      id: bet.accountId,
                    },
                    data: {
                      phase: newPhase,
                       balance: getOriginalBalance(account),
                      dailyLoss: 0,
                      totalLoss: 0,
                      totalFundedPayout: 0,
                      totalFundedAmount: getOriginalBalance(account),
                      picks: 0,

                    },
                  });
                  await sendPhaseUpdateEmail(account.id, newPhase);
                  await sendAppNotification(
                    bet.userId,
                    "UPDATE",
                    `Your account is upgraded to phase ${newPhase}`
                  );
                }
              }
            }
          } else {
            await prisma.account.update({
              where: {
                id: bet.accountId,
              },
              data: {
                totalLoss: { increment: bet.pick },
                dailyLoss: { increment: bet.pick },
                totalFundedAmount: {
                  decrement: account.status === "FUNDED" ? bet.pick : 0,
                },
              },
            });
            await sendPickResultEmail(bet.userId, "LOSS");
            if (
              account.dailyLoss + bet.pick >=
              getOriginalBalance(account) * 0.15
            ) {
              await prisma.account.update({
                where: {
                  id: bet.accountId,
                },
                data: {
                  status: "BREACHED",
                },
              });

              await sendBreachedEmail("BREACHED", account.id);
              await sendAppNotification(
                bet.userId,
                "ALERT",
                "Your account has been breached."
              );
            }
            if (
              account.totalLoss + bet.pick >=
              getOriginalBalance(account) * 0.2
            ) {
              await prisma.account.update({
                where: {
                  id: bet.accountId,
                },
                data: {
                  status: "BREACHED",
                },
              });

              await sendBreachedEmail("BREACHED", account.id);
              await sendAppNotification(
                bet.userId,
                "ALERT",
                "Your account has been breached."
              );
            }
          }
        } catch (error) {
          console.error(`Error processing bet ${bet.id}:`, error);
        }
      });
    } else {
      console.log("No completed games found.");
    }
  } catch (error) {
    console.error("An unexpected error occurred in checkForUpdates:", error);
  }
}

// Initialize WebSocket server with noServer: true
const init = (server) => {
  const wss = new WebSocket.Server({ port: 443 });

  wss.on("connection", (ws, req) => {
    // Parse userId from query params or a message
    const userId = req.url.split("?userId=")[1];
    console.log(userId);

    // Store the connected client
    connectedClients[userId] = ws;
    console.log(`Client connected: userId=${userId}`);

    // When a message is received from the client
    ws.on("message", (message) => {
      console.log("Received message:", message);
      ws.send("Server received your message");
    });

    // When the connection is closed
    ws.on("close", () => {
      console.log(`Client disconnected: userId=${userId}`);
      delete connectedClients[userId]; // Remove the client from the map
    });
  });

  console.log("WebSocket server initialized");

  // Periodically check for match updates (every 1 minute)
  setInterval(() => checkForUpdates(wss), 1 * 60 * 1000);
};
module.exports = { init, sendNotification };