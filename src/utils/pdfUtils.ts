import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

interface StudentAttendanceData {
  name: string;
  email: string;
  stream: string;
  status: 'present' | 'absent' | 'not-marked';
  timeMarked?: string;
  photoUrl?: string;
}

// Function to load image as base64
const loadImageAsBase64 = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!url) {
      resolve('');
      return;
    }
    
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      } else {
        resolve('');
      }
    };
    img.onerror = () => resolve('');
    img.src = url;
  });
};

export const generateAttendancePDF = async (
  students: StudentAttendanceData[],
  title: string = 'Student Attendance Report',
  onProgress?: (message: string) => void
) => {
  onProgress?.('Generating PDF...');
  
  const doc = new jsPDF('portrait', 'mm', 'a4');
  
  // Add school header image
  const headerImg = new Image();
  headerImg.src = '/header.png';
  
  // Add header image at the top
  const imgWidth = 190;
  const imgHeight = 30;
  doc.addImage(headerImg, 'PNG', 10, 10, imgWidth, imgHeight);
  
  // Add title below header
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text(title, doc.internal.pageSize.getWidth() / 2, 48, { align: 'center' });
  
  // Add date
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(
    `Generated: ${format(new Date(), 'MMM dd, yyyy HH:mm')}`,
    doc.internal.pageSize.getWidth() / 2,
    55,
    { align: 'center' }
  );
  
  // Add summary
  const presentCount = students.filter(s => s.status === 'present').length;
  const absentCount = students.filter(s => s.status === 'absent').length;
  const notMarkedCount = students.filter(s => s.status === 'not-marked').length;
  const totalCount = students.length;
  const attendanceRate = totalCount > 0 ? ((presentCount / totalCount) * 100).toFixed(1) : '0';
  
  doc.setFontSize(9);
  doc.text(`Total: ${totalCount} | Present: ${presentCount} | Absent: ${absentCount} | Not Marked: ${notMarkedCount} | Rate: ${attendanceRate}%`, 
    doc.internal.pageSize.getWidth() / 2, 61, { align: 'center' });
  
  // Prepare table data with numbering
  const tableData = students.map((student, index) => {
    return [
      (index + 1).toString(),
      student.name,
      student.email,
      student.stream,
      student.status === 'present' ? 'Present' : 
      student.status === 'absent' ? 'Absent' : 'Not Marked'
    ];
  });
  
  // Generate table with all borders
  autoTable(doc, {
    startY: 68,
    head: [['No.', 'Name', 'Email', 'Class', 'Status']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [0, 0, 0],
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: 'bold',
      halign: 'center',
      lineWidth: 0.5,
      lineColor: [0, 0, 0],
      minCellHeight: 12
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [0, 0, 0],
      lineWidth: 0.5,
      lineColor: [0, 0, 0],
      minCellHeight: 10
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    },
    columnStyles: {
      0: { cellWidth: 15, halign: 'center' },
      1: { cellWidth: 50, halign: 'left' },
      2: { cellWidth: 55, halign: 'left' },
      3: { cellWidth: 30, halign: 'center' },
      4: { cellWidth: 30, halign: 'center' }
    },
    didDrawCell: function(data) {
      // Color code the status column
      if (data.column.index === 4 && data.section === 'body') {
        const status = data.cell.text[0];
        if (status === 'Absent') {
          data.cell.styles.textColor = [255, 0, 0];
        } else if (status === 'Present') {
          data.cell.styles.textColor = [0, 128, 0];
        } else {
          data.cell.styles.textColor = [128, 128, 128];
        }
      }
    },
    margin: { left: 15, right: 15 }
  });
  
  // Add footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }
  
  return doc;
};

interface CandidateData {
  name: string;
  email: string;
  class: string;
  stream: string;
  position: string;
  parentContact: string;
  status: string;
}

