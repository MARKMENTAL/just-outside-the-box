const log = document.getElementById("log");
const card = document.getElementById("gachaCard");
const cardInner = document.getElementById("cardInner");
const cardBack = document.getElementById("cardBack");
const startButton = document.getElementById("startButton");
const resetButton = document.getElementById("resetButton");
const teamSelectBox = document.getElementById("teamSelectBox");

let inventory = JSON.parse(localStorage.getItem("inventory") || "[]");
let usedTeams = [...inventory];
let coinBalance = parseInt(localStorage.getItem("coinBalance") || "3");

async function pullFromPack() {
    if (coinBalance <= 0) {
        alert("You're out of coins!");
        return;
    }

    const team = pullTeam(inventory);
    if (!team) return;

    inventory.push(team);
    coinBalance--;
    saveProgress();

    // Update UI
    document.getElementById("coinDisplay").innerText = `🪙 Coins: ${coinBalance}`;
    populateInventoryDropdown();
    teamSelectBox.style.display = "block";
    startButton.disabled = false;

    // Animate flip
    card.style.display = "block";
    card.classList.remove("flip");
    await new Promise((r) => setTimeout(r, 300));
    card.classList.add("flip");

    cardBack.innerHTML = `
      <div class="card-style rarity-${team.rarity}">
        <h3>${team.name}</h3>
        <p>🌟 ${team.bonus}</p>
        <p>⚡ Power: ${team.power}</p>
      </div>
    `;

    logLine(`\n🎴 You pulled: ${team.name} [${team.rarity}] – ${team.bonus}`, `rarity-${team.rarity}`);
    await new Promise((r) => setTimeout(r, 2000));
    card.style.display = "none";
}


function viewPulledCards() {
  if (inventory.length === 0) {
    alert("You have no cards yet!");
    return;
  }

  const grid = document.getElementById("cardGrid");
  grid.innerHTML = "";
  const teamCounts = {};
  inventory.forEach(team => {
    teamCounts[team.name] = (teamCounts[team.name] || 0) + 1;
  });

  inventory.forEach((team) => {
    const wrapper = document.createElement("div");
    wrapper.className = "card-flip";
    wrapper.innerHTML = `
      <div class="card-inner">
	<div class="card-front">🎴 ${team.rarity} Rarity</div>
	<div class="card-back rarity-${team.rarity}">
	  <strong>${team.name}</strong><br>
	  🌟 ${team.bonus}<br>
	  ⚡ Power: ${team.power}
	  ${teamCounts[team.name] > 1 ? `<div class="dup-count">×${teamCounts[team.name]}</div>` : ""}
	</div>
      </div>
    `;

    // ⬅️ Apply toggle on the `.card-flip`, not just `.card-inner`
    wrapper.addEventListener("click", () => {
      wrapper.classList.toggle("flip");
    });

    grid.appendChild(wrapper);
  });

  document.getElementById("cardModal").style.display = "block";
}


function closeModal() {
  document.getElementById("cardModal").style.display = "none";
}

function logLine(text, rarityClass = "") {
    const span = document.createElement("div");
    if (rarityClass) span.classList.add(rarityClass);
    span.innerText = text;
    log.appendChild(span);
    log.scrollTop = log.scrollHeight;
}

const RARITY_TIERS = {
    C: 50,
    R: 30,
    SR: 15,
    SSR: 5,
};

