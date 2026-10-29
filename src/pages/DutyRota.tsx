import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "@/lib/router-compat";
import { 
  Calendar, 
  Users, 
  Sparkles, 
  Clock,
  ChevronLeft,
  ChevronRight,
  Download,
  Printer,
  Filter
} from "lucide-react";
import { format } from "date-fns";

interface WeekData {
  week: number;
  dateRange: string;
  teachers: string[];
  theme: string;
  events: string[];
  classPresenting?: string;
}

export default function DutyRota() {
  const { userName, photoUrl, userRole } = useAuth();
  const navigate = useNavigate();
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);

  const handleLogout = () => {
    navigate('/login');
  };

  const dutyRotaData: WeekData[] = [
    {
      week: 1,
      dateRange: "Monday 8/9/25 to Sunday 14/9/25",
      teachers: ["Gerald", "Alexander", "Ruth", "Monica"],
      theme: "Beginning of Term",
      events: [
        "Reporting of boarders from P.1 – P.6",
        "Reception of day pupils P.1 – P.6",
        "Orientation of pupils",
        "Beginning of term III kindergarten",
        "Opening of term III assembly",
        "Declaring electoral posts",
        "P.6 teachers meeting",
        "Teachers' briefing"
      ],
      classPresenting: undefined
    },
    {
      week: 2,
      dateRange: "Monday 15/9/25 to Sunday 21/9/25",
      teachers: ["Vicent", "Waiswa", "Olivia", "Benitah"],
      theme: "The struggle begins",
      events: [
        "Boarders meeting (P.1-P.6)",
        "Science departmental meeting",
        "Picking nomination forms",
        "Guidance and counseling P.6",
        "Guidance and counseling (P.1 & P.2)",
        "Final returning of nomination forms",
        "Support staff meeting"
      ],
      classPresenting: "P.6RD"
    },
    {
      week: 3,
      dateRange: "Monday 22/9/25 to Sunday 28/9/25",
      teachers: ["Walter", "Patrick", "Fiona", "Angella"],
      theme: "Yes I can",
      events: [
        "P.1 study tour",
        "P.2 study tour",
        "English book checking (P.4 – P.6)",
        "Guidance and counseling P.3 & P.4",
        "Vetting of nominees",
        "Weekend outing"
      ],
      classPresenting: "P.4C"
    },
    {
      week: 4,
      dateRange: "Monday 29/9/25 to Sunday 5/10/25",
      teachers: ["Godfrey", "Sam", "Agnes", "Margret"],
      theme: "An early bird catches the worm",
      events: [
        "Guidance and counseling (P.7)",
        "Thanks giving service",
        "Displaying successfully nominated candidates",
        "MTC book checking (Upper)"
      ],
      classPresenting: "P.3C"
    },
    {
      week: 5,
      dateRange: "Monday 6/10/25 to Sunday 12/10/25",
      teachers: ["Jesse", "Paul"],
      theme: "Pen it down",
      events: [
        "MID TERM EXAMS",
        "INDEPENDENCE DAY (PUBLIC HOLIDAY)",
        "Final handwriting competition"
      ],
      classPresenting: undefined
    },
    {
      week: 6,
      dateRange: "Monday 13/10/25 to Sunday 19/10/25",
      teachers: ["Moses"],
      theme: "Its time to fly",
      events: [
        "General book checking (ENG & SCI)",
        "SST and MTC book checking",
        "RE, LUG & LIT II general book checking",
        "Closing campaigns",
        "Elections of prefects vote counting & declaration of results",
        "TEACHER-PARENT CONTACT DAY KINDERGARTEN"
      ],
      classPresenting: undefined
    },
    {
      week: 7,
      dateRange: "Monday 20/10/25 to Sunday 26/10/25",
      teachers: ["Benoit"],
      theme: "The power of a pen",
      events: [
        "ENG & SCI evaluation meetings",
        "MTC & SST evaluation meeting",
        "RE, LIT II & LUG evaluation meeting",
        "Academic Board meeting",
        "General evaluation meeting",
        "General cleaning",
        "Support staff meeting",
        "Scouts club community outreach"
      ],
      classPresenting: undefined
    },
    {
      week: 8,
      dateRange: "Monday 27/10/25 to Sunday 2/11/25",
      teachers: ["Habert"],
      theme: "Say it out louder",
      events: [
        "Swearing in of prefects",
        "P.7 dedication prayer",
        "Farewell Dinner",
        "Section meetings",
        "Medical check-up"
      ],
      classPresenting: undefined
    }
  ];

  const currentWeek = Math.ceil((new Date().getTime() - new Date("2025-09-08").getTime()) / (7 * 24 * 60 * 60 * 1000));
  const displayWeek = selectedWeek !== null ? dutyRotaData.find(w => w.week === selectedWeek) : dutyRotaData.find(w => w.week === currentWeek) || dutyRotaData[0];

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Create a simple text version for download
    const content = dutyRotaData.map(week => 
      `Week ${week.week}: ${week.dateRange}\nTheme: ${week.theme}\nTeachers: ${week.teachers.join(", ")}\n${week.classPresenting ? `Presenting: ${week.classPresenting}\n` : ""}Events:\n${week.events.map(e => `- ${e}`).join("\n")}\n\n`
    ).join("\n");
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'duty-rota-term3-2025.txt';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout 
      userRole={userRole || "teacher"} 
      userName={userName} 
      photoUrl={photoUrl} 
      onLogout={handleLogout}
    >
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <ScrollReveal animation="fadeInUp" delay={100}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                <Calendar className="h-8 w-8 text-primary" />
                Duty Rota - Term 3, 2025
              </h1>
              <p className="text-muted-foreground mt-1">
                Teacher duty schedule and weekly themes
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
            </div>
          </div>
        </ScrollReveal>

        {/* Week Navigation */}
        <ScrollReveal animation="fadeInUp" delay={150}>
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-2">
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    const prevWeek = (selectedWeek || currentWeek) - 1;
                    if (prevWeek >= 1) setSelectedWeek(prevWeek);
                  }}
                  disabled={(selectedWeek || currentWeek) <= 1}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>

                <div className="flex-1 text-center space-y-1">
                  <div className="flex items-center justify-center gap-2">
                    <Badge variant="default" className="text-lg px-4 py-1">
                      Week {displayWeek?.week}
                    </Badge>
                    {displayWeek?.week === currentWeek && (
                      <Badge variant="secondary" className="animate-pulse">
                        Current Week
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {displayWeek?.dateRange}
                  </p>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    const nextWeek = (selectedWeek || currentWeek) + 1;
                    if (nextWeek <= dutyRotaData.length) setSelectedWeek(nextWeek);
                  }}
                  disabled={(selectedWeek || currentWeek) >= dutyRotaData.length}
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* Week Details */}
        {displayWeek && (
          <ScrollReveal animation="fadeInUp" delay={200}>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Teachers & Theme */}
              <Card className="border-2 hover:shadow-lg transition-shadow">
                <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Teachers on Duty
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {displayWeek.teachers.map((teacher, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg border"
                      >
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white font-bold">
                          {teacher.charAt(0)}
                        </div>
                        <span className="font-semibold">{teacher}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="pt-4 border-t">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="h-5 w-5 text-yellow-500" />
                      <h3 className="font-semibold">Weekly Theme</h3>
                    </div>
                    <p className="text-2xl font-bold text-primary bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-lg text-center">
                      "{displayWeek.theme}"
                    </p>
                  </div>

                  {displayWeek.classPresenting && (
                    <div className="pt-4 border-t">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="h-5 w-5 text-green-500" />
                        <h3 className="font-semibold">Class Presenting</h3>
                      </div>
                      <Badge variant="secondary" className="text-lg px-4 py-2">
                        {displayWeek.classPresenting}
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Events */}
              <Card className="border-2 hover:shadow-lg transition-shadow">
                <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Special Events & Activities
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-2">
                    {displayWeek.events.map((event, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                      >
                        <div className="h-6 w-6 rounded-full bg-gradient-to-br from-orange-400 to-red-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 group-hover:scale-110 transition-transform">
                          {index + 1}
                        </div>
                        <p className="text-sm font-medium flex-1 pt-0.5">{event}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </ScrollReveal>
        )}

        {/* Full Schedule Overview */}
        <ScrollReveal animation="fadeInUp" delay={250}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Complete Term 3 Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {dutyRotaData.map((week) => (
                  <Card
                    key={week.week}
                    className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                      week.week === displayWeek?.week
                        ? 'border-2 border-primary bg-primary/5'
                        : 'hover:border-primary/50'
                    } ${week.week === currentWeek ? 'ring-2 ring-green-400' : ''}`}
                    onClick={() => setSelectedWeek(week.week)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <Badge variant={week.week === currentWeek ? "default" : "outline"}>
                          Week {week.week}
                        </Badge>
                        {week.week === currentWeek && (
                          <Badge variant="secondary" className="animate-pulse text-xs">
                            Now
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        {week.dateRange.split(' to ')[0]}
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center gap-1 text-xs">
                        <Sparkles className="h-3 w-3 text-yellow-500" />
                        <span className="font-semibold truncate">{week.theme}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Users className="h-3 w-3" />
                        <span className="truncate">{week.teachers.join(", ")}</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {week.events.length} Events
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>
      </div>
    </DashboardLayout>
  );
}
