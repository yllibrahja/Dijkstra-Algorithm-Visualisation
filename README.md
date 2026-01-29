# Dijkstra's Algorithm - Interactive Visualization

An interactive, kid-friendly visualization of Dijkstra's shortest path algorithm. Learn how computers find the fastest route between two points!

![Dijkstra Visualization](https://img.shields.io/badge/React-18-blue) ![License](https://img.shields.io/badge/license-MIT-green)

## 🎯 What is This?

This project teaches Dijkstra's algorithm through a fun, step-by-step visualization. Watch as the algorithm finds the shortest path from Home to School, exploring different routes through a Park and Shop.

## ✨ Features

- **Step-by-Step Walkthrough** - Follow along as the algorithm explores each path
- **Interactive Mode** - Click on nodes yourself to learn by doing
- **Sound Effects** - Audio feedback for discoveries and completions
- **Speed Control** - Adjust animation speed from 0.5x to 3x
- **Mini-Map Visualizations** - Synchronized diagrams that explain each step
- **Path Comparison** - See why some routes are shorter than others
- **Quiz Mode** - Test your understanding with 5 questions

## 🚀 Live Demo

[View Live Demo](https://YOUR_USERNAME.github.io/dijkstra-visualization/)

## 🛠️ Run Locally

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/dijkstra-visualization.git
   cd dijkstra-visualization
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

## 📁 Project Structure

```
dijkstra-visualization/
├── src/
│   ├── DijkstraEnhanced.jsx  # Main visualization component
│   ├── main.jsx              # React entry point
│   └── index.css             # Tailwind CSS styles
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## 🎓 How Dijkstra's Algorithm Works

1. **Start** at the source node (Home) with distance 0
2. **Explore** all neighboring nodes and record their distances
3. **Choose** the unvisited node with the smallest distance
4. **Repeat** until you reach the destination
5. **Result** - The shortest path is guaranteed!

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

Built with:
- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)

---

Made with ❤️ for teaching algorithms to everyone!