export const generateCandidatesListPDF = async (
  candidates: CandidateData[],
  title: string = 'Electoral Candidates List'
) => {
  const doc = new jsPDF('portrait', 'mm', 'a4');
  
  // Add school header image
  const headerImg = new Image();
  headerImg.src = '/header.png';
  
  // Add header image at the top
  const imgWidth = 190;
  const imgHeight = 30;
  doc.addImage(headerImg, 'PNG', 10, 10, imgWidth, imgHeight);
  
  // Add title below header
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text(title, doc.internal.pageSize.getWidth() / 2, 48, { align: 'center' });
  
  // Add date
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(
    `Generated: ${format(new Date(), 'MMM dd, yyyy HH:mm')}`,
    doc.internal.pageSize.getWidth() / 2,
    55,
    { align: 'center' }
  );
  
  // Add summary
  const totalCount = candidates.length;
  const approvedCount = candidates.filter(c => c.status === 'Approved').length;
  const pendingCount = candidates.filter(c => c.status === 'Pending').length;
  const rejectedCount = candidates.filter(c => c.status === 'Rejected').length;
  
  doc.setFontSize(9);
  doc.text(`Total: ${totalCount} | Approved: ${approvedCount} | Pending: ${pendingCount} | Rejected: ${rejectedCount}`, 
    doc.internal.pageSize.getWidth() / 2, 61, { align: 'center' });
  
  // Helper function to format position
  const formatPosition = (position: string) => {
    return position.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  // Prepare table data with numbering
  const tableData = candidates.map((candidate, index) => {
    return [
      (index + 1).toString(),
      candidate.name,
      `${candidate.class} ${candidate.stream}`,
      formatPosition(candidate.position),
      candidate.parentContact
    ];
  });
  
  // Generate table with all borders
  autoTable(doc, {
    startY: 68,
    head: [['No.', 'Name', 'Class', 'Position', 'Parent Contact']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [0, 0, 0],
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: 'bold',
      halign: 'center',
      lineWidth: 0.5,
      lineColor: [0, 0, 0],
      minCellHeight: 12
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [0, 0, 0],
      lineWidth: 0.5,
      lineColor: [0, 0, 0],
      minCellHeight: 10
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    },
    columnStyles: {
      0: { cellWidth: 15, halign: 'center' },
      1: { cellWidth: 50, halign: 'left' },
      2: { cellWidth: 30, halign: 'center' },
      3: { cellWidth: 55, halign: 'left' },
      4: { cellWidth: 35, halign: 'center' }
    },
    margin: { left: 10, right: 10 }
  });
  
  // Add footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }
  
  return doc;
};

interface BallotCandidate {
  id: string;
  name: string;
  class: string;
  stream: string;
  photo?: string | null;
}

interface BallotPosition {
  title: string;
  candidates: BallotCandidate[];
}

export const generateBallotPDF = async (
  positions: BallotPosition[],
  title: string = 'Official Ballot Paper',
  ballotsPerPage: number = 3
) => {
  const doc = new jsPDF('portrait', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Load school logo
  const schoolLogo = await loadImageAsBase64('/school-logo.png');
  
  // Always use 3 ballots per page (horizontal strips)
  const h = pageHeight / 3;
  const w = pageWidth;
  const ballotConfigs: Array<{x: number, y: number, width: number, height: number}> = [
    { x: 0, y: 0, width: w, height: h },
    { x: 0, y: h, width: w, height: h },
    { x: 0, y: h * 2, width: w, height: h }
  ];
  
  // Helper function to draw a single ballot
  const drawBallot = async (
    config: {x: number, y: number, width: number, height: number},
    position: BallotPosition,
    candidatePhotos: Map<string, string>
  ) => {
    const margin = 5;
    const contentWidth = config.width - (margin * 2);
    let yPos = config.y + margin;
    
    // Scale fonts based on ballot size
    const scaleFactor = config.width / pageWidth;
    const titleFontSize = Math.max(8, 12 * scaleFactor);
    const headerFontSize = Math.max(6, 8 * scaleFactor);
    const nameFontSize = Math.max(7, 9 * scaleFactor);
    const detailFontSize = Math.max(6, 7 * scaleFactor);
    
    // Add school logo if available
    if (schoolLogo) {
      const logoSize = 8;
      const logoX = config.x + margin;
      doc.addImage(schoolLogo, 'PNG', logoX, yPos, logoSize, logoSize);
      
      // Add school name next to logo
      doc.setFontSize(headerFontSize);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text("Kyengera Parents' School - Mugongo", logoX + logoSize + 2, yPos + 3, { maxWidth: contentWidth - logoSize - 2 });
      doc.setFontSize(detailFontSize);
      doc.setFont('helvetica', 'normal');
      doc.text('Action Not Words', logoX + logoSize + 2, yPos + 6);
      
      // Add "Ballot Paper" in the opposite corner
      doc.setFontSize(headerFontSize);
      doc.setFont('helvetica', 'bold');
      doc.text('Ballot Paper', config.x + config.width - margin, yPos + 4, { align: 'right' });
      
      yPos += logoSize + 2;
    }
    
    // Title
    doc.setFontSize(titleFontSize);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    const titleText = position.title.toUpperCase();
    doc.text(titleText, config.x + config.width / 2, yPos + 5, { align: 'center', maxWidth: contentWidth });
    yPos += titleFontSize * 0.5;
    
    // Instructions
    doc.setFontSize(detailFontSize);
    doc.setFont('helvetica', 'normal');
    doc.text('Tick the box beside the candidate of your choice with a tick ✓', config.x + config.width / 2, yPos + 3, { align: 'center' });
    yPos += 6;
    
    // Table setup
    const col1Width = contentWidth * 0.45; // Name
    const col2Width = contentWidth * 0.30; // Photo
    const col3Width = contentWidth * 0.25; // Mark
    
    // Header row
    doc.setFillColor(44, 62, 80);
    doc.rect(config.x + margin, yPos, col1Width, 6, 'F');
    doc.rect(config.x + margin + col1Width, yPos, col2Width, 6, 'F');
    doc.rect(config.x + margin + col1Width + col2Width, yPos, col3Width, 6, 'F');
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(headerFontSize);
    doc.setTextColor(255, 255, 255);
    doc.text('NAME', config.x + margin + 1, yPos + 4);
    doc.text('PHOTO', config.x + margin + col1Width + col2Width / 2, yPos + 4, { align: 'center' });
    doc.text('MARK', config.x + margin + col1Width + col2Width + col3Width / 2, yPos + 4, { align: 'center' });
    
    yPos += 6;
    
    // Candidate rows
    const rowHeight = Math.min(18, (config.height - yPos + config.y - 10) / position.candidates.length);
    doc.setTextColor(0, 0, 0);
    
    for (const candidate of position.candidates) {
      // Row borders
      doc.setDrawColor(44, 62, 80);
      doc.setLineWidth(0.3);
      doc.rect(config.x + margin, yPos, col1Width, rowHeight);
      doc.rect(config.x + margin + col1Width, yPos, col2Width, rowHeight);
      doc.rect(config.x + margin + col1Width + col2Width, yPos, col3Width, rowHeight);
      
      // Candidate name
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(nameFontSize);
      const nameY = yPos + rowHeight * 0.35;
      doc.text(candidate.name, config.x + margin + 1, nameY, { maxWidth: col1Width - 2 });
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(detailFontSize);
      doc.text(`${candidate.class}-${candidate.stream}`, config.x + margin + 1, nameY + 3, { maxWidth: col1Width - 2 });
      
      // Photo
      const photoSize = Math.min(14, rowHeight - 2);
      const photoX = config.x + margin + col1Width + (col2Width - photoSize) / 2;
      const photoY = yPos + (rowHeight - photoSize) / 2;
      
      const photoData = candidatePhotos.get(candidate.id);
      if (photoData) {
        try {
          // Add photo as image
          doc.addImage(photoData, 'JPEG', photoX, photoY, photoSize, photoSize);
        } catch (err) {
          console.error('Error adding photo to PDF:', err);
          // Fallback to initials if image fails
          const initials = candidate.name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
          
          doc.setFillColor(102, 126, 234);
          doc.circle(photoX + photoSize / 2, photoY + photoSize / 2, photoSize / 2, 'F');
          doc.setTextColor(255, 255, 255);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(Math.max(7, photoSize / 2));
          doc.text(initials, photoX + photoSize / 2, photoY + photoSize / 2 + 1, { align: 'center' });
          doc.setTextColor(0, 0, 0);
        }
      } else {
        // No photo available, show initials
        const initials = candidate.name
          .split(' ')
          .map(n => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2);
        
        doc.setFillColor(102, 126, 234);
        doc.circle(photoX + photoSize / 2, photoY + photoSize / 2, photoSize / 2, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(Math.max(7, photoSize / 2));
        doc.text(initials, photoX + photoSize / 2, photoY + photoSize / 2 + 1, { align: 'center' });
        doc.setTextColor(0, 0, 0);
      }
      
      // Mark box
      const boxSize = Math.min(10, rowHeight - 4);
      const boxX = config.x + margin + col1Width + col2Width + (col3Width - boxSize) / 2;
      const boxY = yPos + (rowHeight - boxSize) / 2;
      
      doc.setDrawColor(44, 62, 80);
      doc.setLineWidth(0.5);
      doc.rect(boxX, boxY, boxSize, boxSize);
      
      yPos += rowHeight;
    }
    
    // Outer border
    doc.setLineWidth(1);
    doc.setDrawColor(44, 62, 80);
    doc.rect(config.x + margin, config.y + margin, contentWidth, yPos - config.y - margin);
    
    // Footer for this ballot
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    const footerY = config.y + config.height - 3;
    doc.text('Kyengera Mugongo · +256 704 281240', config.x + margin, footerY);
  };
  
  // Load all candidate photos first
  const candidatePhotos = new Map<string, string>();
  for (const position of positions) {
    for (const candidate of position.candidates) {
      if (candidate.photo) {
        try {
          const photoBase64 = await loadImageAsBase64(candidate.photo);
          if (photoBase64) {
            candidatePhotos.set(candidate.id, photoBase64);
          }
        } catch (err) {
          console.error(`Failed to load photo for ${candidate.name}:`, err);
        }
      }
    }
  }
  
  // Generate ballots - one page per position with 3 identical ballots
  for (let posIdx = 0; posIdx < positions.length; posIdx++) {
    // Add new page for each position (except first)
    if (posIdx > 0) {
      doc.addPage();
    }
    
    // Draw 3 identical ballots for this position
    for (let ballotNum = 0; ballotNum < 3; ballotNum++) {
      await drawBallot(ballotConfigs[ballotNum], positions[posIdx], candidatePhotos);
      
      // Add dotted cutting line between ballots (not after the last one)
      if (ballotNum < 2) {
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(1.5);
        const lineY = ballotConfigs[ballotNum].y + ballotConfigs[ballotNum].height;
        // Draw dotted line manually
        const dashLength = 3;
        const gapLength = 2;
        for (let x = 0; x < pageWidth; x += dashLength + gapLength) {
          doc.line(x, lineY, Math.min(x + dashLength, pageWidth), lineY);
        }
      }
    }
  }
  
  return doc;
};

interface TeacherData {
  name: string;
  contactNumber?: number;
  email: string;
  default_password?: string;
}

export const generateTeachersListPDF = async (
  teachers: TeacherData[],
  title: string = 'STAFF DETAILS'
) => {
  const doc = new jsPDF('portrait', 'mm', 'a4');
  
  // Add school header image
  const headerImg = new Image();
  headerImg.src = '/header.png';
  
  // Add header image at the top
  const imgWidth = 190;
  const imgHeight = 30;
  doc.addImage(headerImg, 'PNG', 10, 10, imgWidth, imgHeight);
  
  // Add title below header
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text(title, doc.internal.pageSize.getWidth() / 2, 48, { align: 'center' });
  
  // Add date
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(
    `Generated: ${format(new Date(), 'MMM dd, yyyy HH:mm')}`,
    doc.internal.pageSize.getWidth() / 2,
    55,
    { align: 'center' }
  );
  
  // Add summary
  const totalCount = teachers.length;
  
  doc.setFontSize(9);
  doc.text(`Total Staff: ${totalCount}`, 
    doc.internal.pageSize.getWidth() / 2, 61, { align: 'center' });
  
  // Prepare table data with numbering
  const tableData = teachers.map((teacher, index) => {
    const formattedPhone = teacher.contactNumber 
      ? `+256${teacher.contactNumber.toString()}` 
      : 'N/A';
    return [
      (index + 1).toString(),
      teacher.name,
      formattedPhone,
      teacher.email,
      teacher.default_password || 'N/A'
    ];
  });
  
  // Generate table with all borders
  autoTable(doc, {
    startY: 68,
    head: [['NO.', 'NAME', 'TEL.', 'E-MAIL', 'PASSWORD']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [0, 0, 0],
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: 'bold',
      halign: 'center',
      lineWidth: 0.5,
      lineColor: [0, 0, 0],
      minCellHeight: 12
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [0, 0, 0],
      lineWidth: 0.5,
      lineColor: [0, 0, 0],
      minCellHeight: 10
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    },
    columnStyles: {
      0: { cellWidth: 15, halign: 'center' },
      1: { cellWidth: 48, halign: 'left' },
      2: { cellWidth: 28, halign: 'center' },
      3: { cellWidth: 52, halign: 'left' },
      4: { cellWidth: 32, halign: 'center' }
    },
    margin: { left: 10, right: 10 }
  });
  
  // Add footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }
  
  return doc;
};

interface StudentDataForPDF {
  name: string;
  gender?: string;
  email: string;
  stream_id?: string;
  photo_url?: string;
  default_password?: string;
}

export const generateStudentsListPDF = async (
  students: StudentDataForPDF[],
  streamNameById: Record<string, string>,
  title: string = 'STUDENT DETAILS',
  onProgress?: (progress: number, message: string) => void
) => {
  const doc = new jsPDF('portrait', 'mm', 'a4');
  
  // Add school header image
  const headerImg = new Image();
  headerImg.src = '/header.png';
  
  // Add header image at the top
  const imgWidth = 190;
  const imgHeight = 30;
  doc.addImage(headerImg, 'PNG', 10, 10, imgWidth, imgHeight);
  
  // Add title below header
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text(title, doc.internal.pageSize.getWidth() / 2, 48, { align: 'center' });
  
  // Add date
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(
    `Generated: ${format(new Date(), 'MMM dd, yyyy HH:mm')}`,
    doc.internal.pageSize.getWidth() / 2,
    55,
    { align: 'center' }
  );
  
  // Add summary
  const totalCount = students.length;
  
  doc.setFontSize(9);
  doc.text(`Total Students: ${totalCount}`, 
    doc.internal.pageSize.getWidth() / 2, 61, { align: 'center' });
  
  // Load student photos with progress reporting
  const studentPhotos = new Map<string, string>();
  const totalStudents = students.length;
  let loadedCount = 0;
  
  for (const student of students) {
    if (student.photo_url) {
      try {
        const photoBase64 = await loadImageAsBase64(student.photo_url);
        if (photoBase64) {
          studentPhotos.set(student.email, photoBase64);
        }
      } catch (err) {
        console.error(`Failed to load photo for ${student.name}:`, err);
      }
    }
    
    loadedCount++;
    // Report progress during photo loading (60-85% of total progress)
    const photoProgress = 60 + (loadedCount / totalStudents) * 25;
    onProgress?.(photoProgress, `Loading student photos... ${loadedCount}/${totalStudents}`);
  }
  
  // Prepare table data with numbering
  const tableData = students.map((student, index) => {
    return [
      (index + 1).toString(),
      '', // Empty cell for photo (will be added in didDrawCell)
      student.name,
      student.gender || 'N/A',
      student.email,
      student.stream_id ? (streamNameById[student.stream_id] || student.stream_id) : 'N/A',
      student.default_password || 'N/A'
    ];
  });
  
  // Generate table with all borders
  autoTable(doc, {
    startY: 68,
    head: [['NO.', 'PHOTO', 'NAME', 'GENDER', 'EMAIL', 'STREAM', 'PASSWORD']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [0, 0, 0],
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: 'bold',
      halign: 'center',
      lineWidth: 0.5,
      lineColor: [0, 0, 0],
      minCellHeight: 12
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [0, 0, 0],
      lineWidth: 0.5,
      lineColor: [0, 0, 0],
      minCellHeight: 12
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    },
    columnStyles: {
      0: { cellWidth: 12, halign: 'center' },
      1: { cellWidth: 15, halign: 'center' },
      2: { cellWidth: 38, halign: 'left' },
      3: { cellWidth: 18, halign: 'center' },
      4: { cellWidth: 45, halign: 'left' },
      5: { cellWidth: 20, halign: 'center' },
      6: { cellWidth: 22, halign: 'center' }
    },
    didDrawCell: function(data) {
      // Add photos to the PHOTO column
      if (data.column.index === 1 && data.section === 'body') {
        const studentIndex = data.row.index;
        const student = students[studentIndex];
        const photoData = studentPhotos.get(student.email);
        
        if (photoData) {
          try {
            const photoSize = 10;
            const photoX = data.cell.x + (data.cell.width - photoSize) / 2;
            const photoY = data.cell.y + (data.cell.height - photoSize) / 2;
            doc.addImage(photoData, 'JPEG', photoX, photoY, photoSize, photoSize);
          } catch (err) {
            console.error('Error adding photo to PDF:', err);
          }
        } else {
          // Add initials if no photo
          const initials = student.name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
          
          const circleSize = 5;
          const circleX = data.cell.x + data.cell.width / 2;
          const circleY = data.cell.y + data.cell.height / 2;
          
          doc.setFillColor(102, 126, 234);
          doc.circle(circleX, circleY, circleSize, 'F');
          doc.setTextColor(255, 255, 255);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(7);
          doc.text(initials, circleX, circleY + 1.5, { align: 'center' });
          doc.setTextColor(0, 0, 0);
        }
      }
    },
    margin: { left: 8, right: 8 }
  });
  
  // Add footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }
  
  return doc;
};
