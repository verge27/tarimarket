import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { usePGP } from '@/hooks/usePGP';
import { settingsSchema } from '@/lib/validation';
import { Shield, Download, Key, Copy, Check, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { PGPPassphraseDialog } from '@/components/PGPPassphraseDialog';

const Settings = () => {
  const { user } = useAuth();
  const { profile, loading, updateProfile } = useProfile();
  const { isUnlocked, checkHasKeys, restoreSession } = usePGP();
  const [displayName, setDisplayName] = useState('');
  const [xmrAddress, setXmrAddress] = useState('');
  const [pgpKeys, setPgpKeys] = useState<{ publicKey: string; encryptedPrivateKey: string } | null>(null);
  const [loadingKeys, setLoadingKeys] = useState(true);
  const [copied, setCopied] = useState<'public' | 'private' | null>(null);
  const [showPGPDialog, setShowPGPDialog] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
      setXmrAddress(profile.xmr_address || '');
    }
  }, [profile]);

  // Fetch PGP keys
  useEffect(() => {
    const fetchKeys = async () => {
      if (!user) return;
      
      try {
        const { data } = await supabase
          .from('profiles')
          .select('pgp_public_key, pgp_encrypted_private_key')
          .eq('id', user.id)
          .maybeSingle();
        
        if (data?.pgp_public_key) {
          setPgpKeys({
            publicKey: data.pgp_public_key,
            encryptedPrivateKey: data.pgp_encrypted_private_key || ''
          });
        }
      } catch (e) {
        console.error('Failed to fetch PGP keys:', e);
      } finally {
        setLoadingKeys(false);
      }
    };

    fetchKeys();
    restoreSession();
  }, [user, restoreSession]);

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const handleSave = async () => {
    try {
      settingsSchema.parse({
        displayName,
        xmrAddress: xmrAddress || ''
      });
    } catch (error: any) {
      toast.error(error.errors?.[0]?.message || 'Invalid input');
      return;
    }

    const { error } = await updateProfile({
      display_name: displayName,
      xmr_address: xmrAddress || null
    });
    
    if (error) {
      toast.error('Failed to save settings');
    } else {
      toast.success('Settings saved successfully!');
    }
  };

  const handleCopy = async (type: 'public' | 'private') => {
    if (!pgpKeys) return;
    
    const text = type === 'public' ? pgpKeys.publicKey : pgpKeys.encryptedPrivateKey;
    await navigator.clipboard.writeText(text);
    setCopied(type);
    toast.success(`${type === 'public' ? 'Public' : 'Private'} key copied to clipboard`);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDownload = (type: 'public' | 'private') => {
    if (!pgpKeys) return;
    
    const text = type === 'public' ? pgpKeys.publicKey : pgpKeys.encryptedPrivateKey;
    const filename = type === 'public' ? 'tarimarket-public.asc' : 'tarimarket-private-encrypted.asc';
    
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success(`${type === 'public' ? 'Public' : 'Private'} key downloaded`);
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 max-w-2xl space-y-6">
        <h1 className="text-4xl font-bold">Settings</h1>

        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Your public profile information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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

        {/* PGP Encryption Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-500" />
              PGP Encryption
            </CardTitle>
            <CardDescription>
              Manage your end-to-end encryption keys for secure messaging
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loadingKeys ? (
              <p className="text-muted-foreground">Loading keys...</p>
            ) : pgpKeys ? (
              <>
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 flex items-start gap-3">
                  <Shield className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-500">Encryption Enabled</p>
                    <p className="text-sm text-muted-foreground">
                      Your messages are encrypted with PGP. Only you and the recipient can read them.
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Public Key */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <Key className="w-4 h-4" />
                      Public Key
                    </Label>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopy('public')}
                      >
                        {copied === 'public' ? (
                          <Check className="w-4 h-4 mr-1" />
                        ) : (
                          <Copy className="w-4 h-4 mr-1" />
                        )}
                        Copy
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload('public')}
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                  <div className="bg-muted rounded-lg p-3 font-mono text-xs overflow-auto max-h-24">
                    {pgpKeys.publicKey.substring(0, 200)}...
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Share this key with others so they can send you encrypted messages.
                  </p>
                </div>

                <Separator />

                {/* Private Key */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <Key className="w-4 h-4 text-amber-500" />
                      Private Key (Encrypted)
                    </Label>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopy('private')}
                      >
                        {copied === 'private' ? (
                          <Check className="w-4 h-4 mr-1" />
                        ) : (
                          <Copy className="w-4 h-4 mr-1" />
                        )}
                        Copy
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload('private')}
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                  <div className="bg-muted rounded-lg p-3 font-mono text-xs overflow-auto max-h-24">
                    {pgpKeys.encryptedPrivateKey.substring(0, 200)}...
                  </div>
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-amber-500">
                      <strong>Keep this safe!</strong> This key is encrypted with your passphrase. 
                      Back it up securely - if lost, you won't be able to read old messages.
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-6">
                <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="font-medium mb-1">No encryption keys set up</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Set up PGP encryption to secure your messages
                </p>
                <Button onClick={() => setShowPGPDialog(true)}>
                  <Key className="w-4 h-4 mr-2" />
                  Set Up Encryption
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <PGPPassphraseDialog
        open={showPGPDialog}
        onOpenChange={setShowPGPDialog}
        onUnlocked={() => {
          // Refresh keys after setup
          window.location.reload();
        }}
      />
    </div>
  );
};

export default Settings;
