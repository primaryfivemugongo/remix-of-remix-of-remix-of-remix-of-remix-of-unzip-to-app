import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, CheckCircle, XCircle, Clock } from "lucide-react";

import { useState } from "react";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { format } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import classCrest from "@/assets/class-crest.png.asset.json";
import { school } from "@/lib/school";

interface ApplicationData {
  id?: string;
  student_name: string;
  student_email: string;
  student_photo?: string | null;
  position: string;
  class_name: string;
  stream_name: string;
  sex?: string;
  age?: number;
  class_teacher_name?: string;
  class_teacher_tel?: string;
  parent_name?: string;
  parent_tel?: string;
  experience?: string;
  qualifications?: string;
  why_apply?: string;
  submitted_at?: string;
  status?: string;
}

interface ApplicationPreviewProps {
  application: ApplicationData;
  showActions?: boolean;
  onClose?: () => void;
}

const getPositionTitle = (position: string) => {
  const positionMap: { [key: string]: string } = {
    'head_prefect': 'HEAD PREFECT',
    'academic_prefect': 'ACADEMIC PREFECT',
    'head_monitors': 'HEAD MONITOR(ES)',
    'welfare_prefect': 'WELFARE PREFECT (MESS PREFECT)',
    'entertainment_prefect': 'ENTERTAINMENT PREFECT',
    'games_sports_prefect': 'GAMES AND SPORTS PREFECT',
    'health_sanitation': 'HEALTH & SANITATION',
    'uniform_uniformity': 'UNIFORM & UNIFORMITY',
    'time_keeper': 'TIME KEEPER',
    'ict_prefect': 'ICT PREFECT',
    'furniture_prefect': 'FURNITURE PREFECT(S)',
    'prefect_upper_section': 'PREFECT FOR UPPER SECTION',
    'prefect_lower_section': 'PREFECT FOR LOWER SECTION',
    'discipline_prefect': 'PREFECT IN CHARGE OF DISCIPLINE'
  };
  
  return positionMap[position] || position.toUpperCase();
};

