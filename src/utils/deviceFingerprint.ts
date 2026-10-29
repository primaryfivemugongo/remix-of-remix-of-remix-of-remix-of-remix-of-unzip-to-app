// Advanced device fingerprinting utilities

// Canvas Fingerprint
export const getCanvasFingerprint = (): string => {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return 'unavailable';
    
    canvas.width = 200;
    canvas.height = 50;
    
    // Draw text with specific styling
    ctx.textBaseline = 'top';
    ctx.font = '14px "Arial"';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('Vote Fingerprint 🗳️', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('Vote Fingerprint 🗳️', 4, 17);
    
    // Get data URL and hash it
    const dataURL = canvas.toDataURL();
    return hashString(dataURL);
  } catch (e) {
    return 'error';
  }
};

// WebGL Fingerprint
export const getWebGLFingerprint = (): string => {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext;
    if (!gl) return 'unavailable';
    
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    const vendor = debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : 'unknown';
    const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'unknown';
    
    return hashString(`${vendor}|${renderer}`);
  } catch (e) {
    return 'error';
  }
};

// Detect installed fonts
export const getInstalledFonts = (): string[] => {
  const baseFonts = ['monospace', 'sans-serif', 'serif'];
  const testFonts = [
    'Arial', 'Verdana', 'Courier New', 'Georgia', 'Times New Roman',
    'Comic Sans MS', 'Impact', 'Trebuchet MS', 'Arial Black', 'Tahoma',
    'Palatino', 'Garamond', 'Bookman', 'Helvetica', 'Century Gothic'
  ];
  
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return [];
  
  const detected: string[] = [];
  const testString = 'mmmmmmmmmmlli';
  const testSize = '72px';
  
  // Get baseline measurements
  const baseWidths: { [key: string]: number } = {};
  baseFonts.forEach(baseFont => {
    ctx.font = `${testSize} ${baseFont}`;
    baseWidths[baseFont] = ctx.measureText(testString).width;
  });
  
  // Test each font
  testFonts.forEach(font => {
    let detected_flag = false;
    baseFonts.forEach(baseFont => {
      ctx.font = `${testSize} '${font}', ${baseFont}`;
      const width = ctx.measureText(testString).width;
      if (width !== baseWidths[baseFont]) {
        detected_flag = true;
      }
    });
    if (detected_flag) {
      detected.push(font);
    }
  });
  
  return detected;
};

// Get battery information
export const getBatteryInfo = async (): Promise<{
  level: number | null;
  charging: boolean | null;
}> => {
  try {
    // @ts-ignore - Battery API
    if ('getBattery' in navigator) {
      // @ts-ignore
      const battery = await navigator.getBattery();
      return {
        level: battery.level * 100,
        charging: battery.charging
      };
    }
  } catch (e) {
    console.log('Battery API not available');
  }
  return { level: null, charging: null };
};

// Mouse and keyboard pattern tracking
export class BehaviorTracker {
  private mouseMovements: Array<{ x: number; y: number; timestamp: number }> = [];
  private keyPresses: Array<{ key: string; timestamp: number }> = [];
  private clickPatterns: Array<{ x: number; y: number; timestamp: number }> = [];
  
  startTracking() {
    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('keydown', this.handleKeyPress);
    document.addEventListener('click', this.handleClick);
  }
  
  stopTracking() {
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('keydown', this.handleKeyPress);
    document.removeEventListener('click', this.handleClick);
  }
  
  private handleMouseMove = (e: MouseEvent) => {
    this.mouseMovements.push({
      x: e.clientX,
      y: e.clientY,
      timestamp: Date.now()
    });
    
    // Keep only last 100 movements to avoid memory issues
    if (this.mouseMovements.length > 100) {
      this.mouseMovements.shift();
    }
  };
  
  private handleKeyPress = (e: KeyboardEvent) => {
    // Don't log actual keys for security, just timing
    this.keyPresses.push({
      key: 'key', // Anonymized
      timestamp: Date.now()
    });
    
    if (this.keyPresses.length > 50) {
      this.keyPresses.shift();
    }
  };
  
  private handleClick = (e: MouseEvent) => {
    this.clickPatterns.push({
      x: e.clientX,
      y: e.clientY,
      timestamp: Date.now()
    });
    
    if (this.clickPatterns.length > 50) {
      this.clickPatterns.shift();
    }
  };
  
  getAnalytics() {
    const mouseSpeed = this.calculateMouseSpeed();
    const typingSpeed = this.calculateTypingSpeed();
    const clickFrequency = this.calculateClickFrequency();
    
    return {
      mouse_movement_count: this.mouseMovements.length,
      average_mouse_speed: mouseSpeed,
      key_press_count: this.keyPresses.length,
      average_typing_speed: typingSpeed,
      click_count: this.clickPatterns.length,
      click_frequency: clickFrequency,
      behavior_signature: hashString(JSON.stringify({
        mouseSpeed,
        typingSpeed,
        clickFrequency
      }))
    };
  }
  
  private calculateMouseSpeed(): number {
    if (this.mouseMovements.length < 2) return 0;
    
    let totalSpeed = 0;
    for (let i = 1; i < this.mouseMovements.length; i++) {
      const prev = this.mouseMovements[i - 1];
      const curr = this.mouseMovements[i];
      const distance = Math.sqrt(
        Math.pow(curr.x - prev.x, 2) + Math.pow(curr.y - prev.y, 2)
      );
      const time = (curr.timestamp - prev.timestamp) / 1000; // seconds
      if (time > 0) {
        totalSpeed += distance / time;
      }
    }
    return totalSpeed / (this.mouseMovements.length - 1);
  }
  
  private calculateTypingSpeed(): number {
    if (this.keyPresses.length < 2) return 0;
    
    const timespan = this.keyPresses[this.keyPresses.length - 1].timestamp - 
                     this.keyPresses[0].timestamp;
    return timespan > 0 ? (this.keyPresses.length / timespan) * 1000 : 0;
  }
  
  private calculateClickFrequency(): number {
    if (this.clickPatterns.length < 2) return 0;
    
    const timespan = this.clickPatterns[this.clickPatterns.length - 1].timestamp - 
                     this.clickPatterns[0].timestamp;
    return timespan > 0 ? (this.clickPatterns.length / timespan) * 1000 : 0;
  }
}

// Simple hash function for fingerprinting
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}
