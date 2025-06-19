
import { useState } from 'react';
import { Plus, Calendar, Clock, Users, Play, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const LiveClassManagement = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newLiveClass, setNewLiveClass] = useState({
    title: '',
    batchId: '',
    subjectId: '',
    chapterId: '',
    liveUrl: '',
    scheduledAt: ''
  });
  
  const { batches, liveClasses, addLiveClass, updateLiveClassStatus } = useData();
  const { user } = useAuth();
  const { toast } = useToast();

  const getBatchName = (batchId: string) => {
    const batch = batches.find(b => b.id === batchId);
    return batch?.name || 'Unknown Batch';
  };

  const getSubjectName = (batchId: string, subjectId: string) => {
    const batch = batches.find(b => b.id === batchId);
    const subject = batch?.subjects.find(s => s.id === subjectId);
    return subject?.name || 'Unknown Subject';
  };

  const getChapterName = (batchId: string, subjectId: string, chapterId: string) => {
    const batch = batches.find(b => b.id === batchId);
    const subject = batch?.subjects.find(s => s.id === subjectId);
    const chapter = subject?.chapters.find(c => c.id === chapterId);
    return chapter?.title || 'Unknown Chapter';
  };

  const getAvailableSubjects = (batchId: string) => {
    const batch = batches.find(b => b.id === batchId);
    return batch?.subjects || [];
  };

  const getAvailableChapters = (batchId: string, subjectId: string) => {
    const batch = batches.find(b => b.id === batchId);
    const subject = batch?.subjects.find(s => s.id === subjectId);
    return subject?.chapters || [];
  };

  const handleCreateLiveClass = () => {
    if (!newLiveClass.title.trim() || !newLiveClass.batchId || !newLiveClass.subjectId || 
        !newLiveClass.chapterId || !newLiveClass.liveUrl.trim() || !newLiveClass.scheduledAt) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    addLiveClass({
      title: newLiveClass.title,
      batchId: newLiveClass.batchId,
      subjectId: newLiveClass.subjectId,
      chapterId: newLiveClass.chapterId,
      liveUrl: newLiveClass.liveUrl,
      scheduledAt: new Date(newLiveClass.scheduledAt),
      status: 'scheduled'
    });

    toast({
      title: "Live Class Scheduled",
      description: `${newLiveClass.title} has been scheduled successfully.`,
    });

    setNewLiveClass({
      title: '',
      batchId: '',
      subjectId: '',
      chapterId: '',
      liveUrl: '',
      scheduledAt: ''
    });
    setIsCreateDialogOpen(false);
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
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Live Class Management</h2>
          <p className="text-gray-600">Schedule and manage live interactive sessions</p>
        </div>

        {(user?.role === 'super_admin' || user?.role === 'admin') && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Schedule Live Class
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Schedule New Live Class</DialogTitle>
                <DialogDescription>
                  Create a new live class session for students.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="live-title">Class Title</Label>
                  <Input
                    id="live-title"
                    placeholder="e.g., Physics Live Session - Mechanics"
                    value={newLiveClass.title}
                    onChange={(e) => setNewLiveClass({ ...newLiveClass, title: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="batch-select">Select Batch</Label>
                  <Select value={newLiveClass.batchId} onValueChange={(value) => 
                    setNewLiveClass({ ...newLiveClass, batchId: value, subjectId: '', chapterId: '' })
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a batch" />
                    </SelectTrigger>
                    <SelectContent>
                      {batches.map((batch) => (
                        <SelectItem key={batch.id} value={batch.id}>
                          {batch.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {newLiveClass.batchId && (
                  <div>
                    <Label htmlFor="subject-select">Select Subject</Label>
                    <Select value={newLiveClass.subjectId} onValueChange={(value) => 
                      setNewLiveClass({ ...newLiveClass, subjectId: value, chapterId: '' })
                    }>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {getAvailableSubjects(newLiveClass.batchId).map((subject) => (
                          <SelectItem key={subject.id} value={subject.id}>
                            {subject.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {newLiveClass.subjectId && (
                  <div>
                    <Label htmlFor="chapter-select">Select Chapter</Label>
                    <Select value={newLiveClass.chapterId} onValueChange={(value) => 
                      setNewLiveClass({ ...newLiveClass, chapterId: value })
                    }>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a chapter" />
                      </SelectTrigger>
                      <SelectContent>
                        {getAvailableChapters(newLiveClass.batchId, newLiveClass.subjectId).map((chapter) => (
                          <SelectItem key={chapter.id} value={chapter.id}>
                            {chapter.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <Label htmlFor="live-url">Live Stream URL</Label>
                  <Input
                    id="live-url"
                    placeholder="https://live-server.example.com/..."
                    value={newLiveClass.liveUrl}
                    onChange={(e) => setNewLiveClass({ ...newLiveClass, liveUrl: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="scheduled-time">Scheduled Date & Time</Label>
                  <Input
                    id="scheduled-time"
                    type="datetime-local"
                    value={newLiveClass.scheduledAt}
                    onChange={(e) => setNewLiveClass({ ...newLiveClass, scheduledAt: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateLiveClass}>Schedule Class</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {liveClasses.map((liveClass) => (
          <Card key={liveClass.id} className="hover:shadow-lg transition-shadow">
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
              <CardTitle className="text-lg">{liveClass.title}</CardTitle>
              <CardDescription>
                {getBatchName(liveClass.batchId)} • {getSubjectName(liveClass.batchId, liveClass.subjectId)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span className="text-sm">{formatDate(liveClass.scheduledAt)}</span>
                </div>

                <div className="text-sm text-gray-600">
                  <strong>Chapter:</strong> {getChapterName(liveClass.batchId, liveClass.subjectId, liveClass.chapterId)}
                </div>

                <div className="flex gap-2 pt-2">
                  {liveClass.status === 'scheduled' && (
                    <Button
                      size="sm"
                      onClick={() => updateLiveClassStatus(liveClass.id, 'live')}
                      className="flex-1"
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Start Live
                    </Button>
                  )}

                  {liveClass.status === 'live' && (
                    <Button
                      size="sm"
                      onClick={() => updateLiveClassStatus(liveClass.id, 'completed')}
                      variant="outline"
                      className="flex-1"
                    >
                      End Class
                    </Button>
                  )}

                  {liveClass.status === 'completed' && (
                    <Button size="sm" disabled className="flex-1">
                      Completed
                    </Button>
                  )}
                </div>

                {liveClass.status === 'live' && (
                  <a
                    href={liveClass.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Button size="sm" className="w-full bg-red-600 hover:bg-red-700">
                      Join Live Stream
                    </Button>
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {liveClasses.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No Live Classes Scheduled</h3>
          <p className="text-gray-500">Schedule your first live class to get started.</p>
        </div>
      )}
    </div>
  );
};

export default LiveClassManagement;
