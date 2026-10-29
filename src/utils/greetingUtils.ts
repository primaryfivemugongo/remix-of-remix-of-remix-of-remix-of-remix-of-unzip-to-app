/**
 * Utility functions for custom greeting logic
 */

/**
 * Properly capitalizes a name (first letter uppercase, rest lowercase)
 * @param name - The name to capitalize
 * @returns The properly capitalized name
 */
function capitalizeName(name: string): string {
  if (!name) return '';
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}

/**
 * Formats the greeting name based on user role and name structure
 * @param fullName - The user's full name
 * @param userRole - The user's role ('student', 'teacher', 'admin')
 * @returns The formatted name for greeting
 */
export function formatGreetingName(fullName: string, userRole: 'student' | 'teacher' | 'admin'): string {
  if (!fullName) return '';
  
  const nameParts = fullName.trim().split(/\s+/);
  
  switch (userRole) {
    case 'student':
      if (nameParts.length === 2) {
        // Two names: use last name (e.g., "NASSUUNA WILDER" → "Wilder")
        return capitalizeName(nameParts[1]);
      } else if (nameParts.length >= 3) {
        // Three or more names: use middle name (e.g., "NAKAFEERO CHLOE KATRINAH" → "Chloe")
        return capitalizeName(nameParts[1]);
      } else {
        // Single name: use as is
        return capitalizeName(nameParts[0]);
      }
      
    case 'teacher':
      if (nameParts.length >= 3) {
        // Three or more names: use "Tr." + middle name (e.g., "Mutumba Jesse Paul" → "Tr. Jesse")
        return `Tr. ${capitalizeName(nameParts[1])}`;
      } else if (nameParts.length === 2) {
        // Two names: use "Tr." + last name
        return `Tr. ${capitalizeName(nameParts[1])}`;
      } else {
        // Single name: use "Tr." + name
        return `Tr. ${capitalizeName(nameParts[0])}`;
      }
      
    case 'admin':
      // For admin, properly capitalize the full name
      return nameParts.map(capitalizeName).join(' ');
      
    default:
      return nameParts.map(capitalizeName).join(' ');
  }
}

/**
 * Gets time-based greeting
 * @returns The appropriate greeting based on current time
 */
export function getTimeBasedGreeting(): string {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 12) {
    return "Good morning";
  } else if (hour >= 12 && hour < 17) {
    return "Good afternoon";
  } else {
    return "Good evening";
  }
}
