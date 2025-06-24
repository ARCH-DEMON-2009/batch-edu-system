
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useData } from '@/contexts/DataContext';
import { toast } from 'sonner';

interface MonetizationConfig {
  access_duration: string;
  server1_url: string;
  server2_url: string;
  linkshortify_enabled: boolean;
}

const MonetizationSettings = () => {
  const { getSettings, updateSettings } = useData();
  const [config, setConfig] = useState<MonetizationConfig>({
    access_duration: '3600',
    server1_url: '',
    server2_url: '',
    linkshortify_enabled: true
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await getSettings('monetization');
      if (settings) {
        setConfig(settings);
      }
    } catch (error) {
      console.error('Error loading monetization settings:', error);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await updateSettings('monetization', config);
      toast.success('Monetization settings updated successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Monetization Settings</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Access Control Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="access-duration">Access Duration</Label>
              <Select 
                value={config.access_duration} 
                onValueChange={(value) => setConfig({ ...config, access_duration: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3600">1 Hour</SelectItem>
                  <SelectItem value="21600">6 Hours</SelectItem>
                  <SelectItem value="43200">12 Hours</SelectItem>
                  <SelectItem value="86400">24 Hours</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch 
                id="linkshortify-enabled"
                checked={config.linkshortify_enabled}
                onCheckedChange={(checked) => setConfig({ ...config, linkshortify_enabled: checked })}
              />
              <Label htmlFor="linkshortify-enabled">Enable LinkShortify Integration</Label>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="server1-url">Server 1 URL (Original Long URL)</Label>
              <Input
                id="server1-url"
                value={config.server1_url}
                onChange={(e) => setConfig({ ...config, server1_url: e.target.value })}
                placeholder="https://example.com/verification-page-1"
              />
              <p className="text-sm text-muted-foreground mt-1">
                This URL will be shortened using LinkShortify for Server 1 button
              </p>
            </div>

            <div>
              <Label htmlFor="server2-url">Server 2 URL (Original Long URL)</Label>
              <Input
                id="server2-url"
                value={config.server2_url}
                onChange={(e) => setConfig({ ...config, server2_url: e.target.value })}
                placeholder="https://example.com/verification-page-2"
              />
              <p className="text-sm text-muted-foreground mt-1">
                This URL will be shortened using LinkShortify for Server 2 button
              </p>
            </div>
          </div>

          <div className="pt-4">
            <Button onClick={handleSave} disabled={loading}>
              {loading ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Usage Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-semibold">How to set up verification servers:</h4>
              <ol className="list-decimal list-inside space-y-2 mt-2">
                <li>Enter your original long URLs above (the actual verification pages)</li>
                <li>Use a URL shortener like LinkShortify to create short links for these URLs</li>
                <li>The shortened links will redirect users to your verification pages</li>
                <li>Your verification pages should redirect back to /set-verified.html after successful verification</li>
              </ol>
            </div>
            <div>
              <h4 className="font-semibold">Access Duration:</h4>
              <p>This determines how long users will have access after verification before needing to verify again.</p>
            </div>
            <div>
              <h4 className="font-semibold">Continue with Ads:</h4>
              <p>Users who choose this option will see Monetag ads throughout the platform instead of verifying through servers.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MonetizationSettings;
