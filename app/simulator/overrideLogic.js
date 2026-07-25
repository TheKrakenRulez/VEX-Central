// Override Simulator Constants & Drawing Logic

export const overrideGoalTargets = [
    { goalId: "red-1", x: 200, y: 500, radius: 16, type: "red" },
    { goalId: "red-2", x: 100, y: 400, radius: 16, type: "red" },

    { goalId: "blue-1", x: 400, y: 100, radius: 16, type: "blue" },
    { goalId: "blue-2", x: 500, y: 200, radius: 16, type: "blue" },

    { goalId: "black-tall", x: 300, y: 300, radius: 16, type: "black" },
    { goalId: "black-med-1", x: 100, y: 200, radius: 16, type: "black" },
    { goalId: "black-med-2", x: 200, y: 100, radius: 16, type: "black" },
    { goalId: "black-med-3", x: 500, y: 400, radius: 16, type: "black" },
    { goalId: "black-med-4", x: 400, y: 500, radius: 16, type: "black" }
];

export const getFieldQuadrant = (x, y) => {
    // Four triangular regions split by white X lines through field center (300, 300)
    if (x + y < 600) {
        return y < x ? "topLeft" : "topRight";
    }
    return y < x ? "bottomRight" : "bottomLeft";
};

export const toggleRectangles = [
    { key: "bottomLeft", x: 6, y: 260, width: 8, height: 80 },
    { key: "topRight", x: 586, y: 260, width: 8, height: 80 },
    { key: "topLeft", x: 260, y: 6, width: 80, height: 8 },
    { key: "bottomRight", x: 260, y: 586, width: 80, height: 8 },
];

export const toggleRectColors = {
    yellow: "#ffff03",
    red: "#ef4444",
    blue: "#3b82f6",
};

export const getToggleRectKeyAtPoint = (x, y, threshold = 48) => {
    let nearestKey = null;
    let nearestDistance = Infinity;

    toggleRectangles.forEach((rect) => {
        const closestX = Math.max(rect.x, Math.min(x, rect.x + rect.width));
        const closestY = Math.max(rect.y, Math.min(y, rect.y + rect.height));
        const distance = Math.hypot(x - closestX, y - closestY);
        if (distance <= threshold && distance < nearestDistance) {
            nearestDistance = distance;
            nearestKey = rect.key;
        }
    });

    return nearestKey;
};

export const overrideCupPickupTargets = [
    { x: 20, y: 170 },
    { x: 20, y: 200 },
    { x: 20, y: 230 },
    { x: 580, y: 170 },
    { x: 580, y: 200 },
    { x: 580, y: 230 },
    { x: 20, y: 370 },
    { x: 20, y: 400 },
    { x: 20, y: 430 },
    { x: 580, y: 370 },
    { x: 580, y: 400 },
    { x: 580, y: 430 },
    { x: 170, y: 20 },
    { x: 200, y: 20 },
    { x: 230, y: 20 },
    { x: 370, y: 20 },
    { x: 400, y: 20 },
    { x: 430, y: 20 },
    { x: 170, y: 580 },
    { x: 200, y: 580 },
    { x: 230, y: 580 },
    { x: 370, y: 580 },
    { x: 400, y: 580 },
    { x: 430, y: 580 },
    { x: 100, y: 100 },
    { x: 200, y: 200 },
    { x: 400, y: 400 },
    { x: 500, y: 500 },
];

