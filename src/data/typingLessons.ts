export interface TypingLesson {
  id: number;
  title: string;
  description: string;
  targetKeys: string[];
  exercises: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  unlockRequirement: {
    accuracy: number;
    wpm: number;
  };
}

export const typingLessons: TypingLesson[] = [
  {
    id: 1,
    title: "Home Row - ASDF JKL;",
    description: "Learn the foundation of touch typing with home row keys",
    targetKeys: ['A', 'S', 'D', 'F', 'J', 'K', 'L', ';'],
    exercises: [
      "asdf jkl;",
      "ff jj dd kk ss ll aa ;;",
      "fj dk sl a;",
      "fjdk sla; fjdk sla;",
      "fads fjkl ;sdf jka;",
      "a sad lad; a flask; a lass",
      "ask a lad; a sad lass asks"
    ],
    difficulty: 'beginner',
    unlockRequirement: { accuracy: 85, wpm: 15 }
  },
  {
    id: 2,
    title: "Top Row - QWERT YUIOP",
    description: "Extend your reach to the top row keys",
    targetKeys: ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    exercises: [
      "qwert yuiop",
      "ff jj rr uu ee ii ww oo qq pp tt yy",
      "quit wrap your trio",
      "query water power",
      "tire quote prayer",
      "red water pours quietly",
      "your pretty prayer quiets workers"
    ],
    difficulty: 'beginner',
    unlockRequirement: { accuracy: 80, wpm: 20 }
  },
  {
    id: 3,
    title: "Bottom Row - ZXCVBNM",
    description: "Master the bottom row for complete alphabet coverage",
    targetKeys: ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
    exercises: [
      "zxcv bnm",
      "ff jj zz xx cc vv bb nn mm",
      "zoom exact civic",
      "brave mixing zone",
      "maximum curve box",
      "brave foxes climb very big mountains",
      "magnificent zebras excel in boxing competitions"
    ],
    difficulty: 'intermediate',
    unlockRequirement: { accuracy: 80, wpm: 25 }
  },
  {
    id: 4,
    title: "Numbers Row - 1234567890",
    description: "Learn to type numbers without looking",
    targetKeys: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
    exercises: [
      "1234567890",
      "11 22 33 44 55 66 77 88 99 00",
      "12 34 56 78 90",
      "the 10 best ways to type",
      "there are 365 days in a year",
      "call me at 555-1234 after 6pm",
      "order 25 items for december 31st celebration"
    ],
    difficulty: 'intermediate',
    unlockRequirement: { accuracy: 75, wpm: 30 }
  },
  {
    id: 5,
    title: "Punctuation Mastery",
    description: "Perfect your punctuation and special characters",
    targetKeys: [',', '.', '/', ';', "'", '[', ']', '-', '='],
    exercises: [
      ",./ ;' []- =",
      "it's time; let's go.",
      "hello, world! how are you?",
      "the [best] way to learn = practice",
      "don't worry; you're doing great!",
      "she said, 'practice makes perfect.'",
      "the quick-thinking student typed accurately."
    ],
    difficulty: 'advanced',
    unlockRequirement: { accuracy: 85, wpm: 35 }
  },
  {
    id: 6,
    title: "Capital Letters Challenge",
    description: "Master uppercase letters with proper shift key usage",
    targetKeys: ['Shift'],
    exercises: [
      "The Quick Brown Fox",
      "Typing Master Game",
      "John Smith lives in New York",
      "Every Student Should Practice Daily",
      "Microsoft Windows Operating System",
      "The United States of America is Beautiful",
      "Amazing Students Always Achieve Academic Excellence Successfully"
    ],
    difficulty: 'advanced',
    unlockRequirement: { accuracy: 80, wpm: 40 }
  },
  {
    id: 7,
    title: "Speed Challenge - Mixed Content",
    description: "Combine everything for maximum typing speed",
    targetKeys: [], // All keys
    exercises: [
      "The quick brown fox jumps over the lazy dog.",
      "Pack my box with five dozen liquor jugs.",
      "How vexingly quick daft zebras jump!",
      "Sphinx of black quartz, judge my vow.",
      "The five boxing wizards jump quickly.",
      "Waltz, bad nymph, for quick jigs vex.",
      "Quick zephyrs blow, vexing daft Jim."
    ],
    difficulty: 'advanced',
    unlockRequirement: { accuracy: 85, wpm: 50 }
  }
];

export function getUnlockedLessons(userProgress: { [lessonId: number]: { accuracy: number; wpm: number; completed: boolean } }): number[] {
  const unlockedLessons = [1]; // First lesson is always unlocked
  
  typingLessons.forEach((lesson, index) => {
    if (index === 0) return; // Skip first lesson
    
    const previousLesson = typingLessons[index - 1];
    const previousProgress = userProgress[previousLesson.id];
    
    if (previousProgress?.completed && 
        previousProgress.accuracy >= previousLesson.unlockRequirement.accuracy &&
        previousProgress.wpm >= previousLesson.unlockRequirement.wpm) {
      unlockedLessons.push(lesson.id);
    }
  });
  
  return unlockedLessons;
}