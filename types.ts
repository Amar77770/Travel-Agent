export enum Sender {
  USER = 'user',
  AI = 'ai'
}

export interface Activity {
  time_of_day: string;
  title: string;
  description: string;
  location: string;
}

export interface DayPlan {
  day_number: number;
  theme: string;
  activities: Activity[];
}

export interface Itinerary {
  trip_title: string;
  destination: string;
  duration: string;
  budget_estimate: string;
  vibe: string;
  summary: string;
  days: DayPlan[];
}

export interface Message {
  id: string;
  text: string;
  sender: Sender;
  timestamp: number;
  isStreaming?: boolean;
  image?: string; // Base64 data string
  itinerary?: Itinerary; // Structured data from Function Call
}

export interface ChatSession {
  id: string;
  title: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}