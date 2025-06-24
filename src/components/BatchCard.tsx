
import { Link } from 'react-router-dom';
import { Users, BookOpen, Play, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface BatchCardProps {
  batch: {
    id: string;
    name: string;
    description: string;
    subjects: Array<{
      id: string;
      name: string;
      color: string;
      chapters: Array<{
        lectures: any[];
      }>;
    }>;
  };
}

const BatchCard = ({ batch }: BatchCardProps) => {
  const totalChapters = batch.subjects.reduce((acc, subject) => acc + subject.chapters.length, 0);
  const totalLectures = batch.subjects.reduce((acc, subject) => 
    acc + subject.chapters.reduce((chapterAcc, chapter) => chapterAcc + chapter.lectures.length, 0), 0
  );

  return (
    <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg group overflow-hidden">
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
        <CardTitle className="text-xl font-bold mb-2 relative z-10">
          {batch.name}
        </CardTitle>
        <CardDescription className="text-blue-100 relative z-10">
          {batch.description}
        </CardDescription>
      </div>
      
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
              {batch.subjects.slice(0, 3).map((subject) => (
                <Badge
                  key={subject.id}
                  className={`${subject.color} text-white border-0`}
                >
                  {subject.name}
                </Badge>
              ))}
              {batch.subjects.length > 3 && (
                <Badge variant="secondary">
                  +{batch.subjects.length - 3} more
                </Badge>
              )}
            </div>
          </div>

          <Link to={`/batch/${batch.id}`}>
            <Button className="w-full mt-6 bg-blue-600 hover:bg-blue-700 group">
              Explore Batch
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default BatchCard;
