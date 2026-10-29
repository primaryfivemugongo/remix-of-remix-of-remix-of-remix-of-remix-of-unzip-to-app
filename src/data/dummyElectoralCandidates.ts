export interface DummyCandidate {
  id: string;
  student_name: string;
  student_email: string;
  student_photo: string | null;
  position: string;
  class_name: string;
  stream_name: string;
  sex: string;
  status: string;
}

export const dummyCandidates: DummyCandidate[] = [];
