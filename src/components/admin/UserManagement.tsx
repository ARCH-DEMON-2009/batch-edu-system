
import { useState } from 'react';
import { Plus, Users, Edit, Trash2, Shield, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/hooks/use-toast';

const UserManagement = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    role: 'uploader' as 'admin' | 'uploader',
    assignedBatches: [] as string[]
  });

  const { user } = useAuth();
  const { batches } = useData();
  const { toast } = useToast();

  // Mock users data - in a real app this would come from a backend
  const [users, setUsers] = useState([
    {
      id: '1',
      email: 'shashanksv2009@gmail.com',
      role: 'super_admin' as const,
      assignedBatches: []
    },
    {
      id: '2',
      email: 'admin@example.com',
      role: 'admin' as const,
      assignedBatches: []
    },
    {
      id: '3',
      email: 'uploader@example.com',
      role: 'uploader' as const,
      assignedBatches: ['1', '2']
    }
  ]);

  const handleCreateUser = () => {
    if (!newUser.email.trim() || !newUser.password.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const user = {
      id: Math.random().toString(36).substr(2, 9),
      email: newUser.email,
      role: newUser.role,
      assignedBatches: newUser.role === 'uploader' ? newUser.assignedBatches : []
    };

    setUsers(prev => [...prev, user]);

    toast({
      title: "User Created",
      description: `${newUser.email} has been added as ${newUser.role}.`,
    });

    setNewUser({
      email: '',
      password: '',
      role: 'uploader',
      assignedBatches: []
    });
    setIsCreateDialogOpen(false);
  };

  const handleDeleteUser = (userId: string, email: string) => {
    if (userId === '1') {
      toast({
        title: "Cannot Delete Super Admin",
        description: "The super admin account cannot be deleted.",
        variant: "destructive",
      });
      return;
    }

    if (confirm(`Are you sure you want to delete user "${email}"?`)) {
      setUsers(prev => prev.filter(u => u.id !== userId));
      toast({
        title: "User Deleted",
        description: `${email} has been removed.`,
      });
    }
  };

  const getBatchName = (batchId: string) => {
    const batch = batches.find(b => b.id === batchId);
    return batch?.name || 'Unknown Batch';
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'super_admin':
        return <Shield className="h-4 w-4" />;
      case 'admin':
        return <Users className="h-4 w-4" />;
      case 'uploader':
        return <Upload className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-red-100 text-red-800';
      case 'admin':
        return 'bg-blue-100 text-blue-800';
      case 'uploader':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleBatchAssignment = (batchId: string, checked: boolean) => {
    if (checked) {
      setNewUser(prev => ({
        ...prev,
        assignedBatches: [...prev.assignedBatches, batchId]
      }));
    } else {
      setNewUser(prev => ({
        ...prev,
        assignedBatches: prev.assignedBatches.filter(id => id !== batchId)
      }));
    }
  };

  // Only super admin can access this component
  if (user?.role !== 'super_admin') {
    return (
      <div className="text-center py-12">
        <Shield className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">Access Denied</h3>
        <p className="text-gray-500">Only super admins can manage users.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <p className="text-gray-600">Manage admin and uploader accounts</p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>
                Add a new admin or uploader account to the system.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="user-email">Email Address</Label>
                <Input
                  id="user-email"
                  type="email"
                  placeholder="user@example.com"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="user-password">Password</Label>
                <Input
                  id="user-password"
                  type="password"
                  placeholder="Enter password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="user-role">Role</Label>
                <Select value={newUser.role} onValueChange={(value: 'admin' | 'uploader') => 
                  setNewUser({ ...newUser, role: value, assignedBatches: [] })
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="uploader">Uploader</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {newUser.role === 'uploader' && (
                <div>
                  <Label>Assign to Batches</Label>
                  <div className="space-y-2 mt-2">
                    {batches.map((batch) => (
                      <div key={batch.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`batch-${batch.id}`}
                          checked={newUser.assignedBatches.includes(batch.id)}
                          onCheckedChange={(checked) => handleBatchAssignment(batch.id, checked as boolean)}
                        />
                        <label
                          htmlFor={`batch-${batch.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {batch.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateUser}>Create User</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => (
          <Card key={user.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Badge className={`${getRoleColor(user.role)} flex items-center gap-1`}>
                  {getRoleIcon(user.role)}
                  {user.role.replace('_', ' ').toUpperCase()}
                </Badge>
                {user.role !== 'super_admin' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteUser(user.id, user.email)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <CardTitle className="text-lg">{user.email}</CardTitle>
              <CardDescription>
                {user.role === 'super_admin' && 'Full system access'}
                {user.role === 'admin' && 'Content management access'}
                {user.role === 'uploader' && `Access to ${user.assignedBatches.length} batches`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {user.role === 'uploader' && user.assignedBatches.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm mb-2">Assigned Batches:</h4>
                  <div className="space-y-1">
                    {user.assignedBatches.map((batchId) => (
                      <div key={batchId} className="text-sm text-gray-600">
                        • {getBatchName(batchId)}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default UserManagement;
