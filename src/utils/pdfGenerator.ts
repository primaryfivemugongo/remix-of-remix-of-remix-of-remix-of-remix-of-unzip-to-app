import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

interface StudentAttendanceData {
  name: string;
  gender: string;
  stream: string;
  status: 'present' | 'absent' | 'not-marked';
  timeMarked?: string;
  photoUrl?: string;
  reason?: string;
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
  attendanceDate: Date = new Date(),
  onProgress?: (message: string) => void
) => {
  onProgress?.('Generating PDF...');
  
  const doc = new jsPDF('portrait', 'mm', 'a4');
  
  // Group students by stream
  const studentsByStream = students.reduce((acc, student) => {
    const stream = student.stream || 'No Stream';
    if (!acc[stream]) {
      acc[stream] = [];
    }
    acc[stream].push(student);
    return acc;
  }, {} as Record<string, StudentAttendanceData[]>);
  
  const streams = Object.keys(studentsByStream).sort();
  
  // Calculate overall statistics
  const totalStudents = students.length;
  const totalPresent = students.filter(s => s.status === 'present').length;
  const totalAbsent = students.filter(s => s.status === 'absent').length;
  const totalNotMarked = students.filter(s => s.status === 'not-marked').length;
  const overallRate = totalStudents > 0 ? ((totalPresent / totalStudents) * 100).toFixed(1) : '0';
  
  // Generate summary page first
  const headerImg = new Image();
  headerImg.src = '/header.png';
  
  // Add header image
  const imgWidth = 190;
  const imgHeight = 30;
  doc.addImage(headerImg, 'PNG', 10, 10, imgWidth, imgHeight);
  
  // Add main title
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text('Daily Attendance Report', doc.internal.pageSize.getWidth() / 2, 48, { align: 'center' });
  
  // Add attendance date
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 139);
  doc.text(
    format(attendanceDate, 'EEEE, MMMM dd, yyyy'),
    doc.internal.pageSize.getWidth() / 2,
    56,
    { align: 'center' }
  );
  
  // Add overall summary title
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('Overall Attendance Summary', doc.internal.pageSize.getWidth() / 2, 68, { align: 'center' });
  
  // Add overall summary statistics
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(
    `Total: ${totalStudents} | Present: ${totalPresent} | Absent: ${totalAbsent} | Not Marked: ${totalNotMarked} | Rate: ${overallRate}%`,
    doc.internal.pageSize.getWidth() / 2,
    75,
    { align: 'center' }
  );
  
  // Prepare summary table data
  const summaryData = streams.map(stream => {
    const streamStudents = studentsByStream[stream];
    const streamTotal = streamStudents.length;
    const streamPresent = streamStudents.filter(s => s.status === 'present').length;
    const streamAbsent = streamStudents.filter(s => s.status === 'absent').length;
    const streamNotMarked = streamStudents.filter(s => s.status === 'not-marked').length;
    const streamRate = streamTotal > 0 ? ((streamPresent / streamTotal) * 100).toFixed(1) : '0';
    
    // Use "-" if all students are not marked (no attendance taken yet)
    const hasMarkedAttendance = streamPresent > 0 || streamAbsent > 0;
    
    return [
      stream,
      streamTotal.toString(),
      hasMarkedAttendance ? streamPresent.toString() : '-',
      hasMarkedAttendance ? streamAbsent.toString() : '-',
      streamNotMarked.toString(),
      hasMarkedAttendance ? `${streamRate}%` : '-'
    ];
  });
  
  // Add total row
  summaryData.push([
    'TOTAL',
    totalStudents.toString(),
    totalPresent.toString(),
    totalAbsent.toString(),
    totalNotMarked.toString(),
    `${overallRate}%`
  ]);
  
  // Generate summary table
  autoTable(doc, {
    startY: 82,
    head: [['Stream', 'Total', 'Present', 'Absent', 'Not Marked', 'Rate']],
    body: summaryData,
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
      minCellHeight: 10,
      halign: 'center'
    },
    columnStyles: {
      0: { halign: 'left', fontStyle: 'bold' }
    },
    didParseCell: function(data) {
      // Make the total row bold
      if (data.section === 'body' && data.row.index === summaryData.length - 1) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [230, 230, 230];
      }
    },
    margin: { left: 15, right: 15 }
  });
  
  // Generate a page for each stream
  streams.forEach((stream, streamIndex) => {
    const streamStudents = studentsByStream[stream];
    
    // Always add a new page for each stream (summary is on page 1)
    doc.addPage();
    
    // Add school header image
    const headerImg = new Image();
    headerImg.src = '/header.png';
    
    // Add header image at the top
    const imgWidth = 190;
    const imgHeight = 30;
    doc.addImage(headerImg, 'PNG', 10, 10, imgWidth, imgHeight);
    
    // Add main title below header
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('Daily Attendance Report', doc.internal.pageSize.getWidth() / 2, 48, { align: 'center' });
    
    // Add stream name prominently
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 139);
    doc.text(stream, doc.internal.pageSize.getWidth() / 2, 56, { align: 'center' });
    
    // Add attendance date
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(
      format(attendanceDate, 'EEEE, MMMM dd, yyyy'),
      doc.internal.pageSize.getWidth() / 2,
      63,
      { align: 'center' }
    );
    
    // Add summary for this stream
    const presentCount = streamStudents.filter(s => s.status === 'present').length;
    const absentCount = streamStudents.filter(s => s.status === 'absent').length;
    const notMarkedCount = streamStudents.filter(s => s.status === 'not-marked').length;
    const totalCount = streamStudents.length;
    const attendanceRate = totalCount > 0 ? ((presentCount / totalCount) * 100).toFixed(1) : '0';
    
    doc.setFontSize(9);
    doc.text(`Total: ${totalCount} | Present: ${presentCount} | Absent: ${absentCount} | Not Marked: ${notMarkedCount} | Rate: ${attendanceRate}%`, 
      doc.internal.pageSize.getWidth() / 2, 69, { align: 'center' });
    
    // Prepare table data with numbering for this stream
    const tableData = streamStudents.map((student, index) => {
      let statusText = '';
      if (student.status === 'present') {
        statusText = 'Present';
      } else if (student.status === 'absent') {
        statusText = student.reason ? `Absent\n${student.reason}` : 'Absent';
      } else {
        statusText = 'Not Marked';
      }
      
      return [
        (index + 1).toString(),
        student.name,
        student.gender || 'N/A',
        statusText
      ];
    });
    
    // Generate table with all borders
    autoTable(doc, {
      startY: 75,
      head: [['No.', 'Name', 'Sex', 'Status']],
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
        0: { cellWidth: 20, halign: 'center' },
        1: { cellWidth: 80, halign: 'left' },
        2: { cellWidth: 30, halign: 'center' },
        3: { cellWidth: 50, halign: 'center' }
      },
      willDrawCell: function(data) {
        // Increase cell height for absent students with reasons
        if (data.column.index === 3 && data.section === 'body') {
          if (data.cell.text.length > 1 && data.cell.text[0] === 'Absent') {
            data.cell.styles.minCellHeight = 16;
          }
        }
      },
      didDrawCell: function(data) {
        // Color code and style the status column
        if (data.column.index === 3 && data.section === 'body') {
          const status = data.cell.text[0];
          
          // Handle absent with reason (multi-line)
          if (status === 'Absent' && data.cell.text.length > 1) {
            // Clear default text to draw manually
            const reason = data.cell.text[1];
            data.cell.text = [];
            
            const x = data.cell.x + data.cell.width / 2;
            const y = data.cell.y + 6;
            
            // Draw "Absent" in red, normal font
            doc.setTextColor(255, 0, 0);
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.text('Absent', x, y, { align: 'center' });
            
            // Draw reason in red, italic font
            doc.setFont('helvetica', 'italic');
            doc.setFontSize(8);
            doc.text(reason, x, y + 5, { align: 'center' });
          } else {
            // Apply color for single-line statuses
            if (status === 'Absent') {
              data.cell.styles.textColor = [255, 0, 0];
            } else if (status === 'Present') {
              data.cell.styles.textColor = [0, 128, 0];
            } else {
              data.cell.styles.textColor = [128, 128, 128];
            }
          }
        }
      },
      margin: { left: 15, right: 15 }
    });
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

