import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, RotateCcw, Pause, Volume2, VolumeX, ChevronLeft, ChevronRight, MousePointer, HelpCircle, Lightbulb, List } from 'lucide-react';

// ============================================
// CONSTANTS
// ============================================
const COLORS = {
  primary: '#6366f1',
  primaryLight: '#e0e7ff',
  secondary: '#10b981',
  secondaryLight: '#d1fae5',
  warning: '#f59e0b',
  warningLight: '#fef3c7',
  neutral: '#64748b',
  neutralLight: '#f1f5f9',
  white: '#ffffff',
  text: '#1e293b',
  textMuted: '#64748b',
};

// Expanded map with 7 locations
const NODES = {
  home: { x: 70, y: 200, emoji: '🏠', name: 'Home' },
  park: { x: 200, y: 100, emoji: '🌳', name: 'Park' },
  shop: { x: 200, y: 300, emoji: '🏪', name: 'Shop' },
  hospital: { x: 350, y: 60, emoji: '🏥', name: 'Hospital' },
  arcade: { x: 350, y: 200, emoji: '🎮', name: 'Arcade' },
  beach: { x: 350, y: 340, emoji: '🏖️', name: 'Beach' },
  school: { x: 500, y: 200, emoji: '🏫', name: 'School' }
};

const EDGES = [
  { from: 'home', to: 'park', weight: 2 },
  { from: 'home', to: 'shop', weight: 4 },
  { from: 'park', to: 'hospital', weight: 3 },
  { from: 'park', to: 'arcade', weight: 2 },
  { from: 'shop', to: 'arcade', weight: 1 },
  { from: 'shop', to: 'beach', weight: 2 },
  { from: 'hospital', to: 'school', weight: 4 },
  { from: 'arcade', to: 'school', weight: 3 },
  { from: 'beach', to: 'school', weight: 5 },
];

