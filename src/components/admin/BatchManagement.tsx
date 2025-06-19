import { useState } from 'react';
import { Plus, Edit, Trash2, BookOpen, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import SubjectManagement from './SubjectManagement';

const BatchManagement = () => {
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newBatch, setNewBatch] = useState({ name: '', description: '' });
  const { batches, addBatch, deleteBatch, updateBatch } = useData();
  const { user } = useAuth();
  const { toast } = useToast();

  const canManageBatch = (batchId: string) => {
    if (user?.role === 'super_admin' || user?.role === 'admin') return true;
    return user?.assignedBatches?.includes(batchId) || false;
  };

  const handleCreateBatch = () => {
    if (!newBatch.name.trim()) return;

    addBatch({
      name: newBatch.name,
      description: newBatch.description
    });

    toast({
      title: "Batch Created",
      description: `${newBatch.name} has been created successfully.`,
    });

    setNewBatch({ name: '', description: '' });
    setIsCreateDialogOpen(false);
  };

  const handleDeleteBatch = (batchId: string, batchName: string) => {
    if (confirm(`Are you sure you want to delete "${batchName}"? This action cannot be undone.`)) {
      deleteBatch(batchId);
      toast({
        title: "Batch Deleted",
        description: `${batchName} has been deleted successfully.`,
      });
    }
  };

  if (selectedBatch)  {
    const batch = batches.find(b => b.id === selectedBatch);
    if (batch) {
      return (
        <SubjectManagement 
          batch={batch} 
          onBack={() => setSelectedBatch(null)} 
        />
      );
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Batch Management</h2>
          <p className="text-gray-600">Create and manage educational batches</p>
        </div>
        
        {(user?.role === 'super_admin' || user?.role === 'admin') && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Batch
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Batch</DialogTitle>
                <DialogDescription>
                  Add a new educational batch to organize subjects and lectures.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="batch-name">Batch Name</Label>
                  <Input
                    id="batch-name"
                    placeholder="e.g., NEET 2024-25"
                    value={newBatch.name}
                    onChange={(e) => setNewBatch({ ...newBatch, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="batch-description">Description</Label>
                  <Textarea
                    id="batch-description"
                    placeholder="Describe the batch content and objectives"
                    value={newBatch.description}
                    onChange={(e) => setNewBatch({ ...newBatch, description: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateBatch}>Create Batch</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {batches
          .filter(batch => canManageBatch(batch.id))
          .map((batch) => {
            const totalChapters = batch.subjects.reduce((acc, subject) => acc + subject.chapters.length, 0);
            const totalLectures = batch.subjects.reduce((acc, subject) => 
              acc + subject.chapters.reduce((chapterAcc, chapter) => chapterAcc + chapter.lectures.length, 0), 0
            );

            return (
              <Card key={batch.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{batch.name}</span>
                    {(user?.role === 'super_admin' || user?.role === 'admin') && (
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteBatch(batch.id, batch.name)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </CardTitle>
                  <CardDescription>{batch.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-blue-600">{batch.subjects.length}</div>
                        <div className="text-xs text-gray-500">Subjects</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">{totalChapters}</div>
                        <div className="text-xs text-gray-500">Chapters</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-purple-600">{totalLectures}</div>
                        <div className="text-xs text-gray-500">Lectures</div>
                      </div>
                    </div>

                    <Button 
                      className="w-full" 
                      onClick={() => setSelectedBatch(batch.id)}
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      Manage Content
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
      </div>

      {batches.filter(batch => canManageBatch(batch.id)).length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No Batches Available</h3>
          <p className="text-gray-500">
            {user?.role === 'uploader' 
              ? "You haven't been assigned to any batches yet." 
              : "Create your first batch to get started."
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default BatchManagement;
