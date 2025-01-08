'use server'

export const getMatcheById = async(
    sportsId: number,
    leagueId : number,
    matchId : number,
) => {
    try {
      const res = await fetch(`https://stm-snapshot.lsports.eu/PreMatch/GetFixtures`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json-patch+json',
      },
      body: JSON.stringify({
      "packageId": 2443,
      "userName": "sandro@proppicks.com",
      "password": "Ud354687!",
      "sports":  [sportsId],
      "leagues": [leagueId],
      "fixtures":[matchId]
})
    });      
       const data = await res.json();
      return JSON.parse(JSON.stringify({ data, status:200}))
    } catch (error) {
        console.log("🚀 ~ get match ~ error", error)        
        return JSON.parse(JSON.stringify({ error, status:500}))
    }

}