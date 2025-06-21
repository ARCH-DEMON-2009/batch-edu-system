
import { useState } from 'react';
import { Key, Server, Zap, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const KeyGenerationPage = () => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const { toast } = useToast();

  // These are the original links that need to be shortened via LinkShortify
  const originalLinks = {
    server1: 'https://your-domain.com/verify?server=1&redirect=set-verified',
    server2: 'https://your-domain.com/verify?server=2&redirect=set-verified'
  };

  const handleServerSelection = (server: 'server1' | 'server2') => {
    setSelectedOption(server);
    
    // Show the original link that needs to be shortened
    toast({
      title: "Link to Shorten",
      description: `Please shorten this link via LinkShortify: ${originalLinks[server]}`,
      duration: 10000,
    });
    
    console.log(`Original link for ${server}:`, originalLinks[server]);
    
    // For now, we'll simulate the redirect after LinkShortify
    // In production, this would be the shortened link
    setTimeout(() => {
      window.location.href = '/set-verified.html';
    }, 2000);
  };

  const handleContinueWithAds = () => {
    setSelectedOption('ads');
    
    // Set ads cookie
    document.cookie = "ads=true; max-age=86400; path=/"; // 24 hours
    
    toast({
      title: "Ads Mode Activated",
      description: "You can now access the website with ads.",
    });
    
    // Redirect to main app
    setTimeout(() => {
      window.location.href = '/';
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Key className="h-16 w-16 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Access Verification</h1>
          <p className="text-purple-100 text-lg">Choose your preferred access method</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card className="hover:shadow-xl transition-shadow cursor-pointer border-2 hover:border-purple-400">
            <CardHeader className="text-center">
              <Server className="h-12 w-12 text-purple-600 mx-auto mb-2" />
              <CardTitle className="text-xl">Server 1</CardTitle>
              <CardDescription>Premium access via Server 1</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full bg-purple-600 hover:bg-purple-700"
                onClick={() => handleServerSelection('server1')}
                disabled={selectedOption === 'server1'}
              >
                {selectedOption === 'server1' ? 'Redirecting...' : 'Access via Server 1'}
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-shadow cursor-pointer border-2 hover:border-blue-400">
            <CardHeader className="text-center">
              <Server className="h-12 w-12 text-blue-600 mx-auto mb-2" />
              <CardTitle className="text-xl">Server 2</CardTitle>
              <CardDescription>Premium access via Server 2</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={() => handleServerSelection('server2')}
                disabled={selectedOption === 'server2'}
              >
                {selectedOption === 'server2' ? 'Redirecting...' : 'Access via Server 2'}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-2">
            <div className="border-t border-white/30 flex-1"></div>
            <span className="px-4 text-white/70 text-sm">OR</span>
            <div className="border-t border-white/30 flex-1"></div>
          </div>
        </div>

        <Card className="hover:shadow-xl transition-shadow cursor-pointer border-2 hover:border-yellow-400">
          <CardHeader className="text-center">
            <Zap className="h-12 w-12 text-yellow-500 mx-auto mb-2" />
            <CardTitle className="text-xl">Continue with Ads</CardTitle>
            <CardDescription>Free access with advertisement support</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
              onClick={handleContinueWithAds}
              disabled={selectedOption === 'ads'}
            >
              {selectedOption === 'ads' ? 'Setting up...' : 'Continue with Ads'}
            </Button>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <div className="flex items-center justify-center text-white/70 text-sm">
            <Clock className="h-4 w-4 mr-2" />
            <span>Access expires after the configured time period</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeyGenerationPage;