export const overridePickupBlocks = [
    // Previous user placements
    { sourceId: "o-1", x: 100, y: 500, color: "yellow-yellow", visible: true },
    { sourceId: "o-2", x: 200, y: 400, color: "yellow-yellow", visible: true },
    { sourceId: "o-30", x: 20, y: 200, color: "yellow-yellow", visible: true },
    { sourceId: "o-31", x: 20, y: 400, color: "yellow-yellow", visible: true },
    { sourceId: "o-32", x: 580, y: 200, color: "yellow-yellow", visible: true },
    { sourceId: "o-33", x: 580, y: 400, color: "yellow-yellow", visible: true },
    { sourceId: "o-34", x: 200, y: 20, color: "yellow-yellow", visible: true },
    { sourceId: "o-35", x: 400, y: 20, color: "yellow-yellow", visible: true },
    { sourceId: "o-36", x: 200, y: 580, color: "yellow-yellow", visible: true },
    { sourceId: "o-37", x: 400, y: 580, color: "yellow-yellow", visible: true },

    // Center-adjacent blocks
    { sourceId: "o-3", x: 300, y: 400, color: "red-blue", visible: true },
    { sourceId: "o-4", x: 200, y: 300, color: "red-blue", visible: true },
    { sourceId: "o-5", x: 300, y: 200, color: "blue-red", visible: true },
    { sourceId: "o-6", x: 400, y: 300, color: "blue-red", visible: true },

    // Yellow-yellow on goals
    { sourceId: "o-7", x: 400, y: 200, color: "yellow-yellow", visible: true },
    { sourceId: "o-8", x: 500, y: 100, color: "yellow-yellow", visible: true },
    { sourceId: "o-9", x: 300, y: 300, color: "yellow-yellow", visible: true },
    { sourceId: "o-10", x: 100, y: 200, color: "yellow-yellow", visible: true },
    { sourceId: "o-11", x: 200, y: 100, color: "yellow-yellow", visible: true },

    // Yellow-yellow on black goals
    { sourceId: "o-12", x: 500, y: 400, color: "yellow-yellow", visible: true },
    { sourceId: "o-13", x: 400, y: 500, color: "yellow-yellow", visible: true },

    // Cross/star at (100, 100) — center left 2, up 2
    { sourceId: "o-14", x: 100, y: 80, color: "blue-yellow", visible: true },
    { sourceId: "o-15", x: 100, y: 120, color: "yellow-red", visible: true },
    { sourceId: "o-16", x: 80, y: 100, color: "red-yellow", visible: true, orientation: "horizontal" },
    { sourceId: "o-17", x: 120, y: 100, color: "yellow-blue", visible: true, orientation: "horizontal" },

    // Cross/star at (200, 200) — down 1 right 1 from (100,100)
    { sourceId: "o-18", x: 200, y: 180, color: "blue-yellow", visible: true },
    { sourceId: "o-19", x: 200, y: 220, color: "yellow-red", visible: true },
    { sourceId: "o-20", x: 180, y: 200, color: "red-yellow", visible: true, orientation: "horizontal" },
    { sourceId: "o-21", x: 220, y: 200, color: "yellow-blue", visible: true, orientation: "horizontal" },

    // Cross/star at (400, 400) — down 2 right 2 from (200,200)
    { sourceId: "o-22", x: 400, y: 380, color: "blue-yellow", visible: true },
    { sourceId: "o-23", x: 400, y: 420, color: "yellow-red", visible: true },
    { sourceId: "o-24", x: 380, y: 400, color: "red-yellow", visible: true, orientation: "horizontal" },
    { sourceId: "o-25", x: 420, y: 400, color: "yellow-blue", visible: true, orientation: "horizontal" },

    // Cross/star at (500, 500) — down 1 right 1 from (400,400)
    { sourceId: "o-26", x: 500, y: 480, color: "blue-yellow", visible: true },
    { sourceId: "o-27", x: 500, y: 520, color: "yellow-red", visible: true },
    { sourceId: "o-28", x: 480, y: 500, color: "red-yellow", visible: true, orientation: "horizontal" },
    { sourceId: "o-29", x: 520, y: 500, color: "yellow-blue", visible: true, orientation: "horizontal" }
];

export const getOverrideGoalTarget = (point) => {
    let nearest = null;
    let nearestDistance = Infinity;

    overrideGoalTargets.forEach((goal) => {
        const distance = Math.hypot(point.x - goal.x, point.y - goal.y);
        if (distance <= goal.radius && distance < nearestDistance) {
            nearestDistance = distance;
            nearest = goal;
        }
    });

    return nearest;
};

