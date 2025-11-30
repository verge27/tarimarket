import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { getCurrentUser, setCurrentUser, DEMO_USERS } from '@/lib/data';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const Settings = () => {
  const currentUser = getCurrentUser();
  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [xmrAddress, setXmrAddress] = useState(currentUser?.xmrAddress || '');

  if (!currentUser) {
    return <Navigate to="/" replace />;
  }

  const handleSave = () => {
    const updatedUser = {
      ...currentUser,
      displayName,
      xmrAddress
    };
    
    // Update in demo users array
    const userIndex = DEMO_USERS.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
      DEMO_USERS[userIndex] = updatedUser;
    }
    
    setCurrentUser(updatedUser);
    toast.success('Settings saved successfully!');
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-4xl font-bold mb-8">Settings</h1>

        <Card>
          <CardContent className="p-6 space-y-6">
            <div>
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your display name"
              />
            </div>

            <div>
              <Label htmlFor="xmrAddress">XMR Address</Label>
              <Input
                id="xmrAddress"
                value={xmrAddress}
                onChange={(e) => setXmrAddress(e.target.value)}
                placeholder="Your Monero address"
                className="font-mono text-sm"
              />
              <p className="text-sm text-muted-foreground mt-1">
                This is where you'll receive payments for your sales
              </p>
            </div>

            <Button onClick={handleSave} className="w-full">
              Save Changes
            </Button>
          </CardContent>
        </Card>

        <Card className="mt-6 bg-primary/10 border-primary/20">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-2">Demo Mode</h3>
            <p className="text-sm text-muted-foreground">
              This is a demo application. All data is stored locally in your browser and will be lost if you clear your browser data.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
