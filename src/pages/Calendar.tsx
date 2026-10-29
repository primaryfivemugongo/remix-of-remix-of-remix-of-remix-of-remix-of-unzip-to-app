import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "@/lib/router-compat";
import { 
  CalendarDays, 
  Clock, 
  MapPin, 
  Users,
  Plus,
  Edit3,
  Trash2,
  Bell,
  Filter
} from "lucide-react";
import { format, isSameDay, startOfDay, endOfDay, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";

interface Event {
  id: string;
  title: string;
  description: string;
  date: Date;
  time: string;
  location: string;
  type: 'class' | 'assignment' | 'exam' | 'meeting' | 'event';
  attendees?: number;
  isImportant?: boolean;
}

const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Mathematics Exam',
    description: 'Calculus and Linear Algebra final exam',
    date: new Date(),
    time: '09:00 AM',
    location: 'Room 204',
    type: 'exam',
    isImportant: true
  },
  {
    id: '2',
    title: 'Science Project Due',
    description: 'Submit physics research project',
    date: new Date(Date.now() + 86400000),
    time: '11:59 PM',
    location: 'Online Portal',
    type: 'assignment',
    isImportant: true
  },
  {
    id: '3',
    title: 'History Class',
    description: 'World War II: Pacific Theater',
    date: new Date(Date.now() + 172800000),
    time: '10:30 AM',
    location: 'Room 305',
    type: 'class',
    attendees: 25
  },
  {
    id: '4',
    title: 'Student Council Meeting',
    description: 'Monthly planning session',
    date: new Date(Date.now() + 259200000),
    time: '03:00 PM',
    location: 'Conference Room',
    type: 'meeting',
    attendees: 12
  },
  {
    id: '5',
    title: 'Sports Day',
    description: 'Annual inter-house sports competition',
    date: new Date(Date.now() + 604800000),
    time: '08:00 AM',
    location: 'Main Field',
    type: 'event',
    attendees: 500,
    isImportant: true
  },
  {
    id: '6',
    title: 'Independence Day',
    description: 'National holiday celebration',
    date: new Date(2024, 6, 4), // July 4th
    time: 'All Day',
    location: 'Nationwide',
    type: 'event',
    isImportant: true
  },
  {
    id: '7',
    title: 'Mid-term Break',
    description: 'School holiday period',
    date: new Date(2024, 9, 15), // October 15th
    time: 'All Day',
    location: 'School Campus',
    type: 'event',
    isImportant: true
  },
  {
    id: '8',
    title: 'Graduation Ceremony',
    description: 'Annual graduation ceremony for seniors',
    date: new Date(2024, 11, 20), // December 20th
    time: '10:00 AM',
    location: 'Main Auditorium',
    type: 'event',
    attendees: 1000,
    isImportant: true
  }
];

const getEventTypeColor = (type: Event['type']) => {
  switch (type) {
    case 'exam': return 'bg-red-500';
    case 'assignment': return 'bg-orange-500';
    case 'class': return 'bg-blue-500';
    case 'meeting': return 'bg-green-500';
    case 'event': return 'bg-purple-500';
    default: return 'bg-gray-500';
  }
};

const getEventTypeBadge = (type: Event['type']) => {
  switch (type) {
    case 'exam': return 'destructive';
    case 'assignment': return 'secondary';
    case 'class': return 'default';
    case 'meeting': return 'outline';
    case 'event': return 'secondary';
    default: return 'default';
  }
};

