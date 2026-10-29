// Utility functions for managing electoral applications in localStorage

export interface LocalElectoralApplication {
  id: string;
  student_name: string;
  student_email: string;
  student_photo: string | null;
  position: string;
  class_name: string;
  stream_name: string;
  sex?: string | null;
  age?: number | null;
  class_teacher_name?: string | null;
  class_teacher_tel?: string | null;
  parent_name?: string | null;
  parent_tel?: string | null;
  experience: string | null;
  qualifications: string | null;
  why_apply: string | null;
  status: 'pending' | 'confirmed' | 'rejected';
  created_at: string;
}

/**
 * Get all manual applications from localStorage (not dummy data)
 */
export const getManualApplications = (): LocalElectoralApplication[] => {
  const manualApplications: LocalElectoralApplication[] = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('electoral_application_manual_')) {
      try {
        const appData = JSON.parse(localStorage.getItem(key) || '{}');
        manualApplications.push({
          ...appData,
          status: (appData.status || 'pending') as 'pending' | 'confirmed' | 'rejected'
        });
      } catch (e) {
        console.error('Error parsing manual application:', e);
      }
    }
  }
  
  return manualApplications;
};

/**
 * Get a single manual application by ID
 */
export const getManualApplication = (applicationId: string): LocalElectoralApplication | null => {
  if (!applicationId.startsWith('manual_')) return null;
  
  const storageKey = `electoral_application_${applicationId}`;
  const appData = localStorage.getItem(storageKey);
  
  if (!appData) return null;
  
  try {
    return JSON.parse(appData);
  } catch (e) {
    console.error('Error parsing manual application:', e);
    return null;
  }
};

/**
 * Update a manual application in localStorage
 */
export const updateManualApplication = (applicationId: string, updates: Partial<LocalElectoralApplication>): boolean => {
  if (!applicationId.startsWith('manual_')) return false;
  
  const storageKey = `electoral_application_${applicationId}`;
  const appData = localStorage.getItem(storageKey);
  
  if (!appData) return false;
  
  try {
    const app = JSON.parse(appData);
    const updatedApp = { ...app, ...updates };
    localStorage.setItem(storageKey, JSON.stringify(updatedApp));
    return true;
  } catch (e) {
    console.error('Error updating manual application:', e);
    return false;
  }
};

/**
 * Delete a manual application from localStorage
 */
export const deleteManualApplication = (applicationId: string): boolean => {
  if (!applicationId.startsWith('manual_')) return false;
  
  const storageKey = `electoral_application_${applicationId}`;
  localStorage.removeItem(storageKey);
  return true;
};

/**
 * Save a new manual application to localStorage
 */
export const saveManualApplication = (application: LocalElectoralApplication): boolean => {
  if (!application.id.startsWith('manual_')) {
    console.error('Manual applications must have IDs starting with "manual_"');
    return false;
  }
  
  try {
    const storageKey = `electoral_application_${application.id}`;
    localStorage.setItem(storageKey, JSON.stringify(application));
    return true;
  } catch (e) {
    console.error('Error saving manual application:', e);
    return false;
  }
};

/**
 * Count manual applications in localStorage
 */
export const countManualApplications = (): number => {
  let count = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('electoral_application_manual_')) {
      count++;
    }
  }
  return count;
};

/**
 * Clear all manual applications from localStorage
 */
export const clearAllManualApplications = (): number => {
  const keysToRemove: string[] = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('electoral_application_manual_')) {
      keysToRemove.push(key);
    }
  }
  
  keysToRemove.forEach(key => localStorage.removeItem(key));
  
  console.log(`Removed ${keysToRemove.length} manual electoral applications from localStorage`);
  
  return keysToRemove.length;
};
