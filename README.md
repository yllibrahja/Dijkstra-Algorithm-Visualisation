# Dijkstra's Algorithm - Interactive Visualisation

[![Live Demo](https://img.shields.io/badge/demo-live-green)](https://yllibrahja.github.io/Dijkstra-Algorithm-Visualisation/)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

An interactive, beginner-friendly visualisation of Dijkstra's shortest path algorithm. Learn how computers find the fastest route between two points.

## About

This project offers an engaging way to learn Dijkstra's shortest-path algorithm. Navigate from Home to School through 7 different locations, including Park, Shop, Hospital, Arcade, and Beach. The visualisation guides you through 11 steps with explanations, decision points, and a priority queue display.

## Features

**Learning Tools**
- Step-by-Step Walkthrough: 11 guided steps explaining the algorithm
- Priority Queue Panel: See which nodes are waiting to be visited
- Decision Panel: Understand why the algorithm makes each choice
- "Why This Matters": Real-world context for each concept
- Interactive Mode: Click nodes and edges to participate actively
- Quiz Mode: 4 questions to test your understanding

**Visual Elements**
- 7 Locations: Home, Park, Shop, Hospital, Arcade, Beach, School
- 9 Weighted Edges: Multiple paths to compare
- Colour-Coded States: Current (indigo), Exploring (amber), Visited (indigo light), Final path (emerald)
- Distance Badges: See calculated distances on each node
- Responsive Layout: Two-column design on larger screens

**Controls**
- Play/Pause: Auto-advance through steps
- Back/Next: Manual step navigation
- Reset: Start over from the beginning
- Sound Toggle: Enable/disable audio feedback
- Interactive Toggle: Switch between watch and participate modes

## Live Demo

[View Live Demo](https://yllibrahja.github.io/Dijkstra-Algorithm-Visualisation/)

## Run Locally

Clone the repository:
```bash
git clone https://github.com/yllibrahja/Dijkstra-Algorithm-Visualisation.git
cd Dijkstra-Algorithm-Visualisation
```

Install dependencies:
```bash
npm install
```

Start the development server:
```bash
npm run dev
```

Open your browser and navigate to `http://localhost:5173`

Build for production:
```bash
npm run build
```

## Project Structure

```
Dijkstra-Algorithm-Visualisation/
├── src/
│   ├── DijkstraAlgorithm.jsx     # Main visualization component
│   ├── main.jsx                 # React entry point
│   └── index.css                # Tailwind directives
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

## How Dijkstra's Algorithm Works

1. **Initialise**: Start at Home with distance 0, all others unknown
2. **Explore**: Check all neighbours and calculate their distances
3. **Select**: Pick the unvisited node with the smallest distance
4. **Mark**: Mark current node as visited
5. **Repeat**: Continue until reaching the destination
6. **Result**: The path found is guaranteed to be the shortest

**Key Insight**: By always visiting the closest unvisited node, we ensure that when we reach any node, we've found the optimal path to it.

## Real-World Applications

- **GPS Navigation**: Finding the fastest driving route
- **Game AI**: Pathfinding for characters in video games
- **Network Routing**: Directing internet traffic efficiently
- **Social Networks**: Finding degrees of separation between people

## Built With

- [React 18](https://react.dev/) - UI library
- [Vite 4](https://vitejs.dev/) - Build tool
- [Tailwind CSS 3](https://tailwindcss.com/) - Styling
- [Lucide React](https://lucide.dev/) - Icons

## License

MIT License - see [LICENSE](LICENSE) for details.