const TEAMS_BY_RARITY = {
  C: [
    { name: "2002 China National Team", power: 68, bonus: "Last-Minute Hope" },
    { name: "1998 Jamaica National Team", power: 70, bonus: "Island Pressure" },
    { name: "2010 North Korea National Team", power: 65, bonus: "Defensive Collapse" },
    { name: "2006 Saudi Arabia National Team", power: 67, bonus: "Miracle Header" },
    { name: "1994 Greece National Team", power: 66, bonus: "Hard Tacklers" },
    { name: "1990 Egypt National Team", power: 69, bonus: "Desert Discipline" },
    { name: "2002 South Africa National Team", power: 71, bonus: "Rainbow Resilience" }
  ],
  R: [
    { name: "2002 USA National Team", power: 76, bonus: "High Press Hustle" },
    { name: "1996 Ajax", power: 79, bonus: "Youth Surge" },
    { name: "2004 Greece National Team", power: 78, bonus: "Underdog Fortitude" },
    { name: "1994 Nigeria National Team", power: 77, bonus: "Super Eagle Speed" },
    { name: "2006 Australia National Team", power: 75, bonus: "Outback Grit" },
    { name: "1998 Scotland National Team", power: 74, bonus: "Tartan Tenacity" },
    { name: "2007 Sevilla", power: 77, bonus: "Cup Surge" },
    { name: "2009 Porto", power: 78, bonus: "Dragão Drive" }
  ],
  SR: [
    { name: "2006 Italy National Team", power: 85, bonus: "Legendary Defense" },
    { name: "1986 Argentina National Team", power: 87, bonus: "Hand of God" },
    { name: "1999 Manchester United", power: 86, bonus: "Fergie Time" },
    { name: "1998 France National Team", power: 88, bonus: "Zidane Magic" },
    { name: "2004 AC Milan", power: 85, bonus: "Rossoneri Wall" },
    { name: "2002 Brazil National Team", power: 89, bonus: "Joga Bonito" },
    { name: "2009 Inter Milan", power: 86, bonus: "Mourinho’s Mind" },
    { name: "2001 Deportivo La Coruña", power: 84, bonus: "Galician Surge" }
  ],
  SSR: [
    { name: "2010 Spain National Team", power: 94, bonus: "Tiki-Taka Flow" },
    { name: "2014 Germany National Team", power: 93, bonus: "Machine Precision" },
    { name: "2011 Barcelona", power: 96, bonus: "Possession Masters" },
    { name: "2008 Manchester United", power: 92, bonus: "Ronaldo's Reign" },
    { name: "2005 Brazil National Team", power: 95, bonus: "Samba Masterclass" },
    { name: "2022 Argentina National Team", power: 94, bonus: "Messi’s Redemption" },
    { name: "2018 France National Team", power: 93, bonus: "Mbappé Momentum" },
    { name: "2002 Real Madrid", power: 95, bonus: "Galácticos Glory" },
    { name: "2013 Bayern Munich", power: 92, bonus: "Treble Storm" },
    { name: "2017 PSG", power: 91, bonus: "Neymar Effect" },
    { name: "2015 Chile National Team", power: 90, bonus: "Copa Kings" },
    { name: "2000 Valencia", power: 90, bonus: "Final Runners’ Fire" }
  ]
};


function weightedRarityChoice() {
    let roll = Math.floor(Math.random() * 100) + 1;
    for (let rarity in RARITY_TIERS) {
        if (roll <= RARITY_TIERS[rarity]) return rarity;
        roll -= RARITY_TIERS[rarity];
    }
    return "C";
}

function pullTeam(exclude = []) {
    const allTeams = Object.entries(TEAMS_BY_RARITY).flatMap(([rarity, teams]) =>
        teams.map(team => ({ ...team, rarity }))
    );

    const pulledNames = new Set([
        ...inventory.map(t => t.name),
        ...exclude.map(t => t.name)
    ]);

    const availableTeams = allTeams;

    if (availableTeams.length === 0) {
        alert("No more unique teams left to pull.");
        return null;
    }

    const rarityPool = availableTeams.reduce((acc, team) => {
        if (!acc[team.rarity]) acc[team.rarity] = [];
        acc[team.rarity].push(team);
        return acc;
    }, {});

    let roll = Math.floor(Math.random() * 100) + 1;
    for (let rarity in RARITY_TIERS) {
        if (roll <= RARITY_TIERS[rarity] && rarityPool[rarity]?.length) {
            const team = rarityPool[rarity][Math.floor(Math.random() * rarityPool[rarity].length)];
            return team;
        }
        roll -= RARITY_TIERS[rarity];
    }

    // Fallback if rarity filtered out all teams
    const fallbackTeam = availableTeams[Math.floor(Math.random() * availableTeams.length)];
    return fallbackTeam;
}


function populateInventoryDropdown() {
    teamSelectBox.innerHTML = "";
    inventory.forEach((team, idx) => {
        const opt = document.createElement("option");
        opt.value = idx;
        opt.textContent = `${team.name} [${team.rarity}] - ${team.bonus}`;
        teamSelectBox.appendChild(opt);
    });
}

