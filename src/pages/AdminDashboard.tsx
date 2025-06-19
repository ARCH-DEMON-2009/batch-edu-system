
import { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { BarChart3, Users, BookOpen, Calendar, Plus, Settings, LogOut, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import BatchManagement from '@/components/admin/BatchManagement';
import UserManagement from '@/components/admin/UserManagement';
import LiveClassManagement from '@/components/admin/LiveClassManagement';

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const { batches, liveClasses } = useData();

  if (!isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  const totalSubjects = batches.reduce((acc, batch) => acc + batch.subjects.length, 0);
  const totalChapters = batches.reduce((acc, batch) => 
    acc + batch.subjects.reduce((subAcc, subject) => subAcc + subject.chapters.length, 0), 0
  );
  const totalLectures = batches.reduce((acc, batch) => 
    acc + batch.subjects.reduce((subAcc, subject) => 
      subAcc + subject.chapters.reduce((chapterAcc, chapter) => chapterAcc + chapter.lectures.length, 0), 0
    ), 0
  );

  const stats = [
    {
      title: 'Total Batches',
      value: batches.length,
      icon: BookOpen,
      color: 'bg-blue-500'
    },
    {
      title: 'Total Subjects',
      value: totalSubjects,
      icon: BookOpen,
      color: 'bg-green-500'
    },
    {
      title: 'Total Lectures',
      value: totalLectures,
      icon: Calendar,
      color: 'bg-purple-500'
    },
    {
      title: 'Live Classes',
      value: liveClasses.length,
      icon: Users,
      color: 'bg-red-500'
    }
  ];

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'batches', label: 'Batch Management', icon: BookOpen },
    { id: 'live-classes', label: 'Live Classes', icon: Calendar },
    ...(user?.role === 'super_admin' ? [{ id: 'users', label: 'User Management', icon: Users }] : [])
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:static lg:inset-0`}>
        <div className="flex items-center justify-between h-16 px-6 border-b">
          <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-4">
          <div className="mb-6">
            <p className="text-sm text-gray-600">Logged in as:</p>
            <p className="font-medium">{user?.email}</p>
            <p className="text-xs text-blue-600 capitalize">{user?.role?.replace('_', ' ')}</p>
          </div>

          <nav className="space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  className="w-full flex items-center space-x-3 px-3 py-2 text-left text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  onClick={() => {
                    // Handle navigation within tabs
                    setSidebarOpen(false);
                  }}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <div className="space-y-2">
            <Link to="/" className="w-full">
              <Button variant="outline" className="w-full justify-start">
                <BookOpen className="h-4 w-4 mr-2" />
                View Website
              </Button>
            </Link>
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={logout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Top bar */}
        <div className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome back, {user?.email}</span>
            </div>
          </div>
        </div>

        {/* Dashboard content */}
        <div className="p-6">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-8">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="batches">Batches</TabsTrigger>
              <TabsTrigger value="live-classes">Live Classes</TabsTrigger>
              {user?.role === 'super_admin' && (
                <TabsTrigger value="users">Users</TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <Card key={index}>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                        <div className={`p-2 rounded-lg ${stat.color} text-white`}>
                          <Icon className="h-4 w-4" />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stat.value}</div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common administrative tasks</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button className="h-20 flex-col space-y-2">
                      <Plus className="h-6 w-6" />
                      <span>Add New Batch</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex-col space-y-2">
                      <Calendar className="h-6 w-6" />
                      <span>Schedule Live Class</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex-col space-y-2">
                      <Users className="h-6 w-6" />
                      <span>Manage Users</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="batches">
              <BatchManagement />
            </TabsContent>

            <TabsContent value="live-classes">
              <LiveClassManagement />
            </TabsContent>

            {user?.role === 'super_admin' && (
              <TabsContent value="users">
                <UserManagement />
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
