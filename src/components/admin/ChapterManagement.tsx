import { useState } from 'react';
import { ArrowLeft, Plus, Play, FileText, Download, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useData, Batch, Subject, Chapter } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface ChapterManagementProps {
  batch: Batch;
  subject: Subject;
  onBack: () => void;
}

const ChapterManagement = ({ batch, subject, onBack }: ChapterManagementProps) => {
  const [isCreateChapterDialogOpen, setIsCreateChapterDialogOpen] = useState(false);
  const [isCreateLectureDialogOpen, setIsCreateLectureDialogOpen] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
  const [newChapter, setNewChapter] = useState({ title: '', order: 1 });
  const [newLecture, setNewLecture] = useState({
    title: '',
    videoUrl: '',
    videoType: 'youtube' as 'youtube' | 'direct',
    dppUrl: '',
    notesUrl: ''
  });

  const { addChapter, addLecture } = useData();
  const { user } = useAuth();
  const { toast } = useToast();

  const handleCreateChapter = () => {
    if (!newChapter.title.trim()) return;

    addChapter(batch.id, subject.id, {
      title: newChapter.title,
      order: newChapter.order,
      lectures: []
    });

    toast({
      title: "Chapter Created",
      description: `${newChapter.title} has been added to ${subject.name}.`,
    });

    setNewChapter({ title: '', order: 1 });
    setIsCreateChapterDialogOpen(false);
  };

  const handleCreateLecture = () => {
    if (!newLecture.title.trim() || !newLecture.videoUrl.trim() || !selectedChapter) return;

    addLecture(batch.id, subject.id, selectedChapter, {
      title: newLecture.title,
      videoUrl: newLecture.videoUrl,
      videoType: newLecture.videoType,
      dppUrl: newLecture.dppUrl || undefined,
      notesUrl: newLecture.notesUrl || undefined,
      createdAt: new Date(),
      uploadedBy: user?.email || 'Unknown'
    });

    toast({
      title: "Lecture Added",
      description: `${newLecture.title} has been added successfully.`,
    });

    setNewLecture({
      title: '',
      videoUrl: '',
      videoType: 'youtube',
      dppUrl: '',
      notesUrl: ''
    });
    setSelectedChapter(null);
    setIsCreateLectureDialogOpen(false);
  };

  const getVideoThumbnail = (url: string, type: 'youtube' | 'direct') => {
    if (type === 'youtube') {
      const videoId = url.match(/(?:youtu\.be\/|youtube\.com\/watch\?v=)([^&\n?#]+)/)?.[1];
      return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null;
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Subjects
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{subject.name}</h2>
            <p className="text-gray-600">Manage chapters and lectures</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Dialog open={isCreateChapterDialogOpen} onOpenChange={setIsCreateChapterDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Chapter
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Chapter</DialogTitle>
                <DialogDescription>
                  Add a new chapter to {subject.name}.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="chapter-title">Chapter Title</Label>
                  <Input
                    id="chapter-title"
                    placeholder="e.g., Laws of Motion"
                    value={newChapter.title}
                    onChange={(e) => setNewChapter({ ...newChapter, title: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="chapter-order">Order</Label>
                  <Input
                    id="chapter-order"
                    type="number"
                    min="1"
                    value={newChapter.order}
                    onChange={(e) => setNewChapter({ ...newChapter, order: parseInt(e.target.value) || 1 })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateChapterDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateChapter}>Add Chapter</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isCreateLectureDialogOpen} onOpenChange={setIsCreateLectureDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Lecture
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Lecture</DialogTitle>
                <DialogDescription>
                  Add a new lecture to a chapter in {subject.name}.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="lecture-chapter">Select Chapter</Label>
                  <Select value={selectedChapter || ''} onValueChange={setSelectedChapter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a chapter" />
                    </SelectTrigger>
                    <SelectContent>
                      {subject.chapters.map((chapter) => (
                        <SelectItem key={chapter.id} value={chapter.id}>
                          {chapter.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="lecture-title">Lecture Title</Label>
                  <Input
                    id="lecture-title"
                    placeholder="e.g., Introduction to Newton's Laws"
                    value={newLecture.title}
                    onChange={(e) => setNewLecture({ ...newLecture, title: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="video-type">Video Type</Label>
                  <Select value={newLecture.videoType} onValueChange={(value: 'youtube' | 'direct') => setNewLecture({ ...newLecture, videoType: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="youtube">YouTube</SelectItem>
                      <SelectItem value="direct">Direct Link</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="video-url">Video URL</Label>
                  <Input
                    id="video-url"
                    placeholder={newLecture.videoType === 'youtube' ? 'https://youtu.be/...' : 'https://example.com/video.mp4'}
                    value={newLecture.videoUrl}
                    onChange={(e) => setNewLecture({ ...newLecture, videoUrl: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="dpp-url">DPP URL (Optional)</Label>
                  <Input
                    id="dpp-url"
                    placeholder="https://static.pw.live/...pdf"
                    value={newLecture.dppUrl}
                    onChange={(e) => setNewLecture({ ...newLecture, dppUrl: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="notes-url">Notes URL (Optional)</Label>
                  <Input
                    id="notes-url"
                    placeholder="https://d2bps9p1kiy4ka.cloudfront.net/...pdf"
                    value={newLecture.notesUrl}
                    onChange={(e) => setNewLecture({ ...newLecture, notesUrl: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateLectureDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateLecture}>Add Lecture</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="space-y-6">
        {subject.chapters
          .sort((a, b) => a.order - b.order)
          .map((chapter) => (
            <Card key={chapter.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Chapter {chapter.order}: {chapter.title}</span>
                  <span className="text-sm font-normal text-gray-500">
                    {chapter.lectures.length} lectures
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {chapter.lectures.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {chapter.lectures.map((lecture) => {
                      const thumbnail = getVideoThumbnail(lecture.videoUrl, lecture.videoType);
                      
                      return (
                        <Card key={lecture.id} className="overflow-hidden">
                          {thumbnail && (
                            <div className="aspect-video bg-gray-100">
                              <img 
                                src={thumbnail} 
                                alt={lecture.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                }}
                              />
                            </div>
                          )}
                          <CardContent className="p-4">
                            <h4 className="font-medium mb-2 line-clamp-2">{lecture.title}</h4>
                            <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                              <Play className="h-3 w-3" />
                              <span>{lecture.videoType === 'youtube' ? 'YouTube' : 'Direct'}</span>
                            </div>
                            
                            <div className="flex gap-2">
                              <Button size="sm" className="flex-1">
                                <Play className="h-3 w-3 mr-1" />
                                Watch
                              </Button>
                              
                              {lecture.dppUrl && (
                                <Button size="sm" variant="outline">
                                  <FileText className="h-3 w-3" />
                                </Button>
                              )}
                              
                              {lecture.notesUrl && (
                                <Button size="sm" variant="outline">
                                  <Download className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Play className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No lectures added yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
      </div>

      {subject.chapters.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No Chapters Added</h3>
          <p className="text-gray-500">Add chapters to organize your lectures.</p>
        </div>
      )}
    </div>
  );
};

export default ChapterManagement;
