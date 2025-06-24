import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, Play, FileText, Download, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useData } from '@/contexts/DataContext';
import Navbar from '@/components/Navbar';

const BatchDetailPage = () => {
  const { batchId } = useParams();
  const { batches } = useData();
  const [selectedLecture, setSelectedLecture] = useState<any>(null);

  const batch = batches.find(b => b.id === batchId);

  if (!batch) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Batch Not Found</h1>
            <Link to="/batches">
              <Button>Back to Batches</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const getYouTubeEmbedUrl = (url: string) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link to="/batches" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Batches
          </Link>
          
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{batch.name}</h1>
            <p className="text-gray-600 text-lg">{batch.description}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Content Area */}
          <div className="lg:col-span-2">
            {selectedLecture ? (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Play className="h-5 w-5" />
                    {selectedLecture.title}
                  </CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setSelectedLecture(null)}
                    className="w-fit"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Course Content
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Video Player */}
                    <div className="aspect-video bg-black rounded-lg overflow-hidden">
                      {selectedLecture.video_type === 'youtube' ? (
                        <iframe
                          src={getYouTubeEmbedUrl(selectedLecture.video_url) || ''}
                          className="w-full h-full"
                          frameBorder="0"
                          allowFullScreen
                          title={selectedLecture.title}
                        />
                      ) : (
                        <video
                          src={selectedLecture.video_url}
                          controls
                          className="w-full h-full"
                          title={selectedLecture.title}
                        />
                      )}
                    </div>

                    {/* Resources */}
                    <div className="flex flex-wrap gap-4">
                      {selectedLecture.notes_url && (
                        <a
                          href={selectedLecture.notes_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                        >
                          <FileText className="h-4 w-4" />
                          Download Notes
                        </a>
                      )}
                      {selectedLecture.dpp_url && (
                        <a
                          href={selectedLecture.dpp_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                        >
                          <Download className="h-4 w-4" />
                          Download DPP
                        </a>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Course Content
                  </CardTitle>
                  <CardDescription>
                    Explore subjects, chapters, and lectures in this batch
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue={batch.subjects[0]?.id} className="w-full">
                    <TabsList className="grid w-full grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mb-6">
                      {batch.subjects.map((subject) => (
                        <TabsTrigger key={subject.id} value={subject.id} className="text-sm">
                          {subject.name}
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    {batch.subjects.map((subject) => (
                      <TabsContent key={subject.id} value={subject.id}>
                        <div className={`p-4 rounded-lg mb-4 ${subject.color} text-white`}>
                          <h3 className="text-xl font-semibold">{subject.name}</h3>
                          <p className="text-sm opacity-90">
                            {subject.chapters.length} chapters • {' '}
                            {subject.chapters.reduce((acc, chapter) => acc + chapter.lectures.length, 0)} lectures
                          </p>
                        </div>

                        {subject.chapters.length > 0 ? (
                          <Accordion type="single" collapsible className="w-full">
                            {subject.chapters.map((chapter) => (
                              <AccordionItem key={chapter.id} value={chapter.id}>
                                <AccordionTrigger className="text-left">
                                  <div className="flex items-center gap-2">
                                    <BookOpen className="h-4 w-4" />
                                    <span>{chapter.title}</span>
                                    <span className="text-sm text-gray-500">
                                      ({chapter.lectures.length} lectures)
                                    </span>
                                  </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                  <div className="space-y-2 pl-6">
                                    {chapter.lectures.map((lecture) => (
                                      <div
                                        key={lecture.id}
                                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                                        onClick={() => setSelectedLecture(lecture)}
                                      >
                                        <div className="flex items-center gap-2">
                                          <Play className="h-4 w-4 text-blue-600" />
                                          <span className="font-medium">{lecture.title}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          {lecture.notes_url && (
                                            <FileText className="h-4 w-4 text-green-600" />
                                          )}
                                          {lecture.dpp_url && (
                                            <Download className="h-4 w-4 text-blue-600" />
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            ))}
                          </Accordion>
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
                            <p>No chapters available for this subject yet.</p>
                          </div>
                        )}
                      </TabsContent>
                    ))}
                  </Tabs>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg">Batch Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {batch.subjects.length}
                    </div>
                    <div className="text-sm text-gray-600">Subjects</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {batch.subjects.reduce((acc, subject) => acc + subject.chapters.length, 0)}
                    </div>
                    <div className="text-sm text-gray-600">Chapters</div>
                  </div>
                </div>

                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {batch.subjects.reduce((acc, subject) => 
                      acc + subject.chapters.reduce((chapterAcc, chapter) => chapterAcc + chapter.lectures.length, 0), 0
                    )}
                  </div>
                  <div className="text-sm text-gray-600">Total Lectures</div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-2">Subjects in this batch:</h4>
                  <div className="space-y-2">
                    {batch.subjects.map((subject) => (
                      <div key={subject.id} className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${subject.color}`}></div>
                        <span className="text-sm">{subject.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatchDetailPage;
