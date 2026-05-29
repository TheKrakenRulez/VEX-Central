"use client";
import { useState, useEffect, useRef } from "react";

export default function Home() {
  const canvasRef = useRef(null);

  // --- SCALE MATRIX CONFIGURATION ---
  // A real VEX arena is 144 inches square (12ft x 12ft). 
  // Our interactive canvas element is 600 pixels square.
  // Ratio: 1 inch = 4.166 pixels. 1 Foam Tile (24 inches) = 100 pixels.
  const SCALE = 600 / 144;

  // Alliance Starting Positions (Centered within legal starting tiles)
  const startingPositions = {
    red: { x: 100, y: 450, angle: -Math.PI / 2 },
    blue: { x: 500, y: 150, angle: -Math.PI / 2 },
  };

  const originalCodeText = "SAMPLE CODE BELOW: \ndriveFor(24); \npickup(); \nturnRight(90);\ndriveFor(12);\nturnLeft(45);\nscore();";

  const centerBoxWidth = 16 * SCALE;
  const centerBoxHeight = 18 * SCALE;
  const wallBlockInset = 10;
  const leftCenterBox = { x: centerBoxWidth / 2, y: 300 };
  const rightCenterBox = { x: 600 - centerBoxWidth / 2, y: 300 };
  const robotRadius = 24;

  const pickupSourceDefinitions = [
    {
      id: "left-center",
      wall: "left",
      x: leftCenterBox.x,
      y: leftCenterBox.y,
      isLoaderSource: false,
      colors: ["#3b82f6", "#3b82f6", "#3b82f6"],
    },
    {
      id: "right-center",
      wall: "right",
      x: rightCenterBox.x,
      y: rightCenterBox.y,
      isLoaderSource: false,
      colors: ["#ef4444", "#ef4444", "#ef4444"],
    },
    {
      id: "top-left-loader",
      wall: "left",
      x: 48,
      y: 48,
      isLoaderSource: true,
      colors: ["#3b82f6", "#3b82f6", "#3b82f6", "#ef4444", "#ef4444", "#ef4444"],
    },
    {
      id: "top-right-loader",
      wall: "right",
      x: 552,
      y: 48,
      isLoaderSource: true,
      colors: ["#ef4444", "#ef4444", "#ef4444", "#3b82f6", "#3b82f6", "#3b82f6"],
    },
    {
      id: "bottom-left-loader",
      wall: "left",
      x: 48,
      y: 552,
      isLoaderSource: true,
      colors: ["#ef4444", "#ef4444", "#ef4444", "#3b82f6", "#3b82f6", "#3b82f6"],
    },
    {
      id: "bottom-right-loader",
      wall: "right",
      x: 552,
      y: 552,
      isLoaderSource: true,
      colors: ["#3b82f6", "#3b82f6", "#3b82f6", "#ef4444", "#ef4444", "#ef4444"],
    },
  ];

  const underGoalPickupBlocks = [
    { sourceId: "under-goal-top", isLoaderSource: false, x: 292, y: 88, color: "#3b82f6" },
    { sourceId: "under-goal-top", isLoaderSource: false, x: 312, y: 88, color: "#ef4444" },
    { sourceId: "under-goal-top", isLoaderSource: false, x: 292, y: 108, color: "#ef4444" },
    { sourceId: "under-goal-top", isLoaderSource: false, x: 312, y: 108, color: "#3b82f6" },
    { sourceId: "under-goal-bottom", isLoaderSource: false, x: 292, y: 492, color: "#3b82f6" },
    { sourceId: "under-goal-bottom", isLoaderSource: false, x: 312, y: 492, color: "#ef4444" },
    { sourceId: "under-goal-bottom", isLoaderSource: false, x: 292, y: 512, color: "#ef4444" },
    { sourceId: "under-goal-bottom", isLoaderSource: false, x: 312, y: 512, color: "#3b82f6" },
  ];

  const clampPoint = (x, y) => ({
    x: Math.max(10, Math.min(590, x)),
    y: Math.max(10, Math.min(590, y)),
  });

  const clampRobotPoint = (x, y) => ({
    x: Math.max(robotRadius, Math.min(600 - robotRadius, x)),
    y: Math.max(robotRadius, Math.min(600 - robotRadius, y)),
  });

  const wallBoundary = robotRadius;

  const getBoxBlockPositions = (source) => {
    const columns = source.wall === "left" ? [20, 40] : [560, 580];
    const rows = [280, 300, 320];

    return columns.flatMap((x) =>
      rows.map((y) => ({ x, y }))
    );
  };

  const buildPickupBlocks = (sources) => [
    ...sources.flatMap((source) => {
      const positions = source.isLoaderSource
        ? [
          { x: source.x, y: source.y - 24 },
          { x: source.x - 8, y: source.y },
          { x: source.x + 8, y: source.y },
          { x: source.x, y: source.y + 24 },
          { x: source.x - 16, y: source.y + 24 },
          { x: source.x + 16, y: source.y + 24 },
        ]
        : getBoxBlockPositions(source);

      return positions.map((position, index) => ({
        sourceId: source.id,
        isLoaderSource: source.isLoaderSource,
        visible: !source.isLoaderSource,
        x: clampPoint(position.x, position.y).x,
        y: clampPoint(position.x, position.y).y,
        color: source.colors[index],
      }));
    }),
    ...underGoalPickupBlocks,
  ];

  const goalLegCenters = [
    { x: 270, y: 270 },
    { x: 320, y: 270 },
    { x: 270, y: 330 },
    { x: 320, y: 330 },
  ];

  // --- STATE SYSTEM ---
  const [alliance, setAlliance] = useState("red"); // "red" or "blue"
  const [codeText, setCodeText] = useState(originalCodeText);
  const [currentLine, setCurrentLine] = useState("Ready to parse autonomous routine script.");
  const [isSimulating, setIsSimulating] = useState(false);
  const [robotState, setRobotState] = useState(startingPositions.red);
  const [robotPath, setRobotPath] = useState([startingPositions.red]);
  const [isDragging, setIsDragging] = useState(false);
  const [pickupBlocks, setPickupBlocks] = useState(buildPickupBlocks(pickupSourceDefinitions));
  const [carriedBlocks, setCarriedBlocks] = useState([]);
  const [scoredBlocks, setScoredBlocks] = useState([]);
  const [clearedLoaderIds, setClearedLoaderIds] = useState([]);
  const [parkingZoneCleared, setParkingZoneCleared] = useState(false);
  const [parkedBonusEarned, setParkedBonusEarned] = useState(false);
  const [allowRotation, setAllowRotation] = useState(true);

  const robotStateRef = useRef(robotState);

  const mmToPx = (mm) => (mm / 25.4) * SCALE;
  const isBlockedByWalls = (x, y) => x < wallBoundary || x > 600 - wallBoundary || y < wallBoundary || y > 600 - wallBoundary;
  const isRobotInParkingZone = (state) => {
    const leftZone = state.x >= 24 && state.x <= 42.6666666667 && state.y >= 286.5 && state.y <= 313.5;
    const rightZone = state.x >= 557.3333333333 && state.x <= 576 && state.y >= 286.5 && state.y <= 313.5;
    return leftZone || rightZone;
  };
  const isBlockedByCenterX = (x, y) => {
    const dx = x - 300;
    const dy = y - 300;

    const checkAngle = (angle) => {
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const rotatedX = dx * cos + dy * sin;
      const rotatedY = -dx * sin + dy * cos;
      return Math.abs(rotatedX) <= 90 && Math.abs(rotatedY) <= 16;
    };

    return checkAngle(Math.PI / 4) || checkAngle((3 * Math.PI) / 4);
  };
  const isBlockedByGoalLegs = (x, y) => {
    const goalLegRadius = 18;
    return goalLegCenters.some((leg) => Math.hypot(x - leg.x, y - leg.y) <= goalLegRadius);
  };
  const isPointBlocked = (x, y) => isBlockedByWalls(x, y) || isBlockedByCenterX(x, y) || isBlockedByGoalLegs(x, y);
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const parsePythonLikeProgram = (scriptText) => {
    const functions = new Map();
    const callOrder = [];
    let currentFunction = null;

    scriptText.split("\n").forEach((rawLine) => {
      const trimmed = rawLine.trim().replace(/;$/, "");
      if (!trimmed || trimmed.startsWith("#")) return;

      const legacyCommandMatch = trimmed.match(/^(driveFor|turnRight|turnLeft|pickup|score|motor_18\.spin)\(/);
      if (legacyCommandMatch) {
        const commandName = `__legacy_${callOrder.length}`;
        functions.set(commandName, [trimmed]);
        callOrder.push(commandName);
        return;
      }

      const isIndented = rawLine.startsWith(" ") || rawLine.startsWith("\t");
      const defMatch = trimmed.match(/^def\s+([A-Za-z_][A-Za-z0-9_]*)\(([^)]*)\):$/);
      if (defMatch) {
        currentFunction = { name: defMatch[1], body: [] };
        functions.set(currentFunction.name, currentFunction.body);
        return;
      }

      if (currentFunction) {
        if (!isIndented) {
          currentFunction = null;
        } else {
          if (trimmed.startsWith("global ") || trimmed.includes("=")) return;
          currentFunction.body.push(trimmed);
          return;
        }
      }

      const callMatch = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)\(\)$/);
      if (callMatch) {
        callOrder.push(callMatch[1]);
      }
    });

    return { functions, callOrder };
  };

  const getOppositeGoalCenter = (x, y) => {
    if (x < 300) {
      return { x: 562.5, y: 300 };
    }

    return { x: 37.5, y: 300 };
  };

  const getCanvasPoint = (event) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  const updateRobotPose = (x, y) => {
    const next = clampRobotPoint(x, y);
    if (isPointBlocked(next.x, next.y)) {
      return;
    }

    const nextAngle = allowRotation
      ? Math.atan2(next.y - robotState.y, next.x - robotState.x) - Math.PI / 2
      : -Math.PI / 2;

    setRobotState({ ...next, angle: nextAngle });
    setRobotPath([{ ...next, angle: nextAngle }]);
  };

  const handlePointerDown = (event) => {
    const point = getCanvasPoint(event);
    if (!point) return;

    const dx = point.x - robotState.x;
    const dy = point.y - robotState.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance <= 40) {
      event.preventDefault();
      setIsDragging(true);
      canvasRef.current?.setPointerCapture(event.pointerId);
    }
  };

  const handlePointerMove = (event) => {
    if (!isDragging) return;
    const point = getCanvasPoint(event);
    if (!point) return;

    updateRobotPose(point.x, point.y);
  };

  const handlePointerUp = (event) => {
    if (!isDragging) return;
    setIsDragging(false);
    canvasRef.current?.releasePointerCapture?.(event.pointerId);
  };

  const drawBlock = (ctx, x, y, color) => {
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.strokeStyle = color === "#ef4444" ? "#991b1b" : "#1e40af";
    ctx.lineWidth = 2;
    ctx.fill();
    ctx.stroke();
  };

  const findNearestPickupBlock = (point, blocks = pickupBlocks) => {
    if (!blocks.length) return null;

    let nearest = null;
    let nearestDistance = Infinity;

    blocks.forEach((block) => {
      const dx = point.x - block.x;
      const dy = point.y - block.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearest = block;
      }
    });

    return nearestDistance <= 88 ? nearest : null;
  };

  const goalTargets = [
    { goalId: "top-left", x: 180, y: 100, radius: 40 },
    { goalId: "top-right", x: 420, y: 100, radius: 40 },
    { goalId: "bottom-left", x: 180, y: 500, radius: 40 },
    { goalId: "bottom-right", x: 420, y: 500, radius: 40 },
    { goalId: "x-top-left", x: 260, y: 240, radius: 30 },
    { goalId: "x-top-right", x: 340, y: 240, radius: 30 },
    { goalId: "x-bottom-left", x: 260, y: 360, radius: 30 },
    { goalId: "x-bottom-right", x: 340, y: 360, radius: 30 },
  ];

  const getGoalTarget = (point) => {
    let nearest = null;
    let nearestDistance = Infinity;

    goalTargets.forEach((goal) => {
      const distance = Math.hypot(point.x - goal.x, point.y - goal.y);
      if (distance <= goal.radius && distance < nearestDistance) {
        nearestDistance = distance;
        nearest = goal;
      }
    });

    return nearest;
  };

  const getScoredBlockPosition = (goalId, index) => {
    const goal = goalTargets.find((target) => target.goalId === goalId) ?? { x: 300, y: 300 };
    const row = Math.floor(index / 2);
    const col = index % 2;

    let x = goal.x;
    let y = goal.y;

    if (goalId.includes("top")) {
      y += 18;
    } else if (goalId.includes("bottom")) {
      y -= 18;
    }

    if (goalId.includes("left")) {
      x += 18;
    } else if (goalId.includes("right")) {
      x -= 18;
    }

    x += col === 0 ? -10 : 10;
    y += row === 0 ? -8 : row === 1 ? 10 : 28;

    if (goalId.startsWith("x-")) {
      x += col === 0 ? -10 : 10;
      y += row === 0 ? -8 : row === 1 ? 10 : 28;
    }

    return clampPoint(x, y);
  };

  // --- CANVAS FIELD RENDERER ---
  const drawField = (
    ctx,
    robotPath = [],
    currentPickupBlocks = pickupBlocks,
    currentCarriedBlocks = carriedBlocks,
    currentScoredBlocks = scoredBlocks,
  ) => {
    // 1. Draw solid, uniform Grey Foam Tiles Floor
    ctx.fillStyle = "#4b5563"; // Uniform tournament matte gray
    ctx.fillRect(0, 0, 600, 600);

    // Draw faint Tile Boundary Grid Lines (6x6 Grid - every 100px)
    ctx.strokeStyle = "#374151";
    ctx.lineWidth = 1;
    for (let i = 1; i < 6; i++) {
      ctx.beginPath(); ctx.moveTo(i * 100, 0); ctx.lineTo(i * 100, 600); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i * 100); ctx.lineTo(600, i * 100); ctx.stroke();
    }

    // Outer Perimeter Border Walls
    ctx.strokeStyle = "#18181b";
    ctx.lineWidth = 8;
    ctx.strokeRect(0, 0, 600, 600);

    // --- CENTRAL X GOAL (Top View) ---

    // Center at (300, 300), arms length 90px, width 32px (wider X)
    ctx.save();
    ctx.translate(300, 300);
    ctx.rotate(Math.PI / 4);
    ctx.fillStyle = "#e2e8f0";
    ctx.lineWidth = 0;
    ctx.beginPath();
    ctx.rect(-16, -90, 32, 180);
    ctx.fill();
    ctx.rotate(Math.PI / 2);
    ctx.beginPath();
    ctx.rect(-16, -90, 32, 180);
    ctx.fill();
    ctx.restore();

    // Add four yellow legs in the center where the goal stands
    ctx.save();
    ctx.fillStyle = "#fbbf24";
    ctx.strokeStyle = "#b45309";
    ctx.lineWidth = 2.5;
    const legOffset = 20;
    const legSize = 10;
    // Top-left
    ctx.fillRect(300 - legOffset - legSize, 300 - legOffset - legSize, legSize, legSize);
    ctx.strokeRect(300 - legOffset - legSize, 300 - legOffset - legSize, legSize, legSize);
    // Top-right
    ctx.fillRect(300 + legOffset, 300 - legOffset - legSize, legSize, legSize);
    ctx.strokeRect(300 + legOffset, 300 - legOffset - legSize, legSize, legSize);
    // Bottom-left
    ctx.fillRect(300 - legOffset - legSize, 300 + legOffset, legSize, legSize);
    ctx.strokeRect(300 - legOffset - legSize, 300 + legOffset, legSize, legSize);
    // Bottom-right
    ctx.fillRect(300 + legOffset, 300 + legOffset, legSize, legSize);
    ctx.strokeRect(300 + legOffset, 300 + legOffset, legSize, legSize);
    ctx.restore();

    const centerBoxWidth = 18 * SCALE;
    const centerBoxHeight = 18 * SCALE;
    const leftCenterBox = { x: centerBoxWidth / 2, y: 300 };
    const rightCenterBox = { x: 600 - centerBoxWidth / 2, y: 300 };

    ctx.save();
    ctx.strokeStyle = "#ef4444";
    ctx.lineWidth = 4;
    ctx.strokeRect(leftCenterBox.x - centerBoxWidth / 2, leftCenterBox.y - centerBoxHeight / 2, centerBoxWidth, centerBoxHeight);
    ctx.restore();

    ctx.save();
    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 4;
    ctx.strokeRect(rightCenterBox.x - centerBoxWidth / 2, rightCenterBox.y - centerBoxHeight / 2, centerBoxWidth, centerBoxHeight);
    ctx.restore();

    currentPickupBlocks
      .filter((block) => block.visible !== false)
      .forEach((block) => {
        drawBlock(ctx, block.x, block.y, block.color);
      });

    currentScoredBlocks.forEach((block) => {
      drawBlock(ctx, block.x, block.y, block.color);
    });

    // 2. Draw Central White Barrier Pipes (Double white divider lines through center x=300)
    ctx.strokeStyle = "#f8fafc";
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(296, 0); ctx.lineTo(296, 600); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(304, 0); ctx.lineTo(304, 600); ctx.stroke();

    // 3. Draw a top-left scoring goal marker on the left wall at the seam between the top and bottom tiles
    ctx.save();
    const goalRadius = 14;
    const leftGoalX = 18;
    const leftGoalY = 100;

    ctx.beginPath();
    ctx.moveTo(leftGoalX - goalRadius, leftGoalY);
    ctx.arc(leftGoalX, leftGoalY, goalRadius, Math.PI, 0);
    ctx.closePath();
    ctx.fillStyle = "#ef4444";
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(leftGoalX + goalRadius, leftGoalY);
    ctx.arc(leftGoalX, leftGoalY, goalRadius, 0, Math.PI);
    ctx.closePath();
    ctx.fillStyle = "#3b82f6";
    ctx.fill();

    ctx.lineWidth = 2.5;
    ctx.strokeStyle = "#f8fafc";
    ctx.beginPath();
    ctx.arc(leftGoalX, leftGoalY, goalRadius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // 4. Draw a mirrored top-right scoring goal marker on the right wall at the seam between the top and bottom tiles
    ctx.save();
    const rightGoalX = 582;
    const rightGoalY = 100;

    ctx.beginPath();
    ctx.moveTo(rightGoalX - goalRadius, rightGoalY);
    ctx.arc(rightGoalX, rightGoalY, goalRadius, Math.PI, 0);
    ctx.closePath();
    ctx.fillStyle = "#3b82f6";
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(rightGoalX + goalRadius, rightGoalY);
    ctx.arc(rightGoalX, rightGoalY, goalRadius, 0, Math.PI);
    ctx.closePath();
    ctx.fillStyle = "#ef4444";
    ctx.fill();

    ctx.lineWidth = 2.5;
    ctx.strokeStyle = "#f8fafc";
    ctx.beginPath();
    ctx.arc(rightGoalX, rightGoalY, goalRadius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // 5. Draw a mirrored bottom-left scoring goal marker on the left wall at the seam between the bottom and tile below it
    ctx.save();
    const bottomLeftGoalX = 18;
    const bottomLeftGoalY = 500;

    ctx.beginPath();
    ctx.moveTo(bottomLeftGoalX - goalRadius, bottomLeftGoalY);
    ctx.arc(bottomLeftGoalX, bottomLeftGoalY, goalRadius, Math.PI, 0);
    ctx.closePath();
    ctx.fillStyle = "#3b82f6";
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(bottomLeftGoalX + goalRadius, bottomLeftGoalY);
    ctx.arc(bottomLeftGoalX, bottomLeftGoalY, goalRadius, 0, Math.PI);
    ctx.closePath();
    ctx.fillStyle = "#ef4444";
    ctx.fill();

    ctx.lineWidth = 2.5;
    ctx.strokeStyle = "#f8fafc";
    ctx.beginPath();
    ctx.arc(bottomLeftGoalX, bottomLeftGoalY, goalRadius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // 6. Draw a mirrored bottom-right scoring goal marker on the right wall at the seam between the bottom and tile below it
    ctx.save();
    const bottomRightGoalX = 582;
    const bottomRightGoalY = 500;

    ctx.beginPath();
    ctx.moveTo(bottomRightGoalX - goalRadius, bottomRightGoalY);
    ctx.arc(bottomRightGoalX, bottomRightGoalY, goalRadius, Math.PI, 0);
    ctx.closePath();
    ctx.fillStyle = "#ef4444";
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(bottomRightGoalX + goalRadius, bottomRightGoalY);
    ctx.arc(bottomRightGoalX, bottomRightGoalY, goalRadius, 0, Math.PI);
    ctx.closePath();
    ctx.fillStyle = "#3b82f6";
    ctx.fill();

    ctx.lineWidth = 2.5;
    ctx.strokeStyle = "#f8fafc";
    ctx.beginPath();
    ctx.arc(bottomRightGoalX, bottomRightGoalY, goalRadius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // 5. Draw 3D-Look Elevation Bar Assemblies (Top at y=100, Bottom at y=500)
    const elevationBarYPositions = [100, 500];

    elevationBarYPositions.forEach((yPos) => {
      // Clear/White frosted horizontal bar structure extended to exactly 210px
      ctx.fillStyle = "rgba(241, 245, 249, 0.35)";
      ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
      ctx.lineWidth = 2;
      ctx.fillRect(195, yPos - 10, 210, 20);
      ctx.strokeRect(195, yPos - 10, 210, 20);

      // --- UPDATED: Translucent amber/orange center base housing shortened to 60px ---
      // X = 270 with a width of 60 stretches perfectly from X=270 to X=330 (centered at X=300)
      ctx.fillStyle = "rgba(245, 158, 11, 0.45)";
      ctx.strokeStyle = "#d97706";
      ctx.fillRect(270, yPos - 12, 60, 24);
      ctx.strokeRect(270, yPos - 12, 60, 24);

      // White dividing brackets adjusted to fit the new 60px housing boundaries
      ctx.fillStyle = "#f8fafc";
      ctx.fillRect(270, yPos - 14, 6, 28);
      ctx.fillRect(324, yPos - 14, 6, 28);

      // Yellow/Amber structural legs drawn completely straight pointing straight down
      ctx.strokeStyle = "#d97706";
      ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(200, yPos + 10); ctx.lineTo(200, yPos + 22); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(400, yPos + 10); ctx.lineTo(400, yPos + 22); ctx.stroke();
    });

    // 6. Trace Traveling Line Path Trail
    if (robotPath.length > 1) {
      ctx.strokeStyle = alliance === "red" ? "#f43f5e" : "#60a5fa";
      ctx.lineWidth = 4;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(robotPath[0].x, robotPath[0].y);
      for (let p = 1; p < robotPath.length; p++) {
        ctx.lineTo(robotPath[p].x, robotPath[p].y);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 7. Draw Robot Body Shape
    if (robotPath.length > 0) {
      const currentPos = robotPath[robotPath.length - 1];
      ctx.save();
      ctx.translate(currentPos.x, currentPos.y);
      ctx.rotate(currentPos.angle);

      // Chassis Core Structure Block Box
      ctx.fillStyle = "#27272a";
      ctx.strokeStyle = alliance === "red" ? "#ef4444" : "#3b82f6";
      ctx.lineWidth = 3;
      ctx.fillRect(-24, -24, 48, 48);
      ctx.strokeRect(-24, -24, 48, 48);

      // Wheels outline decoration
      ctx.fillStyle = "#09090b";
      ctx.fillRect(-28, -20, 4, 12);
      ctx.fillRect(24, -20, 4, 12);
      ctx.fillRect(-28, 8, 4, 12);
      ctx.fillRect(24, 8, 4, 12);

      // Forward Heading Indicator Arrow (on front of robot)
      ctx.fillStyle = alliance === "red" ? "#ef4444" : "#3b82f6";
      ctx.beginPath();
      ctx.moveTo(0, 28);
      ctx.lineTo(-8, 18);
      ctx.lineTo(8, 18);
      ctx.closePath();
      ctx.fill();

      currentCarriedBlocks.forEach((block, index) => {
        const offsetAngle = index * 0.6;
        ctx.fillStyle = block.color;
        ctx.strokeStyle = block.color === "#ef4444" ? "#991b1b" : "#1e40af";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(24 + Math.cos(offsetAngle) * 12, Math.sin(offsetAngle) * 10, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      });

      ctx.restore();
    }
  };

  useEffect(() => {
    robotStateRef.current = robotState;
  }, [robotState]);

  useEffect(() => {
    const resetState = startingPositions[alliance];
    setRobotState(resetState);
    setRobotPath([resetState]);
    setPickupBlocks(buildPickupBlocks(pickupSourceDefinitions));
    setCarriedBlocks([]);
    setScoredBlocks([]);
    setClearedLoaderIds([]);
    setParkingZoneCleared(false);
    setParkedBonusEarned(false);
  }, [alliance]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    drawField(ctx, robotPath, pickupBlocks, carriedBlocks, scoredBlocks);
  }, [robotPath, pickupBlocks, carriedBlocks, scoredBlocks]);

  const runSimulation = async () => {
    if (isSimulating) return;
    setIsSimulating(true);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const program = parsePythonLikeProgram(codeText);

    let currentRobotState = { ...robotStateRef.current };
    let currentPickupBlocks = [...pickupBlocks];
    let currentCarriedBlocks = [...carriedBlocks];
    let currentScoredBlocks = [...scoredBlocks];
    let frameHistory = [{ ...currentRobotState }];

    const refreshFrame = () => {
      setRobotState({ ...currentRobotState });
      setRobotPath([...frameHistory]);
      setPickupBlocks([...currentPickupBlocks]);
      setCarriedBlocks([...currentCarriedBlocks]);
      setScoredBlocks([...currentScoredBlocks]);
      drawField(ctx, frameHistory, currentPickupBlocks, currentCarriedBlocks, currentScoredBlocks);
    };

    const executeLine = async (line) => {
      if (!line) return;

      setCurrentLine(line);

      if (line === "pickup()") {
        const nearestBlock = findNearestPickupBlock(currentRobotState, currentPickupBlocks);
        if (!nearestBlock) {
          setCurrentLine("No block nearby to pick up.");
          return;
        }

        currentPickupBlocks = currentPickupBlocks.filter((block) => block !== nearestBlock);
        currentCarriedBlocks = [...currentCarriedBlocks, nearestBlock];

        const remainingInSource = currentPickupBlocks.filter((block) => block.sourceId === nearestBlock.sourceId).length;
        if (nearestBlock.isLoaderSource && remainingInSource === 0) {
          setClearedLoaderIds((current) => current.includes(nearestBlock.sourceId) ? current : [...current, nearestBlock.sourceId]);
        }

        setCurrentLine("Picked up block.");
        refreshFrame();
        return;
      }

      if (line === "score()") {
        if (!currentCarriedBlocks.length) {
          setCurrentLine("No block to score.");
          return;
        }

        const goalTarget = getGoalTarget(currentRobotState);
        if (!goalTarget) {
          setCurrentLine("Not near a goal.");
          return;
        }

        const existingCount = currentScoredBlocks.filter((block) => block.goalId === goalTarget.goalId).length;
        const scored = currentCarriedBlocks.map((block, index) => ({
          ...block,
          ...getScoredBlockPosition(goalTarget.goalId, existingCount + index),
          goalId: goalTarget.goalId,
        }));

        currentScoredBlocks = [...currentScoredBlocks, ...scored];
        currentCarriedBlocks = [];
        setCurrentLine(`Scored ${scored.length} block${scored.length === 1 ? "" : "s"}.`);
        refreshFrame();
        return;
      }

      if (line.startsWith("driveFor(")) {
        const inner = line.slice(line.indexOf("(") + 1, line.lastIndexOf(")"));
        const distance = parseFloat(inner.trim());
        if (Number.isNaN(distance)) {
          setCurrentLine(`Skipping invalid drive command: ${line}`);
          return;
        }

        const distancePx = Math.abs(distance) * SCALE;
        const sign = distance >= 0 ? 1 : -1;
        const totalSteps = 25;

        for (let step = 1; step <= totalSteps; step++) {
          const nextX = currentRobotState.x + Math.cos(currentRobotState.angle + Math.PI / 2) * (distancePx * sign / totalSteps);
          const nextY = currentRobotState.y + Math.sin(currentRobotState.angle + Math.PI / 2) * (distancePx * sign / totalSteps);

          if (isBlockedByWalls(nextX, nextY)) {
            currentRobotState = { ...clampRobotPoint(nextX, nextY), angle: currentRobotState.angle };
            setCurrentLine("Blocked by wall.");
            frameHistory.push({ ...currentRobotState });
            refreshFrame();
            break;
          }

          if (isBlockedByCenterX(nextX, nextY)) {
            setCurrentLine("Blocked by center X.");
            break;
          }

          if (isBlockedByGoalLegs(nextX, nextY)) {
            setCurrentLine("Blocked by goal legs.");
            break;
          }

          currentRobotState.x = nextX;
          currentRobotState.y = nextY;
          frameHistory.push({ ...currentRobotState });
          refreshFrame();
          await sleep(25);
        }
        return;
      }

      if (line.startsWith("turnRight(")) {
        const degrees = parseFloat(line.slice(line.indexOf("(") + 1, line.lastIndexOf(")")).trim());
        if (Number.isNaN(degrees)) {
          setCurrentLine(`Skipping invalid turn command: ${line}`);
          return;
        }

        const totalSteps = 20;
        const radiansPerStep = (degrees * Math.PI) / 180 / totalSteps;

        for (let step = 1; step <= totalSteps; step++) {
          currentRobotState.angle += radiansPerStep;
          frameHistory.push({ ...currentRobotState });
          refreshFrame();
          await sleep(25);
        }
        return;
      }

      if (line.startsWith("turnLeft(")) {
        const degrees = parseFloat(line.slice(line.indexOf("(") + 1, line.lastIndexOf(")")).trim());
        if (Number.isNaN(degrees)) {
          setCurrentLine(`Skipping invalid turn command: ${line}`);
          return;
        }

        const totalSteps = 20;
        const radiansPerStep = -(degrees * Math.PI) / 180 / totalSteps;

        for (let step = 1; step <= totalSteps; step++) {
          currentRobotState.angle += radiansPerStep;
          frameHistory.push({ ...currentRobotState });
          refreshFrame();
          await sleep(25);
        }
        return;
      }

      if (line.startsWith("drivetrain.drive_for(")) {
        const inner = line.slice(line.indexOf("(") + 1, line.lastIndexOf(")"));
        const [direction, rawDistance, unit] = inner.split(",").map((part) => part.trim());
        const distance = parseFloat(rawDistance);
        if (Number.isNaN(distance)) {
          setCurrentLine(`Skipping invalid drive command: ${line}`);
          return;
        }

        const distancePx = unit === "MM" ? mmToPx(distance) : distance * SCALE;
        const sign = direction === "BACKWARD" ? -1 : 1;
        const totalSteps = 25;

        for (let step = 1; step <= totalSteps; step++) {
          const nextX = currentRobotState.x + Math.cos(currentRobotState.angle + Math.PI / 2) * (distancePx * sign / totalSteps);
          const nextY = currentRobotState.y + Math.sin(currentRobotState.angle + Math.PI / 2) * (distancePx * sign / totalSteps);

          if (isBlockedByWalls(nextX, nextY)) {
            currentRobotState = { ...clampRobotPoint(nextX, nextY), angle: currentRobotState.angle };
            setCurrentLine("Blocked by wall.");
            frameHistory.push({ ...currentRobotState });
            refreshFrame();
            break;
          }

          if (isBlockedByCenterX(nextX, nextY)) {
            setCurrentLine("Blocked by center X.");
            break;
          }

          if (isBlockedByGoalLegs(nextX, nextY)) {
            setCurrentLine("Blocked by goal legs.");
            break;
          }

          currentRobotState.x = nextX;
          currentRobotState.y = nextY;
          frameHistory.push({ ...currentRobotState });
          refreshFrame();
          await sleep(25);
        }
        return;
      }

      if (line.startsWith("drivetrain.turn_for(")) {
        const inner = line.slice(line.indexOf("(") + 1, line.lastIndexOf(")"));
        const [direction, rawDegrees] = inner.split(",").map((part) => part.trim());
        const degrees = parseFloat(rawDegrees);
        if (Number.isNaN(degrees)) {
          setCurrentLine(`Skipping invalid turn command: ${line}`);
          return;
        }

        const sign = direction === "RIGHT" ? 1 : -1;
        const totalSteps = 20;
        const radiansPerStep = (sign * degrees * Math.PI) / 180 / totalSteps;

        for (let step = 1; step <= totalSteps; step++) {
          currentRobotState.angle += radiansPerStep;
          frameHistory.push({ ...currentRobotState });
          refreshFrame();
          await sleep(25);
        }
        return;
      }

      if (line.startsWith("motor_18.spin(")) {
        const direction = line.slice(line.indexOf("(") + 1, line.lastIndexOf(")")).trim();
        setCurrentLine(`Spin motor_18 ${direction}`);
        await sleep(100);
        return;
      }

      if (line.startsWith("global ") || line.includes("=")) {
        return;
      }

      if (line.match(/^[A-Za-z_][A-Za-z0-9_]*\(\)$/)) {
        setCurrentLine(`Running ${line}`);
        return;
      }

      setCurrentLine(`Skipping unsupported line: ${line}`);
    };

    for (const callName of program.callOrder) {
      const functionBody = program.functions.get(callName);
      if (!functionBody) {
        setCurrentLine(`Function ${callName} not found.`);
        continue;
      }

      for (const line of functionBody) {
        await executeLine(line);
      }
    }

    setRobotState({ ...currentRobotState });
    setRobotPath([...frameHistory]);
    setPickupBlocks([...currentPickupBlocks]);
    setCarriedBlocks([...currentCarriedBlocks]);
    setScoredBlocks([...currentScoredBlocks]);
    drawField(ctx, frameHistory, currentPickupBlocks, currentCarriedBlocks, currentScoredBlocks);

    const finalParkingZoneCleared = currentPickupBlocks.filter((block) => block.sourceId === "left-center" || block.sourceId === "right-center").length === 0;
    const finalParkedBonusEarned = isRobotInParkingZone(currentRobotState);
    setParkingZoneCleared(finalParkingZoneCleared);
    setParkedBonusEarned(finalParkedBonusEarned);
    setCurrentLine("Execution finished.");
    setIsSimulating(false);
  };

  const resetSimulation = () => {
    const resetState = startingPositions[alliance];
    setRobotState(resetState);
    setRobotPath([resetState]);
    setPickupBlocks(buildPickupBlocks(pickupSourceDefinitions));
    setCarriedBlocks([]);
    setScoredBlocks([]);
    setClearedLoaderIds([]);
    setParkingZoneCleared(false);
    setParkedBonusEarned(false);
    setCodeText(originalCodeText);
    setCurrentLine("Reset complete.");
  };

  const blocksScored = scoredBlocks.length;
  const clearedLoaders = clearedLoaderIds.length;
  const parkingZoneScore = parkingZoneCleared ? 5 : 0;
  const parkedScore = parkedBonusEarned ? 15 : 0;
  const totalScore = blocksScored + clearedLoaders * 5 + parkingZoneScore + parkedScore;

  return (
    <div className="p-6 flex flex-col items-center">
      <main className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 mt-4">

        {/* CONTROL DECK CODE TERMINAL */}
        <div className="lg:col-span-5 flex flex-col gap-6 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">

          {/* ALLIANCE SELECTION TOGGLE BOXES */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 font-mono">
              Select Your Alliance
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setAlliance("red")}
                disabled={isSimulating}
                className={`py-4 rounded-xl font-mono text-sm font-black uppercase tracking-wider transition-all border shadow-lg ${alliance === "red"
                  ? "bg-red-600/20 border-red-500 text-red-400 ring-2 ring-red-500/30"
                  : "bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-400 hover:border-slate-700"
                  }`}
              >
                🔴 Red Alliance
              </button>
              <button
                type="button"
                onClick={() => setAlliance("blue")}
                disabled={isSimulating}
                className={`py-4 rounded-xl font-mono text-sm font-black uppercase tracking-wider transition-all border shadow-lg ${alliance === "blue"
                  ? "bg-blue-600/20 border-blue-500 text-blue-400 ring-2 ring-blue-500/30"
                  : "bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-400 hover:border-slate-700"
                  }`}
              >
                🔵 Blue Alliance
              </button>
            </div>
          </div>

          <div className="flex-1 flex flex-col">
            <label className="text-[15px] block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono">
              Script Editor
            </label>
            <p className="text-[13px] text-slate-400 font-mono mb-3 leading-tight">
              <strong>Path Editor:</strong> Drag the robot to position it and click <strong>Rotation</strong> to adjust its heading.
              All <em>driveFor()</em> measurements are in inches; <em>driveLeft/Right()</em> use degrees.
              This tool supports all functions listed below.
            </p>
            <textarea
              value={codeText}
              onChange={(e) => setCodeText(e.target.value)}
              disabled={isSimulating}
              rows={10}
              className="w-full flex-1 bg-slate-950 border border-slate-700 rounded-xl p-4 font-mono text-sm text-emerald-400 focus:outline-none focus:border-red-500 resize-none leading-relaxed tracking-wide shadow-inner min-h-[250px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setAllowRotation((current) => !current)}
              disabled={isSimulating}
              className={`py-3 px-4 rounded-xl font-bold transition-all font-mono text-sm uppercase tracking-wide border ${allowRotation
                ? "bg-amber-500 text-slate-950 border-amber-400"
                : "bg-slate-950 border-slate-700 text-slate-300 hover:border-slate-600"
                }`}
            >
              {allowRotation ? "Rotation: ON" : "Rotation: OFF"}
            </button>
            <button
              onClick={runSimulation}
              disabled={isSimulating}
              className="bg-red-500 hover:bg-red-600 disabled:bg-slate-800 text-white py-3 px-4 rounded-xl font-bold transition-all font-mono text-sm uppercase tracking-wide shadow-lg"
            >
              {isSimulating ? "Running..." : "▶ Run Path"}
            </button>
            <button
              onClick={resetSimulation}
              disabled={isSimulating}
              className="bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-400 py-3 px-4 rounded-xl font-bold transition-all font-mono text-sm uppercase tracking-wide"
            >
              🔄 Clear Map
            </button>
          </div>
        </div>

        {/* SIMULATOR CORE VIEWPORT */}
        <div className="lg:col-span-7 flex flex-col items-center gap-4">
          <div className="border-4 border-slate-800 rounded-3xl overflow-hidden shadow-2xl bg-slate-900 p-2">
            <canvas
              ref={canvasRef}
              width={600}
              height={600}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
              className="rounded-xl max-w-full h-auto block bg-slate-950 cursor-grab"
            />
          </div>

          <div className="w-full max-w-[616px] flex flex-col gap-3">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md">
              <div className="flex items-center justify-between gap-4">
                <div>
<p className="text-[18px] uppercase tracking-[0.2em] text-slate-300 font-mono font-bold">Score Tally</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-black text-amber-300">{totalScore}</p>
                  <p className="text-[11px] uppercase tracking-[0.3em] text-slate-500 font-mono">Total</p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2">
                  <p className="text-[11px] uppercase tracking-[0.3em] text-slate-500 font-mono">Blocks Scored</p>
                  <p className="mt-2 text-2xl font-black text-emerald-300">{blocksScored}</p>
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2">
                  <p className="text-[11px] uppercase tracking-[0.3em] text-slate-500 font-mono">Loaders Cleared</p>
                  <p className="mt-2 text-2xl font-black text-cyan-300">{clearedLoaders}</p>
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2">
                  <p className="text-[11px] uppercase tracking-[0.3em] text-slate-500 font-mono">Parking Zone Cleared</p>
                  <p className="mt-2 text-2xl font-black text-amber-300">{parkingZoneScore}</p>
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2">
                  <p className="text-[11px] uppercase tracking-[0.3em] text-slate-500 font-mono">Parking Bonus</p>
                  <p className="mt-2 text-2xl font-black text-fuchsia-300">{parkedScore}</p>
                </div>
              </div>
            </div>

            {/* LOGGER SYSTEM */}
            <div className="bg-slate-900 border border-slate-800 px-4 py-3 rounded-xl font-mono text-xs flex gap-3 items-center shadow-md">
              <span className={`w-2 h-2 rounded-full ${isSimulating ? "bg-amber-400 animate-pulse" : "bg-emerald-400"}`} />
              <span className="text-slate-500 font-black tracking-wider uppercase">Console:</span>
              <span className="text-slate-300 truncate">{currentLine}</span>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}