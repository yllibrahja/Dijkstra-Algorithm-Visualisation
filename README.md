# Dijkstra's Algorithm - Interactive Visualization

[![Live Demo](https://img.shields.io/badge/demo-live-green)](https://yllibrahja.github.io/Dijkstra-Algorithm-Visualisation/)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

An interactive, kid-friendly visualization of Dijkstra's shortest path algorithm. Learn how computers find the fastest route between two points.

## About

This project provides an engaging, interactive way to learn Dijkstra's shortest path algorithm. Start at Home and find the shortest path to School by exploring multiple locations including Park, Shop, Hospital, Arcade, and Beach. The visualization guides you through 20+ steps with detailed explanations and interactive decision points.

## Features

**Learning Experience**
- 20+ Guided Steps: Detailed walkthrough of the entire algorithm
- Interactive Mode: Click nodes and edges to actively participate
- Real-time Visualization: Watch distance updates and path exploration
- Decision Points: Multiple-choice questions at key steps
- Why This Matters: Explanations of real-world applications

**User Controls**
- Play/Pause/Reset: Control the visualization flow
- Speed Control: Adjust animation speed (0.5x to 3x)
- Sound Toggle: Enable/disable audio feedback
- Quiz Mode: Test your understanding with interactive questions
- Step Navigation: Move forward/backward through the algorithm

**Visual Design**
- Graph Visualization: 7 locations with weighted edges
- Color-coded States: Unvisited (gray), exploring (blue), visited (green)
- Node Identification: Clear markers for each location
- Responsive Layout: Works on desktop and mobile devices

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
│   ├── DijkstraAlgorithm.jsx    # Main component with algorithm logic
│   ├── main.jsx                 # React entry point
│   └── index.css                # Global styles
├── index.html                   # HTML template
├── package.json                 # Dependencies and scripts
├── vite.config.js              # Vite configuration
├── tailwind.config.js          # Tailwind CSS configuration
├── postcss.config.js           # PostCSS configuration
└── README.md                   # This file
```

## How Dijkstra's Algorithm Works

The algorithm finds the shortest path from a source node to a destination by:

1. **Initialize**: Start at the source (Home) with distance 0, mark all others as infinite
2. **Explore**: From current node, check all unvisited neighbors and update their distances
3. **Select**: Choose the unvisited node with the smallest distance
4. **Mark**: Mark that node as visited and repeat from step 2
5. **Complete**: Continue until reaching the destination or visiting all nodes
6. **Guaranteed**: The algorithm guarantees finding the true shortest path

### Real-World Applications
- GPS Navigation: Finding fastest routes in maps
- Game AI: Pathfinding for non-player characters
- Network Routing: Optimizing data packet transmission
- Flight Planning: Computing minimal travel routes

## Built With

- **[React 18](https://react.dev/)** - User interface library
- **[Vite 4](https://vitejs.dev/)** - Fast build tool and dev server
- **[Tailwind CSS 3](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Lucide React](https://lucide.dev/)** - Beautiful icon library
- **[GitHub Pages](https://pages.github.com/)** - Deployment platform

## License

MIT License - see [LICENSE](LICENSE) for details.
