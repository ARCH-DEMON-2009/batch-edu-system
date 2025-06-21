import { useState } from 'react';
import { 
  Users, 
  BookOpen, 
  FileText, 
  Video, 
  Calendar,
  Database,
  LogOut,
  Settings,
  DollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import BatchManagement from '@/components/admin/BatchManagement';
import UserManagement from '@/components/admin/UserManagement';
import LiveClassManagement from '@/components/admin/LiveClassManagement';
import BackupManagement from '@/components/admin/BackupManagement';
import MonetizationSettings from '@/components/admin/MonetizationSettings';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const { batches, liveClasses, loading } = useData();

  const handleLogout = () => {
    logout();
  };

  // Calculate statistics
  const totalBatches = batches.length;
  const totalSubjects = batches.reduce((acc, batch) => acc + batch.subjects.length, 0);
  const totalChapters = batches.reduce((acc, batch) => 
    acc + batch.subjects.reduce((subAcc, subject) => subAcc + subject.chapters.length, 0), 0
  );
  const totalLectures = batches.reduce((acc, batch) => 
    acc + batch.subjects.reduce((subAcc, subject) => 
      subAcc + subject.chapters.reduce((chapAcc, chapter) => chapAcc + chapter.lectures.length, 0), 0
    ), 0
  );
  const liveSessions = liveClasses.filter(lc => lc.status === 'live').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {user?.role === 'uploader' ? 'Content Dashboard' : 'Admin Dashboard'}
                </h1>
                <p className="text-sm text-gray-500 capitalize">{user?.role?.replace('_', ' ')} Panel</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {user?.email}
              </span>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {user?.role === 'uploader' ? 'My Batches' : 'Total Batches'}
              </CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalBatches}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Subjects</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSubjects}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Chapters</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalChapters}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Lectures</CardTitle>
              <Video className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalLectures}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Live Sessions</CardTitle>
              <Calendar className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{liveSessions}</div>
            </CardContent>
          </Card>
        </div>

        {/* Management Tabs */}
        <Tabs defaultValue="batches" className="space-y-6">
          <TabsList className={`grid w-full ${user?.role === 'uploader' ? 'grid-cols-2' : user?.role === 'admin' ? 'grid-cols-3' : 'grid-cols-5'}`}>
            <TabsTrigger value="batches">
              {user?.role === 'uploader' ? 'My Batches' : 'Batches'}
            </TabsTrigger>
            <TabsTrigger value="live-classes">Live Classes</TabsTrigger>
            {user?.role !== 'uploader' && (
              <TabsTrigger value="backup">Backup</TabsTrigger>
            )}
            {user?.role === 'super_admin' && (
              <>
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="monetization">Monetization</TabsTrigger>
              </>
            )}
          </TabsList>

          <TabsContent value="batches" className="space-y-6">
            <BatchManagement />
          </TabsContent>

          <TabsContent value="live-classes" className="space-y-6">
            <LiveClassManagement />
          </TabsContent>

          {user?.role !== 'uploader' && (
            <TabsContent value="backup" className="space-y-6">
              <BackupManagement />
            </TabsContent>
          )}

          {user?.role === 'super_admin' && (
            <>
              <TabsContent value="users" className="space-y-6">
                <UserManagement />
              </TabsContent>
              
              <TabsContent value="monetization" className="space-y-6">
                <MonetizationSettings />
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
