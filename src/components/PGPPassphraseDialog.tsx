import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { KeyRound, Lock, Shield, Fingerprint, Check } from 'lucide-react';
import { usePGP } from '@/hooks/usePGP';
import { usePasskey } from '@/hooks/usePasskey';
import { useToast } from '@/hooks/use-toast';

interface PGPPassphraseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUnlocked?: () => void;
}

export function PGPPassphraseDialog({ open, onOpenChange, onUnlocked }: PGPPassphraseDialogProps) {
  const { checkHasKeys, generateKeys, unlockKeys, restoreSession } = usePGP();
  const { isSupported: passkeySupported, hasPasskey, checkAvailability, registerPasskey, authenticateWithPasskey } = usePasskey();
  const { toast } = useToast();
  const [mode, setMode] = useState<'checking' | 'create' | 'unlock'>('checking');
  const [passphrase, setPassphrase] = useState('');
  const [confirmPassphrase, setConfirmPassphrase] = useState('');
  const [loading, setLoading] = useState(false);
  const [passkeyAvailable, setPasskeyAvailable] = useState(false);
  const [showPasskeySetup, setShowPasskeySetup] = useState(false);
  const [passkeyRegistered, setPasskeyRegistered] = useState(false);

  useEffect(() => {
    if (open) {
      // First try to restore from session
      if (restoreSession()) {
        onOpenChange(false);
        onUnlocked?.();
        return;
      }

      // Check passkey availability
      checkAvailability().then(setPasskeyAvailable);

      // Check if user has keys
      checkHasKeys().then(hasKeys => {
        setMode(hasKeys ? 'unlock' : 'create');
      });
    }
  }, [open, checkHasKeys, restoreSession, onOpenChange, onUnlocked, checkAvailability]);

  // Try passkey authentication automatically when dialog opens in unlock mode
  useEffect(() => {
    if (open && mode === 'unlock' && hasPasskey && !loading) {
      handlePasskeyUnlock();
    }
  }, [open, mode, hasPasskey]);

  const handlePasskeyUnlock = async () => {
    setLoading(true);
    const retrievedPassphrase = await authenticateWithPasskey();
    
    if (retrievedPassphrase) {
      const success = await unlockKeys(retrievedPassphrase);
      if (success) {
        toast({
          title: 'Keys unlocked',
          description: 'Authenticated with biometrics'
        });
        onOpenChange(false);
        onUnlocked?.();
        setLoading(false);
        return;
      }
    }
    setLoading(false);
  };

  const handleCreate = async () => {
    if (passphrase.length < 8) {
      toast({
        title: 'Passphrase too short',
        description: 'Please use at least 8 characters',
        variant: 'destructive'
      });
      return;
    }

    if (passphrase !== confirmPassphrase) {
      toast({
        title: 'Passphrases do not match',
        description: 'Please make sure both passphrases match',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    const success = await generateKeys(passphrase);
    
    if (success) {
      // Offer passkey setup if available
      if (passkeyAvailable) {
        setShowPasskeySetup(true);
        setLoading(false);
        return;
      }
      
      toast({
        title: 'PGP keys created',
        description: 'Your messages are now end-to-end encrypted'
      });
      setPassphrase('');
      setConfirmPassphrase('');
      onOpenChange(false);
      onUnlocked?.();
    } else {
      toast({
        title: 'Failed to create keys',
        description: 'Please try again',
        variant: 'destructive'
      });
    }
    setLoading(false);
  };

  const handleSetupPasskey = async () => {
    setLoading(true);
    const success = await registerPasskey(passphrase);
    setLoading(false);
    
    if (success) {
      setPasskeyRegistered(true);
      toast({
        title: 'Biometric unlock enabled',
        description: 'You can now unlock with fingerprint or Face ID'
      });
      setTimeout(() => {
        setPassphrase('');
        setConfirmPassphrase('');
        setShowPasskeySetup(false);
        setPasskeyRegistered(false);
        onOpenChange(false);
        onUnlocked?.();
      }, 1500);
    } else {
      toast({
        title: 'Failed to set up biometrics',
        description: 'You can still use your passphrase',
        variant: 'destructive'
      });
    }
  };

  const handleSkipPasskey = () => {
    toast({
      title: 'PGP keys created',
      description: 'Your messages are now end-to-end encrypted'
    });
    setPassphrase('');
    setConfirmPassphrase('');
    setShowPasskeySetup(false);
    onOpenChange(false);
    onUnlocked?.();
  };

  const handleUnlock = async () => {
    setLoading(true);
    const success = await unlockKeys(passphrase);

    if (success) {
      // Offer passkey setup if available and not already set up
      if (passkeyAvailable && !hasPasskey) {
        setShowPasskeySetup(true);
        setLoading(false);
        return;
      }
      
      toast({
        title: 'Keys unlocked',
        description: 'You can now read and send encrypted messages'
      });
      setPassphrase('');
      onOpenChange(false);
      onUnlocked?.();
    } else {
      toast({
        title: 'Wrong passphrase',
        description: 'Please check your passphrase and try again',
        variant: 'destructive'
      });
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            {showPasskeySetup ? 'Enable Biometric Unlock' : mode === 'create' ? 'Set Up Encryption' : 'Unlock Messages'}
          </DialogTitle>
          <DialogDescription>
            {showPasskeySetup
              ? 'Use fingerprint or Face ID to unlock your messages faster next time.'
              : mode === 'create'
              ? 'Create a passphrase to protect your encryption keys. This passphrase is used to encrypt your private key.'
              : 'Enter your passphrase to unlock your encrypted messages.'}
          </DialogDescription>
        </DialogHeader>

        {mode === 'checking' ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : showPasskeySetup ? (
          <div className="space-y-4">
            {passkeyRegistered ? (
              <div className="flex flex-col items-center py-6 gap-3">
                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
                  <Check className="w-8 h-8 text-green-500" />
                </div>
                <p className="font-medium text-green-500">Biometric unlock enabled!</p>
              </div>
            ) : (
              <>
                <div className="flex flex-col items-center py-4 gap-3">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Fingerprint className="w-8 h-8 text-primary" />
                  </div>
                  <p className="text-sm text-center text-muted-foreground">
                    Unlock with your device's biometric authentication instead of typing your passphrase.
                  </p>
                </div>

                <Button
                  onClick={handleSetupPasskey}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? 'Setting up...' : 'Enable Biometric Unlock'}
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleSkipPasskey}
                  className="w-full"
                >
                  Skip for now
                </Button>
              </>
            )}
          </div>
        ) : mode === 'create' ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="passphrase">Passphrase</Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="passphrase"
                  type="password"
                  placeholder="Enter a strong passphrase"
                  value={passphrase}
                  onChange={(e) => setPassphrase(e.target.value)}
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Minimum 8 characters. This cannot be recovered if lost!
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassphrase">Confirm Passphrase</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassphrase"
                  type="password"
                  placeholder="Confirm your passphrase"
                  value={confirmPassphrase}
                  onChange={(e) => setConfirmPassphrase(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Button
              onClick={handleCreate}
              disabled={loading || !passphrase || !confirmPassphrase}
              className="w-full"
            >
              {loading ? 'Creating keys...' : 'Create Encryption Keys'}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {hasPasskey && (
              <div className="flex flex-col items-center py-2 gap-2">
                <Button
                  variant="outline"
                  onClick={handlePasskeyUnlock}
                  disabled={loading}
                  className="w-full gap-2"
                >
                  <Fingerprint className="w-4 h-4" />
                  {loading ? 'Authenticating...' : 'Unlock with Biometrics'}
                </Button>
                <div className="flex items-center gap-2 text-xs text-muted-foreground w-full">
                  <div className="flex-1 h-px bg-border" />
                  <span>or use passphrase</span>
                  <div className="flex-1 h-px bg-border" />
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="unlockPassphrase">Passphrase</Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="unlockPassphrase"
                  type="password"
                  placeholder="Enter your passphrase"
                  value={passphrase}
                  onChange={(e) => setPassphrase(e.target.value)}
                  className="pl-10"
                  onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
                />
              </div>
            </div>

            <Button
              onClick={handleUnlock}
              disabled={loading || !passphrase}
              className="w-full"
            >
              {loading ? 'Unlocking...' : 'Unlock Messages'}
            </Button>
          </div>
        )}

        {!showPasskeySetup && (
          <div className="bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">🔐 End-to-End Encryption</p>
            <p>Your messages are encrypted with PGP. Only you and the recipient can read them.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
