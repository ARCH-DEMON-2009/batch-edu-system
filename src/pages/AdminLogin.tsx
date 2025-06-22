
import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { LogIn, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  if (isAuthenticated) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        toast({
          title: "Login Successful",
          description: "Welcome to the admin panel!",
        });
        // Wait a bit for the auth state to update
        setTimeout(() => {
          navigate('/admin/dashboard');
        }, 1000);
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid email or password. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred during login.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <BookOpen className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">EduPortal Admin</h1>
          <p className="text-blue-100">Access the admin panel</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LogIn className="h-5 w-5" />
              Admin Login
            </CardTitle>
            <CardDescription>
              Enter your credentials to access the admin panel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t">
              <h4 className="font-semibold mb-3">Demo Credentials:</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div>
                    <p><strong>Super Admin:</strong></p>
                    <p className="text-gray-600">shashanksv2009@gmail.com</p>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleDemoLogin('shashanksv2009@gmail.com', 'admin123')}
                  >
                    Use
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div>
                    <p><strong>Admin:</strong></p>
                    <p className="text-gray-600">admin@example.com</p>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleDemoLogin('admin@example.com', 'admin123')}
                  >
                    Use
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div>
                    <p><strong>Uploader:</strong></p>
                    <p className="text-gray-600">uploader@example.com</p>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleDemoLogin('uploader@example.com', 'uploader123')}
                  >
                    Use
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminLogin;
