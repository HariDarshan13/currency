import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Navbar } from "@/components/ui/navbar";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  Database, 
  Activity, 
  Shield, 
  Trash2, 
  Edit3,
  Plus,
  BarChart3,
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock
} from "lucide-react";

interface User {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin';
  status: 'active' | 'inactive' | 'suspended';
  joinDate: string;
  lastLogin: string;
  portfolioValue: number;
}

interface DataSource {
  id: number;
  name: string;
  type: string;
  status: 'active' | 'error' | 'maintenance';
  lastUpdate: string;
  apiCalls: number;
  reliability: number;
}

// Mock admin data
const initialUsers: User[] = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    role: "user",
    status: "active",
    joinDate: "2023-06-15",
    lastLogin: "2024-01-20T10:30:00Z",
    portfolioValue: 45250.30
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    role: "user",
    status: "active",
    joinDate: "2023-08-22",
    lastLogin: "2024-01-19T14:20:00Z",
    portfolioValue: 28750.80
  },
  {
    id: 3,
    name: "Admin User",
    email: "admin@example.com",
    role: "admin",
    status: "active",
    joinDate: "2023-01-10",
    lastLogin: "2024-01-20T09:15:00Z",
    portfolioValue: 125000.00
  },
  {
    id: 4,
    name: "Test User",
    email: "test@example.com",
    role: "user",
    status: "suspended",
    joinDate: "2023-12-01",
    lastLogin: "2024-01-18T16:45:00Z",
    portfolioValue: 5200.50
  }
];

const dataSources: DataSource[] = [
  {
    id: 1,
    name: "CoinGecko API",
    type: "Price Data",
    status: "active",
    lastUpdate: "2024-01-20T10:30:00Z",
    apiCalls: 15420,
    reliability: 99.8
  },
  {
    id: 2,
    name: "CryptoCompare API",
    type: "Historical Data",
    status: "active",
    lastUpdate: "2024-01-20T10:25:00Z",
    apiCalls: 8750,
    reliability: 98.5
  },
  {
    id: 3,
    name: "NewsAPI",
    type: "News & Updates",
    status: "error",
    lastUpdate: "2024-01-20T08:15:00Z",
    apiCalls: 3250,
    reliability: 85.2
  },
  {
    id: 4,
    name: "Binance API",
    type: "Trading Data",
    status: "maintenance",
    lastUpdate: "2024-01-19T22:00:00Z",
    apiCalls: 12500,
    reliability: 97.3
  }
];

