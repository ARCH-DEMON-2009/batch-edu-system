
import { createContext, useContext, useState, ReactNode } from 'react';

export interface Lecture {
  id: string;
  title: string;
  videoUrl: string;
  videoType: 'youtube' | 'direct';
  dppUrl?: string;
  notesUrl?: string;
  createdAt: Date;
  uploadedBy: string;
}

export interface Chapter {
  id: string;
  title: string;
  lectures: Lecture[];
  order: number;
}

export interface Subject {
  id: string;
  name: string;
  chapters: Chapter[];
  color: string;
}

export interface Batch {
  id: string;
  name: string;
  description: string;
  subjects: Subject[];
  assignedUploaders: string[];
}

export interface LiveClass {
  id: string;
  title: string;
  batchId: string;
  subjectId: string;
  chapterId: string;
  liveUrl: string;
  scheduledAt: Date;
  status: 'scheduled' | 'live' | 'completed';
}

interface DataContextType {
  batches: Batch[];
  liveClasses: LiveClass[];
  addBatch: (batch: Omit<Batch, 'id'>) => void;
  updateBatch: (id: string, batch: Partial<Batch>) => void;
  deleteBatch: (id: string) => void;
  addSubject: (batchId: string, subject: Omit<Subject, 'id'>) => void;
  addChapter: (batchId: string, subjectId: string, chapter: Omit<Chapter, 'id'>) => void;
  addLecture: (batchId: string, subjectId: string, chapterId: string, lecture: Omit<Lecture, 'id'>) => void;
  addLiveClass: (liveClass: Omit<LiveClass, 'id'>) => void;
  updateLiveClassStatus: (id: string, status: LiveClass['status']) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

const generateId = () => Math.random().toString(36).substr(2, 9);

const sampleBatches: Batch[] = [
  {
    id: '1',
    name: 'NEET 2024-25',
    description: 'Complete NEET preparation course with Physics, Chemistry, and Biology',
    assignedUploaders: ['3'],
    subjects: [
      {
        id: '1',
        name: 'Physics',
        color: 'bg-blue-500',
        chapters: [
          {
            id: '1',
            title: 'Mechanics',
            order: 1,
            lectures: [
              {
                id: '1',
                title: 'Introduction to Motion',
                videoUrl: 'https://youtu.be/we9EIFANP44',
                videoType: 'youtube',
                dppUrl: 'https://static.pw.live/sample-dpp.pdf',
                notesUrl: 'https://d2bps9p1kiy4ka.cloudfront.net/sample-notes.pdf',
                createdAt: new Date(),
                uploadedBy: 'uploader@example.com'
              }
            ]
          }
        ]
      },
      {
        id: '2',
        name: 'Chemistry',
        color: 'bg-green-500',
        chapters: []
      }
    ]
  },
  {
    id: '2',
    name: 'JEE Main 2024-25',
    description: 'Comprehensive JEE Main preparation with Mathematics, Physics, and Chemistry',
    assignedUploaders: ['3'],
    subjects: [
      {
        id: '3',
        name: 'Mathematics',
        color: 'bg-purple-500',
        chapters: []
      }
    ]
  }
];

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [batches, setBatches] = useState<Batch[]>(sampleBatches);
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>([]);

  const addBatch = (batch: Omit<Batch, 'id'>) => {
    const newBatch = { ...batch, id: generateId() };
    setBatches(prev => [...prev, newBatch]);
  };

  const updateBatch = (id: string, updatedBatch: Partial<Batch>) => {
    setBatches(prev => prev.map(batch => 
      batch.id === id ? { ...batch, ...updatedBatch } : batch
    ));
  };

  const deleteBatch = (id: string) => {
    setBatches(prev => prev.filter(batch => batch.id !== id));
  };

  const addSubject = (batchId: string, subject: Omit<Subject, 'id'>) => {
    const newSubject = { ...subject, id: generateId() };
    setBatches(prev => prev.map(batch => 
      batch.id === batchId 
        ? { ...batch, subjects: [...batch.subjects, newSubject] }
        : batch
    ));
  };

  const addChapter = (batchId: string, subjectId: string, chapter: Omit<Chapter, 'id'>) => {
    const newChapter = { ...chapter, id: generateId() };
    setBatches(prev => prev.map(batch => 
      batch.id === batchId 
        ? {
            ...batch,
            subjects: batch.subjects.map(subject =>
              subject.id === subjectId
                ? { ...subject, chapters: [...subject.chapters, newChapter] }
                : subject
            )
          }
        : batch
    ));
  };

  const addLecture = (batchId: string, subjectId: string, chapterId: string, lecture: Omit<Lecture, 'id'>) => {
    const newLecture = { ...lecture, id: generateId() };
    setBatches(prev => prev.map(batch => 
      batch.id === batchId 
        ? {
            ...batch,
            subjects: batch.subjects.map(subject =>
              subject.id === subjectId
                ? {
                    ...subject,
                    chapters: subject.chapters.map(chapter =>
                      chapter.id === chapterId
                        ? { ...chapter, lectures: [...chapter.lectures, newLecture] }
                        : chapter
                    )
                  }
                : subject
            )
          }
        : batch
    ));
  };

  const addLiveClass = (liveClass: Omit<LiveClass, 'id'>) => {
    const newLiveClass = { ...liveClass, id: generateId() };
    setLiveClasses(prev => [...prev, newLiveClass]);
  };

  const updateLiveClassStatus = (id: string, status: LiveClass['status']) => {
    setLiveClasses(prev => prev.map(liveClass => 
      liveClass.id === id ? { ...liveClass, status } : liveClass
    ));
  };

  const value = {
    batches,
    liveClasses,
    addBatch,
    updateBatch,
    deleteBatch,
    addSubject,
    addChapter,
    addLecture,
    addLiveClass,
    updateLiveClassStatus
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
