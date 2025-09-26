import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Navbar } from "@/components/ui/navbar";
import { useToast } from "@/hooks/use-toast";
import { 
  User, 
  Mail, 
  Bell, 
  Shield, 
  Eye, 
  EyeOff,
  Save,
  Edit3,
  Camera
} from "lucide-react";
import axios from "axios";

interface UserProfile {
  name: string;
  email: string;
  joinDate: string;
  lastLogin: string;
  preferences: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    priceAlerts: boolean;
    newsUpdates: boolean;
    weeklyReport: boolean;
  };
  watchlistPreferences: {
    defaultView: string;
    autoRefresh: boolean;
    compactView: boolean;
  };
}

export default function Profile() {
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    email: "",
    joinDate: "",
    lastLogin: "",
    preferences: {
      emailNotifications: true,
      pushNotifications: true,
      priceAlerts: true,
      newsUpdates: false,
      weeklyReport: true,
    },
    watchlistPreferences: {
      defaultView: "grid",
      autoRefresh: true,
      compactView: false,
    }
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const { toast } = useToast();

  // Fetch logged-in user data
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("token"); // JWT stored after login
        if (!token) return;

        const res = await axios.get("http://localhost:5000/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` }
        });

        const user = res.data;
        setProfile(prev => ({
          ...prev,
          name: user.name,
          email: user.email,
          joinDate: user.joinDate || new Date().toISOString(),
          lastLogin: user.lastLogin || new Date().toISOString(),
        }));
      } catch (err) {
        console.error("Failed to fetch user profile", err);
      }
    };
    fetchUserProfile();
  }, []);

  const handleProfileUpdate = () => {
    toast({
      title: "Profile Updated",
      description: "Your profile information has been successfully updated.",
    });
    setIsEditingProfile(false);
  };

  const handlePasswordChange = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "New password and confirmation don't match.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Password Changed",
      description: "Your password has been successfully updated.",
    });
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setIsChangingPassword(false);
  };

  const handlePreferenceChange = (category: keyof UserProfile['preferences'], value: boolean) => {
    setProfile(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [category]: value
      }
    }));
  };

  const handleWatchlistPrefChange = (category: keyof UserProfile['watchlistPreferences'], value: boolean | string) => {
    setProfile(prev => ({
      ...prev,
      watchlistPreferences: {
        ...prev.watchlistPreferences,
        [category]: value
      }
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatLastLogin = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar isAuthenticated userRole="user" />
      
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            <span className="crypto-gradient-text">Profile</span> Settings
          </h1>
          <p className="text-muted-foreground">Manage your account information and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card className="crypto-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="h-5 w-5 text-primary" />
                    <span>Profile Information</span>
                  </CardTitle>
                  <CardDescription>Update your personal information</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditingProfile(!isEditingProfile)}
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  {isEditingProfile ? 'Cancel' : 'Edit'}
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Avatar */}
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <div className="h-20 w-20 rounded-full bg-gradient-primary crypto-glow flex items-center justify-center">
                      <User className="h-10 w-10 text-background" />
                    </div>
                    {isEditingProfile && (
                      <Button
                        size="sm"
                        className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                      >
                        <Camera className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{profile.name}</h3>
                    <p className="text-muted-foreground">Member since {formatDate(profile.joinDate)}</p>
                    <p className="text-sm text-muted-foreground">Last login: {formatLastLogin(profile.lastLogin)}</p>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={profile.name}
                      onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                      disabled={!isEditingProfile}
                      className="bg-muted/50 border-border focus:border-primary"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                      disabled={!isEditingProfile}
                      className="bg-muted/50 border-border focus:border-primary"
                    />
                  </div>
                </div>

                {isEditingProfile && (
                  <div className="flex space-x-3 pt-4">
                    <Button onClick={handleProfileUpdate} className="crypto-glow">
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditingProfile(false)}>
                      Cancel
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Password Change */}
            <Card className="crypto-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-primary" />
                    <span>Security</span>
                  </CardTitle>
                  <CardDescription>Change your password</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsChangingPassword(!isChangingPassword)}
                >
                  {isChangingPassword ? 'Cancel' : 'Change Password'}
                </Button>
              </CardHeader>
              {isChangingPassword && (
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showPassword ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                        className="bg-muted/50 border-border focus:border-primary pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                      className="bg-muted/50 border-border focus:border-primary"
                    />
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="bg-muted/50 border-border focus:border-primary"
                    />
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <Button onClick={handlePasswordChange} className="crypto-glow">
                      Update Password
                    </Button>
                    <Button variant="outline" onClick={() => setIsChangingPassword(false)}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>

          {/* Preferences Sidebar */}
          <div className="space-y-6">
            {/* Notification Preferences */}
            <Card className="crypto-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="h-5 w-5 text-primary" />
                  <span>Notifications</span>
                </CardTitle>
                <CardDescription>Manage your notification preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(profile.preferences).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <Label htmlFor={key} className="text-sm font-normal cursor-pointer">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </Label>
                    <input
                      id={key}
                      type="checkbox"
                      checked={value}
                      onChange={(e) => handlePreferenceChange(key as keyof UserProfile['preferences'], e.target.checked)}
                      className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Watchlist Preferences */}
            <Card className="crypto-card">
              <CardHeader>
                <CardTitle>Watchlist Settings</CardTitle>
                <CardDescription>Customize your watchlist experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-normal">Auto Refresh</Label>
                  <input
                    type="checkbox"
                    checked={profile.watchlistPreferences.autoRefresh}
                    onChange={(e) => handleWatchlistPrefChange('autoRefresh', e.target.checked)}
                    className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-normal">Compact View</Label>
                  <input
                    type="checkbox"
                    checked={profile.watchlistPreferences.compactView}
                    onChange={(e) => handleWatchlistPrefChange('compactView', e.target.checked)}
                    className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Account Summary */}
            <Card className="crypto-card border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg">Account Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Account Type:</span>
                  <span className="text-sm font-medium">Premium</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Portfolio Value:</span>
                  <span className="text-sm font-medium">$45,250.30</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Watchlist Items:</span>
                  <span className="text-sm font-medium">8</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Transactions:</span>
                  <span className="text-sm font-medium">23</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
