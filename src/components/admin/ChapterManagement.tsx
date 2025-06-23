
import { useState } from 'react';
import { ArrowLeft, Plus, Play, FileText, Download, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabaseService, SupabaseBatch, SupabaseSubject } from '@/services/supabaseService';

interface ChapterManagementProps {
  batch: SupabaseBatch;
  subject: SupabaseSubject;
  onBack: () => void;
  onUpdate: () => void;
}

const ChapterManagement = ({ batch, subject, onBack, onUpdate }: ChapterManagementProps) => {
  const [isCreateChapterDialogOpen, setIsCreateChapterDialogOpen] = useState(false);
  const [isCreateLectureDialogOpen, setIsCreateLectureDialogOpen] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
  const [newChapter, setNewChapter] = useState({ title: '' });
  const [newLecture, setNewLecture] = useState({
    title: '',
    video_url: '',
    video_type: 'youtube' as 'youtube' | 'direct',
    dpp_url: '',
    notes_url: ''
  });

  const { user } = useAuth();
  const { toast } = useToast();

  const handleCreateChapter = async () => {
    if (!newChapter.title.trim()) return;

    try {
      await supabaseService.createChapter(subject.id, {
        title: newChapter.title
      });

      toast({
        title: "Chapter Created",
        description: `${newChapter.title} has been added to ${subject.name}.`,
      });

      setNewChapter({ title: '' });
      setIsCreateChapterDialogOpen(false);
      onUpdate();
    } catch (error) {
      console.error('Error creating chapter:', error);
      toast({
        title: "Error",
        description: "Failed to create chapter.",
        variant: "destructive",
      });
    }
  };

  const handleCreateLecture = async () => {
    if (!newLecture.title.trim() || !newLecture.video_url.trim() || !selectedChapter) return;

    try {
      await supabaseService.createLecture(selectedChapter, {
        title: newLecture.title,
        video_url: newLecture.video_url,
        video_type: newLecture.video_type,
        dpp_url: newLecture.dpp_url || undefined,
        notes_url: newLecture.notes_url || undefined,
        uploaded_by: user?.email || 'Unknown'
      });

      toast({
        title: "Lecture Added",
        description: `${newLecture.title} has been added successfully.`,
      });

      setNewLecture({
        title: '',
        video_url: '',
        video_type: 'youtube',
        dpp_url: '',
        notes_url: ''
      });
      setSelectedChapter(null);
      setIsCreateLectureDialogOpen(false);
      onUpdate();
    } catch (error) {
      console.error('Error creating lecture:', error);
      toast({
        title: "Error",
        description: "Failed to create lecture.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteChapter = async (chapterId: string, chapterTitle: string) => {
    if (confirm(`Are you sure you want to delete "${chapterTitle}"? This will also delete all lectures in this chapter.`)) {
      try {
        await supabaseService.deleteChapter(chapterId);
        toast({
          title: "Chapter Deleted",
          description: `${chapterTitle} has been deleted successfully.`,
        });
        onUpdate();
      } catch (error) {
        console.error('Error deleting chapter:', error);
        toast({
          title: "Error",
          description: "Failed to delete chapter.",
          variant: "destructive",
        });
      }
    }
  };

  const handleDeleteLecture = async (lectureId: string, lectureTitle: string) => {
    if (confirm(`Are you sure you want to delete "${lectureTitle}"?`)) {
      try {
        await supabaseService.deleteLecture(lectureId);
        toast({
          title: "Lecture Deleted",
          description: `${lectureTitle} has been deleted successfully.`,
        });
        onUpdate();
      } catch (error) {
        console.error('Error deleting lecture:', error);
        toast({
          title: "Error",
          description: "Failed to delete lecture.",
          variant: "destructive",
        });
      }
    }
  };

  const getVideoThumbnail = (url: string, type: 'youtube' | 'direct') => {
    if (type === 'youtube') {
      const videoId = url.match(/(?:youtu\.be\/|youtube\.com\/watch\?v=)([^&\n?#]+)/)?.[1];
      return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null;
    }
    return null;
  };

  const openUrl = (url: string) => {
    window.open(url, '_blank');
  };

  const handleVideoTypeChange = (value: string) => {
    setNewLecture({ ...newLecture, video_type: value as 'youtube' | 'direct' });
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
                          Chapter {chapter.order_index}: {chapter.title}
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
                  <Select value={newLecture.video_type} onValueChange={handleVideoTypeChange}>
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
                    placeholder={newLecture.video_type === 'youtube' ? 'https://youtu.be/...' : 'https://example.com/video.mp4'}
                    value={newLecture.video_url}
                    onChange={(e) => setNewLecture({ ...newLecture, video_url: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="dpp-url">DPP URL (Optional)</Label>
                  <Input
                    id="dpp-url"
                    placeholder="https://static.pw.live/...pdf"
                    value={newLecture.dpp_url}
                    onChange={(e) => setNewLecture({ ...newLecture, dpp_url: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="notes-url">Notes URL (Optional)</Label>
                  <Input
                    id="notes-url"
                    placeholder="https://d2bps9p1kiy4ka.cloudfront.net/...pdf"
                    value={newLecture.notes_url}
                    onChange={(e) => setNewLecture({ ...newLecture, notes_url: e.target.value })}
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
          .sort((a, b) => a.order_index - b.order_index)
          .map((chapter) => (
            <Card key={chapter.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Chapter {chapter.order_index}: {chapter.title}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-normal text-gray-500">
                      {chapter.lectures.length} lectures
                    </span>
                    {(user?.role === 'super_admin' || user?.role === 'admin') && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteChapter(chapter.id, chapter.title)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {chapter.lectures.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {chapter.lectures.map((lecture) => {
                      const thumbnail = getVideoThumbnail(lecture.video_url, lecture.video_type as 'youtube' | 'direct');
                      
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
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-medium line-clamp-2 flex-1">{lecture.title}</h4>
                              {(user?.role === 'super_admin' || user?.role === 'admin') && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="ml-2 p-1 h-auto"
                                  onClick={() => handleDeleteLecture(lecture.id, lecture.title)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                              <Play className="h-3 w-3" />
                              <span>{lecture.video_type === 'youtube' ? 'YouTube' : 'Direct'}</span>
                            </div>
                            
                            <div className="space-y-2">
                              <Button 
                                size="sm" 
                                className="w-full"
                                onClick={() => openUrl(lecture.video_url)}
                              >
                                <Play className="h-3 w-3 mr-1" />
                                Watch Video
                              </Button>
                              
                              <div className="flex gap-2">
                                {lecture.dpp_url && (
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="flex-1"
                                    onClick={() => openUrl(lecture.dpp_url!)}
                                  >
                                    <FileText className="h-3 w-3 mr-1" />
                                    DPP
                                  </Button>
                                )}
                                
                                {lecture.notes_url && (
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="flex-1"
                                    onClick={() => openUrl(lecture.notes_url!)}
                                  >
                                    <Download className="h-3 w-3 mr-1" />
                                    Notes
                                  </Button>
                                )}
                              </div>
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
