import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, RotateCcw, Pause, Volume2, VolumeX, Zap, Brain, ChevronRight, Award, Sparkles, HelpCircle } from 'lucide-react';

// Audio context for sound effects
const useSound = () => {
  const audioContextRef = useRef(null);
  
  const getAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContextRef.current;
  };

  const playTone = useCallback((frequency, duration, type = 'sine', volume = 0.3) => {
    try {
      const ctx = getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = type;
      gainNode.gain.setValueAtTime(volume, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);
    } catch (e) {
      console.log('Audio not available');
    }
  }, []);

  const sounds = {
    discover: () => {
      playTone(523.25, 0.15, 'sine', 0.2);
      setTimeout(() => playTone(659.25, 0.15, 'sine', 0.2), 100);
    },
    visit: () => {
      playTone(392, 0.1, 'triangle', 0.25);
      setTimeout(() => playTone(523.25, 0.1, 'triangle', 0.25), 80);
      setTimeout(() => playTone(659.25, 0.2, 'triangle', 0.25), 160);
    },
    complete: () => {
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
        setTimeout(() => playTone(freq, 0.3, 'sine', 0.2), i * 150);
      });
    },
    click: () => playTone(880, 0.05, 'square', 0.1),
    wrong: () => {
      playTone(200, 0.2, 'sawtooth', 0.15);
      setTimeout(() => playTone(150, 0.3, 'sawtooth', 0.15), 150);
    },
    correct: () => {
      playTone(523.25, 0.1, 'sine', 0.2);
      setTimeout(() => playTone(783.99, 0.2, 'sine', 0.2), 100);
    }
  };

  return sounds;
};

