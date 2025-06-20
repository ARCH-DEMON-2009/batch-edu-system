import { useState, useEffect } from 'react';
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
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  id: string;
  email: string;
  role: 'super_admin' | 'admin' | 'uploader';
  assigned_batches: string[];
  user_id?: string;
}

const UserManagement = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    role: 'uploader' as 'admin' | 'uploader',
    assignedBatches: [] as string[]
  });
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);

  const { user } = useAuth();
  const { batches } = useData();
  const { toast } = useToast();

  // Load users from database
  const loadUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match our UserProfile interface
      const transformedUsers = (data || []).map(user => ({
        id: user.id,
        email: user.email,
        role: user.role as 'super_admin' | 'admin' | 'uploader',
        assigned_batches: user.assigned_batches || [],
        user_id: user.user_id
      }));
      
      setUsers(transformedUsers);
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        title: "Error Loading Users",
        description: "Failed to load user profiles.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'super_admin') {
      loadUsers();
    }
  }, [user]);

  const handleCreateUser = async () => {
    if (!newUser.email.trim() || !newUser.password.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newUser.email,
        password: newUser.password,
        options: {
          emailRedirectTo: `${window.location.origin}/admin/login`
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // Wait a moment for the trigger to create the profile
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Update the automatically created profile with the correct role and assignments
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({
            role: newUser.role,
            assigned_batches: newUser.role === 'uploader' ? newUser.assignedBatches : []
          })
          .eq('user_id', authData.user.id);

        if (updateError) throw updateError;

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
        loadUsers();
      }
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast({
        title: "Error Creating User",
        description: error.message || "Failed to create user.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (userProfile: UserProfile) => {
    setEditingUser(userProfile);
    setIsEditDialogOpen(true);
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          role: editingUser.role,
          assigned_batches: editingUser.role === 'uploader' ? editingUser.assigned_batches : []
        })
        .eq('id', editingUser.id);

      if (error) throw error;

      toast({
        title: "User Updated",
        description: `${editingUser.email} has been updated.`,
      });

      setIsEditDialogOpen(false);
      setEditingUser(null);
      loadUsers();
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast({
        title: "Error Updating User",
        description: error.message || "Failed to update user.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string, email: string) => {
    if (email === 'shashanksv2009@gmail.com') {
      toast({
        title: "Cannot Delete Super Admin",
        description: "The super admin account cannot be deleted.",
        variant: "destructive",
      });
      return;
    }

    if (confirm(`Are you sure you want to delete user "${email}"?`)) {
      setLoading(true);
      try {
        // Delete from user_profiles (user_id cascade will handle auth.users)
        const { error } = await supabase
          .from('user_profiles')
          .delete()
          .eq('id', userId);

        if (error) throw error;

        toast({
          title: "User Deleted",
          description: `${email} has been removed.`,
        });

        loadUsers();
      } catch (error: any) {
        console.error('Error deleting user:', error);
        toast({
          title: "Error Deleting User",
          description: error.message || "Failed to delete user.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
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
    if (newUser.role === 'uploader') {
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
    }
  };

  const handleEditBatchAssignment = (batchId: string, checked: boolean) => {
    if (!editingUser || editingUser.role !== 'uploader') return;
    
    if (checked) {
      setEditingUser({
        ...editingUser,
        assigned_batches: [...editingUser.assigned_batches, batchId]
      });
    } else {
      setEditingUser({
        ...editingUser,
        assigned_batches: editingUser.assigned_batches.filter(id => id !== batchId)
      });
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

  if (loading && users.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading users...</p>
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
              <Button onClick={handleCreateUser} disabled={loading}>
                {loading ? 'Creating...' : 'Create User'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user role and batch assignments.
            </DialogDescription>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-4">
              <div>
                <Label>Email Address</Label>
                <Input value={editingUser.email} disabled />
              </div>

              <div>
                <Label htmlFor="edit-user-role">Role</Label>
                <Select 
                  value={editingUser.role} 
                  onValueChange={(value: 'admin' | 'uploader') => 
                    setEditingUser({ ...editingUser, role: value, assigned_batches: value === 'admin' ? [] : editingUser.assigned_batches })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="uploader">Uploader</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {editingUser.role === 'uploader' && (
                <div>
                  <Label>Assign to Batches</Label>
                  <div className="space-y-2 mt-2">
                    {batches.map((batch) => (
                      <div key={batch.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`edit-batch-${batch.id}`}
                          checked={editingUser.assigned_batches.includes(batch.id)}
                          onCheckedChange={(checked) => handleEditBatchAssignment(batch.id, checked as boolean)}
                        />
                        <label
                          htmlFor={`edit-batch-${batch.id}`}
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
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateUser} disabled={loading}>
              {loading ? 'Updating...' : 'Update User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((userProfile) => (
          <Card key={userProfile.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Badge className={`${getRoleColor(userProfile.role)} flex items-center gap-1`}>
                  {getRoleIcon(userProfile.role)}
                  {userProfile.role.replace('_', ' ').toUpperCase()}
                </Badge>
                <div className="flex space-x-1">
                  {userProfile.role !== 'super_admin' && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditUser(userProfile)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteUser(userProfile.id, userProfile.email)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
              <CardTitle className="text-lg">{userProfile.email}</CardTitle>
              <CardDescription>
                {userProfile.role === 'super_admin' && 'Full system access'}
                {userProfile.role === 'admin' && 'Content management access'}
                {userProfile.role === 'uploader' && `Access to ${userProfile.assigned_batches?.length || 0} batches`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {userProfile.role === 'uploader' && userProfile.assigned_batches?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm mb-2">Assigned Batches:</h4>
                  <div className="space-y-1">
                    {userProfile.assigned_batches.map((batchId) => (
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
