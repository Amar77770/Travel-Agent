# Agentic Travel Planner

A next-generation, AI-powered travel assistant that transforms simple natural language queries and visual inspirations into detailed, structured travel itineraries.

## 🚀 Overview

The **Agentic Travel Planner** is a React-based web application designed to demonstrate the power of **Agentic AI** workflows. Unlike standard chatbots that simply output text, this application uses advanced LLM capabilities—specifically Function Calling and Multimodal processing—to generate structured data (JSON) that renders as interactive, rich UI components.

## 🧐 Problem Statement

Modern travel planning is often fragmented and overwhelming:
*   **Information Overload:** Travelers have to scour dozens of websites to piece together a trip.
*   **Lack of Personalization:** Generic travel guides fail to capture specific "vibes" or aesthetic preferences.
*   **Static Itineraries:** Changing a plan usually requires starting over from scratch.
*   **Text-Heavy Results:** Traditional AI tools output walls of text that are hard to read and reference during a trip.

## 💡 The Solution

This application solves these issues by acting as an intelligent "Agent":
1.  **Structured Output:** Instead of just talking, the AI builds a bespoke itinerary database (Day-by-day breakdown, activities, geo-locations, budgets) and presents it as a beautiful, interactive card.
2.  **Visual Intelligence:** Users can upload images (e.g., a photo of a snowy cabin or a neon-lit street) to define the "vibe." The AI analyzes the image and creates a trip that matches that exact aesthetic.
3.  **Contextual Awareness:** The app maintains a chat history, allowing users to refine plans iteratively (e.g., "Make day 3 more relaxing" or "Find a cheaper hotel").
4.  **Seamless Experience:** Built-in voice recognition and a fluid, responsive UI make the planning process feel like talking to a human expert.

## 🛠️ Tech Stack

### Frontend Core
*   **React 19:** Utilizing the latest React features for efficient state management and component rendering.
*   **Vite:** For lightning-fast development server and optimized build tooling.
*   **TypeScript:** Ensuring type safety across the application, particularly for the complex data structures involved in AI function calling.

### Styling & UI
*   **Tailwind CSS:** For rapid, utility-first styling and responsive design.
*   **Lucide React:** A clean, consistent icon library.
*   **Custom Theming:** Includes a sophisticated dark/light mode with ambient background effects.

### Artificial Intelligence
*   **Google Gemini API (`@google/genai`):**
    *   **Model:** `gemini-2.5-flash` for high-speed, low-latency responses.
    *   **Function Calling:** Used to enforce structured JSON outputs for itineraries (`propose_itinerary` tool).
    *   **Multimodal Input:** Capable of processing both text and image inputs simultaneously.
    *   **Streaming:** Real-time text generation for a responsive conversational feel.

### Data & Persistence
*   **Local Persistence (`lib/localDb.ts`):** A custom local-storage based simulation of a backend database to handle Users, Chat Sessions, and Message History without requiring an external SQL server for the demo.
*   **Supabase (Optional/Adapter):** The codebase includes an adapter structure (`lib/supabase.ts`) ready for scaling to a real backend.

## 📦 Installation & Setup

1.  **Clone the repository**
    ```bash
    git clone <repository-url>
    cd agentic-travel-planner
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Environment Configuration**
    Create a `.env` file in the root directory and add your API key:
    ```env
    API_KEY=your_gemini_api_key_here
    ```

4.  **Run Development Server**
    ```bash
    npm run dev
    ```

## 🔑 Key Features & Usage

*   **Smart Authentication:** 
    *   Includes a robust mock authentication system.
    *   **Guest Mode:** One-click access for testing.
    *   **Admin Dashboard:** Log in with `amar.workdesk@gmail.com` / `Work@123` to view system stats and user metrics.
*   **Interactive Chat:**
    *   **Voice Input:** Click the microphone to speak your travel plans.
    *   **Image Analysis:** Upload a photo to guide the AI's recommendations.
*   **Itinerary Cards:** 
    *   When the AI detects a planning request, it generates a "Card" with a summary, budget estimate, and timeline.
*   **Sidebar History:** 
    *   Automatically saves chat sessions to local storage so you can revisit past trips.

---

**Note:** This project demonstrates a "Client-Side Agent" architecture where complex AI logic is handled directly in the frontend application securely using environment variables.