function saveProgress() {
    localStorage.setItem("inventory", JSON.stringify(inventory));
    localStorage.setItem("coinBalance", coinBalance.toString());
}

function updateGameUI() {
    document.getElementById("coinDisplay").innerText = `🪙 Coins: ${coinBalance}`;

    const allTeamNames = Object.values(TEAMS_BY_RARITY)
        .flat().map(t => t.name);
    const ownedNames = inventory.map(t => t.name);
    const allCollected = allTeamNames.every(name => ownedNames.includes(name));

    if (allCollected) {
        pullButton.disabled = true;
        logLine("🏆 You've collected all available teams! No more pulls.");
    } else {
	pullButton.disabled = coinBalance <= 0;
    }

    populateInventoryDropdown();
    teamSelectBox.style.display = inventory.length > 0 ? "block" : "none";
    startButton.disabled = inventory.length === 0;
}

function clearProgress() {
    localStorage.removeItem("inventory");
    localStorage.removeItem("coinBalance");
    location.reload();
}

function simulateScore(power) {
    let goals = 0;
    for (let i = 0; i < 7; i++) {
        if (Math.random() < power / 200) goals++;
    }
    return goals;
}

async function simulateGame(team1, team2) {
    logLine(`\n⚽ ${team1.name} vs ${team2.name}`);
    await new Promise(r => setTimeout(r, 700));

    let momentum = {
        [team1.name]: 0,
        [team2.name]: 0,
    };

    // ⚠️ 20% chance of a foul occurring
    if (Math.random() < 0.2) {
        const foulingTeam = Math.random() > 0.5 ? team1 : team2;
        const fouledTeam = foulingTeam === team1 ? team2 : team1;

        momentum[fouledTeam.name] += 8; // bonus for fouled
        momentum[foulingTeam.name] -= 6; // penalty for fouling

        logLine(`🟨 Just Outside The Box! ${foulingTeam.name} commits a foul on ${fouledTeam.name}!`);
        logLine(`📈 ${fouledTeam.name} gains momentum!`);
        logLine(`📉 ${foulingTeam.name} loses composure.`);
        await new Promise(r => setTimeout(r, 800));
    }

    const score1 = simulateScore(team1.power + momentum[team1.name]);
    const score2 = simulateScore(team2.power + momentum[team2.name] + (team2.is_player ? 0 : 4));

    logLine(`📊 Final Score — ${team1.name}: ${score1} | ${team2.name}: ${score2}`);
    if (score1 > score2) {
        logLine(`🏆 ${team1.name} wins!`);
        return team1;
    } else if (score2 > score1) {
        logLine(`🏆 ${team2.name} wins!`);
        return team2;
    } else {
        logLine("⏱️ Match is a draw... proceeding to penalties!");
        await new Promise((r) => setTimeout(r, 800));
        const winner = Math.random() > 0.5 ? team1 : team2;
        logLine(`⚽ Penalty Shootout Winner: ${winner.name}`);
        return winner;
    }
}


async function runTournament(name, teams, playerTeam) {
    logLine(`\n🏆 ${name} Begins!`);
    await new Promise((r) => setTimeout(r, 1000));
    const semi1 = await simulateGame(teams[0], teams[3]);
    const semi2 = await simulateGame(teams[1], teams[2]);
    logLine(`\n⚽ ${name} Finals:`);
    const finalWinner = await simulateGame(semi1, semi2);
    return finalWinner.name === playerTeam.name;
}

