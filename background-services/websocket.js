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

const games = [
  {
      "id": "572d984e132eddaac3da93e5db332e7e",
      "sport_key": "basketball_nba",
      "sport_title": "NBA",
      "commence_time": "2022-02-06T03:10:38Z",
      "completed": true,
      "home_team": "Sacramento Kings",
      "away_team": "Oklahoma City Thunder",
      "scores": [
          {
              "name": "Sacramento Kings",
              "score": "113"
          },
          {
              "name": "Oklahoma City Thunder",
              "score": "103"
          }
      ],
      "last_update": "2022-02-06T05:18:19Z"
  },
  {
      "id": "e2296d6d1206f8d185466876e2b444ea",
      "sport_key": "basketball_nba",
      "sport_title": "NBA",
      "commence_time": "2022-02-06T03:11:26Z",
      "completed": true,
      "home_team": "Portland Trail Blazers",
      "away_team": "Milwaukee Bucks",
      "scores": [
          {
              "name": "Portland Trail Blazers",
              "score": "108"
          },
          {
              "name": "Milwaukee Bucks",
              "score": "137"
          }
      ],
      "last_update": "2022-02-06T05:21:01Z"
  },
  {
      "id": "8d8affc2e29bcafd3cdec8b414256cda",
      "sport_key": "basketball_nba",
      "sport_title": "NBA",
      "commence_time": "2022-02-06T20:41:04Z",
      "completed": true,
      "home_team": "Denver Nuggets",
      "away_team": "Brooklyn Nets",
      "scores": [
          {
              "name": "Denver Nuggets",
              "score": "124"
          },
          {
              "name": "Brooklyn Nets",
              "score": "104"
          }
      ],
      "last_update": "2022-02-06T22:50:22Z"
  },
  {
      "id": "aae8b3294ab2de36e63c614e44e94d80",
      "sport_key": "basketball_nba",
      "sport_title": "NBA",
      "commence_time": "2022-02-06T20:41:47Z",
      "completed": true,
      "home_team": "Minnesota Timberwolves",
      "away_team": "Detroit Pistons",
      "scores": [
          {
              "name": "Minnesota Timberwolves",
              "score": "118"
          },
          {
              "name": "Detroit Pistons",
              "score": "105"
          }
      ],
      "last_update": "2022-02-06T22:52:29Z"
  },
  {
      "id": "07767ff2952c6b025aa5584626db2910",
      "sport_key": "basketball_nba",
      "sport_title": "NBA",
      "commence_time": "2022-02-06T20:42:13Z",
      "completed": true,
      "home_team": "Chicago Bulls",
      "away_team": "Philadelphia 76ers",
      "scores": [
          {
              "name": "Chicago Bulls",
              "score": "108"
          },
          {
              "name": "Philadelphia 76ers",
              "score": "119"
          }
      ],
      "last_update": "2022-02-06T22:58:23Z"
  },
  {
      "id": "3f63cadf65ad249c5bc6b1aac8ba426d",
      "sport_key": "basketball_nba",
      "sport_title": "NBA",
      "commence_time": "2022-02-06T23:10:53Z",
      "completed": true,
      "home_team": "Orlando Magic",
      "away_team": "Boston Celtics",
      "scores": [
          {
              "name": "Orlando Magic",
              "score": "83"
          },
          {
              "name": "Boston Celtics",
              "score": "116"
          }
      ],
      "last_update": "2022-02-07T01:18:57Z"
  },
  {
      "id": "4843de62e910869ee34065ffe4c20137",
      "sport_key": "basketball_nba",
      "sport_title": "NBA",
      "commence_time": "2022-02-06T23:11:42Z",
      "completed": true,
      "home_team": "Dallas Mavericks",
      "away_team": "Atlanta Hawks",
      "scores": [
          {
              "name": "Dallas Mavericks",
              "score": "103"
          },
          {
              "name": "Atlanta Hawks",
              "score": "94"
          }
      ],
      "last_update": "2022-02-07T01:26:29Z"
  },
  {
      "id": "e0f6669de3ae5af63162c3d9459184bf",
      "sport_key": "basketball_nba",
      "sport_title": "NBA",
      "commence_time": "2022-02-06T23:12:42Z",
      "completed": true,
      "home_team": "Cleveland Cavaliers",
      "away_team": "Indiana Pacers",
      "scores": [
          {
              "name": "Cleveland Cavaliers",
              "score": "98"
          },
          {
              "name": "Indiana Pacers",
              "score": "85"
          }
      ],
      "last_update": "2022-02-07T01:36:15Z"
  },
  {
      "id": "a306576b1789dd1c884cc1aa61fda4bf",
      "sport_key": "basketball_nba",
      "sport_title": "NBA",
      "commence_time": "2022-02-07T00:11:03Z",
      "completed": true,
      "home_team": "Houston Rockets",
      "away_team": "New Orleans Pelicans",
      "scores": [
          {
              "name": "Houston Rockets",
              "score": "107"
          },
          {
              "name": "New Orleans Pelicans",
              "score": "120"
          }
      ],
      "last_update": "2022-02-07T02:25:17Z"
  },
  {
      "id": "4b25562aa9e87b57aa16f970abaec8cc",
      "sport_key": "basketball_nba",
      "sport_title": "NBA",
      "commence_time": "2022-02-07T02:11:01Z",
      "completed": false,
      "home_team": "Los Angeles Clippers",
      "away_team": "Milwaukee Bucks",
      "scores": [
          {
              "name": "Los Angeles Clippers",
              "score": "40"
          },
          {
              "name": "Milwaukee Bucks",
              "score": "37"
          }
      ],
      "last_update": "2022-02-07T02:47:23Z"
  },
  {
      "id": "19434a586e3723c55cd3d028b90eb112",
      "sport_key": "basketball_nba",
      "sport_title": "NBA",
      "commence_time": "2022-02-08T00:10:00Z",
      "completed": false,
      "home_team": "Charlotte Hornets",
      "away_team": "Toronto Raptors",
      "scores": null,
      "last_update": null
  },
  {
      "id": "444e56cbf5a6d534741bb8d1298e2d50",
      "sport_key": "basketball_nba",
      "sport_title": "NBA",
      "commence_time": "2022-02-08T01:10:00Z",
      "completed": false,
      "home_team": "Oklahoma City Thunder",
      "away_team": "Golden State Warriors",
      "scores": null,
      "last_update": null
  },
  {
      "id": "16d461b95e9d643d7f2469f72c098a20",
      "sport_key": "basketball_nba",
      "sport_title": "NBA",
      "commence_time": "2022-02-08T02:10:00Z",
      "completed": false,
      "home_team": "Utah Jazz",
      "away_team": "New York Knicks",
      "scores": null,
      "last_update": null
  }
]

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
    // const completedGames = results.flat().filter((game) => game.completed);
    const completedGames = games;

    if (completedGames.length > 0) {
      // Broadcast the completed game results to all connected WebSocket clients
      broadcast(completedGames, wss);
      // console.log("Completed games:", completedGames);

      // Iterate over each bet and update accordingly
      bets.forEach(async (bet) => {
        try {
          let allMatchesWon = false; // To track if all matches in the bet are won

          for (let i = 0; i < bet.eventId.length; i++) {
            const game = completedGames.find(
              (game) => game.id === bet.eventId[i]
            );
            if(!game) return;
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

              const normalizeName = (name) => {
                return name.replace(/\s+/g, "").toLowerCase();
              };

              // Check if the home and away scores were correctly assigned
              if (homeScore !== null && awayScore !== null) {
                // Normalize both bet team and game team names for accurate comparison
                let betTeam = normalizeName(bet.team[i]);
                let homeTeamNormalized = normalizeName(game.home_team);
                let awayTeamNormalized = normalizeName(game.away_team);

                let isHomeTeam = betTeam === homeTeamNormalized;
                let isAwayTeam = betTeam === awayTeamNormalized;

                // Log team information
                console.log(`Bet Team: ${bet.team[i]}`);
                console.log(
                  `Is Home Team: ${isHomeTeam}, Is Away Team: ${isAwayTeam}`
                );

                // Check if the selected team (home or away) won
                let matchWon =
                  (isHomeTeam && homeScore > awayScore) ||
                  (isAwayTeam && awayScore > homeScore);

                console.log(`Match Won: ${matchWon}`);

                // If the match is won, set allMatchesWon to true
                if (matchWon) {
                  allMatchesWon = true;
                } else {
                  // If the match is not won, set allMatchesWon to false and exit loop
                  allMatchesWon = false;
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
              if (objectivesComplete) {
                let goFunded = false;
                let newPhase = updatedAccount.phaseNumber + 1;

                if (account.accountType === "TWO_STEP" && newPhase === 3) {
                  goFunded = true;
                } else if (
                  account.accountType === "THREE_STEP" &&
                  newPhase === 4
                ) {
                  goFunded = true;
                }

                if (goFunded) {
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
                      fundedPayoutTimer: new Date(
                        Date.now() + 14 * 24 * 60 * 60 * 1000
                      ), // 14 days
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

  // Periodically check for match updates (every 10 seconds)
  setInterval(() => checkForUpdates(wss), 10000);
};
module.exports = { init, sendNotification };