const overrideSetBlockSourceIds = [
    "o-14", "o-15", "o-16", "o-17",
    "o-18", "o-19", "o-20", "o-21",
    "o-22", "o-23", "o-24", "o-25",
    "o-26", "o-27", "o-28", "o-29"
];

export const isOverrideBlockOnGoal = (block, goals = overrideGoalTargets) => {
    if (!block) return false;
    return goals.some((goal) => Math.hypot(block.x - goal.x, block.y - goal.y) <= goal.radius + 8);
};

export const isOverrideBlockInSetOfFour = (block) => {
    return block && overrideSetBlockSourceIds.includes(block.sourceId);
};

export const getInitialBlockCupMarkers = (blocks = overridePickupBlocks) =>
    blocks
        .filter((block) => !isOverrideBlockOnGoal(block) && !isOverrideBlockInSetOfFour(block))
        .map((block) => ({
            id: `block-cup-${block.sourceId}-${block.x}-${block.y}`,
            x: block.x,
            y: block.y,
            visible: true,
        }));

export const drawOverrideBlock = (ctx, x, y, type, orientation = "vertical", flipped = false) => {
    ctx.save();
    ctx.translate(x, y);

    const rx = 11;
    const ry = 16;
    const mapColor = (c) => c === "red" ? "#ef4444" : c === "blue" ? "#3b82f6" : "#ffff03";
    const [primaryColor, secondaryColor] = type.split("-");
    const [leftColor, rightColor] = flipped ? [secondaryColor, primaryColor] : [primaryColor, secondaryColor];

    if (orientation === "horizontal") {
        // Horizontal rhombus: points left/right, taller in middle
        ctx.beginPath();
        ctx.moveTo(-ry, 0);
        ctx.lineTo(0, -rx);
        ctx.lineTo(ry, 0);
        ctx.lineTo(0, rx);
        ctx.closePath();
        ctx.clip();

        if (type === "yellow-yellow") {
            ctx.fillStyle = "#ffff03";
            ctx.fill();
        } else {
            ctx.fillStyle = mapColor(leftColor);
            ctx.fillRect(-ry, -rx, ry, rx * 2);
            ctx.fillStyle = mapColor(rightColor);
            ctx.fillRect(0, -rx, ry, rx * 2);
        }

        ctx.lineWidth = 2.5;
        ctx.strokeStyle = "#1e293b";
        ctx.beginPath();
        ctx.moveTo(-ry, 0);
        ctx.lineTo(0, -rx);
        ctx.lineTo(ry, 0);
        ctx.lineTo(0, rx);
        ctx.closePath();
        ctx.stroke();

        // Vertical center divider
        ctx.beginPath();
        ctx.moveTo(0, -rx);
        ctx.lineTo(0, rx);
        ctx.stroke();
    } else {
        // Vertical rhombus: points up/down (default)
        ctx.beginPath();
        ctx.moveTo(0, -ry);
        ctx.lineTo(rx, 0);
        ctx.lineTo(0, ry);
        ctx.lineTo(-rx, 0);
        ctx.closePath();
        ctx.clip();

        if (type === "yellow-yellow") {
            ctx.fillStyle = "#ffff03";
            ctx.fill();
        } else {
            ctx.fillStyle = mapColor(flipped ? secondaryColor : primaryColor);
            ctx.fillRect(-rx, -ry, rx * 2, ry);
            ctx.fillStyle = mapColor(flipped ? primaryColor : secondaryColor);
            ctx.fillRect(-rx, 0, rx * 2, ry);
        }

        ctx.lineWidth = 2.5;
        ctx.strokeStyle = "#1e293b";
        ctx.beginPath();
        ctx.moveTo(0, -ry);
        ctx.lineTo(rx, 0);
        ctx.lineTo(0, ry);
        ctx.lineTo(-rx, 0);
        ctx.closePath();
        ctx.stroke();

        // Horizontal center divider
        ctx.beginPath();
        ctx.moveTo(-rx, 0);
        ctx.lineTo(rx, 0);
        ctx.stroke();
    }

    ctx.restore();
};

