
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Lecture {
  id: string;
  title: string;
  videoUrl: string;
  videoType: 'youtube' | 'direct' | 'live';
  notesUrl?: string;
  dppUrl?: string;
  uploadedBy: string;
}

export interface Chapter {
  id: string;
  title: string;
  orderIndex: number;
  lectures: Lecture[];
}

export interface Subject {
  id: string;
  name: string;
  color: string;
  chapters: Chapter[];
}

export interface Batch {
  id: string;
  name: string;
  description: string;
  subjects: Subject[];
}

export interface LiveClass {
  id: string;
  title: string;
  batchId: string;
  subjectId: string;
  chapterId: string;
  scheduledAt: Date;
  liveUrl: string;
  status: 'scheduled' | 'live' | 'completed';
}

interface DataContextType {
  batches: Batch[];
  liveClasses: LiveClass[];
  loading: boolean;
  addBatch: (batch: { name: string; description: string }) => void;
  updateBatch: (id: string, updates: Partial<Batch>) => void;
  deleteBatch: (id: string) => void;
  addSubject: (batchId: string, subject: { name: string; color: string }) => void;
  updateSubject: (batchId: string, subjectId: string, updates: Partial<Subject>) => void;
  deleteSubject: (batchId: string, subjectId: string) => void;
  addChapter: (batchId: string, subjectId: string, chapter: { title: string }) => void;
  updateChapter: (batchId: string, subjectId: string, chapterId: string, updates: Partial<Chapter>) => void;
  deleteChapter: (batchId: string, subjectId: string, chapterId: string) => void;
  addLecture: (batchId: string, subjectId: string, chapterId: string, lecture: Omit<Lecture, 'id'>) => void;
  updateLecture: (batchId: string, subjectId: string, chapterId: string, lectureId: string, updates: Partial<Lecture>) => void;
  deleteLecture: (batchId: string, subjectId: string, chapterId: string, lectureId: string) => void;
  addLiveClass: (liveClass: Omit<LiveClass, 'id'>) => void;
  updateLiveClass: (id: string, updates: Partial<LiveClass>) => void;
  deleteLiveClass: (id: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

// Sample data
const sampleBatches: Batch[] = [
  {
    id: '1',
    name: 'NEET 2024-25',
    description: 'Complete NEET preparation with Physics, Chemistry, and Biology',
    subjects: [
      {
        id: '1',
        name: 'Physics',
        color: 'bg-blue-500',
        chapters: [
          {
            id: '1',
            title: 'Mechanics',
            orderIndex: 1,
            lectures: [
              {
                id: '1',
                title: 'Introduction to Motion',
                videoUrl: 'https://youtu.be/we9EIFANP44',
                videoType: 'youtube',
                notesUrl: 'https://d2bps9p1kiy4ka.cloudfront.net/sample-notes.pdf',
                dppUrl: 'https://static.pw.live/sample-dpp.pdf',
                uploadedBy: 'admin@example.com'
              }
            ]
          }
        ]
      },
      {
        id: '2',
        name: 'Chemistry',
        color: 'bg-green-500',
        chapters: [
          {
            id: '2',
            title: 'Organic Chemistry',
            orderIndex: 1,
            lectures: [
              {
                id: '2',
                title: 'Basic Organic Chemistry',
                videoUrl: 'https://www.tgxdl2.workers.dev/v3/0:/stream/sample-video.mp4',
                videoType: 'direct',
                uploadedBy: 'uploader@example.com'
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: '2',
    name: 'JEE Main 2024-25',
    description: 'Complete JEE Main preparation',
    subjects: [
      {
        id: '3',
        name: 'Mathematics',
        color: 'bg-purple-500',
        chapters: [
          {
            id: '3',
            title: 'Calculus',
            orderIndex: 1,
            lectures: [
              {
                id: '3',
                title: 'Limits and Derivatives',
                videoUrl: 'https://youtu.be/sample-math-video',
                videoType: 'youtube',
                uploadedBy: 'admin@example.com'
              }
            ]
          }
        ]
      }
    ]
  }
];

const sampleLiveClasses: LiveClass[] = [
  {
    id: '1',
    title: 'Live Physics Doubt Session',
    batchId: '1',
    subjectId: '1',
    chapterId: '1',
    scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    liveUrl: 'https://live-server.dev-boi.xyz/pw/live?session=physics-doubt',
    status: 'scheduled'
  }
];

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider = ({ children }: DataProviderProps) => {
  const [batches, setBatches] = useState<Batch[]>(sampleBatches);
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>(sampleLiveClasses);
  const [loading, setLoading] = useState(false);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const addBatch = (batchData: { name: string; description: string }) => {
    const newBatch: Batch = {
      id: generateId(),
      name: batchData.name,
      description: batchData.description,
      subjects: []
    };
    setBatches(prev => [...prev, newBatch]);
  };

  const updateBatch = (id: string, updates: Partial<Batch>) => {
    setBatches(prev => prev.map(batch => 
      batch.id === id ? { ...batch, ...updates } : batch
    ));
  };

  const deleteBatch = (id: string) => {
    setBatches(prev => prev.filter(batch => batch.id !== id));
  };

  const addSubject = (batchId: string, subjectData: { name: string; color: string }) => {
    const newSubject: Subject = {
      id: generateId(),
      name: subjectData.name,
      color: subjectData.color,
      chapters: []
    };
    
    setBatches(prev => prev.map(batch => 
      batch.id === batchId 
        ? { ...batch, subjects: [...batch.subjects, newSubject] }
        : batch
    ));
  };

  const updateSubject = (batchId: string, subjectId: string, updates: Partial<Subject>) => {
    setBatches(prev => prev.map(batch => 
      batch.id === batchId 
        ? {
            ...batch,
            subjects: batch.subjects.map(subject =>
              subject.id === subjectId ? { ...subject, ...updates } : subject
            )
          }
        : batch
    ));
  };

  const deleteSubject = (batchId: string, subjectId: string) => {
    setBatches(prev => prev.map(batch => 
      batch.id === batchId 
        ? {
            ...batch,
            subjects: batch.subjects.filter(subject => subject.id !== subjectId)
          }
        : batch
    ));
  };

  const addChapter = (batchId: string, subjectId: string, chapterData: { title: string }) => {
    const newChapter: Chapter = {
      id: generateId(),
      title: chapterData.title,
      orderIndex: 1,
      lectures: []
    };
    
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

  const updateChapter = (batchId: string, subjectId: string, chapterId: string, updates: Partial<Chapter>) => {
    setBatches(prev => prev.map(batch => 
      batch.id === batchId 
        ? {
            ...batch,
            subjects: batch.subjects.map(subject =>
              subject.id === subjectId 
                ? {
                    ...subject,
                    chapters: subject.chapters.map(chapter =>
                      chapter.id === chapterId ? { ...chapter, ...updates } : chapter
                    )
                  }
                : subject
            )
          }
        : batch
    ));
  };

  const deleteChapter = (batchId: string, subjectId: string, chapterId: string) => {
    setBatches(prev => prev.map(batch => 
      batch.id === batchId 
        ? {
            ...batch,
            subjects: batch.subjects.map(subject =>
              subject.id === subjectId 
                ? {
                    ...subject,
                    chapters: subject.chapters.filter(chapter => chapter.id !== chapterId)
                  }
                : subject
            )
          }
        : batch
    ));
  };

  const addLecture = (batchId: string, subjectId: string, chapterId: string, lectureData: Omit<Lecture, 'id'>) => {
    const newLecture: Lecture = {
      id: generateId(),
      ...lectureData
    };
    
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

  const updateLecture = (batchId: string, subjectId: string, chapterId: string, lectureId: string, updates: Partial<Lecture>) => {
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
                        ? {
                            ...chapter,
                            lectures: chapter.lectures.map(lecture =>
                              lecture.id === lectureId ? { ...lecture, ...updates } : lecture
                            )
                          }
                        : chapter
                    )
                  }
                : subject
            )
          }
        : batch
    ));
  };

  const deleteLecture = (batchId: string, subjectId: string, chapterId: string, lectureId: string) => {
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
                        ? {
                            ...chapter,
                            lectures: chapter.lectures.filter(lecture => lecture.id !== lectureId)
                          }
                        : chapter
                    )
                  }
                : subject
            )
          }
        : batch
    ));
  };

  const addLiveClass = (liveClassData: Omit<LiveClass, 'id'>) => {
    const newLiveClass: LiveClass = {
      id: generateId(),
      ...liveClassData
    };
    setLiveClasses(prev => [...prev, newLiveClass]);
  };

  const updateLiveClass = (id: string, updates: Partial<LiveClass>) => {
    setLiveClasses(prev => prev.map(liveClass => 
      liveClass.id === id ? { ...liveClass, ...updates } : liveClass
    ));
  };

  const deleteLiveClass = (id: string) => {
    setLiveClasses(prev => prev.filter(liveClass => liveClass.id !== id));
  };

  const value = {
    batches,
    liveClasses,
    loading,
    addBatch,
    updateBatch,
    deleteBatch,
    addSubject,
    updateSubject,
    deleteSubject,
    addChapter,
    updateChapter,
    deleteChapter,
    addLecture,
    updateLecture,
    deleteLecture,
    addLiveClass,
    updateLiveClass,
    deleteLiveClass
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