const STEPS = [
  {
    title: "The Challenge",
    instruction: "Find the shortest path from Home to School. There are many possible routes - which is fastest?",
    whyThisMatters: "GPS apps, game AI, and network routing all use this algorithm to find optimal paths.",
    current: null,
    visited: [],
    distances: { home: 0 },
    exploring: [],
    pathEdges: [],
    queue: [{ node: 'home', dist: 0 }],
    interactiveTarget: { type: 'node', target: 'home' },
    decision: null
  },
  {
    title: "Start at Home",
    instruction: "We begin at Home with distance 0. All other places are unknown (?). Let's explore!",
    whyThisMatters: "We always start by marking our starting point as distance 0.",
    current: 'home',
    visited: [],
    distances: { home: 0, park: '?', shop: '?', hospital: '?', arcade: '?', beach: '?', school: '?' },
    exploring: [],
    pathEdges: [],
    queue: [{ node: 'home', dist: 0 }],
    interactiveTarget: { type: 'node', target: 'park' },
    decision: null
  },
  {
    title: "Explore from Home",
    instruction: "From Home, we can reach Park (2) and Shop (4). We record these distances.",
    whyThisMatters: "We're building a list of places we might visit, sorted by distance.",
    current: 'home',
    visited: [],
    distances: { home: 0, park: 2, shop: 4, hospital: '?', arcade: '?', beach: '?', school: '?' },
    exploring: ['park', 'shop'],
    pathEdges: [['home', 'park'], ['home', 'shop']],
    queue: [{ node: 'park', dist: 2 }, { node: 'shop', dist: 4 }],
    interactiveTarget: { type: 'node', target: 'park' },
    decision: {
      title: "Which place is closest?",
      options: [
        { name: 'Park', dist: 2, winner: true },
        { name: 'Shop', dist: 4, winner: false }
      ],
      explanation: "Park (2) is closer than Shop (4), so we visit Park next."
    }
  },
  {
    title: "Visit Park",
    instruction: "Park is the closest unvisited place (2 blocks). We mark Home as done and move to Park.",
    whyThisMatters: "Always visiting the closest place first guarantees we find the shortest path.",
    current: 'park',
    visited: ['home'],
    distances: { home: 0, park: 2, shop: 4, hospital: '?', arcade: '?', beach: '?', school: '?' },
    exploring: [],
    pathEdges: [['home', 'park']],
    queue: [{ node: 'shop', dist: 4 }],
    interactiveTarget: { type: 'node', target: 'arcade' },
    decision: null
  },
  {
    title: "Explore from Park",
    instruction: "From Park: Hospital is 2+3=5, Arcade is 2+2=4. We add these to our list.",
    whyThisMatters: "Total distance = distance to current node + edge weight.",
    current: 'park',
    visited: ['home'],
    distances: { home: 0, park: 2, shop: 4, hospital: 5, arcade: 4, beach: '?', school: '?' },
    exploring: ['hospital', 'arcade'],
    pathEdges: [['home', 'park'], ['park', 'hospital'], ['park', 'arcade']],
    queue: [{ node: 'shop', dist: 4 }, { node: 'arcade', dist: 4 }, { node: 'hospital', dist: 5 }],
    interactiveTarget: { type: 'node', target: 'shop' },
    decision: {
      title: "What's next?",
      options: [
        { name: 'Shop', dist: 4, winner: true },
        { name: 'Arcade', dist: 4, winner: true },
        { name: 'Hospital', dist: 5, winner: false }
      ],
      explanation: "Shop and Arcade are tied at 4. We'll pick Shop (either works!)."
    }
  },
  {
    title: "Visit Shop",
    instruction: "Shop is 4 blocks away. Let's see what we can reach from here.",
    whyThisMatters: "Even though we found Shop from Home, we still check all neighbors.",
    current: 'shop',
    visited: ['home', 'park'],
    distances: { home: 0, park: 2, shop: 4, hospital: 5, arcade: 4, beach: '?', school: '?' },
    exploring: [],
    pathEdges: [['home', 'park'], ['home', 'shop']],
    queue: [{ node: 'arcade', dist: 4 }, { node: 'hospital', dist: 5 }],
    interactiveTarget: { type: 'node', target: 'arcade' },
    decision: null
  },
  {
    title: "🎯 Key Moment: Found a Shortcut!",
    instruction: "From Shop, Arcade is only 4+1=5... but wait, we already found Arcade at distance 4 via Park! We keep the shorter path.",
    whyThisMatters: "This is the magic of Dijkstra's: we always keep the shortest known distance to each place.",
    current: 'shop',
    visited: ['home', 'park'],
    distances: { home: 0, park: 2, shop: 4, hospital: 5, arcade: 4, beach: 6, school: '?' },
    exploring: ['arcade', 'beach'],
    pathEdges: [['home', 'park'], ['home', 'shop'], ['shop', 'arcade'], ['shop', 'beach']],
    queue: [{ node: 'arcade', dist: 4 }, { node: 'hospital', dist: 5 }, { node: 'beach', dist: 6 }],
    interactiveTarget: { type: 'node', target: 'arcade' },
    decision: {
      title: "Arcade: which path is shorter?",
      options: [
        { name: 'Home→Park→Arcade', dist: 4, winner: true },
        { name: 'Home→Shop→Arcade', dist: 5, winner: false }
      ],
      explanation: "The Park route (4) beats the Shop route (5). We keep the shorter one!"
    }
  },
  {
    title: "Visit Arcade",
    instruction: "Arcade is 4 blocks from Home (via Park). From here, School is just 3 more blocks!",
    whyThisMatters: "We're getting close to our destination now.",
    current: 'arcade',
    visited: ['home', 'park', 'shop'],
    distances: { home: 0, park: 2, shop: 4, hospital: 5, arcade: 4, beach: 6, school: '?' },
    exploring: [],
    pathEdges: [['home', 'park'], ['park', 'arcade']],
    queue: [{ node: 'hospital', dist: 5 }, { node: 'beach', dist: 6 }],
    interactiveTarget: { type: 'node', target: 'school' },
    decision: null
  },
  {
    title: "Explore from Arcade",
    instruction: "From Arcade, School is 4+3=7 blocks. We also check Hospital's path to School.",
    whyThisMatters: "We must check all possibilities before declaring the winner.",
    current: 'arcade',
    visited: ['home', 'park', 'shop'],
    distances: { home: 0, park: 2, shop: 4, hospital: 5, arcade: 4, beach: 6, school: 7 },
    exploring: ['school'],
    pathEdges: [['home', 'park'], ['park', 'arcade'], ['arcade', 'school']],
    queue: [{ node: 'hospital', dist: 5 }, { node: 'beach', dist: 6 }, { node: 'school', dist: 7 }],
    interactiveTarget: { type: 'node', target: 'hospital' },
    decision: {
      title: "What's closest now?",
      options: [
        { name: 'Hospital', dist: 5, winner: true },
        { name: 'Beach', dist: 6, winner: false },
        { name: 'School', dist: 7, winner: false }
      ],
      explanation: "Hospital (5) is next. We must check if it offers a better route to School."
    }
  },
  {
    title: "Visit Hospital",
    instruction: "From Hospital, School is 5+4=9 blocks. But we already found School at 7! The Arcade route wins.",
    whyThisMatters: "Hospital→School (9) is worse than Arcade→School (7), so we don't update.",
    current: 'hospital',
    visited: ['home', 'park', 'shop', 'arcade'],
    distances: { home: 0, park: 2, shop: 4, hospital: 5, arcade: 4, beach: 6, school: 7 },
    exploring: [],
    pathEdges: [['home', 'park'], ['park', 'arcade'], ['arcade', 'school']],
    queue: [{ node: 'beach', dist: 6 }, { node: 'school', dist: 7 }],
    interactiveTarget: { type: 'node', target: 'school' },
    decision: {
      title: "Is Hospital→School better?",
      options: [
        { name: 'Via Arcade', dist: 7, winner: true },
        { name: 'Via Hospital', dist: 9, winner: false }
      ],
      explanation: "Arcade route (7) is still shorter than Hospital route (9). No update needed."
    }
  },
  {
    title: "Destination Reached!",
    instruction: "School is next in the queue at distance 7. When we visit our destination, we're done!",
    whyThisMatters: "The algorithm guarantees this is the shortest possible path.",
    current: 'school',
    visited: ['home', 'park', 'shop', 'arcade', 'hospital'],
    distances: { home: 0, park: 2, shop: 4, hospital: 5, arcade: 4, beach: 6, school: 7 },
    exploring: [],
    pathEdges: [['home', 'park'], ['park', 'arcade'], ['arcade', 'school']],
    queue: [],
    interactiveTarget: null,
    decision: null,
    isComplete: true,
    finalPath: ['home', 'park', 'arcade', 'school'],
    finalDistance: 7
  }
];

