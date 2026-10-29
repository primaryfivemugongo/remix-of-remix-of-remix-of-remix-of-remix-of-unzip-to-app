import { cn } from "@/lib/utils";

interface VirtualKeyboardProps {
  highlightedKey?: string;
  pressedKeys: Set<string>;
  showFingerGuide?: boolean;
}

const keyLayout = [
  ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'Backspace'],
  ['Tab', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[', ']', '\\'],
  ['CapsLock', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', "'", 'Enter'],
  ['Shift', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/', 'Shift'],
  ['Ctrl', 'Alt', 'Space', 'Alt', 'Ctrl']
];

const homeRowKeys = ['A', 'S', 'D', 'F', 'J', 'K', 'L', ';'];

const fingerColors = {
  'A': 'bg-pink-200 dark:bg-pink-900/50 border-pink-300',
  'S': 'bg-red-200 dark:bg-red-900/50 border-red-300',
  'D': 'bg-orange-200 dark:bg-orange-900/50 border-orange-300',
  'F': 'bg-yellow-200 dark:bg-yellow-900/50 border-yellow-300',
  'J': 'bg-yellow-200 dark:bg-yellow-900/50 border-yellow-300',
  'K': 'bg-orange-200 dark:bg-orange-900/50 border-orange-300',
  'L': 'bg-red-200 dark:bg-red-900/50 border-red-300',
  ';': 'bg-pink-200 dark:bg-pink-900/50 border-pink-300',
  // Extended mappings for other rows
  'Q': 'bg-pink-200 dark:bg-pink-900/50 border-pink-300',
  'W': 'bg-red-200 dark:bg-red-900/50 border-red-300',
  'E': 'bg-orange-200 dark:bg-orange-900/50 border-orange-300',
  'R': 'bg-yellow-200 dark:bg-yellow-900/50 border-yellow-300',
  'T': 'bg-yellow-200 dark:bg-yellow-900/50 border-yellow-300',
  'Y': 'bg-yellow-200 dark:bg-yellow-900/50 border-yellow-300',
  'U': 'bg-yellow-200 dark:bg-yellow-900/50 border-yellow-300',
  'I': 'bg-orange-200 dark:bg-orange-900/50 border-orange-300',
  'O': 'bg-red-200 dark:bg-red-900/50 border-red-300',
  'P': 'bg-pink-200 dark:bg-pink-900/50 border-pink-300',
  'Z': 'bg-pink-200 dark:bg-pink-900/50 border-pink-300',
  'X': 'bg-red-200 dark:bg-red-900/50 border-red-300',
  'C': 'bg-orange-200 dark:bg-orange-900/50 border-orange-300',
  'V': 'bg-yellow-200 dark:bg-yellow-900/50 border-yellow-300',
  'B': 'bg-yellow-200 dark:bg-yellow-900/50 border-yellow-300',
  'N': 'bg-yellow-200 dark:bg-yellow-900/50 border-yellow-300',
  'M': 'bg-yellow-200 dark:bg-yellow-900/50 border-yellow-300',
  ',': 'bg-orange-200 dark:bg-orange-900/50 border-orange-300',
  '.': 'bg-red-200 dark:bg-red-900/50 border-red-300',
  '/': 'bg-pink-200 dark:bg-pink-900/50 border-pink-300',
};

export function VirtualKeyboard({ highlightedKey, pressedKeys, showFingerGuide = true }: VirtualKeyboardProps) {
  const getKeyClass = (key: string) => {
    const baseClass = "flex items-center justify-center border-2 rounded-md transition-all duration-150 font-mono text-sm font-semibold min-h-[2.5rem]";
    
    let sizeClass = "flex-1 min-w-[2.5rem]";
    if (key === 'Backspace') sizeClass = "w-20";
    else if (key === 'Tab') sizeClass = "w-16";
    else if (key === 'CapsLock') sizeClass = "w-20";
    else if (key === 'Enter') sizeClass = "w-20";
    else if (key === 'Shift') sizeClass = "w-24";
    else if (key === 'Space') sizeClass = "flex-[6]";
    else if (['Ctrl', 'Alt'].includes(key)) sizeClass = "w-16";

    let colorClass = "bg-secondary/50 border-border hover:bg-secondary";
    
    if (showFingerGuide && fingerColors[key.toUpperCase()]) {
      colorClass = fingerColors[key.toUpperCase()];
    }
    
    if (homeRowKeys.includes(key.toUpperCase())) {
      colorClass += " ring-2 ring-primary/30";
    }
    
    if (highlightedKey?.toLowerCase() === key.toLowerCase()) {
      colorClass = "bg-primary text-primary-foreground border-primary animate-pulse ring-4 ring-primary/30";
    }
    
    if (pressedKeys.has(key.toLowerCase())) {
      colorClass = "bg-green-500 text-white border-green-400 scale-95";
    }

    return cn(baseClass, sizeClass, colorClass);
  };

  return (
    <div className="bg-card border rounded-lg p-4 space-y-2">
      <div className="text-center mb-4">
        <h3 className="font-semibold text-sm text-muted-foreground">Virtual Keyboard</h3>
        {showFingerGuide && (
          <p className="text-xs text-muted-foreground mt-1">Colors show finger positions</p>
        )}
      </div>
      
      {keyLayout.map((row, rowIndex) => (
        <div key={rowIndex} className="flex gap-1 justify-center">
          {row.map((key) => (
            <div key={key} className={getKeyClass(key)}>
              {key === 'Space' ? '' : key}
            </div>
          ))}
        </div>
      ))}
      
      {showFingerGuide && (
        <div className="mt-4 text-xs text-center">
          <div className="flex justify-center gap-4 flex-wrap">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-pink-200 dark:bg-pink-900/50 border border-pink-300 rounded"></div>
              <span>Pinky</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-200 dark:bg-red-900/50 border border-red-300 rounded"></div>
              <span>Ring</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-orange-200 dark:bg-orange-900/50 border border-orange-300 rounded"></div>
              <span>Middle</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-yellow-200 dark:bg-yellow-900/50 border border-yellow-300 rounded"></div>
              <span>Index</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}