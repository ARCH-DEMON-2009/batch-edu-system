
import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, BookOpen, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabaseService, SupabaseBatch } from '@/services/supabaseService';
import SubjectManagement from './SubjectManagement';

const BatchManagement = () => {
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newBatch, setNewBatch] = useState({ name: '', description: '' });
  const [batches, setBatches] = useState<SupabaseBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const canManageBatch = (batchId: string) => {
    if (user?.role === 'super_admin' || user?.role === 'admin') return true;
    return user?.assignedBatches?.includes(batchId) || false;
  };

  const canCreateBatch = () => {
    return user?.role === 'super_admin' || user?.role === 'admin';
  };

  const loadBatches = async () => {
    try {
      setLoading(true);
      const data = await supabaseService.getBatches();
      setBatches(data);
    } catch (error) {
      console.error('Error loading batches:', error);
      toast({
        title: "Error",
        description: "Failed to load batches.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBatches();
  }, []);

  const handleCreateBatch = async () => {
    if (!newBatch.name.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter a batch name.",
        variant: "destructive",
      });
      return;
    }

    try {
      await supabaseService.createBatch({
        name: newBatch.name,
        description: newBatch.description
      });

      toast({
        title: "Batch Created",
        description: `${newBatch.name} has been created successfully.`,
      });

      setNewBatch({ name: '', description: '' });
      setIsCreateDialogOpen(false);
      loadBatches();
    } catch (error) {
      console.error('Error creating batch:', error);
      toast({
        title: "Error",
        description: "Failed to create batch.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteBatch = async (batchId: string, batchName: string) => {
    if (confirm(`Are you sure you want to delete "${batchName}"? This action cannot be undone.`)) {
      try {
        await supabaseService.deleteBatch(batchId);
        toast({
          title: "Batch Deleted",
          description: `${batchName} has been deleted successfully.`,
        });
        loadBatches();
      } catch (error) {
        console.error('Error deleting batch:', error);
        toast({
          title: "Error",
          description: "Failed to delete batch.",
          variant: "destructive",
        });
      }
    }
  };

  if (selectedBatch) {
    const batch = batches.find(b => b.id === selectedBatch);
    if (batch) {
      return (
        <SubjectManagement 
          batch={batch} 
          onBack={() => setSelectedBatch(null)}
          onUpdate={loadBatches}
        />
      );
    }
  }

  const availableBatches = batches.filter(batch => canManageBatch(batch.id));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {user?.role === 'uploader' ? 'My Batches' : 'Batch Management'}
          </h2>
          <p className="text-gray-600">
            {user?.role === 'uploader' 
              ? 'Manage content for your assigned batches' 
              : 'Create and manage educational batches'
            }
          </p>
        </div>
        
        {canCreateBatch() && (
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
        {availableBatches.map((batch) => {
          const totalChapters = batch.subjects.reduce((acc, subject) => acc + subject.chapters.length, 0);
          const totalLectures = batch.subjects.reduce((acc, subject) => 
            acc + subject.chapters.reduce((chapterAcc, chapter) => chapterAcc + chapter.lectures.length, 0), 0
          );

          return (
            <Card key={batch.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{batch.name}</span>
                  {canCreateBatch() && (
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteBatch(batch.id, batch.name);
                        }}
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

      {availableBatches.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No Batches Available</h3>
          <p className="text-gray-500">
            {user?.role === 'uploader' 
              ? "You haven't been assigned to any batches yet. Contact your admin to get batch assignments." 
              : "Create your first batch to get started."
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default BatchManagement;
