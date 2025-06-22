
import { useState } from 'react';
import { Key, Server, Zap, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const KeyGenerationPage = () => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const { toast } = useToast();

  // Load monetization config from localStorage (set by admin)
  const getMonetizationConfig = () => {
    const savedConfig = localStorage.getItem('monetizationConfig');
    if (savedConfig) {
      return JSON.parse(savedConfig);
    }
    return {
      keyValidityTime: '3600', // 1 hour default
      server1Link: 'https://your-domain.com/verify?server=1&redirect=set-verified',
      server2Link: 'https://your-domain.com/verify?server=2&redirect=set-verified'
    };
  };

  const config = getMonetizationConfig();

  const handleServerSelection = (server: 'server1' | 'server2') => {
    setSelectedOption(server);
    
    const originalLink = server === 'server1' ? config.server1Link : config.server2Link;
    
    // Show the original link that needs to be shortened
    toast({
      title: "Original Link for LinkShortify",
      description: `Please copy and shorten this link: ${originalLink}`,
      duration: 10000,
    });
    
    console.log(`=== LINK TO SHORTEN VIA LINKSHORTIFY ===`);
    console.log(`Server: ${server}`);
    console.log(`Original Link: ${originalLink}`);
    console.log(`Duration: ${config.keyValidityTime} seconds`);
    console.log(`========================================`);
    
    // For demo purposes, redirect to set-verified.html after 3 seconds
    // In production, this would be the shortened LinkShortify URL
    setTimeout(() => {
      window.location.href = `/set-verified.html?duration=${config.keyValidityTime}`;
    }, 3000);
  };

  const handleContinueWithAds = () => {
    setSelectedOption('ads');
    
    // Set ads cookie with same duration as verification
    const maxAge = parseInt(config.keyValidityTime);
    document.cookie = `ads=true; max-age=${maxAge}; path=/`;
    
    toast({
      title: "Ads Mode Activated",
      description: "You can now access the website with ads.",
    });
    
    // Redirect to main app
    setTimeout(() => {
      window.location.href = '/';
    }, 1500);
  };

  const getValidityTimeLabel = (seconds: string) => {
    const sec = parseInt(seconds);
    if (sec < 3600) return `${sec / 60} minutes`;
    if (sec < 86400) return `${sec / 3600} hours`;
    return `${sec / 86400} days`;
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
          <p className="text-purple-200 text-sm mt-2">
            Access Duration: {getValidityTimeLabel(config.keyValidityTime)}
          </p>
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
            <span>Access expires after {getValidityTimeLabel(config.keyValidityTime)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeyGenerationPage;
