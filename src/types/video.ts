export interface Video {
  title: string;
  type: "youtube" | "direct";
  src: string;
  thumbnail?: string;
  category: string;
  class: string;
  topic: string;
}

export interface Curriculum {
  [grade: string]: {
    [subject: string]: string[];
  };
}
