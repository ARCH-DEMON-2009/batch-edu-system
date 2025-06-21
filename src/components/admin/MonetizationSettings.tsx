
import { useState, useEffect } from 'react';
import { DollarSign, Clock, Link, Server, Save } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface MonetizationConfig {
  keyValidityTime: string;
  server1Link: string;
  server2Link: string;
}

const MonetizationSettings = () => {
  const [config, setConfig] = useState<MonetizationConfig>({
    keyValidityTime: '3600', // 1 hour default
    server1Link: 'https://your-domain.com/verify?server=1&redirect=set-verified',
    server2Link: 'https://your-domain.com/verify?server=2&redirect=set-verified'
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = () => {
    // Load from localStorage (in production, this would be from your backend)
    const savedConfig = localStorage.getItem('monetizationConfig');
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig));
    }
  };

  const saveConfig = async () => {
    setLoading(true);
    try {
      // Save to localStorage (in production, this would be saved to your backend)
      localStorage.setItem('monetizationConfig', JSON.stringify(config));
      
      toast({
        title: "Settings Saved",
        description: "Monetization settings have been updated successfully.",
      });

      // Show the original links that need to be shortened
      console.log('=== LINKS TO SHORTEN VIA LINKSHORTIFY ===');
      console.log('Server 1 Original Link:', config.server1Link);
      console.log('Server 2 Original Link:', config.server2Link);
      console.log('==========================================');

      toast({
        title: "Links Ready for Shortening",
        description: "Check console for original links to shorten via LinkShortify.",
        duration: 8000,
      });

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save monetization settings.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getValidityTimeLabel = (seconds: string) => {
    const sec = parseInt(seconds);
    if (sec < 3600) return `${sec / 60} minutes`;
    if (sec < 86400) return `${sec / 3600} hours`;
    return `${sec / 86400} days`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Monetization Settings</h2>
        <p className="text-gray-600">Configure key-based verification and monetization options</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Key Validity Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Key Validity Time
            </CardTitle>
            <CardDescription>
              Set how long premium access keys remain valid
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="validity-time">Validity Duration</Label>
              <Select value={config.keyValidityTime} onValueChange={(value) => 
                setConfig({ ...config, keyValidityTime: value })
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1800">30 minutes</SelectItem>
                  <SelectItem value="3600">1 hour</SelectItem>
                  <SelectItem value="21600">6 hours</SelectItem>
                  <SelectItem value="43200">12 hours</SelectItem>
                  <SelectItem value="86400">24 hours</SelectItem>
                  <SelectItem value="259200">3 days</SelectItem>
                  <SelectItem value="604800">7 days</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500 mt-1">
                Current setting: {getValidityTimeLabel(config.keyValidityTime)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Server Links Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              Server Configuration
            </CardTitle>
            <CardDescription>
              Configure the original destination links for servers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="server1-link">Server 1 Original Link</Label>
              <Input
                id="server1-link"
                type="url"
                placeholder="https://your-domain.com/verify?server=1"
                value={config.server1Link}
                onChange={(e) => setConfig({ ...config, server1Link: e.target.value })}
              />
            </div>
            
            <div>
              <Label htmlFor="server2-link">Server 2 Original Link</Label>
              <Input
                id="server2-link"
                type="url"
                placeholder="https://your-domain.com/verify?server=2"
                value={config.server2Link}
                onChange={(e) => setConfig({ ...config, server2Link: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* LinkShortify Instructions */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-800">
            <Link className="h-5 w-5" />
            LinkShortify Instructions
          </CardTitle>
          <CardDescription className="text-yellow-700">
            Important steps for setting up your monetization links
          </CardDescription>
        </CardHeader>
        <CardContent className="text-yellow-800">
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Save your settings below to generate the original links</li>
            <li>Copy the original links from the console output</li>
            <li>Visit LinkShortify and create shortened versions of these links</li>
            <li>The shortened links should redirect users to the set-verified.html page</li>
            <li>Users will receive premium access for the configured duration</li>
          </ol>
        </CardContent>
      </Card>

      {/* Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Access Statistics
          </CardTitle>
          <CardDescription>
            Overview of user access patterns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">-</div>
              <div className="text-sm text-green-600">Premium Users</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">-</div>
              <div className="text-sm text-yellow-600">Ads Users</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">-</div>
              <div className="text-sm text-blue-600">Total Access</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={saveConfig} disabled={loading} className="min-w-32">
          <Save className="h-4 w-4 mr-2" />
          {loading ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
};

export default MonetizationSettings;