const QUIZ_QUESTIONS = [
  {
    question: "Why do we always visit the closest unvisited node?",
    options: ["It's random", "It guarantees the shortest path", "It's faster to compute"],
    correct: 1,
    explanation: "By always picking the closest node, we ensure we've found the optimal path to it."
  },
  {
    question: "What happened when we found Arcade via Shop (distance 5)?",
    options: ["We updated the distance", "We ignored it because 4 < 5", "We visited it twice"],
    correct: 1,
    explanation: "We already knew a shorter path (4 via Park), so we kept that one."
  },
  {
    question: "Could there be an even shorter path we missed?",
    options: ["Yes, possibly", "No, the algorithm checks everything", "Only if there are negative weights"],
    correct: 1,
    explanation: "Dijkstra's algorithm is guaranteed to find the shortest path (with non-negative weights)."
  },
  {
    question: "What's the time complexity of Dijkstra's algorithm?",
    options: ["O(n)", "O(n²) or O(n log n) with optimization", "O(2ⁿ)"],
    correct: 1,
    explanation: "Basic implementation is O(n²), but using a priority queue makes it O(n log n)."
  }
];

// ============================================
// HOOKS
// ============================================
const useSound = () => {
  const audioContextRef = useRef(null);
  
  const getContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContextRef.current;
  };

  const playTone = useCallback((freq, duration, type = 'sine', vol = 0.15) => {
    try {
      const ctx = getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = type;
      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
    } catch (e) {}
  }, []);

  return {
    click: () => playTone(500, 0.05),
    correct: () => { playTone(523, 0.1); setTimeout(() => playTone(659, 0.15), 100); },
    wrong: () => playTone(200, 0.15, 'sawtooth'),
    complete: () => [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => playTone(f, 0.2), i * 100))
  };
};

