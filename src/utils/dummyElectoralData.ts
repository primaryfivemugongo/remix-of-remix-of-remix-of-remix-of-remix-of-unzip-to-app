// Utility to populate dummy electoral data for testing

export const populateDummyElectoralData = () => {
  // Clear existing dummy data first
  clearDummyElectoralData();
  
  const dummyApplications: any[] = [];

  // Save each application to localStorage
  dummyApplications.forEach(app => {
    const key = `electoral_application_${app.id}`;
    localStorage.setItem(key, JSON.stringify(app));
  });

  console.log(`Added ${dummyApplications.length} dummy electoral applications to localStorage`);
  
  return dummyApplications.length;
};

export const clearDummyElectoralData = () => {
  // Remove all dummy electoral applications
  const keysToRemove: string[] = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('electoral_application_dummy_')) {
      keysToRemove.push(key);
    }
  }
  
  keysToRemove.forEach(key => localStorage.removeItem(key));
  
  console.log(`Removed ${keysToRemove.length} dummy electoral applications from localStorage`);
  
  return keysToRemove.length;
};

export const checkDummyDataExists = () => {
  let count = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('electoral_application_dummy_')) {
      count++;
    }
  }
  return count;
};
