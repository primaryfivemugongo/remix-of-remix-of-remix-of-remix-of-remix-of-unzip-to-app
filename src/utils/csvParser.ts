export interface StudentCSVRow {
  id: string;
  name: string;
  class_id: string;
  stream_id: string;
  photo_url: string;
  email: string;
  personal_email?: string;
  created_at: string;
  is_verified: boolean;
  default_password?: string;
}

export const parseStudentCSV = (csvText: string): StudentCSVRow[] => {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',');
  
  return lines.slice(1).map(line => {
    const values = line.split(',');
    const student: any = {};
    
    headers.forEach((header, index) => {
      student[header.trim()] = values[index]?.trim() || '';
    });
    
    return student as StudentCSVRow;
  });
};
