import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/types/user";
import { 
  Clock, 
  Calendar, 
  BookOpen, 
  Download,
  GraduationCap,
  Waves,
  Home,
  Utensils,
  Sun
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TimeSlot {
  time: string;
  activity: string;
  teacher?: string;
  subject?: string;
}

interface DaySchedule {
  [day: string]: TimeSlot[];
}

interface SwimmingSchedule {
  week: string;
  day: string;
  date: string;
  classes: string;
}

interface PrepSchedule {
  grade: string;
  weekdays: { [day: string]: string[] };
}

interface SundaySchedule {
  grade: string;
  schedule: { week: string; date: string; slots: { [time: string]: string } }[];
}

interface HomeworkSchedule {
  day: string;
  subjects: { [grade: string]: string };
}

type TimetableType = "regular" | "sunday" | "swimming" | "prep" | "homework" | "lunch";

// Swimming Timetable
const swimmingSchedule: SwimmingSchedule[] = [
  { week: "2", day: "Wednesday", date: "17/9/2025", classes: "P.1" },
  { week: "2", day: "Thursday", date: "18/9/2025", classes: "P.2 & P.5" },
  { week: "3", day: "Sunday", date: "21/9/2025", classes: "P.6 & P.7" },
  { week: "3", day: "Thursday", date: "25/9/2025", classes: "P.3 & P.4" },
  { week: "6", day: "Wednesday", date: "15/10/2025", classes: "P.1" },
  { week: "6", day: "Thursday", date: "16/10/2025", classes: "P.2 & P.5" },
  { week: "7", day: "Sunday", date: "19/10/2025", classes: "P.6 & P.7" },
  { week: "7", day: "Thursday", date: "23/10/2025", classes: "P.3 & P.4" },
  { week: "8", day: "Wednesday", date: "29/10/2025", classes: "P.5 & P.1" },
  { week: "10", day: "Sunday", date: "8/11/2025", classes: "P.6" },
  { week: "10", day: "Wednesday", date: "12/11/2025", classes: "P.2 & P.4" },
  { week: "10", day: "Thursday", date: "13/11/2025", classes: "P.3 & P.5" },
  { week: "11", day: "Sunday", date: "16/11/2025", classes: "P.6" },
  { week: "11", day: "Wednesday", date: "19/11/2025", classes: "P.1" },
  { week: "11", day: "Thursday", date: "20/11/2025", classes: "P.2 & P.4" },
  { week: "12", day: "Monday", date: "24/11/2025", classes: "P.3" }
];

// Prep Schedules
const prepSchedules: PrepSchedule[] = [
  {
    grade: "P.1",
    weekdays: {
      MON: ["Ruth", "Prossy", "Angella", "Marima", "Judith", "Benitah", "Leirah", "Teddy", "Ruth", "Prossy", "Angella", "Marima"],
      TUE: ["Benitah", "Leirah", "Teddy", "Ruth", "Prossy", "Angella", "Marima", "Judith", "Benitah", "Leirah", "Teddy", "Ruth"],
      WED: ["Angella", "Marima", "Judith", "Benitah", "Leirah", "Teddy", "Ruth", "Prossy", "Angella", "Marima", "Judith", "Benitah"],
      THU: ["Teddy", "Ruth", "Prossy", "Angella", "Marima", "Judith", "Benitah", "Leirah", "Teddy", "Ruth", "Prossy", "Angella"],
      FRI: ["Judith", "Benitah", "Leirah", "Teddy", "Ruth", "Prossy", "Angella", "Marima", "Judith", "Benitah", "Leirah", "Teddy"]
    }
  },
  {
    grade: "P.2",
    weekdays: {
      MON: ["Phiona", "Barbra", "Monica", "Sharon", "Edinah", "Alexander", "Monica", "Edinah", "Phiona", "Barbra", "Monica", "Sharon"],
      TUE: ["Alexander", "Flavia", "Edinah", "Phiona", "Barbra", "Monica", "Sharon", "Olivia", "Alexander", "Flavia", "Edinah", "Phiona"],
      WED: ["Monica", "Sharon", "Alexander", "Alexander", "Flavia", "Edinah", "Phiona", "Barbra", "Monica", "Sharon", "Olivia", "Alexander"],
      THU: ["Edinah", "Monica", "Barbra", "Monica", "Sharon", "Olivia", "Alexander", "Phiona", "Edinah", "Phiona", "Barbra", "Monica"],
      FRI: ["Olivia", "Olivia", "Flavia", "Edinah", "Phiona", "Flavia", "Barbra", "Sharon", "Olivia", "Alexander", "Flavia", "Edinah"]
    }
  }
];

// Sunday Schedules
const sundaySchedules: SundaySchedule[] = [
  {
    grade: "P.5",
    schedule: [
      { week: "1", date: "14/9/25", slots: { "SH": "Science - Mansur", "SR & SS": "Maths - Godfrey" }},
      { week: "2", date: "21/9/25", slots: { "SH": "English - Patrick", "SR & SS": "SST - Okurut" }},
      { week: "3", date: "28/9/25", slots: { "SH": "Maths - Godfrey", "SR & SS": "English - Imeldah" }},
      { week: "4", date: "5/10/25", slots: { "SH": "SST - Joseph", "SR & SS": "RE - Jesse Paul" }},
      { week: "5", date: "12/10/25", slots: { "SH": "Science - Mansur", "SR & SS": "Science - Vicent" }},
      { week: "6", date: "19/10/25", slots: { "SH": "English - Patrick", "SR & SS": "Maths - Moses" }},
      { week: "7", date: "26/10/25", slots: { "ALL": "BOARDERS' DAY OUT" }},
      { week: "8", date: "2/11/25", slots: { "SH": "Maths - Godfrey", "SR & SS": "SST - Habert" }},
      { week: "9", date: "9/11/25", slots: { "SH": "SST - Joseph", "SR & SS": "Science - Graciano" }},
      { week: "10", date: "16/11/25", slots: { "SH": "Science - Mansur", "SR & SS": "English - Sylvia" }},
      { week: "11", date: "23/11/25", slots: { "ALL": "END OF TERM PREP" }}
    ]
  },
  {
    grade: "P.6",
    schedule: [
      { week: "1", date: "14/9/25", slots: { "11am-5pm": "Entertainment / Lunch / Sports" }},
      { week: "2", date: "21/9/25", slots: { "11am-5pm": "Entertainment / Lunch / Sports" }}
    ]
  }
];

// Homework & Lunch schedules
const homeworkSchedule: HomeworkSchedule[] = [
  { day: "MON", subjects: { "P.4C": "SST", "P.4E": "MTC", "P.5SH": "MTC", "P.6VB": "SST" }},
  { day: "TUE", subjects: { "P.4C": "MTC", "P.4E": "SST", "P.5SH": "SST", "P.6VB": "ENG" }},
  { day: "WED", subjects: { "P.4C": "SCI", "P.4E": "ENG", "P.5SH": "SCI", "P.6VB": "MTC" }},
  { day: "THU", subjects: { "P.4C": "ENG", "P.4E": "SCI", "P.5SH": "ENG", "P.6VB": "SCI" }},
  { day: "FRI", subjects: { "P.4C": "WEEKEND HOMEWORK", "P.4E": "", "P.5SH": "", "P.6VB": "" }}
];

const lunchHourSchedule: HomeworkSchedule[] = [
  { day: "MON", subjects: { "P.4C": "SST", "P.4E": "MTC", "P.5SH": "MTC", "P.6VB": "SST" }},
  { day: "TUE", subjects: { "P.4C": "MTC", "P.4E": "SST", "P.5SH": "SST", "P.6VB": "ENG" }},
  { day: "WED", subjects: { "P.4C": "SCI", "P.4E": "ENG", "P.5SH": "SCI", "P.6VB": "MTC" }},
  { day: "THU", subjects: { "P.4C": "ENG", "P.4E": "SCI", "P.5SH": "ENG", "P.6VB": "SCI" }},
  { day: "FRI", subjects: { "P.4C": "GENERAL CORRECTIONS", "P.4E": "", "P.5SH": "", "P.6VB": "" }}
];

export default function Timetable() {
  const { user, userRole, userName, photoUrl, signOut } = useAuth();
  const [timetableType, setTimetableType] = useState<TimetableType>("regular");
  const [selectedGrade, setSelectedGrade] = useState("P.5");

  return (
    <DashboardLayout 
      userRole={userRole || "student"}
      userName={userName || "Guest User"}
      photoUrl={photoUrl}
      onLogout={signOut}
    >
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">School Timetables</h1>
            <p className="text-muted-foreground">Access all schedules - classes, swimming, prep, homework & more</p>
          </div>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Download
          </Button>
        </div>

        <Tabs value={timetableType} onValueChange={(v) => setTimetableType(v as TimetableType)}>
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 gap-1">
            <TabsTrigger value="regular" className="flex items-center gap-1 text-xs lg:text-sm">
              <BookOpen className="h-3 w-3 lg:h-4 lg:w-4" />
              <span className="hidden sm:inline">Classes</span>
            </TabsTrigger>
            <TabsTrigger value="sunday" className="flex items-center gap-1 text-xs lg:text-sm">
              <Sun className="h-3 w-3 lg:h-4 lg:w-4" />
              <span className="hidden sm:inline">Sunday</span>
            </TabsTrigger>
            <TabsTrigger value="swimming" className="flex items-center gap-1 text-xs lg:text-sm">
              <Waves className="h-3 w-3 lg:h-4 lg:w-4" />
              <span className="hidden sm:inline">Swimming</span>
            </TabsTrigger>
            <TabsTrigger value="prep" className="flex items-center gap-1 text-xs lg:text-sm">
              <Home className="h-3 w-3 lg:h-4 lg:w-4" />
              <span className="hidden sm:inline">Prep</span>
            </TabsTrigger>
            <TabsTrigger value="homework" className="flex items-center gap-1 text-xs lg:text-sm">
              <BookOpen className="h-3 w-3 lg:h-4 lg:w-4" />
              <span className="hidden sm:inline">Homework</span>
            </TabsTrigger>
            <TabsTrigger value="lunch" className="flex items-center gap-1 text-xs lg:text-sm">
              <Utensils className="h-3 w-3 lg:h-4 lg:w-4" />
              <span className="hidden sm:inline">Lunch</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sunday" className="space-y-4 mt-6">
            <Select value={selectedGrade} onValueChange={setSelectedGrade}>
              <SelectTrigger className="w-[200px]">
                <GraduationCap className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sundaySchedules.map(s => <SelectItem key={s.grade} value={s.grade}>{s.grade}</SelectItem>)}
              </SelectContent>
            </Select>
            <Card>
              <CardHeader>
                <CardTitle>Sunday Schedule</CardTitle>
                <CardDescription>Weekly Sunday activities</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {sundaySchedules.find(s => s.grade === selectedGrade)?.schedule.map((e, i) => (
                  <Card key={i}>
                    <CardContent className="pt-4">
                      <div className="font-semibold mb-2">Week {e.week} - {e.date}</div>
                      {Object.entries(e.slots).map(([k, v]) => (
                        <div key={k} className="flex justify-between p-2 bg-muted rounded mt-2">
                          <Badge variant="outline">{k}</Badge>
                          <span className="text-sm">{v}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="swimming" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Swimming Schedule - Term III 2025</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {swimmingSchedule.map((s, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border rounded">
                    <Badge variant="outline">Week {s.week}</Badge>
                    <span className="text-sm">{s.day}, {s.date}</span>
                    <Badge className="bg-blue-100 text-blue-800">{s.classes}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="prep" className="space-y-4 mt-6">
            <Select value={selectedGrade} onValueChange={setSelectedGrade}>
              <SelectTrigger className="w-[200px]">
                <GraduationCap className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {prepSchedules.map(p => <SelectItem key={p.grade} value={p.grade}>{p.grade}</SelectItem>)}
              </SelectContent>
            </Select>
            <Card>
              <CardHeader>
                <CardTitle>Prep Supervision Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="bg-muted"><th className="p-2">Day</th>{[...Array(12)].map((_, i) => <th key={i} className="p-2">W{i+1}</th>)}</tr></thead>
                    <tbody>
                      {Object.entries(prepSchedules.find(p => p.grade === selectedGrade)?.weekdays || {}).map(([day, teachers]) => (
                        <tr key={day}><td className="p-2 font-semibold">{day}</td>{teachers.map((t, i) => <td key={i} className="p-2 text-center"><Badge variant="outline" className="text-xs">{t}</Badge></td>)}</tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="homework" className="mt-6">
            <Card>
              <CardHeader><CardTitle>Homework Schedule</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead><tr className="bg-muted">{["Day", ...Object.keys(homeworkSchedule[0].subjects)].map(h => <th key={h} className="border p-2">{h}</th>)}</tr></thead>
                    <tbody>{homeworkSchedule.map((d, i) => <tr key={i}><td className="border p-2 font-semibold">{d.day}</td>{Object.values(d.subjects).map((s, j) => <td key={j} className="border p-2 text-center">{s && <Badge variant="outline" className="text-xs">{s}</Badge>}</td>)}</tr>)}</tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="lunch" className="mt-6">
            <Card>
              <CardHeader><CardTitle>Lunch Hour Schedule (P.4-P.6)</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead><tr className="bg-muted">{["Day", ...Object.keys(lunchHourSchedule[0].subjects)].map(h => <th key={h} className="border p-2">{h}</th>)}</tr></thead>
                    <tbody>{lunchHourSchedule.map((d, i) => <tr key={i}><td className="border p-2 font-semibold">{d.day}</td>{Object.values(d.subjects).map((s, j) => <td key={j} className="border p-2 text-center">{s && <Badge variant="outline" className="text-xs">{s}</Badge>}</td>)}</tr>)}</tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="regular" className="mt-6">
            <Card>
              <CardHeader><CardTitle>Regular Class Timetables</CardTitle></CardHeader>
              <CardContent><p className="text-muted-foreground">Select specific grade for daily schedules</p></CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