export default function Admin() {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "user" as 'user' | 'admin'
  });
  const { toast } = useToast();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatLastLogin = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-secondary/20 text-secondary border-secondary/30';
      case 'error': return 'bg-destructive/20 text-destructive border-destructive/30';
      case 'maintenance': return 'bg-accent/20 text-accent border-accent/30';
      case 'inactive': return 'bg-muted/20 text-muted-foreground border-muted/30';
      case 'suspended': return 'bg-destructive/20 text-destructive border-destructive/30';
      default: return 'bg-muted/20 text-muted-foreground border-muted/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-3 w-3" />;
      case 'error': return <AlertTriangle className="h-3 w-3" />;
      case 'maintenance': return <Clock className="h-3 w-3" />;
      default: return null;
    }
  };

  const addUser = () => {
    if (!newUser.name || !newUser.email) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const user: User = {
      id: Date.now(),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      status: 'active',
      joinDate: new Date().toISOString().split('T')[0],
      lastLogin: new Date().toISOString(),
      portfolioValue: 0
    };

    setUsers([...users, user]);
    setNewUser({ name: "", email: "", role: "user" });
    setShowAddUser(false);

    toast({
      title: "User Added",
      description: `${user.name} has been added to the system.`,
    });
  };

  const deleteUser = (id: number) => {
    const user = users.find(u => u.id === id);
    setUsers(users.filter(u => u.id !== id));
    toast({
      title: "User Deleted",
      description: `${user?.name} has been removed from the system.`,
    });
  };

  const toggleUserStatus = (id: number) => {
    setUsers(prev => prev.map(user => {
      if (user.id === id) {
        const newStatus = user.status === 'active' ? 'suspended' : 'active';
        return { ...user, status: newStatus };
      }
      return user;
    }));
  };

  // Calculate analytics
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === 'active').length;
  const totalPortfolioValue = users.reduce((sum, user) => sum + user.portfolioValue, 0);
  const totalApiCalls = dataSources.reduce((sum, source) => sum + source.apiCalls, 0);

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar isAuthenticated userRole="admin" />
      
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            <span className="crypto-gradient-text">Admin</span> Dashboard
          </h1>
          <p className="text-muted-foreground">Manage users, data sources, and system analytics</p>
        </div>

        {/* Analytics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="crypto-card">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2 mb-2">
                <Users className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium text-muted-foreground">Total Users</span>
              </div>
              <p className="text-2xl font-bold">{totalUsers}</p>
              <p className="text-xs text-muted-foreground">{activeUsers} active</p>
            </CardContent>
          </Card>

          <Card className="crypto-card">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2 mb-2">
                <BarChart3 className="h-5 w-5 text-secondary" />
                <span className="text-sm font-medium text-muted-foreground">Portfolio Value</span>
              </div>
              <p className="text-2xl font-bold">${totalPortfolioValue.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Total managed</p>
            </CardContent>
          </Card>

          <Card className="crypto-card">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2 mb-2">
                <Database className="h-5 w-5 text-accent" />
                <span className="text-sm font-medium text-muted-foreground">API Calls</span>
              </div>
              <p className="text-2xl font-bold">{totalApiCalls.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Last 24h</p>
            </CardContent>
          </Card>

          <Card className="crypto-card">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2 mb-2">
                <Activity className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium text-muted-foreground">System Health</span>
              </div>
              <p className="text-2xl font-bold profit">98.5%</p>
              <p className="text-xs text-muted-foreground">Uptime</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full lg:w-auto grid-cols-3 lg:grid-cols-3">
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="datasources">Data Sources</TabsTrigger>
            <TabsTrigger value="analytics">System Analytics</TabsTrigger>
          </TabsList>

          {/* User Management Tab */}
          <TabsContent value="users" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">User Management</h2>
              <Button className="crypto-glow" onClick={() => setShowAddUser(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </div>

            {/* Add User Form */}
            {showAddUser && (
              <Card className="crypto-card border-primary/20">
                <CardHeader>
                  <CardTitle>Add New User</CardTitle>
                  <CardDescription>Create a new user account</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      placeholder="Full Name"
                      value={newUser.name}
                      onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                    />
                    <Input
                      type="email"
                      placeholder="Email Address"
                      value={newUser.email}
                      onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                    />
                    <select
                      value={newUser.role}
                      onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value as 'user' | 'admin' }))}
                      className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className="flex space-x-3">
                    <Button onClick={addUser} className="crypto-glow">
                      Add User
                    </Button>
                    <Button variant="outline" onClick={() => setShowAddUser(false)}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Users Table */}
            <Card className="crypto-card">
              <CardContent className="pt-6">
                <div className="overflow-x-auto">
                  <div className="min-w-full">
                    {/* Table Header */}
                    <div className="grid grid-cols-7 gap-4 pb-4 border-b border-border text-sm font-medium text-muted-foreground">
                      <div>Name</div>
                      <div>Email</div>
                      <div>Role</div>
                      <div>Status</div>
                      <div>Join Date</div>
                      <div className="text-right">Portfolio Value</div>
                      <div className="text-right">Actions</div>
                    </div>

                    {/* Table Rows */}
                    <div className="space-y-3 pt-4">
                      {users.map((user) => (
                        <div key={user.id} className="grid grid-cols-7 gap-4 py-3 border-b border-border/50 hover:bg-muted/20 rounded-lg px-2 -mx-2">
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-xs text-muted-foreground">ID: {user.id}</p>
                          </div>
                          
                          <div className="text-sm">{user.email}</div>
                          
                          <div>
                            <Badge className={user.role === 'admin' ? 'bg-accent/20 text-accent border-accent/30' : 'bg-primary/20 text-primary border-primary/30'}>
                              {user.role}
                            </Badge>
                          </div>
                          
                          <div>
                            <Badge className={getStatusColor(user.status)}>
                              {getStatusIcon(user.status)}
                              <span className="ml-1 capitalize">{user.status}</span>
                            </Badge>
                          </div>
                          
                          <div className="text-sm">{formatDate(user.joinDate)}</div>
                          
                          <div className="text-right font-medium">
                            ${user.portfolioValue.toLocaleString()}
                          </div>
                          
                          <div className="text-right flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleUserStatus(user.id)}
                              className={user.status === 'active' ? 'text-destructive hover:bg-destructive/10' : 'text-secondary hover:bg-secondary/10'}
                            >
                              {user.status === 'active' ? <Shield className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteUser(user.id)}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data Sources Tab */}
          <TabsContent value="datasources" className="space-y-6">
            <h2 className="text-xl font-semibold">Data Source Management</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {dataSources.map((source) => (
                <Card key={source.id} className="crypto-card">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <div>
                      <CardTitle className="text-lg">{source.name}</CardTitle>
                      <CardDescription>{source.type}</CardDescription>
                    </div>
                    <Badge className={getStatusColor(source.status)}>
                      {getStatusIcon(source.status)}
                      <span className="ml-1 capitalize">{source.status}</span>
                    </Badge>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">API Calls (24h)</p>
                        <p className="font-medium">{source.apiCalls.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Reliability</p>
                        <p className="font-medium">{source.reliability}%</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-muted-foreground">Last Update</p>
                        <p className="font-medium text-xs">{formatLastLogin(source.lastUpdate)}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Edit3 className="h-4 w-4 mr-2" />
                        Configure
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* System Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <h2 className="text-xl font-semibold">System Analytics</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="crypto-card">
                <CardHeader>
                  <CardTitle>User Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48 bg-gradient-to-br from-muted/20 to-muted/5 rounded-lg border border-border flex items-center justify-center">
                    <div className="text-center">
                      <Activity className="h-12 w-12 text-primary/50 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">User activity chart</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="crypto-card">
                <CardHeader>
                  <CardTitle>API Usage</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48 bg-gradient-to-br from-muted/20 to-muted/5 rounded-lg border border-border flex items-center justify-center">
                    <div className="text-center">
                      <Database className="h-12 w-12 text-primary/50 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">API usage metrics</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* System Statistics */}
            <Card className="crypto-card">
              <CardHeader>
                <CardTitle>System Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">Server Uptime</p>
                    <p className="text-2xl font-bold profit">99.8%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">Response Time</p>
                    <p className="text-2xl font-bold text-primary">142ms</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">Error Rate</p>
                    <p className="text-2xl font-bold text-accent">0.02%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}