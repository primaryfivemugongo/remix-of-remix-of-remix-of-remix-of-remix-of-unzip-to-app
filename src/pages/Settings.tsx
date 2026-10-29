import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Database,
  Save,
  RefreshCw,
  Moon,
  Sun,
  Monitor,
  Key,
  Lock,
  Mail,
  Smartphone,
  FileText,
  TrendingUp
} from "lucide-react";
import { useNavigate } from "@/lib/router-compat";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface UserSettings {
  email_notifications: boolean;
  push_notifications: boolean;
  theme: string;
  language: string;
  timezone: string;
  two_factor_enabled: boolean;
  profile_visibility: string;
  auto_save: boolean;
}

export default function Settings() {
  const navigate = useNavigate();
  const { userName, photoUrl, userRole } = useAuth();
  const { theme, setTheme } = useTheme();
  
  const [settings, setSettings] = useState<UserSettings>({
    email_notifications: true,
    push_notifications: false,
    theme: theme || 'system',
    language: 'en',
    timezone: 'UTC',
    two_factor_enabled: false,
    profile_visibility: 'public',
    auto_save: true
  });

  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('profile');

  const handleLogout = () => {
    navigate('/login');
  };

  useEffect(() => {
    fetchUserSettings();
  }, []);

  const fetchUserSettings = async () => {
    try {
      // For now, just use local state since user_settings table might not exist
      console.log('Settings initialized');
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const saveSettings = async () => {
    try {
      setLoading(true);
      // For now, just save to localStorage since user_settings table might not exist
      localStorage.setItem('userSettings', JSON.stringify(settings));
      toast.success('Settings saved successfully!');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    setSettings(prev => ({ ...prev, theme: newTheme }));
  };

  const settingsSections = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'preferences', label: 'Preferences', icon: SettingsIcon },
  ];

  const renderProfileSection = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src={photoUrl} />
          <AvatarFallback className="text-lg">
            {userName?.split(' ').map(n => n[0]).join('') || 'U'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="text-xl font-semibold">{userName || 'User'}</h3>
          <p className="text-muted-foreground">user@example.com</p>
          <Badge variant={userRole === 'admin' ? 'default' : 'secondary'} className="mt-1">
            {userRole || 'User'}
          </Badge>
        </div>
      </div>

      <div className="grid gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input id="firstName" placeholder="Enter first name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input id="lastName" placeholder="Enter last name" />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value="user@example.com" disabled />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Input id="bio" placeholder="Tell us about yourself" />
        </div>
      </div>
    </div>
  );

  const renderNotificationsSection = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-base">Email Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Receive notifications via email
            </p>
          </div>
          <Switch
            checked={settings.email_notifications}
            onCheckedChange={(checked) => 
              setSettings(prev => ({ ...prev, email_notifications: checked }))
            }
          />
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-base">Push Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Receive push notifications in your browser
            </p>
          </div>
          <Switch
            checked={settings.push_notifications}
            onCheckedChange={(checked) => 
              setSettings(prev => ({ ...prev, push_notifications: checked }))
            }
          />
        </div>

        <Separator />

        <div className="space-y-3">
          <Label className="text-base">Notification Types</Label>
          <div className="space-y-3">
            {[
              { id: 'assignments', label: 'New Assignments', icon: FileText },
              { id: 'grades', label: 'Grade Updates', icon: TrendingUp },
              { id: 'messages', label: 'Messages', icon: Mail },
              { id: 'reminders', label: 'Reminders', icon: Bell }
            ].map((type) => (
              <div key={type.id} className="flex items-center space-x-3">
                <type.icon className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor={type.id} className="flex-1">{type.label}</Label>
                <Switch id={type.id} defaultChecked />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecuritySection = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-base">Two-Factor Authentication</Label>
            <p className="text-sm text-muted-foreground">
              Add an extra layer of security to your account
            </p>
          </div>
          <Switch
            checked={settings.two_factor_enabled}
            onCheckedChange={(checked) => 
              setSettings(prev => ({ ...prev, two_factor_enabled: checked }))
            }
          />
        </div>

        <Separator />

        <div className="space-y-3">
          <Label className="text-base">Password & Security</Label>
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <Key className="mr-2 h-4 w-4" />
              Change Password
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Lock className="mr-2 h-4 w-4" />
              Session Management
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Smartphone className="mr-2 h-4 w-4" />
              Trusted Devices
            </Button>
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <Label>Profile Visibility</Label>
          <Select 
            value={settings.profile_visibility} 
            onValueChange={(value) => 
              setSettings(prev => ({ ...prev, profile_visibility: value }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public">Public</SelectItem>
              <SelectItem value="friends">Friends Only</SelectItem>
              <SelectItem value="private">Private</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );

  const renderAppearanceSection = () => (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label className="text-base">Theme</Label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { id: 'light', label: 'Light', icon: Sun },
            { id: 'dark', label: 'Dark', icon: Moon },
            { id: 'system', label: 'System', icon: Monitor }
          ].map((themeOption) => (
            <Button
              key={themeOption.id}
              variant={settings.theme === themeOption.id ? 'default' : 'outline'}
              className="h-20 flex-col gap-2"
              onClick={() => handleThemeChange(themeOption.id)}
            >
              <themeOption.icon className="h-5 w-5" />
              <span>{themeOption.label}</span>
            </Button>
          ))}
        </div>
      </div>

      <Separator />

      <div className="space-y-3">
        <Label>Language</Label>
        <Select 
          value={settings.language} 
          onValueChange={(value) => 
            setSettings(prev => ({ ...prev, language: value }))
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="es">Spanish</SelectItem>
            <SelectItem value="fr">French</SelectItem>
            <SelectItem value="de">German</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <Label>Timezone</Label>
        <Select 
          value={settings.timezone} 
          onValueChange={(value) => 
            setSettings(prev => ({ ...prev, timezone: value }))
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="UTC">UTC</SelectItem>
            <SelectItem value="America/New_York">Eastern Time</SelectItem>
            <SelectItem value="America/Chicago">Central Time</SelectItem>
            <SelectItem value="America/Denver">Mountain Time</SelectItem>
            <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const renderPreferencesSection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label className="text-base">Auto-save</Label>
          <p className="text-sm text-muted-foreground">
            Automatically save your work
          </p>
        </div>
        <Switch
          checked={settings.auto_save}
          onCheckedChange={(checked) => 
            setSettings(prev => ({ ...prev, auto_save: checked }))
          }
        />
      </div>

      <Separator />

      <div className="space-y-3">
        <Label className="text-base">Data & Storage</Label>
        <div className="space-y-3">
          <Button variant="outline" className="w-full justify-start">
            <Database className="mr-2 h-4 w-4" />
            Export My Data
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <RefreshCw className="mr-2 h-4 w-4" />
            Clear Cache
          </Button>
        </div>
      </div>

      <Separator />

      <div className="space-y-3">
        <Label className="text-base">Default Dashboard</Label>
        <Select defaultValue="overview">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="overview">Overview</SelectItem>
            <SelectItem value="calendar">Calendar</SelectItem>
            <SelectItem value="assignments">Assignments</SelectItem>
            <SelectItem value="grades">Grades</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const renderSection = () => {
    switch (activeSection) {
      case 'profile': return renderProfileSection();
      case 'notifications': return renderNotificationsSection();
      case 'security': return renderSecuritySection();
      case 'appearance': return renderAppearanceSection();
      case 'preferences': return renderPreferencesSection();
      default: return renderProfileSection();
    }
  };

  return (
    <DashboardLayout 
      userRole={userRole as any} 
      userName={userName} 
      photoUrl={photoUrl} 
      onLogout={handleLogout}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">
              Manage your account settings and preferences
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => window.location.reload()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Reset
            </Button>
            <Button onClick={saveSettings} disabled={loading}>
              {loading ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save Changes
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Settings Navigation */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Settings Menu</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <nav className="space-y-1">
                {settingsSections.map((section) => (
                  <Button
                    key={section.id}
                    variant={activeSection === section.id ? 'secondary' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => setActiveSection(section.id)}
                  >
                    <section.icon className="mr-2 h-4 w-4" />
                    {section.label}
                  </Button>
                ))}
              </nav>
            </CardContent>
          </Card>

          {/* Settings Content */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {(() => {
                  const section = settingsSections.find(s => s.id === activeSection);
                  const IconComponent = section?.icon;
                  return IconComponent ? <IconComponent className="h-5 w-5" /> : null;
                })()}
                {settingsSections.find(s => s.id === activeSection)?.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderSection()}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}