const CalendarPage = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const { userName, photoUrl, userRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/login');
  };

  const getEventsForDate = (date: Date | undefined) => {
    if (!date) return [];
    return mockEvents.filter(event => isSameDay(event.date, date));
  };

  const getUpcomingEvents = () => {
    const now = new Date();
    return mockEvents
      .filter(event => event.date >= startOfDay(now))
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, 5);
  };

  const getEventsByFilter = () => {
    if (selectedFilter === 'all') return mockEvents;
    return mockEvents.filter(event => event.type === selectedFilter);
  };

  const getImportantDatesInMonth = (month: Date) => {
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    return mockEvents.filter(event => 
      event.isImportant && 
      isWithinInterval(event.date, { start, end })
    );
  };

  const handleDateClick = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      const eventForDate = getEventsForDate(date);
      if (eventForDate.length > 0) {
        // Scroll to events section or show details
        const eventsSection = document.getElementById('events-for-date');
        eventsSection?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const selectedDateEvents = getEventsForDate(selectedDate);
  const upcomingEvents = getUpcomingEvents();
  const filteredEvents = getEventsByFilter();
  const importantDatesThisMonth = getImportantDatesInMonth(currentMonth);

  const eventTypes = [
    { value: 'all', label: 'All Events', count: mockEvents.length },
    { value: 'exam', label: 'Exams', count: mockEvents.filter(e => e.type === 'exam').length },
    { value: 'assignment', label: 'Assignments', count: mockEvents.filter(e => e.type === 'assignment').length },
    { value: 'class', label: 'Classes', count: mockEvents.filter(e => e.type === 'class').length },
    { value: 'meeting', label: 'Meetings', count: mockEvents.filter(e => e.type === 'meeting').length },
    { value: 'event', label: 'Events', count: mockEvents.filter(e => e.type === 'event').length }
  ];

  return (
    <DashboardLayout
      userRole={userRole}
      userName={userName || ''}
      photoUrl={photoUrl}
      onLogout={handleLogout}
    >
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col gap-4 px-2 md:px-0">
          <div className="text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-bold gradient-text">Academic Calendar</h1>
            <p className="text-muted-foreground text-sm md:text-base">
              Manage your schedule and never miss important dates
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 justify-center md:justify-end">
            <Button variant="outline" className="gap-2 w-full sm:w-auto">
              <Bell className="h-4 w-4" />
              Reminders
            </Button>
            <Button className="gap-2 w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              Add Event
            </Button>
          </div>
        </div>

        {/* Filter Tabs */}
        <Card className="animate-slide-in-right">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {eventTypes.map((type) => (
                <Button
                  key={type.value}
                  variant={selectedFilter === type.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedFilter(type.value)}
                  className="gap-2"
                >
                  {type.label}
                  <Badge variant="secondary" className="ml-1">
                    {type.count}
                  </Badge>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Calendar Section - Full Width with Better Spacing */}
        <div className="space-y-6">
          {/* Calendar Widget - Centered with Proper Spacing */}
          <Card className="animate-scale-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5" />
                Calendar
              </CardTitle>
              <CardDescription>
                Select a date to view events. Important dates are highlighted in red.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center p-6">
              <div className="w-full max-w-md">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateClick}
                  month={currentMonth}
                  onMonthChange={setCurrentMonth}
                  className="rounded-md border w-full"
                  modifiers={{
                    hasEvents: mockEvents.map(event => event.date),
                    important: mockEvents.filter(event => event.isImportant).map(event => event.date)
                  }}
                  modifiersClassNames={{
                    hasEvents: "bg-primary/20 text-primary font-medium relative",
                    important: "bg-destructive text-destructive-foreground font-bold ring-2 ring-destructive/50"
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Important Dates This Month */}
          <Card className="animate-slide-in-left">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Important Dates - {format(currentMonth, 'MMMM yyyy')}
              </CardTitle>
              <CardDescription>
                {importantDatesThisMonth.length} important event{importantDatesThisMonth.length !== 1 ? 's' : ''} this month
              </CardDescription>
            </CardHeader>
            <CardContent>
              {importantDatesThisMonth.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  <CalendarDays className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No important dates this month</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {importantDatesThisMonth.map((event) => (
                    <div
                      key={event.id}
                      onClick={() => handleDateClick(event.date)}
                      className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer hover-scale"
                    >
                      <div className={`w-2 h-2 rounded-full mt-2 ${getEventTypeColor(event.type)}`} />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm line-clamp-1">{event.title}</h4>
                        <p className="text-xs text-muted-foreground line-clamp-1">{event.description}</p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <span>{format(event.date, 'MMM d')}</span>
                          <span>•</span>
                          <span>{event.time}</span>
                        </div>
                      </div>
                      <Badge variant="destructive" className="text-xs">
                        Important
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Events for Selected Date */}
        <Card className="animate-slide-in-right" id="events-for-date">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              {selectedDate ? format(selectedDate, 'EEEE, MMMM d, yyyy') : 'Select a Date'}
            </CardTitle>
            <CardDescription>
              {selectedDateEvents.length} event{selectedDateEvents.length !== 1 ? 's' : ''} scheduled
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedDateEvents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CalendarDays className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No events scheduled for this date</p>
              </div>
            ) : (
              <div className="space-y-4">
                {selectedDateEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className={`w-3 h-3 rounded-full mt-2 ${getEventTypeColor(event.type)}`} />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold flex items-center gap-2">
                            {event.title}
                            {event.isImportant && (
                              <Badge variant="destructive" className="text-xs">
                                Important
                              </Badge>
                            )}
                          </h4>
                          <p className="text-sm text-muted-foreground">{event.description}</p>
                        </div>
                        <Badge variant={getEventTypeBadge(event.type)}>
                          {event.type}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {event.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {event.location}
                        </span>
                        {event.attendees && (
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {event.attendees} attendees
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Upcoming Events
            </CardTitle>
            <CardDescription>
              Your next {upcomingEvents.length} events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className="p-4 border rounded-lg hover:bg-muted/50 transition-colors hover-scale"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <h4 className="font-semibold line-clamp-2">{event.title}</h4>
                      <Badge variant={getEventTypeBadge(event.type)} className="ml-2">
                        {event.type}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {event.description}
                    </p>
                    
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <CalendarDays className="h-3 w-3" />
                        {format(event.date, 'MMM d, yyyy')}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {event.time}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {event.location}
                      </div>
                    </div>
                    
                    {event.isImportant && (
                      <Badge variant="destructive" className="text-xs">
                        High Priority
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CalendarPage;