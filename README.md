# AETHER OS — Premium Filesystem Explorer

A modern, fluid web-based filesystem explorer and desktop environment built with React, TypeScript, Tailwind CSS, and Node.js / Express.

![AETHER OS Banner](resources/cloud.png)

## 🌟 Features

- **Intuitive File Navigation**: Smooth directory traversal with interactive breadcrumb navigation, search, and history.
- **Multiple View Layouts**:
  - Grid View
  - Compact Grid View
  - List View
  - Cinematic Layout
  - Gallery Layout
- **File Management & Operations**:
  - Create new files and folders
  - Rename items
  - Delete items with confirmation dialogs
  - Context menu actions for quick item management
- **Rich Previews & Inspection**:
  - Syntax-highlighted code preview powered by PrismJS
  - Details drawer with metadata, size, timestamps, and file attributes
- **Command Palette (`Ctrl` / `Cmd` + `K`)**: Fast access to actions, navigation, and settings.
- **Dynamic Theming**: Customizable UI themes with seamless switching.
- **Express Backend**: Real-time filesystem synchronization with Chokidar file watching and REST APIs.

## 🛠️ Tech Stack

- **Frontend**:
  - React 18
  - TypeScript
  - Tailwind CSS
  - Framer Motion
  - Lucide React Icons
  - PrismJS
  - Vite
- **Backend**:
  - Node.js & Express
  - Chokidar (File watcher)
  - tsx

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [npm](https://www.npmjs.com/)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/OMNIMBARTE/MyFiles.git
   cd MyFiles
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Running the Application

- **Full Stack Development Mode** (Starts Express backend & frontend):
  ```bash
  npm run dev
  ```

- **Frontend Only**:
  ```bash
  npm run dev:client
  ```

- **Production Build**:
  ```bash
  npm run build
  npm run preview
  ```

### Scripts

- `npm run dev` - Run development server via `tsx server/index.ts`
- `npm run build` - Type check and compile frontend bundle
- `npm run lint` - Run ESLint checks
- `npm run typecheck` - Run TypeScript compiler checks
- `npm run verify` - Autonomous QA verification checks

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