export default function DijkstraEnhanced() {
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [visitedNodes, setVisitedNodes] = useState([]);
  const [currentNode, setCurrentNode] = useState(null);
  const [distances, setDistances] = useState({});
  const [animatingNodes, setAnimatingNodes] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [interactiveMode, setInteractiveMode] = useState(false);
  const [showPathComparison, setShowPathComparison] = useState(false);
  const [quizMode, setQuizMode] = useState(false);
  const [quizQuestion, setQuizQuestion] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [pathEdges, setPathEdges] = useState([]);
  const [interactiveHint, setInteractiveHint] = useState('');
  const [waitingForClick, setWaitingForClick] = useState(false);
  
  const sounds = useSound();

  const nodes = {
    home: { x: 100, y: 200, label: '🏠 Home', name: 'Home' },
    park: { x: 300, y: 100, label: '🌳 Park', name: 'Park' },
    shop: { x: 300, y: 300, label: '🏪 Shop', name: 'Shop' },
    school: { x: 500, y: 200, label: '🏫 School', name: 'School' }
  };

  const edges = [
    { from: 'home', to: 'park', weight: 2, label: '2 blocks' },
    { from: 'home', to: 'shop', weight: 5, label: '5 blocks' },
    { from: 'park', to: 'school', weight: 3, label: '3 blocks' },
    { from: 'shop', to: 'school', weight: 1, label: '1 block' }
  ];

  const quizQuestions = [
    {
      question: "What would be the shortest path if Park→School was 5 blocks instead of 3?",
      options: [
        "Home → Park → School (7 blocks)",
        "Home → Shop → School (6 blocks)",
        "Both would be equal"
      ],
      correct: 1,
      explanation: "With Park→School at 5 blocks: Home→Park→School = 2+5 = 7 blocks. Home→Shop→School = 5+1 = 6 blocks. So the Shop route becomes shorter!"
    },
    {
      question: "Why do we always pick the closest unvisited node next?",
      options: [
        "It's faster to compute",
        "It guarantees we find the shortest path",
        "It uses less memory"
      ],
      correct: 1,
      explanation: "This 'greedy' choice ensures that when we visit a node, we've found the shortest possible path to it. Any other path would go through a farther node first!"
    },
    {
      question: "If we added a direct path from Home to School of 4 blocks, what would be the shortest path?",
      options: [
        "Home → School directly (4 blocks)",
        "Home → Park → School (5 blocks)",
        "Home → Shop → School (6 blocks)"
      ],
      correct: 0,
      explanation: "A direct 4-block path would be shorter than going through Park (5 blocks) or Shop (6 blocks). Sometimes the direct route is best!"
    },
    {
      question: "What does Dijkstra's algorithm NOT do well?",
      options: [
        "Find shortest paths in graphs with positive weights",
        "Handle negative edge weights",
        "Work with multiple destinations"
      ],
      correct: 1,
      explanation: "Dijkstra's algorithm assumes all edge weights are positive. Negative weights can cause it to miss the actual shortest path. For negative weights, we use the Bellman-Ford algorithm instead!"
    },
    {
      question: "In our example, why didn't we need to visit Shop?",
      options: [
        "Shop was too far from Home",
        "We found School before needing to explore from Shop",
        "Shop had no connections"
      ],
      correct: 1,
      explanation: "We reached School (5 blocks via Park) before Shop became the closest unvisited node. Since School was our destination, we stopped there!"
    }
  ];

  const steps = [
    {
      title: "The Goal",
      description: "We want to find the SHORTEST path from Home 🏠 to School 🏫.",
      detail: "Dijkstra's algorithm helps us find the quickest route by checking all possible paths and choosing the best one!",
      keyPoint: "Key Idea: We'll visit places in order of distance from Home, starting with the closest.",
      current: null,
      visited: [],
      distances: { home: 0 },
      highlighting: [],
      pathEdges: [],
      interactiveTarget: null,
      calculation: {
        title: "What are we doing?",
        steps: [
          "We have a map with places connected by paths",
          "Each path has a distance (number of blocks)",
          "We want to find the shortest total distance from Home to School"
        ],
        visual: "Think of it like finding the fastest route on a map app!",
        miniMap: {
          showNodes: ['home', 'park', 'shop', 'school'],
          showEdges: [['home', 'park'], ['home', 'shop'], ['park', 'school'], ['shop', 'school']],
          highlightNodes: [],
          highlightEdges: [],
          nodeLabels: {},
          caption: "Our map: 4 places connected by paths"
        }
      }
    },
    {
      title: "Step 1: Start at Home",
      description: "First, we write down the distance to Home from Home. That's easy - it's 0 blocks!",
      detail: "We don't know the distances to other places yet, so we mark them with '?' for now.",
      keyPoint: "Starting Point: Home is 0 blocks away from itself. All other distances are unknown.",
      current: 'home',
      visited: [],
      distances: { home: 0, park: '?', shop: '?', school: '?' },
      highlighting: [],
      pathEdges: [],
      interactiveTarget: 'home',
      calculation: {
        title: "Setting up our distance table",
        steps: [
          "Distance from Home to Home = 0 blocks ✓",
          "Distance to Park = ? (we don't know yet)",
          "Distance to Shop = ? (we don't know yet)",
          "Distance to School = ? (we don't know yet)"
        ],
        visual: "We start by only knowing where we are: Home (0 blocks)",
        miniMap: {
          showNodes: ['home', 'park', 'shop', 'school'],
          showEdges: [['home', 'park'], ['home', 'shop'], ['park', 'school'], ['shop', 'school']],
          highlightNodes: ['home'],
          highlightEdges: [],
          nodeLabels: { home: '0', park: '?', shop: '?', school: '?' },
          caption: "Starting at Home (distance: 0)"
        }
      }
    },
    {
      title: "Step 2: Explore from Home",
      description: "Now we look at all the neighbors we can reach directly from Home.",
      detail: "From Home, we can walk to Park (2 blocks away) OR Shop (5 blocks away). We write down both distances!",
      keyPoint: "Exploration: Check all paths from current location and record their distances.",
      current: 'home',
      visited: [],
      distances: { home: 0, park: 2, shop: 5, school: '?' },
      highlighting: ['park', 'shop'],
      pathEdges: [['home', 'park'], ['home', 'shop']],
      interactiveTarget: null,
      calculation: {
        title: "Calculating distances from Home",
        steps: [
          "🏠 Home → 🌳 Park path = 2 blocks",
          "Distance to Park = 0 (Home) + 2 = 2 blocks ✓",
          "🏠 Home → 🏪 Shop path = 5 blocks",
          "Distance to Shop = 0 (Home) + 5 = 5 blocks ✓"
        ],
        visual: "Formula: Distance to neighbor = Distance to current + Path length",
        miniMap: {
          showNodes: ['home', 'park', 'shop'],
          showEdges: [['home', 'park'], ['home', 'shop']],
          highlightNodes: ['home'],
          highlightEdges: [['home', 'park'], ['home', 'shop']],
          nodeLabels: { home: '0', park: '+2', shop: '+5' },
          caption: "Exploring neighbors: Park (2) and Shop (5)"
        }
      }
    },
    {
      title: "Step 3: Choose the Closest",
      description: "Which place is closest that we haven't visited yet? Park at 2 blocks!",
      detail: "We mark Home as 'visited' ✓ (we're done with it). Now Park becomes our current location because it's the closest unvisited place.",
      keyPoint: "Greedy Choice: Always pick the closest unvisited place next. This ensures we find the shortest path!",
      current: 'park',
      visited: ['home'],
      distances: { home: 0, park: 2, shop: 5, school: '?' },
      highlighting: ['park'],
      pathEdges: [['home', 'park']],
      interactiveTarget: 'park',
      calculation: {
        title: "Choosing the next location",
        steps: [
          "Unvisited places: Park (2), Shop (5), School (?)",
          "Which is smallest? 2 < 5 < ?",
          "Winner: Park with 2 blocks!",
          "Mark Home as visited ✓ (we won't go back)"
        ],
        visual: "Rule: Pick the unvisited place with the smallest known distance",
        miniMap: {
          showNodes: ['home', 'park', 'shop'],
          showEdges: [['home', 'park'], ['home', 'shop']],
          highlightNodes: ['park'],
          highlightEdges: [['home', 'park']],
          visitedNodes: ['home'],
          nodeLabels: { home: '0 ✓', park: '2', shop: '5' },
          caption: "Park wins! (2 < 5)"
        }
      }
    },
    {
      title: "Step 4: Explore from Park",
      description: "From Park, we can reach School! Let's calculate the total distance.",
      detail: "Distance to School = Distance to Park + Park to School = 2 + 3 = 5 blocks. We found a path to School!",
      keyPoint: "Path Calculation: Always add distances together: (distance to current) + (current to neighbor).",
      current: 'park',
      visited: ['home'],
      distances: { home: 0, park: 2, shop: 5, school: 5 },
      highlighting: ['school'],
      pathEdges: [['home', 'park'], ['park', 'school']],
      interactiveTarget: null,
      calculation: {
        title: "Calculating distance to School via Park",
        steps: [
          "Currently at: Park (2 blocks from Home)",
          "🌳 Park → 🏫 School path = 3 blocks",
          "Total distance = 2 + 3 = 5 blocks",
          "School distance was '?' → now it's 5 blocks ✓"
        ],
        visual: "We found our first route to School: Home → Park → School = 5 blocks",
        miniMap: {
          showNodes: ['home', 'park', 'school'],
          showEdges: [['home', 'park'], ['park', 'school']],
          highlightNodes: ['park', 'school'],
          highlightEdges: [['park', 'school']],
          visitedNodes: ['home'],
          nodeLabels: { home: '0 ✓', park: '2', school: '2+3=5' },
          pathFlow: ['home', 'park', 'school'],
          caption: "Found School! 0 + 2 + 3 = 5 blocks"
        }
      }
    },
    {
      title: "Step 5: Compare Paths",
      description: "Now we have TWO ways to reach places with distance 5: Shop (direct) or School (through Park).",
      detail: "Both Shop and School are 5 blocks away. Let's pick School since that's our destination!",
      keyPoint: "Comparison: If we find a shorter path to a place we've already seen, we update it. Here both are equal.",
      current: 'park',
      visited: ['home'],
      distances: { home: 0, park: 2, shop: 5, school: 5 },
      highlighting: ['shop', 'school'],
      pathEdges: [['home', 'park'], ['park', 'school']],
      interactiveTarget: 'school',
      showComparison: true,
      calculation: {
        title: "Which unvisited place is closest?",
        steps: [
          "Unvisited places with known distances:",
          "• Shop: 5 blocks (direct from Home)",
          "• School: 5 blocks (via Park)",
          "Both are equal! Either choice works.",
          "Let's choose School since it's our goal"
        ],
        visual: "When distances are equal, either choice is valid!",
        miniMap: {
          type: 'comparison',
          paths: [
            { nodes: ['home', 'park', 'school'], distances: [2, 3], total: 5, label: 'Via Park', winner: true },
            { nodes: ['home', 'shop', 'school'], distances: [5, 1], total: 6, label: 'Via Shop', winner: false }
          ],
          caption: "Both routes to School: Park route = Shop route = 5"
        }
      }
    },
    {
      title: "Step 6: Reach the Destination",
      description: "School is now the closest unvisited place at 5 blocks, so we visit it!",
      detail: "We mark Park as visited ✓. We've reached our destination! The shortest path is complete.",
      keyPoint: "Found It: When we visit our destination, we've found the shortest path to it!",
      current: 'school',
      visited: ['home', 'park'],
      distances: { home: 0, park: 2, shop: 5, school: 5 },
      highlighting: ['school'],
      pathEdges: [['home', 'park'], ['park', 'school']],
      interactiveTarget: null,
      calculation: {
        title: "Reached the destination!",
        steps: [
          "Visiting: School (5 blocks from Home)",
          "Path taken: Home → Park → School",
          "Total distance: 0 + 2 + 3 = 5 blocks ✓",
          "This is guaranteed to be the shortest path!"
        ],
        visual: "Why is it shortest? Because we always picked the closest unvisited place!",
        miniMap: {
          showNodes: ['home', 'park', 'school'],
          showEdges: [['home', 'park'], ['park', 'school']],
          highlightNodes: ['school'],
          highlightEdges: [['home', 'park'], ['park', 'school']],
          visitedNodes: ['home', 'park'],
          nodeLabels: { home: '0 ✓', park: '2 ✓', school: '5' },
          pathFlow: ['home', 'park', 'school'],
          caption: "Destination reached! Total: 5 blocks"
        }
      }
    },
    {
      title: "Algorithm Complete",
      description: "The shortest path is: Home → Park → School = 5 blocks total!",
      detail: "Notice we went through Park (2 blocks), NOT Shop (5 blocks), because Park led to a path that was just as good and got us to School!",
      keyPoint: "How It Works: By always choosing the closest unvisited place, we guarantee we find the shortest path!",
      current: null,
      visited: ['home', 'park', 'school'],
      distances: { home: 0, park: 2, shop: 5, school: 5 },
      highlighting: [],
      pathEdges: [['home', 'park'], ['park', 'school']],
      interactiveTarget: null,
      calculation: {
        title: "Final Summary",
        steps: [
          "✓ Shortest path: Home → Park → School",
          "✓ Total distance: 5 blocks",
          "✓ Alternative: Home → Shop → School",
          "   Would be: 5 + 1 = 6 blocks (longer!)",
          "We saved 1 block by going through Park!"
        ],
        visual: "The algorithm found the optimal route automatically!",
        miniMap: {
          type: 'final',
          winningPath: ['home', 'park', 'school'],
          winningDistances: [2, 3],
          losingPath: ['home', 'shop', 'school'],
          losingDistances: [5, 1],
          caption: "Winner: Home → Park → School (5 blocks)"
        }
      }
    }
  ];

  const baseDelay = 4000;
  const getDelay = () => baseDelay / speed;

  useEffect(() => {
    if (isPlaying && step < steps.length - 1 && !interactiveMode) {
      const timer = setTimeout(() => {
        setStep(step + 1);
      }, getDelay());
      return () => clearTimeout(timer);
    } else if (step >= steps.length - 1) {
      setIsPlaying(false);
    }
  }, [isPlaying, step, speed, interactiveMode]);

  useEffect(() => {
    const currentStep = steps[step];
    const previousStep = step > 0 ? steps[step - 1] : null;
    
    const changedNodes = [];
    
    if (currentStep.current !== (previousStep?.current || null)) {
      if (currentStep.current) changedNodes.push(currentStep.current);
    }
    
    const newVisited = currentStep.visited.filter(
      node => !previousStep?.visited.includes(node)
    );
    changedNodes.push(...newVisited);
    
    if (currentStep.highlighting) {
      const newHighlighted = currentStep.highlighting.filter(
        node => !previousStep?.highlighting?.includes(node)
      );
      changedNodes.push(...newHighlighted);
    }
    
    Object.keys(currentStep.distances).forEach(node => {
      if (previousStep &&
          currentStep.distances[node] !== previousStep.distances[node] &&
          currentStep.distances[node] !== '?') {
        if (!changedNodes.includes(node)) changedNodes.push(node);
      }
    });
    
    setCurrentNode(currentStep.current);
    setVisitedNodes(currentStep.visited);
    setDistances(currentStep.distances);
    setPathEdges(currentStep.pathEdges || []);
    
    if (currentStep.showComparison) {
      setShowPathComparison(true);
    }
    
    if (changedNodes.length > 0) {
      setAnimatingNodes(changedNodes);
      setTimeout(() => setAnimatingNodes([]), 600);
      
      if (soundEnabled) {
        if (newVisited.length > 0) {
          sounds.visit();
        } else if (changedNodes.length > 0) {
          sounds.discover();
        }
      }
    }
    
    if (step === steps.length - 1 && soundEnabled) {
      sounds.complete();
    }

    // Interactive mode hints
    if (interactiveMode && currentStep.interactiveTarget) {
      setWaitingForClick(true);
      setInteractiveHint(`Click on ${nodes[currentStep.interactiveTarget].name} to continue!`);
    } else {
      setWaitingForClick(false);
      setInteractiveHint('');
    }
  }, [step, soundEnabled]);

  const handleNodeClick = (nodeId) => {
    if (soundEnabled) sounds.click();
    
    if (interactiveMode && waitingForClick) {
      const currentStep = steps[step];
      if (nodeId === currentStep.interactiveTarget) {
        if (soundEnabled) sounds.correct();
        setWaitingForClick(false);
        setInteractiveHint('');
        if (step < steps.length - 1) {
          setStep(step + 1);
        }
      } else {
        if (soundEnabled) sounds.wrong();
        setInteractiveHint(`Not quite! Try clicking on ${nodes[currentStep.interactiveTarget].name}`);
      }
    }
  };

  const handleQuizAnswer = (answerIndex) => {
    if (quizAnswered) return;
    
    setSelectedAnswer(answerIndex);
    setQuizAnswered(true);
    
    if (answerIndex === quizQuestions[quizQuestion].correct) {
      setQuizScore(quizScore + 1);
      if (soundEnabled) sounds.correct();
    } else {
      if (soundEnabled) sounds.wrong();
    }
  };

  const nextQuizQuestion = () => {
    if (quizQuestion < quizQuestions.length - 1) {
      setQuizQuestion(quizQuestion + 1);
      setQuizAnswered(false);
      setSelectedAnswer(null);
    }
  };

  const resetQuiz = () => {
    setQuizQuestion(0);
    setQuizScore(0);
    setQuizAnswered(false);
    setSelectedAnswer(null);
  };

  const reset = () => {
    setStep(0);
    setIsPlaying(false);
    setShowPathComparison(false);
    setWaitingForClick(false);
    setInteractiveHint('');
  };

  const togglePlay = () => {
    if (interactiveMode) {
      setInteractiveMode(false);
    }
    if (step >= steps.length - 1) {
      reset();
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const startInteractiveMode = () => {
    reset();
    setInteractiveMode(true);
    setIsPlaying(false);
  };

  const getNodeStyle = (nodeId) => {
    const currentStep = steps[step];
    
    if (nodeId === 'school' && visitedNodes.includes('school')) {
      return {
        fill: 'url(#goldGradient)',
        stroke: '#eab308',
        strokeWidth: 4,
        status: 'Destination Reached',
        statusColor: '#eab308'
      };
    }
    if (visitedNodes.includes(nodeId)) {
      return {
        fill: 'url(#greenGradient)',
        stroke: '#16a34a',
        strokeWidth: 4,
        status: 'Visited ✓',
        statusColor: '#16a34a'
      };
    }
    if (currentNode === nodeId) {
      return {
        fill: 'url(#blueGradient)',
        stroke: '#2563eb',
        strokeWidth: 4,
        status: 'Current',
        statusColor: '#2563eb'
      };
    }
    if (currentStep.highlighting && currentStep.highlighting.includes(nodeId)) {
      return {
        fill: 'url(#orangeGradient)',
        stroke: '#f97316',
        strokeWidth: 4,
        status: 'Exploring...',
        statusColor: '#f97316'
      };
    }
    return {
      fill: 'url(#grayGradient)',
      stroke: '#6b7280',
      strokeWidth: 3,
      status: 'Unvisited',
      statusColor: '#6b7280'
    };
  };

  const isEdgeInPath = (from, to) => {
    return pathEdges.some(([start, end]) =>
      (from === start && to === end) || (from === end && to === start)
    );
  };

  const getEdgeStyle = (from, to) => {
    const currentStep = steps[step];
    const inPath = isEdgeInPath(from, to);
    
    if (step >= steps.length - 1 && inPath) {
      return { className: 'stroke-green-500', width: 6, animated: false, glow: true };
    }
    
    if (inPath) {
      return { className: 'stroke-blue-500', width: 5, animated: true, glow: false };
    }
    
    if (currentStep.current) {
      for (let edge of edges) {
        if ((edge.from === currentStep.current || edge.to === currentStep.current)) {
          if ((edge.from === from && edge.to === to) || (edge.from === to && edge.to === from)) {
            return { className: 'stroke-orange-400', width: 5, animated: true, glow: false };
          }
        }
      }
    }
    
    return { className: 'stroke-gray-300', width: 3, animated: false, glow: false };
  };

  // Mini map node positions (scaled down)
  const miniNodes = {
    home: { x: 40, y: 50, emoji: '🏠' },
    park: { x: 100, y: 25, emoji: '🌳' },
    shop: { x: 100, y: 85, emoji: '🏪' },
    school: { x: 160, y: 50, emoji: '🏫' }
  };

  const miniEdgeWeights = {
    'home-park': 2,
    'home-shop': 5,
    'park-school': 3,
    'shop-school': 1
  };

  const MiniMapVisualization = ({ miniMap }) => {
    if (!miniMap) return null;

    // Comparison type - show two paths side by side
    if (miniMap.type === 'comparison') {
      return (
        <div className="bg-white rounded-xl p-4 border-2 border-blue-200">
          <div className="space-y-3">
            {miniMap.paths.map((path, idx) => (
              <div 
                key={idx} 
                className={`flex items-center justify-between p-3 rounded-lg ${
                  path.winner ? 'bg-green-50 border-2 border-green-400' : 'bg-gray-50 border-2 border-gray-300'
                }`}
              >
                <div className="flex items-center gap-1">
                  {path.nodes.map((node, nodeIdx) => (
                    <React.Fragment key={node}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                        path.winner ? 'bg-green-200' : 'bg-gray-200'
                      }`}>
                        {miniNodes[node].emoji}
                      </div>
                      {nodeIdx < path.nodes.length - 1 && (
                        <div className="flex items-center">
                          <div className={`w-6 h-1 ${path.winner ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                          <span className={`text-xs font-bold mx-1 ${path.winner ? 'text-green-600' : 'text-gray-500'}`}>
                            {path.distances[nodeIdx]}
                          </span>
                          <div className={`w-6 h-1 ${path.winner ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
                <div className={`text-lg font-bold ${path.winner ? 'text-green-600' : 'text-gray-500'}`}>
                  = {path.total} {path.winner && '✓'}
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-gray-600 mt-3 font-medium">{miniMap.caption}</p>
        </div>
      );
    }

    // Final type - show winning vs losing path
    if (miniMap.type === 'final') {
      return (
        <div className="bg-white rounded-xl p-4 border-2 border-green-300">
          <div className="space-y-3">
            {/* Winning path */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-green-100 border-2 border-green-500">
              <div className="flex items-center gap-1">
                {miniMap.winningPath.map((node, nodeIdx) => (
                  <React.Fragment key={node}>
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl bg-green-300 border-2 border-green-600">
                      {miniNodes[node].emoji}
                    </div>
                    {nodeIdx < miniMap.winningPath.length - 1 && (
                      <div className="flex items-center">
                        <svg width="30" height="20" className="mx-1">
                          <defs>
                            <marker id="arrowGreen" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                              <path d="M0,0 L0,6 L9,3 z" fill="#16a34a" />
                            </marker>
                          </defs>
                          <line x1="0" y1="10" x2="20" y2="10" stroke="#16a34a" strokeWidth="3" markerEnd="url(#arrowGreen)" />
                        </svg>
                        <span className="text-sm font-bold text-green-700 bg-green-200 px-2 py-1 rounded">
                          {miniMap.winningDistances[nodeIdx]}
                        </span>
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
              <div className="text-xl font-bold text-green-700 bg-green-200 px-3 py-1 rounded-lg">
                = 5 ✓
              </div>
            </div>
            {/* Losing path */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-red-50 border-2 border-red-300 opacity-60">
              <div className="flex items-center gap-1">
                {miniMap.losingPath.map((node, nodeIdx) => (
                  <React.Fragment key={node}>
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl bg-red-100 border-2 border-red-300">
                      {miniNodes[node].emoji}
                    </div>
                    {nodeIdx < miniMap.losingPath.length - 1 && (
                      <div className="flex items-center">
                        <svg width="30" height="20" className="mx-1">
                          <line x1="0" y1="10" x2="25" y2="10" stroke="#dc2626" strokeWidth="2" strokeDasharray="4,2" />
                        </svg>
                        <span className="text-sm font-bold text-red-500 bg-red-100 px-2 py-1 rounded">
                          {miniMap.losingDistances[nodeIdx]}
                        </span>
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
              <div className="text-xl font-bold text-red-500">
                = 6 ✗
              </div>
            </div>
          </div>
          <p className="text-center text-sm text-gray-600 mt-3 font-medium">{miniMap.caption}</p>
        </div>
      );
    }

    // Standard mini map
    return (
      <div className="bg-white rounded-xl p-4 border-2 border-blue-200">
        <svg width="100%" height="140" viewBox="0 0 200 140" className="mx-auto">
          <defs>
            <marker id="arrowBlue" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
              <path d="M0,0 L0,6 L9,3 z" fill="#3b82f6" />
            </marker>
            <marker id="arrowOrange" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
              <path d="M0,0 L0,6 L9,3 z" fill="#f97316" />
            </marker>
          </defs>
          
          {/* Draw edges */}
          {miniMap.showEdges && miniMap.showEdges.map(([from, to], idx) => {
            const fromNode = miniNodes[from];
            const toNode = miniNodes[to];
            const isHighlighted = miniMap.highlightEdges?.some(
              ([hFrom, hTo]) => (hFrom === from && hTo === to) || (hFrom === to && hTo === from)
            );
            const edgeKey = [from, to].sort().join('-');
            const weight = miniEdgeWeights[edgeKey];
            
            const midX = (fromNode.x + toNode.x) / 2;
            const midY = (fromNode.y + toNode.y) / 2;
            
            return (
              <g key={idx}>
                <line
                  x1={fromNode.x}
                  y1={fromNode.y}
                  x2={toNode.x}
                  y2={toNode.y}
                  stroke={isHighlighted ? '#f97316' : '#cbd5e1'}
                  strokeWidth={isHighlighted ? 4 : 2}
                  strokeDasharray={isHighlighted ? '6,3' : 'none'}
                  markerEnd={isHighlighted ? 'url(#arrowOrange)' : ''}
                />
                <rect
                  x={midX - 8}
                  y={midY - 8}
                  width="16"
                  height="16"
                  rx="4"
                  fill={isHighlighted ? '#fed7aa' : '#f1f5f9'}
                  stroke={isHighlighted ? '#f97316' : '#94a3b8'}
                />
                <text
                  x={midX}
                  y={midY + 4}
                  textAnchor="middle"
                  className={`text-xs font-bold ${isHighlighted ? 'fill-orange-700' : 'fill-gray-600'}`}
                >
                  {weight}
                </text>
              </g>
            );
          })}
          
          {/* Draw nodes */}
          {miniMap.showNodes && miniMap.showNodes.map((nodeId) => {
            const node = miniNodes[nodeId];
            const isHighlighted = miniMap.highlightNodes?.includes(nodeId);
            const isVisited = miniMap.visitedNodes?.includes(nodeId);
            const label = miniMap.nodeLabels?.[nodeId];
            
            let fillColor = '#e2e8f0';
            let strokeColor = '#94a3b8';
            if (isVisited) {
              fillColor = '#bbf7d0';
              strokeColor = '#16a34a';
            } else if (isHighlighted) {
              fillColor = '#bfdbfe';
              strokeColor = '#2563eb';
            }
            
            return (
              <g key={nodeId}>
                <circle
                  cx={node.x}
                  cy={node.y}
                  r="18"
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeWidth="3"
                />
                <text
                  x={node.x}
                  y={node.y + 5}
                  textAnchor="middle"
                  className="text-base"
                >
                  {node.emoji}
                </text>
                {label && (
                  <text
                    x={node.x}
                    y={node.y + 32}
                    textAnchor="middle"
                    className={`text-xs font-bold ${isHighlighted ? 'fill-blue-700' : isVisited ? 'fill-green-700' : 'fill-gray-600'}`}
                  >
                    {label}
                  </text>
                )}
              </g>
            );
          })}
          
          {/* Draw path flow arrows if present */}
          {miniMap.pathFlow && miniMap.pathFlow.length > 1 && (
            <g>
              {miniMap.pathFlow.slice(0, -1).map((from, idx) => {
                const to = miniMap.pathFlow[idx + 1];
                const fromNode = miniNodes[from];
                const toNode = miniNodes[to];
                // Offset the arrow to not overlap with edge
                const dx = toNode.x - fromNode.x;
                const dy = toNode.y - fromNode.y;
                const len = Math.sqrt(dx * dx + dy * dy);
                const offsetX = (dx / len) * 22;
                const offsetY = (dy / len) * 22;
                
                return (
                  <line
                    key={idx}
                    x1={fromNode.x + offsetX}
                    y1={fromNode.y + offsetY}
                    x2={toNode.x - offsetX}
                    y2={toNode.y - offsetY}
                    stroke="#16a34a"
                    strokeWidth="4"
                    markerEnd="url(#arrowBlue)"
                    opacity="0.7"
                  />
                );
              })}
            </g>
          )}
        </svg>
        <p className="text-center text-sm text-gray-600 mt-2 font-medium">{miniMap.caption}</p>
      </div>
    );
  };

  if (quizMode) {
    const q = quizQuestions[quizQuestion];
    const isLastQuestion = quizQuestion === quizQuestions.length - 1;
    
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 p-4 md:p-8 flex flex-col items-center justify-start overflow-auto">
        <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-10 max-w-3xl w-full my-8">
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => setQuizMode(false)}
              className="text-gray-500 hover:text-gray-700 font-medium"
            >
              ← Back to Demo
            </button>
            <div className="flex items-center gap-2 bg-purple-100 px-4 py-2 rounded-full">
              <Award className="text-purple-600" size={20} />
              <span className="font-bold text-purple-700">{quizScore}/{quizQuestions.length}</span>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-center mb-2 text-purple-600 flex items-center justify-center gap-2">
            <Brain size={32} /> Quiz Time!
          </h1>
          <p className="text-center text-gray-500 mb-8">Question {quizQuestion + 1} of {quizQuestions.length}</p>
          
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">{q.question}</h2>
            
            <div className="space-y-3">
              {q.options.map((option, idx) => {
                let btnClass = "w-full p-4 rounded-xl text-left font-medium transition-all border-2 ";
                
                if (quizAnswered) {
                  if (idx === q.correct) {
                    btnClass += "bg-green-100 border-green-500 text-green-800";
                  } else if (idx === selectedAnswer) {
                    btnClass += "bg-red-100 border-red-500 text-red-800";
                  } else {
                    btnClass += "bg-gray-50 border-gray-200 text-gray-500";
                  }
                } else {
                  btnClass += "bg-white border-gray-200 hover:border-purple-400 hover:bg-purple-50 cursor-pointer";
                }
                
                return (
                  <button
                    key={idx}
                    onClick={() => handleQuizAnswer(idx)}
                    className={btnClass}
                    disabled={quizAnswered}
                  >
                    <span className="mr-3 inline-block w-8 h-8 rounded-full bg-purple-200 text-purple-700 text-center leading-8 font-bold">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    {option}
                  </button>
                );
              })}
            </div>
          </div>
          
          {quizAnswered && (
            <div className={`rounded-xl p-5 mb-6 ${selectedAnswer === q.correct ? 'bg-green-50 border-2 border-green-300' : 'bg-amber-50 border-2 border-amber-300'}`}>
              <p className="font-bold mb-2 flex items-center gap-2">
                {selectedAnswer === q.correct ? (
                  <><Sparkles className="text-green-600" /> Correct!</>
                ) : (
                  <><HelpCircle className="text-amber-600" /> Not quite!</>
                )}
              </p>
              <p className="text-gray-700">{q.explanation}</p>
            </div>
          )}
          
          {quizAnswered && (
            <div className="flex justify-center">
              {isLastQuestion ? (
                <div className="text-center">
                  <p className="text-2xl font-bold mb-4">
                    Final Score: {quizScore}/{quizQuestions.length}
                    {quizScore === quizQuestions.length && " 🏆 Perfect!"}
                    {quizScore >= 3 && quizScore < quizQuestions.length && " 🌟 Great job!"}
                    {quizScore < 3 && " Keep learning!"}
                  </p>
                  <button
                    onClick={resetQuiz}
                    className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-full font-bold mr-4"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => setQuizMode(false)}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-full font-bold"
                  >
                    Back to Demo
                  </button>
                </div>
              ) : (
                <button
                  onClick={nextQuizQuestion}
                  className="bg-purple-500 hover:bg-purple-600 text-white px-8 py-3 rounded-full font-bold flex items-center gap-2"
                >
                  Next Question <ChevronRight size={20} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 p-4 md:p-8 flex flex-col items-center justify-start overflow-auto">
      <style>{`
        @keyframes pulseRing {
          0% { r: 40; opacity: 1; }
          50% { r: 55; opacity: 0.5; }
          100% { r: 40; opacity: 1; }
        }
        @keyframes scaleUp {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
        @keyframes dashMove {
          to { stroke-dashoffset: -20; }
        }
        @keyframes glowPulse {
          0%, 100% { filter: drop-shadow(0 0 8px #22c55e); }
          50% { filter: drop-shadow(0 0 16px #22c55e); }
        }
        .animating-node { animation: scaleUp 0.6s ease-in-out; }
        .pulse-ring { animation: pulseRing 0.6s ease-in-out; }
        .animated-edge { stroke-dasharray: 10 5; animation: dashMove 0.5s linear infinite; }
        .glow-edge { animation: glowPulse 1s ease-in-out infinite; }
        .clickable-node { cursor: pointer; transition: transform 0.2s; }
        .clickable-node:hover { transform: scale(1.1); }
      `}</style>
      
      <div className="bg-white rounded-3xl shadow-2xl p-4 md:p-8 max-w-4xl w-full my-8">
        <h1 className="text-4xl font-bold text-center mb-3 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
          Dijkstra's Algorithm
        </h1>
        <p className="text-center text-gray-600 mb-6">Finding the shortest path, one step at a time</p>
        
        {/* Control Bar */}
        <div className="flex flex-wrap justify-center gap-3 mb-6">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all ${
              soundEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
            }`}
          >
            {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            Sound
          </button>
          
          <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full">
            <Zap size={18} className="text-yellow-600" />
            <span className="text-sm font-medium">Speed:</span>
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.5"
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              className="w-20 accent-purple-500"
            />
            <span className="text-sm font-bold w-8">{speed}x</span>
          </div>
          
          <button
            onClick={startInteractiveMode}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all ${
              interactiveMode ? 'bg-purple-500 text-white' : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
            }`}
          >
            <Brain size={18} />
            Interactive Mode
          </button>
          
          <button
            onClick={() => { setQuizMode(true); resetQuiz(); }}
            className="flex items-center gap-2 px-4 py-2 rounded-full font-medium bg-amber-100 text-amber-700 hover:bg-amber-200 transition-all"
          >
            <Award size={18} />
            Quiz
          </button>
        </div>

        {/* Interactive Mode Banner */}
        {interactiveMode && (
          <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl p-4 mb-6 text-center">
            <p className="font-bold text-lg mb-1">🎮 Interactive Mode Active!</p>
            <p className="text-purple-100">{interactiveHint || "Follow along by clicking the correct nodes"}</p>
          </div>
        )}
        
        {/* Info Box */}
        <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-2xl p-6 mb-6">
          <h2 className="text-2xl font-bold mb-3 text-purple-700">{steps[step].title}</h2>
          <p className="text-lg text-gray-800 mb-3 font-semibold">{steps[step].description}</p>
          <p className="text-base text-gray-700 mb-3 leading-relaxed">{steps[step].detail}</p>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
            <p className="text-sm text-gray-800 font-medium">{steps[step].keyPoint}</p>
          </div>
        </div>

        {/* Graph Visualization */}
        <div className="relative bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border-4 border-purple-300 mb-6" style={{ height: '500px' }}>
          <svg width="100%" height="100%" viewBox="0 0 600 500" preserveAspectRatio="xMidYMid meet">
            <defs>
              <linearGradient id="blueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{stopColor: '#60a5fa'}} />
                <stop offset="100%" style={{stopColor: '#2563eb'}} />
              </linearGradient>
              <linearGradient id="greenGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{stopColor: '#4ade80'}} />
                <stop offset="100%" style={{stopColor: '#16a34a'}} />
              </linearGradient>
              <linearGradient id="orangeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{stopColor: '#fb923c'}} />
                <stop offset="100%" style={{stopColor: '#f97316'}} />
              </linearGradient>
              <linearGradient id="grayGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{stopColor: '#e5e7eb'}} />
                <stop offset="100%" style={{stopColor: '#9ca3af'}} />
              </linearGradient>
              <linearGradient id="goldGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{stopColor: '#fde047'}} />
                <stop offset="100%" style={{stopColor: '#eab308'}} />
              </linearGradient>
              <filter id="dropShadow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
                <feOffset dx="0" dy="2" result="offsetblur"/>
                <feComponentTransfer>
                  <feFuncA type="linear" slope="0.3"/>
                </feComponentTransfer>
                <feMerge>
                  <feMergeNode/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              <filter id="glow">
                <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            {/* Draw edges */}
            {edges.map((edge, idx) => {
              const from = nodes[edge.from];
              const to = nodes[edge.to];
              const midX = (from.x + to.x) / 2;
              const midY = (from.y + to.y) / 2 + 50;
              const edgeStyle = getEdgeStyle(edge.from, edge.to);
              
              return (
                <g key={idx}>
                  <line
                    x1={from.x}
                    y1={from.y + 50}
                    x2={to.x}
                    y2={to.y + 50}
                    className={`${edgeStyle.className} transition-all duration-500 ${edgeStyle.animated ? 'animated-edge' : ''} ${edgeStyle.glow ? 'glow-edge' : ''}`}
                    strokeWidth={edgeStyle.width}
                    filter={edgeStyle.glow ? 'url(#glow)' : undefined}
                  />
                  <text
                    x={midX}
                    y={midY - 10}
                    className={`font-bold text-sm ${edgeStyle.className.includes('orange') ? 'fill-orange-600' : 'fill-gray-700'}`}
                    textAnchor="middle"
                  >
                    {edge.label}
                  </text>
                </g>
              );
            })}

            {/* Draw nodes */}
            {Object.entries(nodes).map(([id, node]) => {
              const isAnimating = animatingNodes.includes(id);
              const style = getNodeStyle(id);
              const nodeY = node.y + 50;
              const isClickable = interactiveMode && waitingForClick;
              
              return (
                <g 
                  key={id} 
                  className={`${isAnimating ? 'animating-node' : ''} ${isClickable ? 'clickable-node' : ''}`}
                  onClick={() => handleNodeClick(id)}
                  style={{ cursor: isClickable ? 'pointer' : 'default' }}
                >
                  {isAnimating && (
                    <>
                      <circle cx={node.x} cy={nodeY} r="45" className="pulse-ring fill-none" stroke={style.stroke} strokeWidth="3" opacity="0.6" />
                      <circle cx={node.x} cy={nodeY} r="50" className="pulse-ring fill-none" stroke={style.stroke} strokeWidth="2" opacity="0.4" />
                    </>
                  )}
                  
                  <circle
                    cx={node.x}
                    cy={nodeY}
                    r="45"
                    fill={style.fill}
                    stroke={style.stroke}
                    strokeWidth={style.strokeWidth}
                    filter="url(#dropShadow)"
                    className="transition-all duration-500"
                  />
                  
                  <circle cx={node.x} cy={nodeY} r="38" fill="none" stroke="white" strokeWidth="2" opacity="0.5" />
                  
                  <text x={node.x} y={nodeY + 8} className="fill-gray-800 font-bold text-2xl pointer-events-none" textAnchor="middle">
                    {node.label.split(' ')[0]}
                  </text>
                  
                  <rect x={node.x - 55} y={nodeY - 72} width="110" height="24" rx="12" fill={style.statusColor} opacity="0.9" />
                  <text x={node.x} y={nodeY - 54} className="fill-white font-bold pointer-events-none" style={{ fontSize: '11px' }} textAnchor="middle">
                    {style.status}
                  </text>
                  
                  <rect x={node.x - 35} y={nodeY + 52} width="70" height="28" rx="14" fill="white" stroke={style.stroke} strokeWidth="2" />
                  <text
                    x={node.x}
                    y={nodeY + 70}
                    className="font-bold text-sm pointer-events-none"
                    fill={style.statusColor}
                    textAnchor="middle"
                  >
                    {distances[id] !== undefined ? (distances[id] === '?' ? '?' : `${distances[id]} blocks`) : '∞'}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Path Comparison Panel */}
        {showPathComparison && (
          <div className="bg-gradient-to-r from-red-50 to-green-50 rounded-xl p-5 mb-6 border-2 border-purple-300">
            <h3 className="font-bold text-lg mb-4 text-center text-purple-800">Why Not Go Through Shop?</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 border-2 border-green-400">
                <p className="font-bold text-green-700 mb-2">✓ Park Route (Winner!)</p>
                <div className="space-y-1 text-sm">
                  <p>🏠 Home → 🌳 Park: <span className="font-bold">2 blocks</span></p>
                  <p>🌳 Park → 🏫 School: <span className="font-bold">3 blocks</span></p>
                  <p className="text-lg font-bold text-green-600 mt-2">Total: 5 blocks</p>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 border-2 border-red-300 opacity-75">
                <p className="font-bold text-red-600 mb-2">✗ Shop Route (Longer)</p>
                <div className="space-y-1 text-sm">
                  <p>🏠 Home → 🏪 Shop: <span className="font-bold">5 blocks</span></p>
                  <p>🏪 Shop → 🏫 School: <span className="font-bold">1 block</span></p>
                  <p className="text-lg font-bold text-red-500 mt-2">Total: 6 blocks</p>
                </div>
              </div>
            </div>
            <p className="text-center mt-4 text-gray-600 font-medium">
              Even though Shop→School is shorter, the total path through Park is 1 block less!
            </p>
          </div>
        )}

        {/* Distance Table */}
        <div className="bg-white rounded-xl p-4 mb-6 border-2 border-purple-300 shadow-lg">
          <h3 className="font-bold text-center mb-3 text-gray-700">📊 Distance Table (from Home)</h3>
          <div className="grid grid-cols-4 gap-3">
            {Object.entries(nodes).map(([id, node]) => {
              const isAnimating = animatingNodes.includes(id);
              const style = getNodeStyle(id);
              
              let bgColor = '#e5e7eb';
              if (style.fill.includes('blue')) bgColor = '#60a5fa';
              else if (style.fill.includes('green')) bgColor = '#4ade80';
              else if (style.fill.includes('orange')) bgColor = '#fb923c';
              else if (style.fill.includes('gold')) bgColor = '#fde047';
              
              return (
                <div
                  key={id}
                  className={`p-4 rounded-xl text-center border-4 transition-all duration-500 shadow-md ${
                    isAnimating ? 'scale-110 shadow-xl ring-4 ring-purple-400' : ''
                  }`}
                  style={{
                    borderColor: style.stroke,
                    background: `linear-gradient(to bottom, ${bgColor}, ${style.stroke})`
                  }}
                >
                  <div className="font-bold text-sm text-white drop-shadow-md">{node.label}</div>
                  <div className={`text-3xl font-bold mt-2 text-white drop-shadow-lg transition-all duration-300 ${
                    isAnimating ? 'text-4xl' : ''
                  }`}>
                    {distances[id] !== undefined ? (distances[id] === '?' ? '?' : distances[id]) : '∞'}
                  </div>
                  <div className="text-xs mt-1 text-white font-semibold opacity-90">
                    {visitedNodes.includes(id) ? '✓ Done' : style.status}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Calculation Panel with Mini Map */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-5 mb-6 border-2 border-green-300">
          <h3 className="font-bold text-lg mb-3 text-green-800 flex items-center gap-2">
            <span className="text-2xl">🧮</span> {steps[step].calculation.title}
          </h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            {/* Text explanation */}
            <div>
              <div className="space-y-2 mb-3">
                {steps[step].calculation.steps.map((calcStep, idx) => (
                  <div key={idx} className="flex items-start gap-2 bg-white p-2 rounded-lg">
                    <span className="text-green-600 font-bold min-w-[20px]">{idx + 1}.</span>
                    <span className="text-gray-800">{calcStep}</span>
                  </div>
                ))}
              </div>
              <div className="bg-yellow-100 border-l-4 border-yellow-500 p-3 rounded">
                <p className="text-sm font-semibold text-gray-800">💡 {steps[step].calculation.visual}</p>
              </div>
            </div>
            
            {/* Mini map visualization */}
            <div>
              <MiniMapVisualization miniMap={steps[step].calculation.miniMap} />
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-4 mb-6 flex-wrap">
          {[
            { gradient: 'linear-gradient(to bottom, #60a5fa, #2563eb)', border: '#2563eb', label: 'Current' },
            { gradient: 'linear-gradient(to bottom, #fb923c, #f97316)', border: '#f97316', label: 'Exploring' },
            { gradient: 'linear-gradient(to bottom, #4ade80, #16a34a)', border: '#16a34a', label: 'Visited ✓' },
            { gradient: 'linear-gradient(to bottom, #e5e7eb, #9ca3af)', border: '#6b7280', label: 'Unvisited' }
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow border-2 border-gray-200">
              <div className="w-10 h-10 rounded-full" style={{ background: item.gradient, border: `4px solid ${item.border}` }}></div>
              <span className="text-sm font-semibold">{item.label}</span>
            </div>
          ))}
        </div>

        {/* Step Navigation */}
        {!interactiveMode && (
          <div className="flex justify-center gap-2 mb-4">
            <button
              onClick={() => setStep(Math.max(0, step - 1))}
              disabled={step === 0}
              className="px-4 py-2 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 disabled:text-gray-400 rounded-lg font-semibold transition-all"
            >
              ← Previous
            </button>
            <button
              onClick={() => setStep(Math.min(steps.length - 1, step + 1))}
              disabled={step === steps.length - 1}
              className="px-4 py-2 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 disabled:text-gray-400 rounded-lg font-semibold transition-all"
            >
              Next →
            </button>
          </div>
        )}

        {/* Controls */}
        <div className="flex justify-center gap-4">
          <button
            onClick={togglePlay}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-8 py-3 rounded-full font-bold text-lg transition-all shadow-lg"
          >
            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
            {step >= steps.length - 1 ? 'Restart' : isPlaying ? 'Pause' : 'Play'}
          </button>
          <button
            onClick={reset}
            className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-8 py-3 rounded-full font-bold text-lg transition-all shadow-lg"
          >
            <RotateCcw size={24} />
            Reset
          </button>
        </div>

        <div className="mt-6 text-center text-sm text-gray-600">
          Step {step + 1} of {steps.length}
        </div>
      </div>
    </div>
  );
}
