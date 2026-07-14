export function calculatePartnerScore(myTeam, partner) {
  if (!myTeam || !partner) return 0;

  // 1. Combined Auton Performance (Max 35 points)
  const autonConsistency = partner.hasAuton === "yes" ? (Number(partner.autonConsistency) || 0) : 0;
  const autonPoints = partner.hasAuton === "yes" ? (Number(partner.autonPoints) || 0) : 0;
  const autonScore = partner.hasAuton === "yes"
    ? (autonConsistency / 100) * (15 + Math.min(autonPoints, 20))
    : 0;

  // 2. Drivetrain Speed (Max 10 points)
  let drivetrainScore = 0;
  if (partner.drivetrainSpeed === "fast") drivetrainScore = 10;
  else if (partner.drivetrainSpeed === "average") drivetrainScore = 5;
  else if (partner.drivetrainSpeed === "slow") drivetrainScore = 2.5;

  // 3. Matchloader Intake (Max 10 points)
  let matchloaderScore = 0;
  if (partner.hasMatchloaderIntake === "yes") {
    if (partner.matchloaderSpeed === "fast") matchloaderScore = 10;
    else if (partner.matchloaderSpeed === "med") matchloaderScore = 7;
    else if (partner.matchloaderSpeed === "slow") matchloaderScore = 4;
    else matchloaderScore = 5; // Default if speed not set
  }

  // 4. De-Scoring (Max 10 points)
  const deScoringScore = partner.deScoring === "yes" ? 10 : 0;

  // 5. End-Game Parking (Max 10 points)
  let parkingScore = 0;
  if (partner.singleParking === "yes") parkingScore += 5;
  if (partner.doubleParking === "yes") parkingScore += 5;

  // 6. Scoring Speed (Max 10 points)
  let scoringSpeedScore = 0;
  if (partner.scoringSpeed === "fast") scoringSpeedScore = 10;
  else if (partner.scoringSpeed === "average") scoringSpeedScore = 5;
  else if (partner.scoringSpeed === "slow") scoringSpeedScore = 2.5;

  // Strategy Synergy (Max 15 points)
  let strategySynergy = 0;
  if (myTeam.primaryStrategy === "offense" && (partner.primaryStrategy === "defense" || partner.primaryStrategy === "balanced")) {
    strategySynergy = 15;
  }

  // Auton Gap-Fill (Max 15 points)
  let autonGapFill = 0;
  if (myTeam.hasAuton !== "yes" && partner.hasAuton === "yes") {
    autonGapFill = (autonConsistency / 100) * 15;
  }

  // Total Score (Capped at 100)
  let total = autonScore + drivetrainScore + matchloaderScore + deScoringScore + parkingScore + scoringSpeedScore + strategySynergy + autonGapFill;
  total = Math.min(100, total);

  return Math.round(total * 10) / 10;
}

export function generateCoachComment(myTeam, partner) {
  if (!myTeam || !partner) return "";

  const comments = [];

  // Auton synergy / gap fill reasons
  if (myTeam.hasAuton !== "yes" && partner.hasAuton === "yes") {
    comments.push(`Pick this team to cover your autonomous weaknesses (they have a consistent ${partner.autonConsistency || 0}% auton routine scoring ${partner.autonPoints || 0} pts).`);
  } else if (myTeam.hasAuton === "yes" && partner.hasAuton === "yes") {
    comments.push(`Excellent auton pairing - both alliances can coordinate autonomous routines for maximum prefix bonus.`);
  }

  // Drivetrain Speed reasons
  if (myTeam.drivetrainSpeed === "fast" && partner.drivetrainSpeed === "fast") {
    comments.push("High-speed pacing: Both teams have fast drivetrains, enabling a highly mobile, aggressive playstyle on the field.");
  } else if (partner.drivetrainSpeed === "fast") {
    comments.push("Their fast drivetrain offers superb field mobility to escape defense and lock down position.");
  } else if (partner.drivetrainSpeed === "slow") {
    comments.push("While their drivetrain is slower, they compensate with high scoring consistency.");
  }

  // Matchloader Intake reasons
  if (partner.hasMatchloaderIntake === "yes") {
    const speedText = partner.matchloaderSpeed ? `${partner.matchloaderSpeed} speed` : "capable";
    comments.push(`Equipped with a ${speedText} matchloader intake, they excel at clearing blocks from the tall ball stack quickly.`);
  }

  // Scoring Speed reasons
  if (partner.scoringSpeed === "fast") {
    comments.push("Their rapid scoring speed ensures high cycle rates and puts continuous scoring pressure on opponents.");
  }

  // Strategy synergy reasons
  if (myTeam.primaryStrategy === "offense" && partner.primaryStrategy === "defense") {
    comments.push("Synergy: You are offensive-focused while they are defensive, allowing them to control opponents while you dominate the scoring zones.");
  } else if (myTeam.primaryStrategy === "offense" && partner.primaryStrategy === "balanced") {
    comments.push("Synergy: You play offense; they play balanced, which gives you the flexibility to adapt defense or double down on scoring.");
  } else if (myTeam.primaryStrategy === "defense" && partner.primaryStrategy === "offense") {
    comments.push("Synergy: You anchor the defense while this partner scores at high speeds.");
  } else if (myTeam.primaryStrategy === "balanced" && partner.primaryStrategy === "balanced") {
    comments.push("Flexible strategy: Both teams are balanced and can dynamically switch roles mid-match.");
  }

  // End-game parking reasons
  if (partner.doubleParking === "yes") {
    comments.push("Their double-parking capability makes them a highly valuable end-game alliance partner.");
  } else if (partner.singleParking === "yes") {
    comments.push("Capable of single parking to lock in end-game points.");
  }

  // De-scoring reasons
  if (partner.deScoring === "yes") {
    comments.push("Equipped with de-scoring capability to deny opposing alliance points.");
  }

  return comments.length > 0 ? comments.join(" ") : "Solid overall stats and consistent game play.";
}
