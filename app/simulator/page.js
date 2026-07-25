"use client";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { collection, addDoc, getDocs, query, where, serverTimestamp, deleteDoc, updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { overrideGoalTargets, overridePickupBlocks, overrideCupPickupTargets, drawOverrideField, drawOverrideBlock, getToggleRectKeyAtPoint, getInitialBlockCupMarkers, drawDoubleSidedCup, isOverrideBlockOnGoal, getFieldQuadrant } from "./overrideLogic";

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

  const originalCodeText = "SAMPLE CODE BELOW: \nDriveFor(24); \npickupBlock(); \nturnRight(90);\nDriveFor(12);\nturnLeft(45);\nplaceBlock();\nplaceCup();\nflipBlock();\nflipCup();\ntoggle();";
  const PICKUP_RANGE = 88;
  const GOAL_INTERACTION_RADIUS = 52;

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
      colors: ["#3b82f6", "#3b82f6", "#3b82f6", "#3b82f6", "#3b82f6", "#3b82f6"],
    },
    {
      id: "right-center",
      wall: "right",
      x: rightCenterBox.x,
      y: rightCenterBox.y,
      isLoaderSource: false,
      colors: ["#ef4444", "#ef4444", "#ef4444", "#ef4444", "#ef4444", "#ef4444"],
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

  const circlePickupBlocks = [
    // Top-Left Circle (200, 200)
    { sourceId: "circle-top-left", isLoaderSource: false, x: 190, y: 190, color: "#3b82f6" },
    { sourceId: "circle-top-left", isLoaderSource: false, x: 210, y: 190, color: "#ef4444" },
    { sourceId: "circle-top-left", isLoaderSource: false, x: 190, y: 210, color: "#ef4444" },
    { sourceId: "circle-top-left", isLoaderSource: false, x: 210, y: 210, color: "#3b82f6" },

    // Top-Right Circle (400, 200)
    { sourceId: "circle-top-right", isLoaderSource: false, x: 390, y: 190, color: "#3b82f6" },
    { sourceId: "circle-top-right", isLoaderSource: false, x: 410, y: 190, color: "#ef4444" },
    { sourceId: "circle-top-right", isLoaderSource: false, x: 390, y: 210, color: "#ef4444" },
    { sourceId: "circle-top-right", isLoaderSource: false, x: 410, y: 210, color: "#3b82f6" },

    // Bottom-Left Circle (200, 400)
    { sourceId: "circle-bottom-left", isLoaderSource: false, x: 190, y: 390, color: "#3b82f6" },
    { sourceId: "circle-bottom-left", isLoaderSource: false, x: 210, y: 390, color: "#ef4444" },
    { sourceId: "circle-bottom-left", isLoaderSource: false, x: 190, y: 410, color: "#ef4444" },
    { sourceId: "circle-bottom-left", isLoaderSource: false, x: 210, y: 410, color: "#3b82f6" },

    // Bottom-Right Circle (400, 400)
    { sourceId: "circle-bottom-right", isLoaderSource: false, x: 390, y: 390, color: "#3b82f6" },
    { sourceId: "circle-bottom-right", isLoaderSource: false, x: 410, y: 390, color: "#ef4444" },
    { sourceId: "circle-bottom-right", isLoaderSource: false, x: 390, y: 410, color: "#ef4444" },
    { sourceId: "circle-bottom-right", isLoaderSource: false, x: 410, y: 410, color: "#3b82f6" },
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
    ...circlePickupBlocks,
  ];

  const goalLegCenters = [
    { x: 270, y: 270 },
    { x: 320, y: 270 },
    { x: 270, y: 330 },
    { x: 320, y: 330 },
  ];

  // --- STATE SYSTEM ---
  const { user } = useAuth();
  const [savedScripts, setSavedScripts] = useState([]);
  const [saveName, setSaveName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [activeScript, setActiveScript] = useState(null);
  const [alliance, setAlliance] = useState("red"); // "red" or "blue"

  useEffect(() => {
    if (user === undefined) return; // wait for auth to initialize
    if (!user || !db) {
      setSavedScripts([]);
      return;
    }
    const loadScripts = async () => {
      try {
        const q = query(
          collection(db, "scripts"),
          where("userId", "==", user.uid)
        );
        const querySnapshot = await getDocs(q);
        const scripts = [];
        querySnapshot.forEach((document) => {
          scripts.push({ id: document.id, ...document.data() });
        });
        scripts.sort((a, b) => {
          const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : Date.now();
          const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : Date.now();
          return timeB - timeA;
        });
        setSavedScripts(scripts);
      } catch (error) {
        console.error("Error loading scripts:", error);
      }
    };
    loadScripts();
  }, [user]);

  const saveScript = async () => {
    if (!user) {
      alert("Please log in to save scripts.");
      return;
    }
    if (!saveName.trim()) {
      alert("Please provide a name for the script.");
      return;
    }
    if (!db) {
      alert("Database not configured.");
      return;
    }
    setIsSaving(true);
    try {
      const docRef = await addDoc(collection(db, "scripts"), {
        userId: user.uid,
        name: saveName.trim(),
        code: codeText,
        alliance: alliance,
        robotState: robotState,
        createdAt: serverTimestamp()
      });
      const newScript = { id: docRef.id, name: saveName.trim(), code: codeText, alliance, robotState, createdAt: { toMillis: () => Date.now() } };
      setSavedScripts([newScript, ...savedScripts]);
      setActiveScript(newScript);
      setSaveName("");
    } catch (error) {
      console.error("Error saving script:", error);
      alert("Failed to save script.");
    }
    setIsSaving(false);
  };

  const deleteScript = async (id, e) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this script?")) return;
    try {
      await deleteDoc(doc(db, "scripts", id));
      setSavedScripts(savedScripts.filter(s => s.id !== id));
    } catch (error) {
      console.error("Error deleting script:", error);
      alert("Failed to delete script.");
    }
  };

  const startEdit = (script, e) => {
    e.stopPropagation();
    setEditingId(script.id);
    setEditName(script.name);
  };

  const saveEdit = async (id, e) => {
    e.stopPropagation();
    if (!editName.trim()) {
      setEditingId(null);
      return;
    }
    try {
      await updateDoc(doc(db, "scripts", id), { name: editName.trim() });
      setSavedScripts(savedScripts.map(s => s.id === id ? { ...s, name: editName.trim() } : s));
      setEditingId(null);
    } catch (error) {
      console.error("Error renaming script:", error);
      alert("Failed to rename script.");
    }
  };
  const [codeText, setCodeText] = useState(originalCodeText);
  const [currentLine, setCurrentLine] = useState("Ready for script input.");
  const [isSimulating, setIsSimulating] = useState(false);
  const [robotState, setRobotState] = useState(startingPositions.red);
  const [robotPath, setRobotPath] = useState([startingPositions.red]);
  const [isDragging, setIsDragging] = useState(false);
  const [gameMode, setGameMode] = useState("push_back"); // "push_back" or "override"
  const getInitialPickupBlocks = (mode) => {
    if (mode === "override") {
      return [...overridePickupBlocks];
    }
    return buildPickupBlocks(pickupSourceDefinitions);
  };

  const getInitialGoalStates = () => Object.fromEntries(
    overrideGoalTargets.map((goal) => [goal.goalId, { items: [], flipped: false }])
  );

  const getInitialQuadrantStates = () => ({
    topLeft: "yellow",
    topRight: "yellow",
    bottomLeft: "yellow",
    bottomRight: "yellow",
  });

  const [pickupBlocks, setPickupBlocks] = useState(() => getInitialPickupBlocks("push_back"));
  const [pickupCupMarkers, setPickupCupMarkers] = useState(() => overrideCupPickupTargets.map((target) => ({ ...target, visible: true })));
  const [blockCupMarkers, setBlockCupMarkers] = useState(() => getInitialBlockCupMarkers());

  useEffect(() => {
    const resetState = startingPositions[alliance];
    setRobotState(resetState);
    setRobotPath([resetState]);
    setPickupBlocks(getInitialPickupBlocks(gameMode));
    setPickupCupMarkers(overrideCupPickupTargets.map((target) => ({ ...target, visible: true })));
    setBlockCupMarkers(getInitialBlockCupMarkers());
    setCarriedBlocks([]);
    setCarriedCupItems([]);
    setScoredBlocks([]);
    setGoalStates(getInitialGoalStates());
    setQuadrantStates(getInitialQuadrantStates());
  }, [gameMode, alliance]);

  const [carriedBlocks, setCarriedBlocks] = useState([]);
  const [carriedCupItems, setCarriedCupItems] = useState([]);
  const [scoredBlocks, setScoredBlocks] = useState([]);
  const [goalStates, setGoalStates] = useState(getInitialGoalStates);
  const [quadrantStates, setQuadrantStates] = useState(getInitialQuadrantStates);
  const [clearedLoaderIds, setClearedLoaderIds] = useState([]);
  const [leftZoneCleared, setLeftZoneCleared] = useState(false);
  const [rightZoneCleared, setRightZoneCleared] = useState(false);
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
  const isBlockedByOverrideGoals = (x, y) => {
    if (gameMode !== "override") return false;
    const goalBodyInset = 4;
    return overrideGoalTargets.some((goal) =>
      Math.abs(x - goal.x) <= goal.radius + goalBodyInset && Math.abs(y - goal.y) <= goal.radius + goalBodyInset
    );
  };
  const isPointBlocked = (x, y) => isBlockedByWalls(x, y) || isBlockedByCenterX(x, y) || isBlockedByGoalLegs(x, y) || isBlockedByOverrideGoals(x, y);
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const parsePythonLikeProgram = (scriptText) => {
    const functions = new Map();
    const callOrder = [];
    let currentFunction = null;

    scriptText.split("\n").forEach((rawLine) => {
      const trimmed = rawLine.trim().replace(/;$/, "");
      if (!trimmed || trimmed.startsWith("#")) return;

      const legacyCommandMatch = trimmed.match(/^(drivefor|turnright|turnleft|pickupblock|pickupcup|placeblock|placecup|flipblock|flipcup|toggle|pickup|score|motor_18\.spin)\(/i);
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

    return nearestDistance <= PICKUP_RANGE ? nearest : null;
  };

  const getOverrideGoalTargetForInteraction = (point) => {
    let nearest = null;
    let nearestDistance = Infinity;

    overrideGoalTargets.forEach((goal) => {
      const distance = Math.hypot(point.x - goal.x, point.y - goal.y);
      if (distance <= GOAL_INTERACTION_RADIUS && distance < nearestDistance) {
        nearestDistance = distance;
        nearest = goal;
      }
    });

    return nearest;
  };

  const findNearestCupSource = (point, cupMarkers = [], blockCupMarkers = []) => {
    let nearest = null;
    let nearestDistance = Infinity;

    [...cupMarkers, ...blockCupMarkers]
      .filter((marker) => marker.visible !== false)
      .forEach((marker) => {
        const distance = Math.hypot(point.x - marker.x, point.y - marker.y);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearest = marker;
        }
      });

    return nearestDistance <= PICKUP_RANGE ? nearest : null;
  };

  const hasPickupBlockOnGoal = (goal, blocks) =>
    blocks.some((block) => block.visible !== false && isOverrideBlockOnGoal(block, [goal]));

  const canPlaceBlockOnGoal = (goalState, goal, blocks) => {
    const items = goalState.items || [];
    if (!items.length) {
      if (goal && hasPickupBlockOnGoal(goal, blocks)) return false;
      return true;
    }
    return items[items.length - 1].type === "cup";
  };

  const canPlaceCupOnGoal = (goalState) => {
    const items = goalState.items || [];
    if (!items.length) return false;
    return items[items.length - 1].type === "block";
  };

  const goalTargets = [
    { goalId: "top-left", x: 180, y: 100, radius: 40 },
    { goalId: "top-right", x: 420, y: 100, radius: 40 },
    { goalId: "bottom-left", x: 180, y: 500, radius: 40 },
    { goalId: "bottom-right", x: 420, y: 500, radius: 40 },
    { goalId: "x-top-left", x: 236, y: 236, radius: 40 },
    { goalId: "x-top-right", x: 364, y: 236, radius: 40 },
    { goalId: "x-bottom-left", x: 236, y: 364, radius: 40 },
    { goalId: "x-bottom-right", x: 364, y: 364, radius: 40 },
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

  const getGoalQuadrant = (goal) => getFieldQuadrant(goal?.x ?? 300, goal?.y ?? 300);

  const getBlockHalfColors = (block) => {
    if (!block?.color) return { top: null, bottom: null };
    if (block.color === "yellow-yellow") return { top: "yellow", bottom: "yellow" };
    const [primary, secondary] = block.color.split("-");
    return block.flipped
      ? { top: secondary, bottom: primary }
      : { top: primary, bottom: secondary };
  };

  const isGoalAllowedForAlliance = (goalId, alliance) => {
    const goal = overrideGoalTargets.find((candidate) => candidate.goalId === goalId);
    if (!goal) return false;
    if (goal.type === "red" && alliance === "blue") return false;
    if (goal.type === "blue" && alliance === "red") return false;
    return true;
  };

  const getScoredHalvesForBlock = (block, stack, blockIndex) => {
    const { top, bottom } = getBlockHalfColors(block);
    let topColor = top;
    let bottomColor = bottom;

    const below = stack[blockIndex - 1];
    if (below?.type === "cup" && below.orientation === "gray-bottom") {
      bottomColor = null;
    }

    const above = stack[blockIndex + 1];
    if (above?.type === "cup" && above.orientation === "white-top") {
      topColor = null;
    }

    return { top: topColor, bottom: bottomColor };
  };

  const scoreHalfColor = (color, quadrantState, allianceColor) => {
    if (!color) return 0;
    if (color === "yellow") {
      if (quadrantState === "yellow") return 0;
      if (quadrantState === allianceColor) return 10;
      return 0;
    }
    if (color === allianceColor) return 5;
    return 0;
  };

  const getOverrideScoreForAlliance = (goalStatesToScore, quadrantStatesToScore, alliance) => {
    const allianceColor = alliance === "red" ? "red" : "blue";
    return Object.entries(goalStatesToScore).reduce((sum, [goalId, goalState]) => {
      if (!isGoalAllowedForAlliance(goalId, alliance)) return sum;

      const goal = overrideGoalTargets.find((candidate) => candidate.goalId === goalId);
      const quadrantKey = getGoalQuadrant(goal);
      const quadrantState = quadrantStatesToScore[quadrantKey] || "yellow";
      const stack = goalState?.items || [];

      return sum + stack.reduce((goalSum, item, index) => {
        if (!item || item.type !== "block") return goalSum;
        const { top, bottom } = getScoredHalvesForBlock(item, stack, index);
        return goalSum
          + scoreHalfColor(top, quadrantState, allianceColor)
          + scoreHalfColor(bottom, quadrantState, allianceColor);
      }, 0);
    }, 0);
  };

  const getScoredBlockPosition = (goalId, index) => {
    const goal = goalTargets.find((target) => target.goalId === goalId) ?? { x: 300, y: 300 };

    // For long goals (top-left, top-right, bottom-left, bottom-right)
    // Align them in a neat horizontal line inside the elevation bar
    // Spaced by 13px so 15 blocks fit perfectly within the bar limits
    if (goalId === "top-left") {
      return clampPoint(205 + index * 13, 100);
    }
    if (goalId === "top-right") {
      return clampPoint(395 - index * 13, 100);
    }
    if (goalId === "bottom-left") {
      return clampPoint(205 + index * 13, 500);
    }
    if (goalId === "bottom-right") {
      return clampPoint(395 - index * 13, 500);
    }

    // For X-shaped goals, align them in a diagonal line along the arms of the X
    // Starting from the tip (index 0) going inward towards the center (300, 300)
    // Spaced by 12px in x/y so 7 blocks fit perfectly along the diagonal line
    if (goalId === "x-top-left") {
      return clampPoint(236 + index * 12, 236 + index * 12);
    }
    if (goalId === "x-top-right") {
      return clampPoint(364 - index * 12, 236 + index * 12);
    }
    if (goalId === "x-bottom-left") {
      return clampPoint(236 + index * 12, 364 - index * 12);
    }
    if (goalId === "x-bottom-right") {
      return clampPoint(364 - index * 12, 364 - index * 12);
    }

    return clampPoint(goal.x, goal.y);
  };

  // --- CANVAS FIELD RENDERER ---
  const drawField = (
    ctx,
    robotPath = [],
    currentPickupBlocks = pickupBlocks,
    currentCarriedBlocks = carriedBlocks,
    currentScoredBlocks = scoredBlocks,
    currentGoalStates = goalStates,
    currentQuadrantStates = quadrantStates,
    currentPickupCupMarkers = pickupCupMarkers,
    currentBlockCupMarkers = blockCupMarkers,
    currentCarriedCupItems = carriedCupItems,
  ) => {
    if (gameMode === "override") {
      drawOverrideField(ctx, SCALE, currentPickupBlocks, currentScoredBlocks, getScoredBlockPosition, currentGoalStates, currentQuadrantStates, currentPickupCupMarkers, currentBlockCupMarkers);
    } else {
      // 1. Draw solid, uniform Grey Foam Tiles Floor
      ctx.fillStyle = "#7b8794"; // Lighter tournament matte gray
      ctx.fillRect(0, 0, 600, 600);

      // Draw faint Tile Boundary Grid Lines (6x6 Grid - every 100px)
      ctx.strokeStyle = "#5b6472";
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
      ctx.fillStyle = "#ffff03";
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

      // Group scored blocks by goalId to calculate their dynamic positions
      const scoredByGoal = {};
      currentScoredBlocks.forEach((block) => {
        if (!scoredByGoal[block.goalId]) {
          scoredByGoal[block.goalId] = [];
        }
        scoredByGoal[block.goalId].push(block);
      });

      Object.keys(scoredByGoal).forEach((goalId) => {
        const blocks = scoredByGoal[goalId];
        const count = blocks.length;
        blocks.forEach((block, i) => {
          // Dynamic position: older blocks (smaller i) get pushed deeper (larger position index)
          const posIndex = count - 1 - i;
          const pos = getScoredBlockPosition(goalId, posIndex);
          drawBlock(ctx, pos.x, pos.y, block.color);
        });
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
    }

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

      ctx.restore();

      currentCarriedBlocks.forEach((block, index) => {
        const wx = currentPos.x + 28 + index * 4;
        const wy = currentPos.y - 8;

        if (gameMode === "override") {
          drawOverrideBlock(ctx, wx, wy, block.color, "vertical", block.flipped);
        } else {
          drawBlock(ctx, wx, wy, block.color);
        }
      });

      if (gameMode === "override") {
        currentCarriedCupItems.forEach((cup, index) => {
          drawDoubleSidedCup(ctx, currentPos.x + 28, currentPos.y - 24 - index * 10, 12, cup.orientation === "white-top");
        });
      }
    }
  };

  useEffect(() => {
    robotStateRef.current = robotState;
  }, [robotState]);

  useEffect(() => {
    const resetState = startingPositions[alliance];
    setRobotState(resetState);
    setRobotPath([resetState]);
    setPickupBlocks(getInitialPickupBlocks(gameMode));
    setPickupCupMarkers(overrideCupPickupTargets.map((target) => ({ ...target, visible: true })));
    setBlockCupMarkers(getInitialBlockCupMarkers());
    setCarriedBlocks([]);
    setCarriedCupItems([]);
    setScoredBlocks([]);
    setGoalStates(getInitialGoalStates());
    setQuadrantStates(getInitialQuadrantStates());
    setClearedLoaderIds([]);
    setLeftZoneCleared(false);
    setRightZoneCleared(false);
    setParkedBonusEarned(false);
  }, [alliance]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    drawField(ctx, robotPath, pickupBlocks, carriedBlocks, scoredBlocks, goalStates, quadrantStates, pickupCupMarkers, blockCupMarkers, carriedCupItems);
  }, [robotPath, pickupBlocks, carriedBlocks, scoredBlocks, goalStates, quadrantStates, pickupCupMarkers, blockCupMarkers, carriedCupItems]);

  const runSimulation = async () => {
    if (isSimulating) return;
    setIsSimulating(true);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const program = parsePythonLikeProgram(codeText);

    let currentRobotState = { ...robotStateRef.current };
    let currentPickupBlocks = [...pickupBlocks];
    let currentPickupCupMarkers = [...pickupCupMarkers];
    let currentBlockCupMarkers = [...blockCupMarkers];
    let currentCarriedBlocks = [...carriedBlocks];
    let currentCarriedCupItems = [...carriedCupItems];
    let currentScoredBlocks = [...scoredBlocks];
    let currentGoalStates = { ...goalStates };
    let currentQuadrantStates = { ...quadrantStates };
    let frameHistory = [{ ...currentRobotState }];

    const refreshFrame = () => {
      setRobotState({ ...currentRobotState });
      setRobotPath([...frameHistory]);
      setPickupBlocks([...currentPickupBlocks]);
      setPickupCupMarkers([...currentPickupCupMarkers]);
      setBlockCupMarkers([...currentBlockCupMarkers]);
      setCarriedBlocks([...currentCarriedBlocks]);
      setCarriedCupItems([...currentCarriedCupItems]);
      setScoredBlocks([...currentScoredBlocks]);
      setGoalStates({ ...currentGoalStates });
      setQuadrantStates({ ...currentQuadrantStates });
      drawField(ctx, frameHistory, currentPickupBlocks, currentCarriedBlocks, currentScoredBlocks, currentGoalStates, currentQuadrantStates, currentPickupCupMarkers, currentBlockCupMarkers, currentCarriedCupItems);
    };

    const executeLine = async (line) => {
      if (!line) return;

      setCurrentLine(line);

      const trimmedLine = line.trim();
      const normalizedLine = trimmedLine.toLowerCase();

      if (normalizedLine === "pickupblock()" || normalizedLine === "pickup()") {
        if (gameMode === "override" && currentCarriedBlocks.length >= 1) {
          setCurrentLine("Carrying capacity reached (max 1 block in Override)." );
          return;
        }

        const nearestBlock = findNearestPickupBlock(currentRobotState, currentPickupBlocks);
        if (!nearestBlock) {
          setCurrentLine("No block nearby to pick up.");
          return;
        }

        currentPickupBlocks = currentPickupBlocks.filter((block) => block !== nearestBlock);
        const carriedBlock = {
          ...nearestBlock,
          orientation: "vertical",
          flipped: nearestBlock.flipped || false,
        };
        currentCarriedBlocks = [...currentCarriedBlocks, carriedBlock];

        const remainingInSource = currentPickupBlocks.filter((block) => block.sourceId === nearestBlock.sourceId).length;
        if (nearestBlock.isLoaderSource && remainingInSource === 0) {
          setClearedLoaderIds((current) => current.includes(nearestBlock.sourceId) ? current : [...current, nearestBlock.sourceId]);
        }

        setCurrentLine("Picked up block.");
        refreshFrame();
        return;
      }

      if (normalizedLine === "pickupcup()" || normalizedLine === "pickupgoal()") {
        const nearestCup = findNearestCupSource(currentRobotState, currentPickupCupMarkers, currentBlockCupMarkers);
        if (nearestCup) {
          if (nearestCup.id?.startsWith("block-cup-")) {
            currentBlockCupMarkers = currentBlockCupMarkers.map((marker) => marker === nearestCup ? { ...marker, visible: false } : marker);
          } else {
            currentPickupCupMarkers = currentPickupCupMarkers.map((marker) => marker === nearestCup ? { ...marker, visible: false } : marker);
          }
          currentCarriedCupItems = [...currentCarriedCupItems, { orientation: "gray-bottom" }];
          setCurrentLine("Picked up cup.");
          refreshFrame();
          return;
        }

        const goalTarget = gameMode === "override" ? getOverrideGoalTargetForInteraction(currentRobotState) : getGoalTarget(currentRobotState);
        if (goalTarget) {
          const goalState = currentGoalStates[goalTarget.goalId] || { items: [], flipped: false };
          const topItem = goalState.items[goalState.items.length - 1];
          if (topItem?.type === "cup") {
            currentGoalStates = {
              ...currentGoalStates,
              [goalTarget.goalId]: {
                ...goalState,
                items: goalState.items.slice(0, -1),
              },
            };
            currentCarriedCupItems = [...currentCarriedCupItems, { orientation: topItem.orientation || "gray-bottom" }];
            setCurrentLine("Picked up cup from goal.");
            refreshFrame();
            return;
          }
        }

        setCurrentLine("No cup nearby to pick up.");
        return;
      }

      if (normalizedLine === "placeblock()" || normalizedLine === "score()") {
        if (!currentCarriedBlocks.length) {
          setCurrentLine("No block to place.");
          return;
        }

        const goalTarget = gameMode === "override" ? getOverrideGoalTargetForInteraction(currentRobotState) : getGoalTarget(currentRobotState);
        if (!goalTarget) {
          setCurrentLine("Not near a goal.");
          return;
        }

        if (gameMode === "override" && !isGoalAllowedForAlliance(goalTarget.goalId, alliance)) {
          setCurrentLine("That goal is not available for this alliance.");
          return;
        }

        const goalState = currentGoalStates[goalTarget.goalId] || { items: [], flipped: false };
        const canPlace = gameMode === "override"
          ? canPlaceBlockOnGoal(goalState, goalTarget, currentPickupBlocks)
          : true;
        if (!canPlace) {
          const fieldBlockOnGoal = gameMode === "override" && !goalState.items?.length && hasPickupBlockOnGoal(goalTarget, currentPickupBlocks);
          setCurrentLine(fieldBlockOnGoal
            ? "Pick up the block on this goal before scoring."
            : "A cup is required before placing another block.");
          return;
        }

        const block = {
          ...currentCarriedBlocks[0],
          goalId: goalTarget.goalId,
          orientation: "vertical",
          flipped: currentCarriedBlocks[0].flipped || false,
        };
        currentScoredBlocks = [...currentScoredBlocks, block];
        currentCarriedBlocks = [];
        currentGoalStates = {
          ...currentGoalStates,
          [goalTarget.goalId]: {
            ...goalState,
            items: [...goalState.items, { type: "block", ...block }],
          },
        };
        setCurrentLine("Placed block on goal.");
        refreshFrame();
        return;
      }

      if (normalizedLine === "placecup()" || normalizedLine === "placegoal()") {
        if (currentCarriedCupItems.length <= 0) {
          setCurrentLine("No cup to place.");
          return;
        }

        const goalTarget = gameMode === "override" ? getOverrideGoalTargetForInteraction(currentRobotState) : getGoalTarget(currentRobotState);
        if (!goalTarget) {
          setCurrentLine("Not near a goal.");
          return;
        }

        if (gameMode === "override" && !isGoalAllowedForAlliance(goalTarget.goalId, alliance)) {
          setCurrentLine("That goal is not available for this alliance.");
          return;
        }

        const goalState = currentGoalStates[goalTarget.goalId] || { items: [], flipped: false };

        if (gameMode === "override" && !canPlaceCupOnGoal(goalState)) {
          setCurrentLine("Place a block on the goal before placing a cup.");
          return;
        }

        const carriedCup = currentCarriedCupItems[currentCarriedCupItems.length - 1];
        const nextGoalState = {
          ...goalState,
          items: [
            ...goalState.items,
            { type: "cup", orientation: carriedCup.orientation || "gray-bottom" },
          ],
        };
        currentGoalStates = {
          ...currentGoalStates,
          [goalTarget.goalId]: nextGoalState,
        };
        currentCarriedCupItems = currentCarriedCupItems.slice(0, -1);
        setCurrentLine("Placed cup on goal.");
        refreshFrame();
        return;
      }

      if (normalizedLine === "flipblock()") {
        if (currentCarriedBlocks.length) {
          currentCarriedBlocks = currentCarriedBlocks.map((block, index) => index === 0 ? { ...block, flipped: !block.flipped, orientation: "vertical" } : block);
          setCurrentLine("Flipped carried block.");
        } else {
          const goalTarget = gameMode === "override" ? getOverrideGoalTargetForInteraction(currentRobotState) : getGoalTarget(currentRobotState);
          if (!goalTarget) {
            setCurrentLine("Not near a goal.");
            return;
          }
          const goalState = currentGoalStates[goalTarget.goalId] || { items: [], flipped: false };
          const topBlockIndex = goalState.items.map((item, index) => ({ item, index })).reverse().find(({ item }) => item.type === "block")?.index;
          if (topBlockIndex === undefined) {
            setCurrentLine("No block on goal to flip.");
            return;
          }
          currentGoalStates = {
            ...currentGoalStates,
            [goalTarget.goalId]: {
              ...goalState,
              items: goalState.items.map((item, index) => {
                if (index !== topBlockIndex) return item;
                return { ...item, flipped: !item.flipped, orientation: "vertical" };
              }),
            },
          };
          setCurrentLine("Flipped block on goal.");
        }
        refreshFrame();
        return;
      }

      if (normalizedLine === "flipcup()") {
        if (currentCarriedCupItems.length > 0) {
          setCurrentLine("Flip cup while carrying is not supported.");
          return;
        }
        const goalTarget = gameMode === "override" ? getOverrideGoalTargetForInteraction(currentRobotState) : getGoalTarget(currentRobotState);
        if (!goalTarget) {
          setCurrentLine("Not near a goal.");
          return;
        }
        const goalState = currentGoalStates[goalTarget.goalId] || { items: [], flipped: false };
        const topCupIndex = [...goalState.items].reverse().findIndex((item) => item.type === "cup");
        if (topCupIndex < 0) {
          setCurrentLine("No cup on goal to flip.");
          return;
        }
        const cupIndex = goalState.items.length - 1 - topCupIndex;
        const updatedItems = goalState.items.map((item, index) => index === cupIndex ? { ...item, orientation: item.orientation === "gray-bottom" ? "white-top" : "gray-bottom" } : item);
        currentGoalStates = {
          ...currentGoalStates,
          [goalTarget.goalId]: {
            ...goalState,
            items: updatedItems,
          },
        };
        setCurrentLine("Flipped cup orientation.");
        refreshFrame();
        return;
      }

      if (normalizedLine === "toggle()") {
        const rectKey = getToggleRectKeyAtPoint(currentRobotState.x, currentRobotState.y);
        if (!rectKey) {
          setCurrentLine("Not touching a toggle rectangle.");
          return;
        }
        const cycle = ["yellow", "red", "blue"];
        const currentValue = currentQuadrantStates[rectKey] || "yellow";
        const nextIndex = (cycle.indexOf(currentValue) + 1) % cycle.length;
        currentQuadrantStates = { ...currentQuadrantStates, [rectKey]: cycle[nextIndex] };
        setCurrentLine(`Toggled ${rectKey} rectangle to ${currentQuadrantStates[rectKey]}.`);
        refreshFrame();
        return;
      }

      if (normalizedLine.startsWith("moveforward(") || normalizedLine.startsWith("drivefor(")) {
        const inner = line.slice(line.indexOf("(") + 1, line.lastIndexOf(")"));
        const distance = parseFloat(inner.trim());
        if (Number.isNaN(distance)) {
          setCurrentLine(`Skipping invalid move command: ${line}`);
          return;
        }
        const distancePx = Math.abs(distance) * SCALE;
        const sign = distance >= 0 ? 1 : -1;
        const totalSteps = 25;

        for (let step = 1; step <= totalSteps; step++) {
          const nextX = currentRobotState.x + Math.cos(currentRobotState.angle + Math.PI / 2) * (distancePx * sign / totalSteps);
          const nextY = currentRobotState.y + Math.sin(currentRobotState.angle + Math.PI / 2) * (distancePx * sign / totalSteps);

          if (isPointBlocked(nextX, nextY)) {
            currentRobotState = { ...clampRobotPoint(nextX, nextY), angle: currentRobotState.angle };
            setCurrentLine("Blocked by obstacle.");
            frameHistory.push({ ...currentRobotState });
            refreshFrame();
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

      if (normalizedLine.startsWith("turnright(")) {
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

      if (normalizedLine.startsWith("turnleft(")) {
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

      if (normalizedLine.startsWith("drivetrain.drive_for(")) {
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

          if (isPointBlocked(nextX, nextY)) {
            currentRobotState = { ...clampRobotPoint(nextX, nextY), angle: currentRobotState.angle };
            setCurrentLine("Blocked by obstacle.");
            frameHistory.push({ ...currentRobotState });
            refreshFrame();
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

      if (normalizedLine.startsWith("drivetrain.turn_for(")) {
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

      if (normalizedLine.startsWith("motor_18.spin(")) {
        const direction = line.slice(line.indexOf("(") + 1, line.lastIndexOf(")")).trim();
        setCurrentLine(`Spin motor_18 ${direction}`);
        await sleep(100);
        return;
      }

      if (normalizedLine.startsWith("global ") || trimmedLine.includes("=")) {
        return;
      }

      if (trimmedLine.match(/^[A-Za-z_][A-Za-z0-9_]*\(\)$/)) {
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
    setPickupCupMarkers([...currentPickupCupMarkers]);
    setBlockCupMarkers([...currentBlockCupMarkers]);
    setCarriedBlocks([...currentCarriedBlocks]);
    setCarriedCupItems([...currentCarriedCupItems]);
    setScoredBlocks([...currentScoredBlocks]);
    setGoalStates({ ...currentGoalStates });
    setQuadrantStates({ ...currentQuadrantStates });
    drawField(ctx, frameHistory, currentPickupBlocks, currentCarriedBlocks, currentScoredBlocks, currentGoalStates, currentQuadrantStates, currentPickupCupMarkers, currentBlockCupMarkers, currentCarriedCupItems);

    if (gameMode !== "override") {
      const finalLeftZoneCleared = currentPickupBlocks.filter((block) => block.sourceId === "left-center").length === 0;
      const finalRightZoneCleared = currentPickupBlocks.filter((block) => block.sourceId === "right-center").length === 0;
      const finalParkedBonusEarned = isRobotInParkingZone(currentRobotState);
      setLeftZoneCleared(finalLeftZoneCleared);
      setRightZoneCleared(finalRightZoneCleared);
      setParkedBonusEarned(finalParkedBonusEarned);
    }
    setCurrentLine("Execution finished.");
    setIsSimulating(false);
  };

  const resetSimulation = () => {
    const resetState = startingPositions[alliance];
    setRobotState(resetState);
    setRobotPath([resetState]);
    setPickupBlocks(getInitialPickupBlocks(gameMode));
    setPickupCupMarkers(overrideCupPickupTargets.map((target) => ({ ...target, visible: true })));
    setBlockCupMarkers(getInitialBlockCupMarkers());
    setCarriedBlocks([]);
    setCarriedCupItems([]);
    setScoredBlocks([]);
    setGoalStates(getInitialGoalStates());
    setQuadrantStates(getInitialQuadrantStates());
    setClearedLoaderIds([]);
    setLeftZoneCleared(false);
    setRightZoneCleared(false);
    setParkedBonusEarned(false);
    setCodeText(originalCodeText);
    setCurrentLine("Reset complete.");
  };

  const blocksScored = scoredBlocks.length;
  const clearedLoaders = clearedLoaderIds.length;
  const parkingZoneScore = (leftZoneCleared ? 5 : 0) + (rightZoneCleared ? 5 : 0);
  const parkedScore = parkedBonusEarned ? 15 : 0;
  const overrideScore = gameMode === "override"
    ? getOverrideScoreForAlliance(goalStates, quadrantStates, alliance)
    : 0;
  const totalScore = gameMode === "override"
    ? overrideScore
    : blocksScored + clearedLoaders * 5 + parkingZoneScore + parkedScore;

  return (
    <div className="p-6 flex flex-col items-center">
      <main className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4">

        {/* SAVED SCRIPTS PANEL */}
        <div className="lg:col-span-2 flex flex-col gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl max-h-[850px]">
          <h2 className="text-[13px] uppercase tracking-[0.2em] text-slate-300 font-mono font-bold mb-2">Saved Scripts</h2>

          <div className="flex flex-col gap-2 mb-4">
            <input
              type="text"
              placeholder="Script name"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-slate-300 font-mono text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500"
            />
            <button
              onClick={saveScript}
              disabled={isSaving || !saveName.trim() || !user}
              className="bg-emerald-600/20 text-emerald-400 border border-emerald-500/50 hover:bg-emerald-600/40 disabled:opacity-50 disabled:cursor-not-allowed py-2 rounded-lg font-mono text-xs font-bold uppercase transition-colors"
            >
              {isSaving ? "Saving..." : "Save Current"}
            </button>
            {!user && <p className="text-[10px] text-red-400 font-mono mt-1">Log in to save.</p>}
          </div>

          <div className="flex flex-col gap-2 overflow-y-auto pr-1 custom-scrollbar">
            {savedScripts.map((script) => (
              <div
                key={script.id}
                className={`flex flex-col border rounded-lg overflow-hidden group ${activeScript?.id === script.id ? "bg-slate-800 border-emerald-500" : "bg-slate-950 border-slate-800"}`}
              >
                {editingId === script.id ? (
                  <div className="p-3 flex items-center gap-2">
                    <input
                      type="text"
                      autoFocus
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveEdit(script.id, e);
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                      className="flex-1 min-w-0 bg-slate-900 border border-emerald-500 text-slate-300 font-mono text-xs rounded px-2 py-1 focus:outline-none"
                    />
                    <button onClick={(e) => saveEdit(script.id, e)} className="text-emerald-400 hover:text-emerald-300">
                      ✓
                    </button>
                    <button onClick={() => setEditingId(null)} className="text-slate-500 hover:text-slate-400">
                      ✕
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setCodeText(script.code);
                      if (script.alliance) setAlliance(script.alliance);
                      if (script.robotState) {
                        setRobotState(script.robotState);
                        setRobotPath([script.robotState]);
                      }
                      setActiveScript(script);
                    }}
                    className="text-left p-3 hover:bg-slate-900/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2">
                        {script.alliance && (
                          <span className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${script.alliance === "red" ? "bg-red-500" : "bg-blue-500"}`} />
                        )}
                        <p className="text-emerald-400 font-mono text-xs font-bold whitespace-pre-wrap break-words text-left" title={script.name}>{script.name}</p>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span
                          onClick={(e) => startEdit(script, e)}
                          className="text-slate-500 hover:text-blue-400 p-1"
                          title="Rename"
                        >
                          ✎
                        </span>
                        <span
                          onClick={(e) => deleteScript(script.id, e)}
                          className="text-slate-500 hover:text-red-400 p-1"
                          title="Delete"
                        >
                          🗑
                        </span>
                      </div>
                    </div>
                    <p className="text-slate-500 font-mono text-[10px] mt-1 truncate">Click to load</p>
                  </button>
                )}
              </div>
            ))}
            {savedScripts.length === 0 && user && (
              <p className="text-slate-500 font-mono text-xs italic text-center mt-4">No saved scripts yet.</p>
            )}
          </div>
        </div>

        {/* CONTROL DECK CODE TERMINAL */}
        <div className="lg:col-span-4 flex flex-col gap-6 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">

          {/* SIMULATOR TITLE */}
          <div className="border-b border-slate-800 pb-4">
            <h1 className="text-2xl font-black text-white tracking-tight font-mono uppercase">
              Autonomous Simulator
            </h1>
            <p className={`text-xs font-bold uppercase tracking-wider font-mono mt-1 ${gameMode === "override" ? "text-purple-400" : "text-amber-400"}`}>
              {gameMode === "override" ? "Optimized for Override Auton" : "Optimized for Push Back Auton"}
            </p>
          </div>

          {/* GAME MODE SELECTION */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 font-mono">
              Select Game Mode
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setGameMode("push_back")}
                disabled={isSimulating}
                className={`py-4 rounded-xl font-mono text-sm font-black uppercase tracking-wider transition-all border shadow-lg ${gameMode === "push_back"
                  ? "bg-amber-600/20 border-amber-500 text-amber-400 ring-2 ring-amber-500/30"
                  : "bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-400 hover:border-slate-700"
                  }`}
              >
                25-26 Push Back
              </button>
              <button
                type="button"
                onClick={() => setGameMode("override")}
                disabled={isSimulating}
                className={`py-4 rounded-xl font-mono text-sm font-black uppercase tracking-wider transition-all border shadow-lg ${gameMode === "override"
                  ? "bg-purple-600/20 border-purple-500 text-purple-400 ring-2 ring-purple-500/30"
                  : "bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-400 hover:border-slate-700"
                  }`}
              >
                26-27 Override
              </button>
            </div>
          </div>

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
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono flex items-center justify-between">
              <span>Script Editor</span>
              {activeScript && (
                <span className="text-emerald-400 text-[10px] bg-emerald-950/50 px-2 py-1 rounded border border-emerald-500/30 truncate max-w-[200px]">
                  Current: {activeScript.name}
                </span>
              )}
            </label>
            <p className="text-[13px] text-slate-400 font-mono mb-3 leading-tight">
              <strong>Path Editor:</strong> Drag the robot to position it and click <strong>Rotation</strong> to adjust its heading.
              All <em>DriveFor()</em> measurements are in inches; <em>turnLeft/Right()</em> use degrees.
              {gameMode === "override"
                ? " Override commands: pickupBlock(), pickupCup(), placeBlock(), placeCup(), flipBlock(), flipCup(), toggle()."
                : " Push Back commands: pickupBlock(), placeBlock(), DriveFor(), turnLeft(), turnRight."}
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
        <div className="lg:col-span-6 flex flex-col items-center gap-4">
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
                  <p className="text-[11px] uppercase tracking-[0.3em] text-slate-500 font-mono">{gameMode === "override" ? "Override Score" : "Blocks Scored"}</p>
                  <p className="mt-2 text-2xl font-black text-emerald-300">{gameMode === "override" ? overrideScore : blocksScored}</p>
                </div>
                {gameMode !== "override" && (
                  <>
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
                  </>
                )}
              </div>
            </div>

            {/* LOGGER SYSTEM */}
            <div className="bg-slate-900 border border-slate-800 px-4 py-3 rounded-xl font-mono text-xs flex gap-3 items-center shadow-md">
              <span className={`w-2 h-2 rounded-full ${isSimulating ? "bg-amber-400 animate-pulse" : "bg-emerald-400"}`} />
              <span className="text-slate-500 font-black tracking-wider uppercase">Console:</span>
              <span className="text-slate-300 truncate">{currentLine}</span>
            </div>

            {/* LOADER BLOCKS KEY — Push Back only */}
            {gameMode !== "override" && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md">
              <p className="text-[13px] uppercase tracking-[0.2em] text-slate-300 font-mono font-bold mb-3">Loader Blocks Key</p>
              <div className="flex justify-around items-center bg-slate-950 border border-slate-800 rounded-xl p-4">

                {/* Left Key Item */}
                <div className="flex items-center gap-6">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-md flex flex-col flex-shrink-0">
                    <div className="w-full h-1/2 bg-[#ef4444]" />
                    <div className="w-full h-1/2 bg-[#3b82f6]" />
                  </div>
                  <div className="text-slate-500 font-bold text-lg">➔</div>
                  <div className="flex flex-col gap-0.5 border border-slate-800 p-1.5 bg-slate-900 rounded-lg shadow-inner flex-shrink-0">
                    <div className="w-12 h-3 bg-[#ef4444] border border-[#991b1b] rounded-sm" />
                    <div className="w-12 h-3 bg-[#ef4444] border border-[#991b1b] rounded-sm" />
                    <div className="w-12 h-3 bg-[#ef4444] border border-[#991b1b] rounded-sm" />
                    <div className="w-12 h-3 bg-[#3b82f6] border border-[#1e40af] rounded-sm" />
                    <div className="w-12 h-3 bg-[#3b82f6] border border-[#1e40af] rounded-sm" />
                    <div className="w-12 h-3 bg-[#3b82f6] border border-[#1e40af] rounded-sm" />
                  </div>
                </div>

                {/* Right Key Item */}
                <div className="flex items-center gap-6">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-md flex flex-col flex-shrink-0">
                    <div className="w-full h-1/2 bg-[#3b82f6]" />
                    <div className="w-full h-1/2 bg-[#ef4444]" />
                  </div>
                  <div className="text-slate-500 font-bold text-lg">➔</div>
                  <div className="flex flex-col gap-0.5 border border-slate-800 p-1.5 bg-slate-900 rounded-lg shadow-inner flex-shrink-0">
                    <div className="w-12 h-3 bg-[#3b82f6] border border-[#1e40af] rounded-sm" />
                    <div className="w-12 h-3 bg-[#3b82f6] border border-[#1e40af] rounded-sm" />
                    <div className="w-12 h-3 bg-[#3b82f6] border border-[#1e40af] rounded-sm" />
                    <div className="w-12 h-3 bg-[#ef4444] border border-[#991b1b] rounded-sm" />
                    <div className="w-12 h-3 bg-[#ef4444] border border-[#991b1b] rounded-sm" />
                    <div className="w-12 h-3 bg-[#ef4444] border border-[#991b1b] rounded-sm" />
                  </div>
                </div>

              </div>
            </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}