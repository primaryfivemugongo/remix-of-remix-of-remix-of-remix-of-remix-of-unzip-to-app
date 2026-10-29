export interface PasswordStrength {
  score: number; // 0-4 (weak, medium, strong)
  feedback: string[];
  level: 'weak' | 'medium' | 'strong';
  color: string; // For UI feedback
}

export function checkPasswordStrength(password: string): PasswordStrength {
  const feedback: string[] = [];
  let score = 0;
  
  // Check minimum length
  if (password.length >= 8) {
    score++;
  } else {
    feedback.push("Use at least 8 characters");
  }
  
  // Check for uppercase letters
  if (/[A-Z]/.test(password)) {
    score++;
  } else {
    feedback.push("Include at least one uppercase letter");
  }
  
  // Check for numbers
  if (/[0-9]/.test(password)) {
    score++;
  } else {
    feedback.push("Include at least one number");
  }
  
  // Check for special characters
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    score++;
  } else {
    feedback.push("Include at least one special character (!@#$%^&*)");
  }
  
  // Determine strength level
  let level: 'weak' | 'medium' | 'strong';
  let color: string;
  
  if (score <= 1) {
    level = 'weak';
    color = 'hsl(var(--destructive))';
  } else if (score <= 2) {
    level = 'medium';
    color = 'hsl(var(--warning))';
  } else {
    level = 'strong';
    color = 'hsl(var(--success))';
  }
  
  // Provide encouraging feedback for strong passwords
  if (score >= 4) {
    feedback.length = 0;
    feedback.push("Excellent password strength!");
  }
  
  return {
    score,
    feedback,
    level,
    color
  };
}