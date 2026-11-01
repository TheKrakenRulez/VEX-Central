"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const TOUR_STAGE_KEY = "vex_product_tour_step";
const TOUR_OFFER_KEY = "vex_product_tour_offer";
const NO_TOUR_TARGETS = [];
const GUEST_WORKSPACE_TARGETS = ["workspace-guest-note"];

const TOUR_STEPS = {
  home: {
    targets: ["nav-simulator"],
    title: "Try the autonomous simulator",
    description: "Click Simulator in the top navigation to open the robot field and sample routine.",
  },
  simulatorEditor: {
    path: "/simulator",
    targets: ["simulator-code", "simulator-run"],
    title: "Run a robot routine",
    description: "The sample commands are in the script editor. Click Run Path to watch the robot execute them on the field.",
    placement: "simulator-panel",
    preserveViewport: true,
  },
  simulatorNext: {
    path: "/simulator",
    targets: ["nav-scouting"],
    title: "Explore scouting",
    description: "Click Scouting in the top navigation to organize event data and compare teams.",
  },
  scouting: {
    path: "/scouting",
    targets: ["scouting-new-competition"],
    title: "Create a competition",
    description: "Click New Competition to set up an event where you can record team and match scouting data.",
  },
  competitionOpen: {
    path: "/scouting",
    targets: ["scouting-created-competition"],
    title: "Open your competition",
    description: "Click the competition you just created to add your team and explore Match Scout.",
  },
  myTeam: {
    path: "/scouting",
    targets: ["scouting-add-my-team"],
    title: "Add your team",
    description: "Add your own robot profile first. Match Scout uses your team’s strengths to find a compatible partner.",
  },
  myTeamForm: {
    path: "/scouting",
    targets: ["scouting-my-team-form"],
    title: "Enter your team’s details",
    description: "Fill in your team number and robot capabilities through the steps, then save. Next, Match Scout will compare robot stats and explain the compatibility score.",
  },
  matchScoutExample: {
    path: "/scouting",
    targets: ["match-scout-title", "match-scout-example", "nav-team"],
    title: "Next: Team Workspace",
    description: "Match Scout compares robot stats and explains compatibility. Click Team Workspace in the top navigation to continue.",
  },
  competitionName: {
    path: "/scouting",
    targets: ["competition-name"],
    title: "Name the competition",
    description: "Enter a recognizable name for the event.",
  },
  competitionDate: {
    path: "/scouting",
    targets: ["competition-date"],
    title: "Choose the date",
    description: "Set the day this competition takes place.",
  },
  competitionSeason: {
    path: "/scouting",
    targets: ["competition-season"],
    title: "Choose the game season",
    description: "Select the VEX season for this event.",
  },
  competitionSubmit: {
    path: "/scouting",
    targets: ["competition-submit"],
    title: "Save the competition",
    description: "Click Create Competition to save it and open its scouting workspace.",
  },
  teamNext: {
    path: "/scouting",
    targets: ["nav-team"],
    title: "Explore team workspaces",
    description: "Click Team Workspace in the top navigation to create a place for your team to collaborate.",
  },
  team: {
    path: "/team",
    targets: ["team-create"],
    title: "Create a team workspace",
    description: "Click Create Team to start a shared workspace for your robotics team.",
  },
  teamName: {
    path: "/team",
    targets: ["team-name"],
    title: "Name your team",
    description: "Enter your team or club name.",
  },
  teamSubmit: {
    path: "/team",
    targets: ["team-submit"],
    title: "Create your workspace",
    description: "Click Create to make the workspace and get a join code for teammates.",
  },
  workspace: {
    targets: ["workspace-chat-tools"],
    title: "Your workspace is ready",
    description: "Your workspace brings team conversation and pinned resources together. Use chat to coordinate, share updates, and keep useful notes and links on hand.",
    placement: "workspace-center",
    preserveViewport: true,
  },
};

function getInitialTourState() {
  if (typeof window === "undefined") {
    return null;
  }

  if (sessionStorage.getItem(TOUR_OFFER_KEY) === "1") {
    return { mode: "offer" };
  }

  const savedStage = sessionStorage.getItem(TOUR_STAGE_KEY);
  if (savedStage === "home" || TOUR_STEPS[savedStage]) {
    return { mode: "tour", stage: savedStage };
  }

  if (savedStage !== null) {
    sessionStorage.removeItem(TOUR_STAGE_KEY);
  }
  return null;
}