async function startCareer() {
    if (inventory.length === 0) {
        alert("You must pull at least one team before starting.");
        return;
    }

    // Build a set-aside AI pool for the season (30 teams)
    let aiTeamPool = [];
    while (aiTeamPool.length < 30) {
	const team = pullTeam([...inventory, ...aiTeamPool]);
	if (!team) break;
	aiTeamPool.push(team);
    }


    startButton.disabled = true;
    pullButton.disabled = true;
    resetButton.disabled = true;
    deleteButton.disabled = true;
    teamSelectBox.disabled = true;
    log.innerText = "";

    const selectedIndex = teamSelectBox.selectedIndex;
    const player = inventory[selectedIndex];
    player.is_player = true;

    logLine("⚽ Soccer Gacha Career Mode: 11 Match Season + 2 Tournaments");
    await new Promise((r) => setTimeout(r, 1000));

    logLine(`\n🎮 You selected: ${player.name} [${player.rarity}] – ${player.bonus}`, `rarity-${player.rarity}`);
    await new Promise((r) => setTimeout(r, 1000));
    let seasonlength = 11
    logLine(`\n📅 Starting ${seasonlength}-Match Season...\n`);

    let standings = [
        {
            team: player,
            wins: 0,
        },
    ];

    for (let i = 0; i < seasonlength; i++) {
	const ai = aiTeamPool[i % aiTeamPool.length];
	ai.is_player = false;
	standings.push({ team: ai, wins: 0 });

	const winner = await simulateGame(player, ai);
	if (winner === player) standings[0].wins++;
	else {
	    const aiEntry = standings.find(e => e.team.name === ai.name);
	    aiEntry.wins++;
	}
	await new Promise(r => setTimeout(r, 1000));
    }


    function simulateSilentScore(power) {
	let goals = 0;
	for (let i = 0; i < 7; i++) {
	    if (Math.random() < power / 200) goals++;
	}
	return goals;
    }

    function simulateSilentMatch(teamA, teamB) {
	const scoreA = simulateSilentScore(teamA.power);
	const scoreB = simulateSilentScore(teamB.power + 4);
	return scoreA > scoreB ? teamA : scoreB > scoreA ? teamB : Math.random() > 0.5 ? teamA : teamB;
    }

    for (let i = 1; i < standings.length; i++) {
	for (let j = 0; j < standings.length - 1; j++) {
	    const opponent = aiTeamPool[Math.floor(Math.random() * aiTeamPool.length)];
	    const winner = simulateSilentMatch(standings[i].team, opponent);
	    if (winner.name === standings[i].team.name) standings[i].wins++;
	}
    }

    standings.sort((a, b) => b.wins - a.wins);

    logLine("\n📊 Final Standings:");
    standings.forEach((entry, idx) => {
        const tag = entry.team.is_player ? "(You)" : "";
        logLine(`${idx + 1}. ${entry.team.name} - ${entry.wins} Wins ${tag}`);
    });

    const playerRank = standings.findIndex((e) => e.team.is_player);
    let grade = "D",
        title = "Benchwarmer Potential";

    let tournamentResult = null;
    let tournamentName = null;

    if (playerRank < 4) {
	const top4 = standings.slice(0, 4).map((e) => e.team);
	tournamentName = "World Champions Cup";
	tournamentResult = await runTournament(tournamentName, top4, player);
	[grade, title] = tournamentResult ? ["S", "World Football Legend"] : ["B+", "Top Tier Contender"];
    } else if (playerRank < 8) {
	const next4 = standings.slice(4, 8).map((e) => e.team);
	tournamentName = "Europe Champions Cup";
	tournamentResult = await runTournament(tournamentName, next4, player);
	[grade, title] = tournamentResult ? ["A", "Continental Champion"] : ["B", "Strong Challenger"];
    }


    logLine(`\n🎖️ Final Grade as ${player.name}: ${grade}`);
    logLine(`🏅 Title Earned: ${title}`);
    let earnedCoins = 0;

    if (playerRank === 0) {
	earnedCoins += 2;
	logLine("💰 Bonus: World League Champion (1st in standings) +2 Coins");
    }

    if (tournamentResult !== null && tournamentName !== null) {
	const winBonus = tournamentName === "World Champions Cup" ? (tournamentResult ? 5 : 3) : (tournamentResult ? 3 : 1);
	earnedCoins += winBonus;
	logLine(`💰 ${tournamentName} ${tournamentResult ? 'Win' : 'Participation'} +${winBonus} Coins`);
    }

    coinBalance += earnedCoins;
    saveProgress();
    updateGameUI();
    logLine(`🎉 Total Coins Earned: +${earnedCoins}`);
    startButton.disabled = true;
    pullButton.disabled = true;
    deleteButton.disabled = false;
    resetButton.disabled = false;


}

updateGameUI();

