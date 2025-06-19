
import { Link } from 'react-router-dom';
import { Users, BookOpen, Play } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useData } from '@/contexts/DataContext';
import Navbar from '@/components/Navbar';

const BatchesPage = () => {
  const { batches } = useData();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">All Batches</h1>
          <p className="text-xl text-gray-600">
            Explore our comprehensive course offerings and find the perfect batch for your learning journey
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {batches.map((batch) => {
            const totalChapters = batch.subjects.reduce((acc, subject) => acc + subject.chapters.length, 0);
            const totalLectures = batch.subjects.reduce((acc, subject) => 
              acc + subject.chapters.reduce((chapterAcc, chapter) => chapterAcc + chapter.lectures.length, 0), 0
            );

            return (
              <Card key={batch.id} className="hover:shadow-lg transition-shadow duration-300 border-0 shadow-md">
                <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg">
                  <CardTitle className="text-xl font-bold">
                    {batch.name}
                  </CardTitle>
                  <CardDescription className="text-blue-100">
                    {batch.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center">
                        <BookOpen className="h-4 w-4 mr-2" />
                        {batch.subjects.length} Subjects
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2" />
                        {totalChapters} Chapters
                      </div>
                      <div className="flex items-center">
                        <Play className="h-4 w-4 mr-2" />
                        {totalLectures} Lectures
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-900">Subjects:</h4>
                      <div className="flex flex-wrap gap-2">
                        {batch.subjects.map((subject) => (
                          <span
                            key={subject.id}
                            className={`px-3 py-1 rounded-full text-xs font-medium text-white ${subject.color}`}
                          >
                            {subject.name}
                          </span>
                        ))}
                      </div>
                    </div>

                    <Link to={`/batch/${batch.id}`}>
                      <Button className="w-full mt-6 bg-blue-600 hover:bg-blue-700">
                        Explore Batch
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {batches.length === 0 && (
          <div className="text-center py-20">
            <BookOpen className="h-20 w-20 text-gray-300 mx-auto mb-6" />
            <h3 className="text-2xl font-semibold text-gray-600 mb-4">No Batches Available</h3>
            <p className="text-gray-500 text-lg">New batches will be added soon. Check back later!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BatchesPage;
