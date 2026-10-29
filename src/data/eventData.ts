import { Video } from "@/types/video";

export interface EventVideo extends Omit<Video, 'class' | 'category' | 'topic'> {
  year: string;
  category: string;
}

export const eventCategories = {
  "Performances": ["Music", "Dance", "Songs", "Theatre"],
  "Celebrations": ["Birthdays", "Anniversaries", "Awards"],
  "Educational": ["Lessons", "Debates", "Science Fair"],
  "School Events": ["Sports Day", "DEAR Day", "Ceremonies", "Assemblies"],
  "Interviews": ["10 Questions to My Teacher"],
  "Excursions": ["Field Trips", "Tours", "Visits"],
  "Music": ["Songs", "Choir", "Productions"],
  "Competitions": ["Spelling Bee", "Debates", "Contests"],
};

export const eventData: EventVideo[] = [];
