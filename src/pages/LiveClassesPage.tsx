
import { useState } from 'react';
import { Calendar, Clock, Users, Play, Search, Filter } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useData } from '@/contexts/DataContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const LiveClassesPage = () => {
  const { liveClasses, batches } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

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

  const filteredClasses = liveClasses.filter(liveClass => {
    const matchesSearch = liveClass.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         getBatchName(liveClass.batch_id).toLowerCase().includes(searchTerm.toLowerCase()) ||
                         getSubjectName(liveClass.batch_id, liveClass.subject_id).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || liveClass.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-600 to-purple-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Live Classes</h1>
            <p className="text-xl text-purple-100 max-w-2xl mx-auto">
              Join interactive live sessions with expert instructors and connect with fellow learners
            </p>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search live classes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Classes</option>
                  <option value="live">Live Now</option>
                  <option value="scheduled">Upcoming</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div className="text-sm text-gray-600">
                {filteredClasses.length} class{filteredClasses.length !== 1 ? 'es' : ''}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Classes Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredClasses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredClasses.map((liveClass) => (
                <Card key={liveClass.id} className="hover:shadow-xl transition-all duration-300 group">
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
                    <CardTitle className="text-xl group-hover:text-purple-600 transition-colors">
                      {liveClass.title}
                    </CardTitle>
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
                          <Button className="w-full bg-red-600 hover:bg-red-700 group">
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
              {searchTerm || statusFilter !== 'all' ? (
                <>
                  <h3 className="text-2xl font-semibold text-gray-600 mb-4">No classes found</h3>
                  <p className="text-gray-500 text-lg mb-6">
                    No classes match your current filters
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button onClick={() => setSearchTerm('')} variant="outline">
                      Clear Search
                    </Button>
                    <Button onClick={() => setStatusFilter('all')} variant="outline">
                      Show All Classes
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-2xl font-semibold text-gray-600 mb-4">No Live Classes Scheduled</h3>
                  <p className="text-gray-500 text-lg">
                    Live classes will appear here when they are scheduled by instructors
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LiveClassesPage;
