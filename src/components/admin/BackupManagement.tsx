
import { useState } from 'react';
import { Calendar, Download, Upload, Database, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/hooks/use-toast';

const BackupManagement = () => {
  const [isRestoreDialogOpen, setIsRestoreDialogOpen] = useState(false);
  const [restoreDate, setRestoreDate] = useState('');
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const { createBackup, restoreFromBackup } = useData();
  const { toast } = useToast();

  const handleCreateBackup = async () => {
    setIsCreatingBackup(true);
    try {
      await createBackup();
    } finally {
      setIsCreatingBackup(false);
    }
  };

  const handleRestore = async () => {
    if (!restoreDate) {
      toast({
        title: "Date Required",
        description: "Please select a date to restore from.",
        variant: "destructive",
      });
      return;
    }

    setIsRestoring(true);
    try {
      await restoreFromBackup(restoreDate);
      setIsRestoreDialogOpen(false);
      setRestoreDate('');
    } finally {
      setIsRestoring(false);
    }
  };

  const today = new Date().to2/String();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Backup Management</h2>
          <p className="text-gray-600">Create and restore daily backups of your educational data</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Create Backup
            </CardTitle>
            <CardDescription>
              Create a backup of all your current data including batches, subjects, chapters, lectures, and live classes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Automatic Daily Backups</h4>
                <p className="text-sm text-blue-700">
                  The system automatically creates daily backups every day at midnight. You can also create manual backups anytime.
                </p>
              </div>
              
              <Button 
                onClick={handleCreateBackup} 
                className="w-full"
                disabled={isCreatingBackup}
              >
                <Download className="h-4 w-4 mr-2" />
                {isCreatingBackup ? 'Creating Backup...' : 'Create Manual Backup'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Restore from Backup
            </CardTitle>
            <CardDescription>
              Restore your data from a previous backup. This will replace all current data.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <h4 className="font-medium text-red-900">Warning</h4>
                </div>
                <p className="text-sm text-red-700">
                  Restoring from backup will permanently delete all current data and replace it with the backup data.
                </p>
              </div>

              <Dialog open={isRestoreDialogOpen} onOpenChange={setIsRestoreDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <Upload className="h-4 w-4 mr-2" />
                    Restore from Backup
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Restore from Backup</DialogTitle>
                    <DialogDescription>
                      Select the date you want to restore from. This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="restore-date">Backup Date</Label>
                      <Input
                        id="restore-date"
                        type="date"
                        value={restoreDate}
                        max={today}
                        onChange={(e) => setRestoreDate(e.target.value)}
                      />
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <h4 className="font-medium text-red-900">Final Warning</h4>
                      </div>
                      <p className="text-sm text-red-700">
                        This will permanently delete all current data including:
                      </p>
                      <ul className="text-sm text-red-700 mt-2 ml-4 list-disc">
                        <li>All batches and their content</li>
                        <li>All subjects and chapters</li>
                        <li>All lectures and materials</li>
                        <li>All live class schedules</li>
                        <li>All user assignments</li>
                      </ul>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsRestoreDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      variant="destructive" 
                      onClick={handleRestore}
                      disabled={isRestoring || !restoreDate}
                    >
                      {isRestoring ? 'Restoring...' : 'Restore Data'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Backup Schedule
          </CardTitle>
          <CardDescription>
            Information about your backup schedule and retention policy
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">Automatic Backups</h4>
              <p className="text-sm text-green-700">
                Daily at 12:00 AM
              </p>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Retention Period</h4>
              <p className="text-sm text-blue-700">
                Unlimited (stored in database)
              </p>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="font-medium text-purple-900 mb-2">Manual Backups</h4>
              <p className="text-sm text-purple-700">
                Available anytime
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BackupManagement;