export const drawDoubleSidedCup = (ctx, x, y, radius = 15, invert = false) => {
    ctx.save();
    ctx.translate(x, y);

    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fillStyle = "#475569";
    ctx.fill();

    ctx.save();
    ctx.beginPath();
    if (invert) {
        ctx.arc(0, 0, radius, 0, Math.PI);
    } else {
        ctx.arc(0, 0, radius, Math.PI, Math.PI * 2);
    }
    ctx.closePath();
    ctx.clip();
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fillStyle = "#f8fafc";
    ctx.fill();
    ctx.restore();

    ctx.lineWidth = 2;
    ctx.strokeStyle = "#1f2937";
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
};

const drawBorderEdgeL = (ctx, points, color) => {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    points.slice(1).forEach((p) => ctx.lineTo(p.x, p.y));
    ctx.stroke();
    ctx.restore();
};

const drawThinRect = (ctx, x, y, width = 8, height = 100, color = "#ffff03") => {
    ctx.save();
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, width, height);
    ctx.restore();
};

const drawGoalInsetTrapezoid = (ctx, x, y, type) => {
    if (type !== "red" && type !== "blue") return;

    ctx.save();
    ctx.translate(x, y);

    const isLeftSide = x < 300;
    const fillColor = type === "red" ? "#fca5a5" : "#93c5fd";
    const strokeColor = type === "red" ? "#b91c1c" : "#1d4ed8";

    ctx.beginPath();
    if (isLeftSide) {
        ctx.moveTo(-14, -12);
        ctx.lineTo(-14, 12);
        ctx.lineTo(8, 10);
        ctx.lineTo(8, -10);
    } else {
        ctx.moveTo(-8, -10);
        ctx.lineTo(-8, 10);
        ctx.lineTo(14, 12);
        ctx.lineTo(14, -12);
    }
    ctx.closePath();
    ctx.fillStyle = fillColor;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = strokeColor;
    ctx.stroke();
    ctx.restore();
};

const drawWhiteFieldLines = (ctx) => {
    ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";

    // Diamond in center connecting (200,300), (300,200), (400,300), (300,400)
    ctx.beginPath();
    ctx.moveTo(200, 300);
    ctx.lineTo(300, 200);
    ctx.lineTo(400, 300);
    ctx.lineTo(300, 400);
    ctx.closePath();
    ctx.stroke();

    // --- Giant X from corners, with portions inside the diamond removed ---

    // TOP-LEFT to BOTTOM-RIGHT: DOUBLE parallel lines (y = x + 10 and y = x - 10)
    // Line A (y = x + 10): enters diamond at (245, 255), exits at (345, 355)
    ctx.beginPath(); ctx.moveTo(0, 10); ctx.lineTo(245, 255); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(345, 355); ctx.lineTo(590, 600); ctx.stroke();

    // Line B (y = x - 10): enters diamond at (255, 245), exits at (355, 345)
    ctx.beginPath(); ctx.moveTo(10, 0); ctx.lineTo(255, 245); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(355, 345); ctx.lineTo(600, 590); ctx.stroke();

    // TOP-RIGHT to BOTTOM-LEFT: SINGLE line (y = -x + 600)
    // Enters diamond at (350, 250), exits at (250, 350)
    ctx.beginPath(); ctx.moveTo(600, 0); ctx.lineTo(350, 250); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(250, 350); ctx.lineTo(0, 600); ctx.stroke();
};