export default function ProductTour() {
  const pathname = usePathname();
  const router = useRouter();
  const { isGuest } = useAuth();
  const [tourState, setTourState] = useState(null);
  const [position, setPosition] = useState(null);

  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      const initialTourState = getInitialTourState();
      if (initialTourState) {
        setTourState(initialTourState);
      }
    });
    return () => cancelAnimationFrame(frameId);
  }, []);

  const stage = tourState?.mode === "tour" ? tourState.stage : null;
  const step = stage ? TOUR_STEPS[stage] : null;
  const targets = isGuest && stage === "workspace"
    ? GUEST_WORKSPACE_TARGETS
    : step?.targets ?? NO_TOUR_TARGETS;
  const finishTour = useCallback(() => {
    sessionStorage.removeItem(TOUR_STAGE_KEY);
    sessionStorage.removeItem(TOUR_OFFER_KEY);
    setTourState(null);
    window.dispatchEvent(new Event("vex-tour:finished"));
  }, []);

  const moveToStage = useCallback((nextStage) => {
    sessionStorage.setItem(TOUR_STAGE_KEY, nextStage);
    setTourState({ mode: "tour", stage: nextStage });
    const nextPath = TOUR_STEPS[nextStage]?.path;
    if (nextPath && nextPath !== pathname) {
      router.push(nextPath);
    }
  }, [pathname, router]);

  useEffect(() => {
    window.dispatchEvent(new Event(stage === "matchScoutExample" ? "vex-tour:show-example-team" : "vex-tour:hide-example-team"));
  }, [stage]);

  useEffect(() => {
    if (!stage) {
      return undefined;
    }

    const handleNavigation = (event) => {
      const transitions = {
        "home:simulator": "simulatorEditor",
        "simulatorNext:scouting": "scouting",
        "matchScoutExample:team": "team",
      };
      const nextStage = transitions[`${stage}:${event.detail.destination}`];
      if (nextStage) {
        sessionStorage.setItem(TOUR_STAGE_KEY, nextStage);
        setTourState({ mode: "tour", stage: nextStage });
      }
    };

    const stageEvents = {
      "vex-tour:simulation-complete": "simulatorNext",
      "vex-tour:competition-form-open": "competitionName",
      "vex-tour:competition-name-entered": "competitionDate",
      "vex-tour:competition-date-entered": "competitionSeason",
      "vex-tour:competition-season-selected": "competitionSubmit",
      "vex-tour:competition-created": "competitionOpen",
      "vex-tour:competition-opened": "myTeam",
      "vex-tour:my-team-form-open": "myTeamForm",
      "vex-tour:my-team-saved": "matchScoutExample",
      "vex-tour:team-form-open": "teamName",
      "vex-tour:team-name-entered": "teamSubmit",
      "vex-tour:team-created": "workspace",
    };
    const handleTourEvent = (event) => {
      const nextStage = stageEvents[event.type];
      if (nextStage) {
        sessionStorage.setItem(TOUR_STAGE_KEY, nextStage);
        setTourState({ mode: "tour", stage: nextStage });
      }
    };

    window.addEventListener("vex-tour:navigate", handleNavigation);
    Object.keys(stageEvents).forEach((eventName) => {
      window.addEventListener(eventName, handleTourEvent);
    });
    return () => {
      window.removeEventListener("vex-tour:navigate", handleNavigation);
      Object.keys(stageEvents).forEach((eventName) => {
        window.removeEventListener(eventName, handleTourEvent);
      });
    };
  }, [stage]);

  useEffect(() => {
    let frameId;
    let highlightedTargets = [];
    const updatePosition = () => {
      if (!step || (step.path && pathname !== step.path)) {
        highlightedTargets.forEach((target) => target.classList.remove("vex-tour-highlight"));
        highlightedTargets = [];
        setPosition(null);
        return;
      }

      const foundTargets = targets
        .map((targetName) => document.querySelector(`[data-tour="${targetName}"]`))
        .filter(Boolean);
      highlightedTargets.forEach((target) => {
        if (!foundTargets.includes(target)) {
          target.classList.remove("vex-tour-highlight");
        }
      });
      foundTargets.forEach((target) => {
        if (!highlightedTargets.includes(target)) {
          target.classList.add("vex-tour-highlight");
          if (!step.preserveViewport) {
            target.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
          }
        }
      });
      highlightedTargets = foundTargets;

      const anchor = foundTargets[0];
      if (!anchor) {
        setPosition(null);
        return;
      }

      const rect = anchor.getBoundingClientRect();
      const width = Math.min(336, window.innerWidth - 32);
      if (step.placement === "simulator-panel") {
        const panel = document.querySelector('[data-tour="simulator-panel"]');
        const panelRect = panel?.getBoundingClientRect();
        if (panelRect) {
          setPosition({
            left: panelRect.left + 12,
            top: Math.max(80, Math.min(panelRect.top + 12, window.innerHeight - 190)),
            width: Math.min(width, panelRect.width - 24),
          });
          return;
        }
      }
      if (step.placement === "workspace-center") {
        setPosition({
          left: Math.max(16, (window.innerWidth - width) / 2),
          top: Math.max(100, Math.min(window.innerHeight * 0.2, window.innerHeight - 220)),
          width,
        });
        return;
      }
      if (step.placement === "right-bottom" || step.placement === "left-bottom") {
        setPosition({ [step.placement === "right-bottom" ? "right" : "left"]: 16, bottom: 16, width });
        return;
      }
      if (window.innerWidth < 640) {
        const left = Math.max(16, Math.min(rect.left, window.innerWidth - width - 16));
        let top = rect.bottom + 14;
        if (top + 180 > window.innerHeight) {
          top = Math.max(16, rect.top - 194);
        }
        setPosition({ left, top, width });
      } else {
        const left = rect.right + width + 24 <= window.innerWidth
          ? rect.right + 16
          : Math.max(16, rect.left - width - 16);
        const top = Math.max(
          16,
          Math.min(rect.top + rect.height / 2 - 80, window.innerHeight - 190)
        );
        setPosition({ left, top, width });
      }
    };
    const schedulePosition = () => {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(updatePosition);
    };
    const observer = new MutationObserver(schedulePosition);

    schedulePosition();
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("resize", schedulePosition);
    window.addEventListener("scroll", schedulePosition, true);

    return () => {
      cancelAnimationFrame(frameId);
      observer.disconnect();
      window.removeEventListener("resize", schedulePosition);
      window.removeEventListener("scroll", schedulePosition, true);
      highlightedTargets.forEach((target) => target.classList.remove("vex-tour-highlight"));
    };
  }, [step, targets, pathname]);

  if (!tourState) {
    return null;
  }

  const isOffer = tourState.mode === "offer";
  const title = isOffer ? "Want a quick walkthrough?" : step.title;
  const guestNote = isGuest && (stage === "team" || stage === "teamName" || stage === "teamSubmit")
    ? " Guest preview workspaces are temporary and will be deleted when you leave guest mode. Sign in to keep one."
    : isGuest && stage === "workspace"
      ? " This guest workspace and its join code are only available in this browser. It will be deleted when you leave guest mode; sign in to create a shareable workspace."
      : "";
  const description = isOffer
    ? "We’ll show you the simulator, scouting features, and team workspaces. You can leave the tour any time."
    : `${step.description}${guestNote}`;

  if (isOffer) {
    return (
      <section
        aria-labelledby="product-tour-title"
        className="fixed bottom-4 right-4 z-[101] w-[calc(100%-2rem)] max-w-md rounded-2xl border-2 border-cyan-400 bg-slate-950/95 p-6 text-slate-100 shadow-[0_0_28px_rgba(34,211,238,0.3)] backdrop-blur-md"
        role="dialog"
      >
        <p className="mb-2 text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-blue-300">
          Welcome to VEX Central
        </p>
        <h2 id="product-tour-title" className="text-xl font-black font-mono text-white">{title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-300">
          {description}
        </p>
        <div className="mt-5 flex justify-end gap-3">
          <button
            className="rounded-lg border border-slate-700 px-4 py-2.5 text-xs font-mono text-slate-300 hover:bg-slate-900"
            onClick={finishTour}
            type="button"
          >
            Not now
          </button>
          <button
            className="rounded-lg bg-gradient-to-r from-red-600 to-blue-600 px-4 py-2.5 text-xs font-mono font-bold uppercase text-white hover:opacity-90"
            onClick={() => {
              sessionStorage.removeItem(TOUR_OFFER_KEY);
              moveToStage("home");
            }}
            type="button"
          >
            Start tour
          </button>
        </div>
      </section>
    );
  }

  return (
    <section
      aria-labelledby="product-tour-title"
      className="fixed z-[101] w-[calc(100%-2rem)] rounded-2xl border-2 border-cyan-400 bg-slate-950/95 p-4 text-slate-100 shadow-[0_0_28px_rgba(34,211,238,0.3)] backdrop-blur-md sm:w-[336px]"
      role="status"
      style={position ?? { right: 20, bottom: 20, width: 336 }}
    >
      <p className="mb-1.5 text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-blue-300">
        Your guided tour
      </p>
      <h2 id="product-tour-title" className="text-base font-black font-mono text-white">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-300">
        {stage === "matchScoutExample" ? (
          <>
            <strong className="text-cyan-200">EXAMPLE TEAM: WONT BE SAVED.</strong>{" "}
            {description}
          </>
        ) : isGuest && stage === "workspace" ? (
          "This temporary guest workspace includes team chat and pinned notes. It will be deleted when you leave guest mode."
        ) : (
          description
        )}
      </p>
      <button
        className="mt-3 text-xs font-mono text-slate-400 transition-colors hover:text-white"
        onClick={() => {
          if (window.confirm("Are you sure you want to end the tour?")) {
            finishTour();
          }
        }}
        type="button"
      >
        {stage === "workspace" ? "Finish tour" : "End tour"}
      </button>
    </section>
  );
}
