import { useState } from 'react';
import { ArrowLeft, Plus, BookOpen, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useData, Batch } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import ChapterManagement from './ChapterManagement';

interface SubjectManagementProps {
  batch: Batch;
  onBack: () => void;
}

const SubjectManagement = ({ batch, onBack }: SubjectManagementProps) => {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newSubject, setNewSubject] = useState({ name: '', color: 'bg-blue-500' });
  const { addSubject } = useData();
  const { user } = useAuth();
  const { toast } = useToast();

  const colorOptions = [
    { value: 'bg-blue-500', label: 'Blue' },
    { value: 'bg-green-500', label: 'Green' },
    { value: 'bg-purple-500', label: 'Purple' },
    { value: 'bg-red-500', label: 'Red' },
    { value: 'bg-yellow-500', label: 'Yellow' },
    { value: 'bg-indigo-500', label: 'Indigo' },
    { value: 'bg-pink-500', label: 'Pink' },
    { value: 'bg-gray-500', label: 'Gray' }
  ];

  const handleCreateSubject = () => {
    if (!newSubject.name.trim()) return;

    addSubject(batch.id, {
      name: newSubject.name,
      color: newSubject.color
    });

    toast({
      title: "Subject Created",
      description: `${newSubject.name} has been added to ${batch.name}.`,
    });

    setNewSubject({ name: '', color: 'bg-blue-500' });
    setIsCreateDialogOpen(false);
  };

  if (selectedSubject) {
    const subject = batch.subjects.find(s => s.id === selectedSubject);
    if (subject) {
      return (
        <ChapterManagement 
          batch={batch}
          subject={subject} 
          onBack={() => setSelectedSubject(null)} 
        />
      );
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Batches
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{batch.name}</h2>
            <p className="text-gray-600">Manage subjects and content</p>
          </div>
        </div>

        {(user?.role === 'super_admin' || user?.role === 'admin') && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Subject
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Subject</DialogTitle>
                <DialogDescription>
                  Add a new subject to {batch.name}.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="subject-name">Subject Name</Label>
                  <Input
                    id="subject-name"
                    placeholder="e.g., Physics, Chemistry, Mathematics"
                    value={newSubject.name}
                    onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="subject-color">Color Theme</Label>
                  <Select value={newSubject.color} onValueChange={(value) => setNewSubject({ ...newSubject, color: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {colorOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded ${option.value}`}></div>
                            {option.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateSubject}>Add Subject</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {batch.subjects.map((subject) => {
          const totalLectures = subject.chapters.reduce((acc, chapter) => acc + chapter.lectures.length, 0);

          return (
            <Card key={subject.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className={`${subject.color} text-white rounded-t-lg`}>
                <CardTitle className="flex items-center justify-between">
                  <span>{subject.name}</span>
                  <BookOpen className="h-5 w-5" />
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{subject.chapters.length}</div>
                      <div className="text-xs text-gray-500">Chapters</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">{totalLectures}</div>
                      <div className="text-xs text-gray-500">Lectures</div>
                    </div>
                  </div>

                  <Button 
                    className="w-full" 
                    onClick={() => setSelectedSubject(subject.id)}
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    Manage Chapters
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {batch.subjects.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No Subjects Added</h3>
          <p className="text-gray-500">Add subjects to organize your course content.</p>
        </div>
      )}
    </div>
  );
};

export default SubjectManagement;