export const drawOverrideField = (ctx, SCALE, currentPickupBlocks, currentScoredBlocks, getScoredBlockPosition, goalStates = {}, quadrantStates = {}, currentPickupCupMarkers = [], currentBlockCupMarkers = []) => {
    // Floor
    ctx.fillStyle = "#7b8794";
    ctx.fillRect(0, 0, 600, 600);

    // Grid Lines
    ctx.strokeStyle = "#5b6472";
    ctx.lineWidth = 1;
    for (let i = 1; i < 6; i++) {
        ctx.beginPath(); ctx.moveTo(i * 100, 0); ctx.lineTo(i * 100, 600); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i * 100); ctx.lineTo(600, i * 100); ctx.stroke();
    }

    // Border Walls
    ctx.strokeStyle = "#18181b";
    ctx.lineWidth = 8;
    ctx.strokeRect(0, 0, 600, 600);

    // Draw white aesthetic field lines
    drawWhiteFieldLines(ctx);

    // Draw Goals
    overrideGoalTargets.forEach((goal) => {
        ctx.save();
        ctx.translate(goal.x, goal.y);

        let fillColor = "#ef4444";
        let strokeColor = "#991b1b";

        if (goal.type === "blue") {
            fillColor = "#3b82f6";
            strokeColor = "#1e40af";
        } else if (goal.type === "black") {
            fillColor = "#1e293b";
            strokeColor = "#0f172a";
        }

        // Square with rounded corners and a circle hole in the middle
        ctx.fillStyle = fillColor;

        ctx.beginPath();
        if (ctx.roundRect) {
            ctx.roundRect(-16, -16, 32, 32, 6);
        } else {
            ctx.rect(-16, -16, 32, 32);
        }
        ctx.arc(0, 0, 8, 0, Math.PI * 2, true);
        ctx.fill("evenodd");

        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        if (ctx.roundRect) {
            ctx.roundRect(-16, -16, 32, 32, 6);
        } else {
            ctx.rect(-16, -16, 32, 32);
        }
        ctx.stroke();

        ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 2); ctx.stroke();

        ctx.restore();
    });

    currentPickupCupMarkers
        .filter((marker) => marker.visible !== false)
        .forEach((marker) => {
            drawDoubleSidedCup(ctx, marker.x, marker.y, 15, true);
        });

    drawGoalInsetTrapezoid(ctx, 18, 50, "red");
    drawGoalInsetTrapezoid(ctx, 18, 550, "red");
    drawGoalInsetTrapezoid(ctx, 578, 50, "blue");
    drawGoalInsetTrapezoid(ctx, 578, 550, "blue");

    toggleRectangles.forEach((rect) => {
        const state = quadrantStates[rect.key] || "yellow";
        drawThinRect(ctx, rect.x, rect.y, rect.width, rect.height, toggleRectColors[state] || toggleRectColors.yellow);
    });

    // Draw red L-shaped edge markers on left side
    drawBorderEdgeL(ctx, [{ x: 0, y: 500 }, { x: 50, y: 500 }, { x: 50, y: 600 }], "#ef4444");
    drawBorderEdgeL(ctx, [{ x: 0, y: 100 }, { x: 50, y: 100 }, { x: 50, y: 0 }], "#ef4444");

    // Draw blue L-shaped edge markers on right side
    drawBorderEdgeL(ctx, [{ x: 600, y: 500 }, { x: 550, y: 500 }, { x: 550, y: 600 }], "#3b82f6");
    drawBorderEdgeL(ctx, [{ x: 600, y: 100 }, { x: 550, y: 100 }, { x: 550, y: 0 }], "#3b82f6");

    currentBlockCupMarkers
        .filter((marker) => marker.visible !== false)
        .forEach((marker) => {
            drawDoubleSidedCup(ctx, marker.x, marker.y, 15, false);
        });

    // Draw Unscored Blocks
    currentPickupBlocks
        .filter((block) => block.visible !== false)
        .forEach((block) => {
            drawOverrideBlock(ctx, block.x, block.y, block.color, block.orientation || "vertical", block.flipped || false);
        });

    // Draw goal-stack state using the live override goal state
    overrideGoalTargets.forEach((goal) => {
        const goalState = goalStates[goal.goalId] || { items: [], flipped: false };
        if (!goalState.items?.length) return;

        const items = [...goalState.items];
        if (goalState.flipped) items.reverse();

        items.forEach((item, index) => {
            const offsetY = -(index * 24) - 20;
            if (item.type === "cup") {
                drawDoubleSidedCup(ctx, goal.x, goal.y + offsetY, 15, item.orientation === "white-top");
            } else if (item.type === "block") {
                drawOverrideBlock(ctx, goal.x, goal.y + offsetY, item.color, "vertical", item.flipped);
            }
        });
    });
};
