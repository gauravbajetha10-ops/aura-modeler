# Aura Modeler

Aura Modeler is a stunning, next-generation 3D model viewing dashboard built with **Next.js 14**, **React Three Fiber**, and **Tailwind CSS**. It combines highly interactive 3D rendering with a gorgeous glassmorphic UI to create a truly immersive experience.

## ✨ Features

- **Interactive 3D Viewer:** View, rotate, and interact with `.glb` models seamlessly right in your browser using `@react-three/fiber` and `@react-three/drei`.
- **Dynamic Asset Loading:** No code changes required to update content! Simply drop `.glb` files into `public/models` and `.mp3` files into `public/music`, and the app will automatically format and load them.
- **Glassmorphic Music Player:** A built-in, beautifully animated music player with shuffle, repeat, and scrubber capabilities. Click anywhere outside the player to collapse it.
- **Vibrant UI & Micro-animations:** Fluid transitions, glowing ring effects, and sleek hover states built strictly with Tailwind CSS utilities.
- **Cinematic Start Engine Sequence:** Engage users immediately with a start-engine button that plays an audio/video sequence before revealing the dashboard.
- **Real-time Flip Clock:** A sleek, fully animated flip clock component built from scratch.

## 🚀 Getting Started

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/YourUsername/aura-modeler.git
   ```
2. Navigate into the project folder:
   ```bash
   cd aura-modeler
   ```
3. Install the dependencies:
   ```bash
   npm install
   ```

### Running the Development Server

Start the application on your local machine:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📂 Managing Content

Aura Modeler is designed to be fully dynamic. You manage the content purely through the file system.

### Adding 3D Models
Drop any `.glb` file into the `public/models/` folder. The app will automatically clean up the filename (removing underscores, hyphens, and the file extension) and display it beautifully in the dashboard list.

### Adding Music Tracks
Drop any `.mp3` file into the `public/music/` folder. The app will parse the title automatically (stripping out common prefixes like `bensound-`) and add it to your music player's rotation.

## 🛠 Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **3D Rendering:** [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) & [Drei](https://github.com/pmndrs/drei)
- **Icons:** Custom SVG implementations

## 🌍 Deployment

The easiest way to deploy Aura Modeler is to use the [Vercel Platform](https://vercel.com/new). 
Simply push this repository to GitHub, link it in Vercel, and the platform will handle the rest!
