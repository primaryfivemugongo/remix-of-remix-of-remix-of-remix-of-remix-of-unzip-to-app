import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Database } from "@/integrations/supabase/types";

type DbStudent = Database['public']['Tables']['students']['Row'];
type DbStream = Database['public']['Tables']['streams']['Row'];

export interface Student {
  id: string;
  name: string;
  student_id: string;
  grade: string;
  section: string;
  photo_url?: string;
  class_id?: string;
  stream_id?: string;
}

export interface Stream {
  id: string;
  name: string;
}

export interface AttendanceRecord {
  id?: string;
  student_id: string;
  stream_id: string;
  date: string;
  status: 'present' | 'absent';
  marked_at?: string;
  marked_by?: string;
}

export const useStudents = (streamId?: string) => {
  return useQuery({
    queryKey: ['students', streamId],
    queryFn: async () => {
      let query = supabase
        .from('students')
        .select(`
          *,
          class:classes(name),
          stream:streams(name)
        `)
        .order('name');

      if (streamId) {
        query = query.eq('stream_id', streamId);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Map database students to our Student interface
      const students: Student[] = (data as any[]).map((student: any) => ({
        id: student.id || '',
        name: student.name || '',
        student_id: student.id || '',
        grade: student.class?.name || student.class_id || '',
        section: student.stream?.name || student.stream_id || '',
        photo_url: student.photo_url || undefined,
        class_id: student.class_id || undefined,
        stream_id: student.stream_id || undefined
      }));

      return students;
    }
  });
};

export const useStreams = () => {
  return useQuery({
    queryKey: ['streams'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('streams')
        .select('*')
        .order('name');

      if (error) throw error;
      
      // Map database streams to our Stream interface
      const streams: Stream[] = (data as DbStream[]).map(stream => ({
        id: stream.id || '',
        name: stream.name || ''
      }));

      return streams;
    }
  });
};

export const useAttendanceRecords = (date: string, streamId: string) => {
  return useQuery({
    queryKey: ['attendance', date, streamId],
    queryFn: async () => {
      if (!streamId) return [];
      
      try {
        const { data, error } = await (supabase as any)
          .from('attendance_records')
          .select('*')
          .eq('date', date)
          .eq('stream_id', streamId);

        if (error) {
          console.error('Error fetching attendance:', error);
          return [];
        }
        
        return (data || []) as AttendanceRecord[];
      } catch (error) {
        console.error('Attendance table may not exist yet:', error);
        return [];
      }
    },
    enabled: !!streamId
  });
};

export const useSaveAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (records: AttendanceRecord[]) => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        const recordsWithUser = records.map(record => ({
          student_id: record.student_id,
          stream_id: record.stream_id,
          date: record.date,
          status: record.status,
          marked_by: user?.id
        }));

        const { error } = await (supabase as any)
          .from('attendance_records')
          .upsert(recordsWithUser, {
            onConflict: 'student_id,date'
          });

        if (error) throw error;
      } catch (error: any) {
        if (error.message?.includes('relation "public.attendance_records" does not exist')) {
          throw new Error('Attendance table not created yet. Please run the SQL script first.');
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      toast.success('Attendance saved successfully!');
    },
    onError: (error: any) => {
      toast.error('Failed to save attendance: ' + error.message);
    }
  });
};

export const useMarkAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      studentId, 
      streamId, 
      date, 
      status 
    }: { 
      studentId: string; 
      streamId: string; 
      date: string; 
      status: 'present' | 'absent' 
    }) => {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        const { error } = await (supabase as any)
          .from('attendance_records')
          .upsert({
            student_id: studentId,
            stream_id: streamId,
            date,
            status,
            marked_by: user?.id
          }, {
            onConflict: 'student_id,date'
          });

        if (error) throw error;
      } catch (error: any) {
        if (error.message?.includes('relation "public.attendance_records" does not exist')) {
          throw new Error('Attendance table not created yet. Please run the SQL script first.');
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    },
    onError: (error: any) => {
      toast.error('Failed to mark attendance: ' + error.message);
    }
  });
};
