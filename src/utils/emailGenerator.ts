/**
 * Generates a school email address from a student's name
 * Uses first two names only and handles duplicates with incremental numbers
 */
export function generateSchoolEmail(fullName: string, existingEmails: string[] = []): string {
  // Clean and format the name
  const nameParts = fullName.toLowerCase().trim().split(/\s+/);
  
  if (nameParts.length === 0) {
    throw new Error("Invalid name provided");
  }
  
  let baseEmail: string;
  
  if (nameParts.length === 1) {
    // Single name
    baseEmail = nameParts[0];
  } else {
    // Use only first two names, ignore all additional names
    baseEmail = nameParts[0] + nameParts[1];
  }
  
  // Remove any special characters
  baseEmail = baseEmail.replace(/[^a-z0-9]/g, '');
  
  // Check if email already exists
  let email = `${baseEmail}@kpm.com`;
  let counter = 1;
  
  while (existingEmails.includes(email)) {
    // Add incremental number if duplicate (1, 2, 3, etc.)
    email = `${baseEmail}${counter}@kpm.com`;
    counter++;
  }
  
  return email;
}

/**
 * Generates a 4-digit password with leading zeros (0001-9999)
 */
export function generateSecurePassword(): string {
  // Generate a random number between 1 and 9999
  const randomNum = Math.floor(Math.random() * 9999) + 1;
  
  // Convert to 4-digit string with leading zeros
  return randomNum.toString().padStart(4, '0');
}

/**
 * Email template for sending credentials
 */
export function generateCredentialEmail(
  studentName: string,
  personalEmail: string,
  schoolEmail: string,
  password: string
): string {
  return `
Dear ${studentName},

Welcome to Kyengera Parents' School - Mugongo! Your account has been successfully created.

Here are your login credentials for the School Management System:

School Email: ${schoolEmail}
Password: ${password}

Please keep these credentials secure and do not share them with anyone.

To access the portal:
1. Visit the school portal at the class portal
2. Enter your school email and password
3. Complete your profile setup upon first login

For security reasons, we recommend changing your password after your first login.

If you have any questions or need assistance, please contact the school at +256 753 616 792

Best regards,
Kyengera Parents' School - Mugongo Administration
  `.trim();
}