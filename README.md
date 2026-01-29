# Dijkstra's Algorithm - Interactive Visualization

[![Live Demo](https://img.shields.io/badge/demo-live-green)](https://YOUR_USERNAME.github.io/dijkstra-visualization/)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

An interactive, kid-friendly visualization of Dijkstra's shortest path algorithm. Learn how computers find the fastest route between two points.

## About

This project teaches Dijkstra's algorithm through a step-by-step visualization. Watch as the algorithm finds the shortest path from Home to School, exploring different routes through a Park and Shop.

## Features

- Step-by-step walkthrough of the algorithm
- Interactive mode - click on nodes to learn by doing
- Sound effects for discoveries and completions
- Adjustable animation speed (0.5x to 3x)
- Mini-map visualizations that explain each step
- Path comparison showing why some routes are shorter
- Quiz mode with 5 questions to test understanding

## Live Demo

[View Live Demo](https://YOUR_USERNAME.github.io/dijkstra-visualization/)

## Run Locally

Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/dijkstra-visualization.git
cd dijkstra-visualization
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

## Project Structure

```
dijkstra-visualization/
├── src/
│   ├── DijkstraEnhanced.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## How Dijkstra's Algorithm Works

1. Start at the source node (Home) with distance 0
2. Explore all neighboring nodes and record their distances
3. Choose the unvisited node with the smallest distance
4. Repeat until you reach the destination
5. The shortest path is guaranteed

## Built With

- React
- Vite
- Tailwind CSS
- Lucide Icons

## License

MIT License - see [LICENSE](LICENSE) for details.