// ============================================
// COMPONENTS
// ============================================

// Progress indicator
const ProgressDots = ({ current, total }) => (
  <div className="flex items-center gap-1.5">
    {Array.from({ length: total }, (_, i) => (
      <div
        key={i}
        className={`rounded-full transition-all duration-300 ${
          i < current 
            ? 'w-2 h-2 bg-emerald-400' 
            : i === current 
            ? 'w-3 h-3 bg-indigo-500' 
            : 'w-2 h-2 bg-slate-200'
        }`}
      />
    ))}
  </div>
);

// Priority Queue visualization
const QueuePanel = ({ queue }) => (
  <div className="bg-white rounded-xl border border-slate-200 p-4">
    <div className="flex items-center gap-2 mb-3">
      <List size={16} className="text-indigo-500" />
      <h3 className="font-semibold text-slate-700 text-sm">Priority Queue</h3>
    </div>
    <p className="text-xs text-slate-500 mb-3">Next to visit → sorted by distance</p>
    {queue.length === 0 ? (
      <p className="text-sm text-slate-400 italic">Empty - we're done!</p>
    ) : (
      <div className="flex flex-wrap gap-2">
        {queue.map((item, i) => (
          <div
            key={item.node}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium ${
              i === 0 
                ? 'bg-indigo-100 text-indigo-700 ring-2 ring-indigo-300' 
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            <span>{NODES[item.node].emoji}</span>
            <span>{item.dist}</span>
          </div>
        ))}
      </div>
    )}
  </div>
);

// Decision explanation panel
const DecisionPanel = ({ decision }) => {
  if (!decision) return null;
  
  return (
    <div className="bg-amber-50 rounded-xl border border-amber-200 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb size={16} className="text-amber-500" />
        <h3 className="font-semibold text-amber-800 text-sm">{decision.title}</h3>
      </div>
      <div className="space-y-2 mb-3">
        {decision.options.map((opt, i) => (
          <div
            key={i}
            className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm ${
              opt.winner 
                ? 'bg-emerald-100 text-emerald-700 font-medium' 
                : 'bg-white text-slate-500'
            }`}
          >
            <span>{opt.name}</span>
            <span className="font-mono">{opt.dist} blocks {opt.winner && '✓'}</span>
          </div>
        ))}
      </div>
      <p className="text-sm text-amber-700">{decision.explanation}</p>
    </div>
  );
};

// Main graph visualization
const Graph = ({ 
  stepData, 
  onNodeClick, 
  onEdgeClick, 
  interactiveMode 
}) => {
  const { current, visited, exploring, pathEdges, interactiveTarget, isComplete, finalPath } = stepData;
  
  const getNodeState = (id) => {
    if (isComplete && finalPath?.includes(id)) return 'final';
    if (visited.includes(id)) return 'visited';
    if (current === id) return 'current';
    if (exploring.includes(id)) return 'exploring';
    return 'default';
  };

  const getNodeColors = (state, isTarget) => {
    if (isTarget) return { fill: COLORS.primaryLight, stroke: COLORS.primary };
    switch (state) {
      case 'final': return { fill: '#d1fae5', stroke: '#10b981' };
      case 'visited': return { fill: '#e0e7ff', stroke: '#6366f1' };
      case 'current': return { fill: '#6366f1', stroke: '#4f46e5' };
      case 'exploring': return { fill: '#fef3c7', stroke: '#f59e0b' };
      default: return { fill: '#f8fafc', stroke: '#cbd5e1' };
    }
  };

  const isEdgeInPath = (from, to) => {
    return pathEdges.some(([a, b]) => 
      (a === from && b === to) || (a === to && b === from)
    );
  };

  const isEdgeFinal = (from, to) => {
    if (!isComplete || !finalPath) return false;
    for (let i = 0; i < finalPath.length - 1; i++) {
      if ((finalPath[i] === from && finalPath[i+1] === to) ||
          (finalPath[i] === to && finalPath[i+1] === from)) {
        return true;
      }
    }
    return false;
  };

  const isEdgeTarget = (from, to) => {
    if (!interactiveMode || interactiveTarget?.type !== 'edge') return false;
    const [tFrom, tTo] = interactiveTarget.target;
    return (from === tFrom && to === tTo) || (from === tTo && to === tFrom);
  };

  return (
    <svg viewBox="0 0 570 400" className="w-full h-full">
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.1"/>
        </filter>
        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="#10b981" />
        </marker>
      </defs>

      {/* Edges */}
      {EDGES.map((edge, i) => {
        const from = NODES[edge.from];
        const to = NODES[edge.to];
        const inPath = isEdgeInPath(edge.from, edge.to);
        const isFinal = isEdgeFinal(edge.from, edge.to);
        const isTarget = isEdgeTarget(edge.from, edge.to);
        const midX = (from.x + to.x) / 2;
        const midY = (from.y + to.y) / 2;

        return (
          <g 
            key={i} 
            onClick={() => onEdgeClick(edge.from, edge.to)} 
            style={{ cursor: interactiveMode ? 'pointer' : 'default' }}
          >
            {/* Hit area */}
            <line
              x1={from.x} y1={from.y}
              x2={to.x} y2={to.y}
              stroke="transparent"
              strokeWidth="20"
            />
            {/* Visible edge */}
            <line
              x1={from.x} y1={from.y}
              x2={to.x} y2={to.y}
              stroke={
                isFinal ? '#10b981' : 
                isTarget ? COLORS.primary : 
                inPath ? '#a5b4fc' : 
                '#e2e8f0'
              }
              strokeWidth={isFinal ? 4 : isTarget ? 4 : inPath ? 3 : 2}
              strokeLinecap="round"
              className={isTarget ? 'animate-pulse' : ''}
            />
            {/* Weight label */}
            <circle 
              cx={midX} cy={midY} r="12" 
              fill="white" 
              stroke={isFinal ? '#10b981' : inPath ? '#a5b4fc' : '#e2e8f0'} 
              strokeWidth="2"
            />
            <text 
              x={midX} y={midY + 4} 
              textAnchor="middle" 
              fontSize="11" 
              fontWeight="600" 
              fill={COLORS.text}
            >
              {edge.weight}
            </text>
          </g>
        );
      })}

      {/* Nodes */}
      {Object.entries(NODES).map(([id, node]) => {
        const state = getNodeState(id);
        const isTarget = interactiveMode && interactiveTarget?.type === 'node' && interactiveTarget?.target === id;
        const colors = getNodeColors(state, isTarget);
        const distance = stepData.distances[id];
        
        return (
          <g 
            key={id} 
            onClick={() => onNodeClick(id)}
            style={{ cursor: interactiveMode ? 'pointer' : 'default' }}
            className={isTarget ? 'animate-pulse' : ''}
          >
            {/* Target ring */}
            {isTarget && (
              <circle 
                cx={node.x} cy={node.y} r="42" 
                fill="none" 
                stroke={COLORS.primary} 
                strokeWidth="3" 
                strokeDasharray="6 4"
                opacity="0.6"
              />
            )}
            
            {/* Main circle */}
            <circle
              cx={node.x} cy={node.y} r="34"
              fill={colors.fill}
              stroke={colors.stroke}
              strokeWidth={isTarget ? 3 : 2}
              filter="url(#shadow)"
            />
            
            {/* Emoji */}
            <text 
              x={node.x} y={node.y + 7} 
              textAnchor="middle" 
              fontSize="24"
              style={{ pointerEvents: 'none' }}
            >
              {node.emoji}
            </text>
            
            {/* Name */}
            <text 
              x={node.x} y={node.y + 54} 
              textAnchor="middle" 
              fontSize="11" 
              fontWeight="500" 
              fill={COLORS.text}
              style={{ pointerEvents: 'none' }}
            >
              {node.name}
            </text>
            
            {/* Distance badge */}
            {distance !== undefined && (
              <g>
                <rect 
                  x={node.x - 14} y={node.y - 52} 
                  width="28" height="18" 
                  rx="9" 
                  fill={state === 'current' ? COLORS.primary : 'white'}
                  stroke={colors.stroke}
                  strokeWidth="1.5"
                />
                <text 
                  x={node.x} y={node.y - 39} 
                  textAnchor="middle" 
                  fontSize="11" 
                  fontWeight="700" 
                  fill={state === 'current' ? 'white' : COLORS.text}
                  style={{ pointerEvents: 'none' }}
                >
                  {distance === '?' ? '?' : distance}
                </text>
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
};

// Final result panel
const ResultPanel = ({ path, distance }) => (
  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200 p-5">
    <div className="flex items-center justify-between flex-wrap gap-4">
      <div>
        <h3 className="font-semibold text-emerald-800 mb-2">Shortest Path Found!</h3>
        <div className="flex items-center gap-2 text-lg">
          {path.map((nodeId, i) => (
            <React.Fragment key={nodeId}>
              <span className="text-2xl">{NODES[nodeId].emoji}</span>
              {i < path.length - 1 && (
                <ChevronRight size={20} className="text-emerald-400" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm text-emerald-600 font-medium">Total Distance</p>
        <p className="text-3xl font-bold text-emerald-700">{distance} blocks</p>
      </div>
    </div>
    <div className="mt-4 pt-4 border-t border-emerald-200">
      <p className="text-sm text-emerald-700">
        Home → Park (2) → Arcade (2) → School (3) = <strong>7 blocks</strong>
      </p>
      <p className="text-xs text-emerald-600 mt-1">
        Note: Home → Shop → Beach → School would be 4+2+5 = 11 blocks. We saved 4 blocks!
      </p>
    </div>
  </div>
);

// Quiz component
const Quiz = ({ onClose, sounds, soundEnabled }) => {
  const [question, setQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selected, setSelected] = useState(null);

  const q = QUIZ_QUESTIONS[question];
  const isLast = question === QUIZ_QUESTIONS.length - 1;

  const handleAnswer = (idx) => {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
    if (idx === q.correct) {
      setScore(score + 1);
      if (soundEnabled) sounds.correct();
    } else {
      if (soundEnabled) sounds.wrong();
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg max-w-lg mx-auto">
      <div className="flex justify-between items-center mb-6">
        <span className="text-sm font-medium text-slate-500">
          Question {question + 1} of {QUIZ_QUESTIONS.length}
        </span>
        <span className="text-sm font-semibold text-indigo-600">Score: {score}</span>
      </div>

      <h3 className="text-lg font-semibold text-slate-800 mb-4">{q.question}</h3>

      <div className="space-y-2 mb-6">
        {q.options.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => handleAnswer(idx)}
            disabled={answered}
            className={`w-full p-3 rounded-xl text-left font-medium transition-all border-2 ${
              answered
                ? idx === q.correct
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                  : idx === selected
                  ? 'border-red-300 bg-red-50 text-red-600'
                  : 'border-slate-200 text-slate-400'
                : 'border-slate-200 hover:border-indigo-300 hover:bg-indigo-50'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>

      {answered && (
        <div className="bg-slate-50 rounded-xl p-4 mb-4">
          <p className="text-sm text-slate-600">{q.explanation}</p>
        </div>
      )}

      <div className="flex justify-between">
        <button 
          onClick={onClose} 
          className="text-slate-500 hover:text-slate-700 font-medium text-sm"
        >
          Exit Quiz
        </button>
        {answered && (
          <button
            onClick={() => {
              if (isLast) onClose();
              else {
                setQuestion(question + 1);
                setAnswered(false);
                setSelected(null);
              }
            }}
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-2 rounded-xl font-semibold text-sm transition-colors"
          >
            {isLast ? `Finish (${score}/${QUIZ_QUESTIONS.length})` : 'Next'}
          </button>
        )}
      </div>
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================
export default function DijkstraVisualization() {
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [interactiveMode, setInteractiveMode] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [feedback, setFeedback] = useState(null);
  
  const sounds = useSound();
  const currentStep = STEPS[step];

  // Auto-play
  useEffect(() => {
    if (isPlaying && !interactiveMode && step < STEPS.length - 1) {
      const timer = setTimeout(() => setStep(step + 1), 3000);
      return () => clearTimeout(timer);
    }
    if (step >= STEPS.length - 1) {
      setIsPlaying(false);
      if (soundEnabled) sounds.complete();
    }
  }, [isPlaying, step, interactiveMode, soundEnabled]);

  const handleNodeClick = (id) => {
    if (!interactiveMode) return;
    if (soundEnabled) sounds.click();

    const target = currentStep.interactiveTarget;
    if (target?.type === 'node' && target?.target === id) {
      if (soundEnabled) sounds.correct();
      setFeedback({ type: 'correct', message: 'Correct!' });
      setTimeout(() => {
        setFeedback(null);
        if (step < STEPS.length - 1) setStep(step + 1);
      }, 500);
    } else if (target?.type === 'node') {
      if (soundEnabled) sounds.wrong();
      setFeedback({ type: 'wrong', message: `Try ${NODES[target.target].name}` });
      setTimeout(() => setFeedback(null), 1500);
    }
  };

  const handleEdgeClick = (from, to) => {
    if (!interactiveMode) return;
    if (soundEnabled) sounds.click();

    const target = currentStep.interactiveTarget;
    if (target?.type === 'edge') {
      const [tFrom, tTo] = target.target;
      const isCorrect = (from === tFrom && to === tTo) || (from === tTo && to === tFrom);
      
      if (isCorrect) {
        if (soundEnabled) sounds.correct();
        setFeedback({ type: 'correct', message: 'Correct!' });
        setTimeout(() => {
          setFeedback(null);
          if (step < STEPS.length - 1) setStep(step + 1);
        }, 500);
      } else {
        if (soundEnabled) sounds.wrong();
        setFeedback({ type: 'wrong', message: 'Try the highlighted path' });
        setTimeout(() => setFeedback(null), 1500);
      }
    }
  };

  const reset = () => {
    setStep(0);
    setIsPlaying(false);
    setFeedback(null);
  };

  if (showQuiz) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
        <Quiz onClose={() => setShowQuiz(false)} sounds={sounds} soundEnabled={soundEnabled} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-1">
            Dijkstra's Shortest Path Algorithm
          </h1>
          <p className="text-slate-500">Learn how GPS and maps find the fastest route</p>
        </div>

        {/* Main Layout */}
        <div className="grid lg:grid-cols-3 gap-4">
          
          {/* Left Panel - Graph */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              
              {/* Top Bar */}
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
                <ProgressDots current={step} total={STEPS.length} />
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className={`p-2 rounded-lg transition-colors ${
                      soundEnabled ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'
                    }`}
                    title={soundEnabled ? 'Mute' : 'Unmute'}
                  >
                    {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                  </button>
                  
                  <button
                    onClick={() => { reset(); setInteractiveMode(!interactiveMode); }}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium text-sm transition-colors ${
                      interactiveMode 
                        ? 'bg-indigo-500 text-white' 
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <MousePointer size={15} />
                    <span className="hidden sm:inline">Interactive</span>
                  </button>
                  
                  <button
                    onClick={() => setShowQuiz(true)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium text-sm bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                  >
                    <HelpCircle size={15} />
                    <span className="hidden sm:inline">Quiz</span>
                  </button>
                </div>
              </div>

              {/* Instruction */}
              <div className="px-5 py-4 bg-gradient-to-r from-indigo-50 to-slate-50 border-b border-slate-100">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h2 className="font-semibold text-slate-800 text-lg mb-1">{currentStep.title}</h2>
                    <p className="text-slate-600">{currentStep.instruction}</p>
                    {currentStep.whyThisMatters && (
                      <p className="text-sm text-indigo-600 mt-2 flex items-center gap-1.5">
                        <Lightbulb size={14} />
                        {currentStep.whyThisMatters}
                      </p>
                    )}
                  </div>
                  
                  {feedback && (
                    <div className={`px-3 py-1.5 rounded-lg font-medium text-sm whitespace-nowrap ${
                      feedback.type === 'correct' 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {feedback.message}
                    </div>
                  )}
                </div>
              </div>

              {/* Graph */}
              <div className="p-5">
                <div className="bg-slate-50 rounded-xl p-2" style={{ height: '420px' }}>
                  <Graph
                    stepData={currentStep}
                    onNodeClick={handleNodeClick}
                    onEdgeClick={handleEdgeClick}
                    interactiveMode={interactiveMode}
                  />
                </div>
              </div>

              {/* Result Panel */}
              {currentStep.isComplete && (
                <div className="px-4 pb-4">
                  <ResultPanel path={currentStep.finalPath} distance={currentStep.finalDistance} />
                </div>
              )}

              {/* Controls */}
              <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setStep(Math.max(0, step - 1))}
                  disabled={step === 0}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg font-medium text-sm text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={18} />
                  Back
                </button>

                <div className="flex items-center gap-2">
                  {!interactiveMode && (
                    <button
                      onClick={() => {
                        if (step >= STEPS.length - 1) reset();
                        else setIsPlaying(!isPlaying);
                      }}
                      className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl font-semibold text-sm transition-colors"
                    >
                      {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                      {step >= STEPS.length - 1 ? 'Restart' : isPlaying ? 'Pause' : 'Play'}
                    </button>
                  )}
                  
                  <button
                    onClick={reset}
                    className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                    title="Reset"
                  >
                    <RotateCcw size={18} />
                  </button>
                </div>

                <button
                  onClick={() => setStep(Math.min(STEPS.length - 1, step + 1))}
                  disabled={step === STEPS.length - 1}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg font-medium text-sm text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Right Panel - Info */}
          <div className="space-y-4">
            <QueuePanel queue={currentStep.queue} />
            <DecisionPanel decision={currentStep.decision} />
            
            {/* Legend */}
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <h3 className="font-semibold text-slate-700 text-sm mb-3">Legend</h3>
              <div className="space-y-2">
                {[
                  { color: '#6366f1', label: 'Current node' },
                  { color: '#f59e0b', label: 'Exploring' },
                  { color: '#e0e7ff', label: 'Visited' },
                  { color: '#10b981', label: 'Final path' },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-2 text-sm">
                    <div 
                      className="w-4 h-4 rounded-full border-2" 
                      style={{ backgroundColor: item.color, borderColor: item.color }}
                    />
                    <span className="text-slate-600">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-slate-400">
          Step {step + 1} of {STEPS.length}
        </div>
      </div>
    </div>
  );
}