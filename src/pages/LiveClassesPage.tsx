
import { Calendar, Clock, Users, Play } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useData } from '@/contexts/DataContext';
import Navbar from '@/components/Navbar';

const LiveClassesPage = () => {
  const { liveClasses, batches } = useData();

  const getBatchName = (batchId: string) => {
    const batch = batches.find(b => b.id === batchId);
    return batch?.name || 'Unknown Batch';
  };

  const getSubjectName = (batchId: string, subjectId: string) => {
    const batch = batches.find(b => b.id === batchId);
    const subject = batch?.subjects.find(s => s.id === subjectId);
    return subject?.name || 'Unknown Subject';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live':
        return 'bg-red-500 text-white';
      case 'scheduled':
        return 'bg-blue-500 text-white';
      case 'completed':
        return 'bg-gray-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Live Classes</h1>
          <p className="text-xl text-gray-600">
            Join interactive live sessions with expert instructors
          </p>
        </div>

        {liveClasses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {liveClasses.map((liveClass) => (
              <Card key={liveClass.id} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={getStatusColor(liveClass.status)}>
                      {liveClass.status.toUpperCase()}
                    </Badge>
                    {liveClass.status === 'live' && (
                      <div className="flex items-center text-red-500">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></div>
                        LIVE
                      </div>
                    )}
                  </div>
                  <CardTitle className="text-xl">{liveClass.title}</CardTitle>
                  <CardDescription>
                    {getBatchName(liveClass.batch_id)} • {getSubjectName(liveClass.batch_id, liveClass.subject_id)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span className="text-sm">{formatDate(new Date(liveClass.scheduled_at))}</span>
                    </div>

                    {liveClass.status === 'live' && (
                      <a
                        href={liveClass.live_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button className="w-full bg-red-600 hover:bg-red-700">
                          <Play className="h-4 w-4 mr-2" />
                          Join Live Class
                        </Button>
                      </a>
                    )}

                    {liveClass.status === 'scheduled' && (
                      <Button className="w-full" disabled>
                        <Clock className="h-4 w-4 mr-2" />
                        Scheduled
                      </Button>
                    )}

                    {liveClass.status === 'completed' && (
                      <Button className="w-full" variant="outline" disabled>
                        Class Completed
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Calendar className="h-20 w-20 text-gray-300 mx-auto mb-6" />
            <h3 className="text-2xl font-semibold text-gray-600 mb-4">No Live Classes Scheduled</h3>
            <p className="text-gray-500 text-lg">
              Live classes will appear here when they are scheduled by instructors
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveClassesPage;
