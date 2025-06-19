
import { useState } from 'react';
import { ArrowLeft, Plus, Play, FileText, Download, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useData, Batch, Subject } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface ChapterManagementProps {
  batch: Batch;
  subject: Subject;
  onBack: () => void;
}

const ChapterManagement = ({ batch, subject, onBack }: ChapterManagementProps) => {
  const [isCreateChapterOpen, setIsCreateChapterOpen] = useState(false);
  const [isCreateLectureOpen, setIsCreateLectureOpen] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState<string>('');
  const [newChapter, setNewChapter] = useState({ title: '' });
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
      lectures: [],
      order: subject.chapters.length + 1
    });

    toast({
      title: "Chapter Created",
      description: `${newChapter.title} has been added to ${subject.name}.`,
    });

    setNewChapter({ title: '' });
    setIsCreateChapterOpen(false);
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
      description: `${newLecture.title} has been uploaded successfully.`,
    });

    setNewLecture({
      title: '',
      videoUrl: '',
      videoType: 'youtube',
      dppUrl: '',
      notesUrl: ''
    });
    setSelectedChapter('');
    setIsCreateLectureOpen(false);
  };

  const detectVideoType = (url: string) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return 'youtube';
    }
    return 'direct';
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
          <Dialog open={isCreateLectureOpen} onOpenChange={setIsCreateLectureOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Lecture
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Upload New Lecture</DialogTitle>
                <DialogDescription>
                  Add a new lecture to an existing chapter in {subject.name}.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="chapter-select">Select Chapter</Label>
                  <Select value={selectedChapter} onValueChange={setSelectedChapter}>
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
                    placeholder="e.g., Introduction to Motion"
                    value={newLecture.title}
                    onChange={(e) => setNewLecture({ ...newLecture, title: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="video-url">Video URL</Label>
                  <Input
                    id="video-url"
                    placeholder="YouTube URL or direct video link"
                    value={newLecture.videoUrl}
                    onChange={(e) => setNewLecture({ 
                      ...newLecture, 
                      videoUrl: e.target.value,
                      videoType: detectVideoType(e.target.value) as 'youtube' | 'direct'
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="notes-url">Notes PDF URL (Optional)</Label>
                  <Input
                    id="notes-url"
                    placeholder="Direct link to PDF notes"
                    value={newLecture.notesUrl}
                    onChange={(e) => setNewLecture({ ...newLecture, notesUrl: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="dpp-url">DPP PDF URL (Optional)</Label>
                  <Input
                    id="dpp-url"
                    placeholder="Direct link to DPP PDF"
                    value={newLecture.dppUrl}
                    onChange={(e) => setNewLecture({ ...newLecture, dppUrl: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateLectureOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateLecture}>Upload Lecture</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isCreateChapterOpen} onOpenChange={setIsCreateChapterOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Chapter
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Chapter</DialogTitle>
                <DialogDescription>
                  Add a new chapter to {subject.name}.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="chapter-title">Chapter Title</Label>
                  <Input
                    id="chapter-title"
                    placeholder="e.g., Mechanics, Thermodynamics"
                    value={newChapter.title}
                    onChange={(e) => setNewChapter({ ...newChapter, title: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateChapterOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateChapter}>Create Chapter</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="space-y-6">
        {subject.chapters.map((chapter) => (
          <Card key={chapter.id}>
            <CardHeader className={`${subject.color} text-white rounded-t-lg`}>
              <CardTitle className="flex items-center justify-between">
                <span>{chapter.title}</span>
                <span className="text-sm opacity-90">
                  {chapter.lectures.length} lectures
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {chapter.lectures.length > 0 ? (
                <div className="space-y-3">
                  {chapter.lectures.map((lecture) => (
                    <div key={lecture.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Play className="h-5 w-5 text-blue-600" />
                        <div>
                          <h4 className="font-medium">{lecture.title}</h4>
                          <p className="text-sm text-gray-500">
                            Uploaded by {lecture.uploadedBy} • {lecture.videoType === 'youtube' ? 'YouTube' : 'Direct'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {lecture.notesUrl && (
                          <FileText className="h-4 w-4 text-green-600" title="Notes available" />
                        )}
                        {lecture.dppUrl && (
                          <Download className="h-4 w-4 text-blue-600" title="DPP available" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Play className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No lectures in this chapter yet.</p>
                  <p className="text-sm">Click "Add Lecture" to upload content.</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {subject.chapters.length === 0 && (
          <div className="text-center py-12">
            <Play className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Chapters Added</h3>
            <p className="text-gray-500">Create chapters to organize your lectures.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChapterManagement;