export default function ApplicationPreview({ application, showActions = true, onClose }: ApplicationPreviewProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    
    try {
      const element = document.getElementById('application-preview-content');
      if (!element) return;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        allowTaint: false,
        imageTimeout: 0,
        logging: false,
        width: element.scrollWidth,
        height: element.scrollHeight,
        scrollX: 0,
        scrollY: 0
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Better A4 dimensions with margins
      const pdfWidth = 210;
      const pdfHeight = 297;
      const margin = 10;
      const contentWidth = pdfWidth - (margin * 2);
      const contentHeight = pdfHeight - (margin * 2);
      
      // Calculate proper scaling to fit content within page
      const imgAspectRatio = canvas.width / canvas.height;
      let imgWidth = contentWidth;
      let imgHeight = contentWidth / imgAspectRatio;
      
      // If height exceeds page, scale down to fit
      if (imgHeight > contentHeight) {
        imgHeight = contentHeight;
        imgWidth = contentHeight * imgAspectRatio;
      }
      
      // Center the image on the page
      const xOffset = margin + (contentWidth - imgWidth) / 2;
      const yOffset = margin;
      
      pdf.addImage(imgData, 'PNG', xOffset, yOffset, imgWidth, imgHeight);
      
      // Only add pages if content is much larger than one page
      let remainingHeight = imgHeight - contentHeight;
      let currentPage = 1;
      
      while (remainingHeight > 50 && currentPage < 3) { // Limit to max 3 pages
        pdf.addPage();
        const nextPageOffset = yOffset - (contentHeight * currentPage);
        pdf.addImage(imgData, 'PNG', xOffset, nextPageOffset, imgWidth, imgHeight);
        remainingHeight -= contentHeight;
        currentPage++;
      }

      pdf.save(`Electoral-Application-${application.student_name}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsDownloading(false);
    }
  };


  const currentDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  const submissionDate = application.submitted_at 
    ? new Date(application.submitted_at).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit', 
        year: 'numeric'
      })
    : currentDate;

  const submissionTime = application.submitted_at
    ? formatInTimeZone(new Date(application.submitted_at), 'Africa/Nairobi', 'h:mm a')
    : formatInTimeZone(new Date(), 'Africa/Nairobi', 'h:mm a');

  return (
    <div className="space-y-4">
      {showActions && (
        <div className="flex justify-between items-center no-print">
          <div className="flex gap-2">
            <Button 
              onClick={handleDownload} 
              disabled={isDownloading}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              {isDownloading ? 'Preparing...' : 'Download PDF'}
            </Button>
          </div>
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Close Preview
            </Button>
          )}
        </div>
      )}

      <Card className="shadow-lg">
        <CardContent className="p-0">
          <div id="application-preview-content" className="w-full max-w-2xl mx-auto bg-white font-century-gothic text-application">
            {/* Header */}
            <div className="flex items-center justify-center gap-4 border-b-2 border-black px-4 py-3 bg-white">
              <img src={classCrest.url} alt={`${school.name} crest`} className="h-20 w-20 object-contain" />
              <div className="text-left">
                <p className="text-lg font-bold leading-tight">{school.fullName}</p>
                <p className="text-sm">{school.location} &middot; {school.phone}</p>
                <p className="text-xs italic">{school.motto}</p>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-4 relative bg-white text-black">
              {/* Watermark overlay */}
              <div className="absolute inset-0 pointer-events-none" style={{
                backgroundImage: `url(${classCrest.url})`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center center',
                backgroundSize: '350px 350px',
                opacity: '0.08'
              }}></div>
              
              <div className="relative z-10">
              {/* Photo placeholder */}
              <div className="absolute top-8 right-6 w-24 h-28 border-2 border-black bg-gray-100 flex items-center justify-center text-sm font-bold">
                {application.student_photo ? (
                  <img 
                    src={application.student_photo} 
                    alt="Student Photo"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement!.innerHTML = 'PHOTO';
                    }}
                  />
                ) : (
                  'PHOTO'
                )}
              </div>

              {/* Date */}
              <div className="mb-3 text-base">
                Date: <span className="font-bold underline">{currentDate}</span>
              </div>

              {/* Address */}
              <div className="mb-3 leading-relaxed text-base">
                <div>The Chairperson</div>
                <div>P.5 Orange Electoral Commission,</div>
                <div>Kyengera Parents' School - Mugongo</div>
                <div>Kyengera Mugongo · +256 753 616 792</div>
                <br />
                <p>Dear Sir,</p>
              </div>

              {/* Subject line */}
              <div className="mb-0 underline font-bold text-base">
                Re: APPLICATION FOR BEING A PREFECT.
              </div>

              {/* Application body */}
              <div className="mb-4 text-justify leading-relaxed text-base">
                <p className="mb-2">
                  As stated above, I hereby apply and express my interest to contest on the post of{' '}
                  <span className="font-bold underline">
                    {getPositionTitle(application.position)}
                  </span>{' '}
                  at Kyengera Parents' School - Mugongo, P.5 Orange.
                </p>
                <p>I will be grateful if my application is positively considered.</p>
              </div>

              {/* Student details */}
              <div className="mb-4 space-y-2 leading-relaxed text-base">
                <div>
                  Name of applicant/aspirant: <span className="font-bold underline">{application.student_name}</span>{' '}
                  Sex: <span className="font-bold underline">{application.sex || 'Not specified'}</span>
                </div>
                <div>
                  Age: <span className="font-bold underline">{application.age || 'Not specified'}</span>{' '}
                  Class: <span className="font-bold underline">{application.class_name} {application.stream_name}</span>
                </div>
                <div>
                  Class Teacher's name: <span className="font-bold underline">{application.class_teacher_name || 'Not specified'}</span>{' '}
                  Tel: <span className="font-bold underline">{application.class_teacher_tel || 'Not specified'}</span>
                </div>
                <div>
                  Parent's name: <span className="font-bold underline">{application.parent_name || 'Not specified'}</span>{' '}
                  Tel: <span className="font-bold underline">{application.parent_tel || 'Not specified'}</span>
                </div>
              </div>

              {/* Official use section */}
              <div className="border-2 border-black p-3 mb-3">
                <div className="text-center font-bold bg-black text-white p-2 -m-3 mb-3 text-base">
                  FOR OFFICIAL USE ONLY
                </div>
                <div className="space-y-2 leading-relaxed text-base">
                  <div>
                    Received by: <span className="font-bold underline">Turyomurugyendo Moses</span>{' '}
                    Title: <span className="font-bold underline">Chairman GEC</span>
                  </div>
                  <div>
                    On the (Date): <span className="font-bold underline">{submissionDate}</span>{' '}
                    Time: <span className="font-bold underline">{submissionTime}</span>
                  </div>
                  
                  <div className="text-center mt-3 text-base">
                    For more information contact: Chairperson GEC 0700718846
                  </div>
                </div>
              </div>

              {/* QR Code Section */}
              <div className="flex justify-center mb-0">
                <div className="border border-gray-300 p-1 rounded bg-white">
                  <img 
                    src="/qr.png" 
                    alt="QR Code to School Portal" 
                    className="w-[100px] h-[100px] object-contain"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              </div>

              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}