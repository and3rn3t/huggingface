'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  getCurrentUser,
  getToken,
  removeToken,
  saveToken,
  validateToken,
} from '@/services/huggingface';
import { Check, ExternalLink, Key, Loader2, Settings, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface TokenSettingsProps {
  trigger?: React.ReactNode;
}

export function TokenSettings({ trigger }: TokenSettingsProps) {
  const [open, setOpen] = useState(false);
  const [token, setToken] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [hasExistingToken, setHasExistingToken] = useState(false);

  // Listen for custom event to open settings (from error handler)
  useEffect(() => {
    const handleOpenSettings = () => setOpen(true);
    window.addEventListener('open-token-settings', handleOpenSettings);
    return () => window.removeEventListener('open-token-settings', handleOpenSettings);
  }, []);

  // Check for existing token on mount
  useEffect(() => {
    const existingToken = getToken();
    if (existingToken) {
      setHasExistingToken(true);
      setToken(''); // Don't show the actual token
      // Validate existing token
      checkExistingToken();
    }
  }, [open]);

  const checkExistingToken = async () => {
    setIsValidating(true);
    try {
      const user = await getCurrentUser();
      if (user) {
        setIsValid(true);
        setUsername(user.name);
      } else {
        setIsValid(false);
        setUsername(null);
      }
    } catch {
      setIsValid(false);
      setUsername(null);
    }
    setIsValidating(false);
  };

  const handleValidate = async () => {
    if (!token.trim()) {
      toast.error('Please enter a token');
      return;
    }

    setIsValidating(true);
    setIsValid(null);

    try {
      const valid = await validateToken(token.trim());
      setIsValid(valid);

      if (valid) {
        toast.success('Token is valid!');
      } else {
        toast.error('Invalid token - please check and try again');
      }
    } catch {
      setIsValid(false);
      toast.error('Failed to validate token');
    }

    setIsValidating(false);
  };

  const handleSave = async () => {
    if (!token.trim() && !hasExistingToken) {
      toast.error('Please enter a token');
      return;
    }

    // If there's a new token, validate and save it
    if (token.trim()) {
      setIsValidating(true);
      const valid = await validateToken(token.trim());
      setIsValidating(false);

      if (!valid) {
        toast.error('Cannot save invalid token');
        return;
      }

      saveToken(token.trim());
      setHasExistingToken(true);
      setToken('');
      toast.success('API token saved successfully');
    }

    setOpen(false);
  };

  const handleRemove = () => {
    removeToken();
    setToken('');
    setIsValid(null);
    setUsername(null);
    setHasExistingToken(false);
    toast.success('API token removed');
  };

  const handleOpenHuggingFace = () => {
    window.open('https://huggingface.co/settings/tokens', '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="icon" aria-label="API Settings">
            <Settings className="h-5 w-5" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            HuggingFace API Token
          </DialogTitle>
          <DialogDescription>
            Add your HuggingFace API token to use the Inference API and access private
            models/datasets.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Current Status */}
          {hasExistingToken && (
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-2">
                {isValidating ? (
                  <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />
                ) : isValid ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <X className="h-4 w-4 text-red-500" />
                )}
                <span className="text-sm">
                  {isValidating
                    ? 'Validating...'
                    : isValid
                      ? `Connected as ${username || 'user'}`
                      : 'Token invalid or expired'}
                </span>
              </div>
              <Badge variant={isValid ? 'default' : 'destructive'}>
                {isValid ? 'Active' : 'Invalid'}
              </Badge>
            </div>
          )}

          {/* Token Input */}
          <div className="grid gap-2">
            <Label htmlFor="token">{hasExistingToken ? 'Replace Token' : 'API Token'}</Label>
            <div className="flex gap-2">
              <Input
                id="token"
                type="password"
                placeholder={hasExistingToken ? 'Enter new token...' : 'hf_xxxxxxxxxx'}
                value={token}
                onChange={(e) => {
                  setToken(e.target.value);
                  setIsValid(null);
                }}
                className="flex-1"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleValidate}
                disabled={!token.trim() || isValidating}
                aria-label="Validate token"
              >
                {isValidating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isValid === true ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : isValid === false ? (
                  <X className="h-4 w-4 text-red-500" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-muted-foreground text-xs">
              Your token is stored locally and never sent to any server except HuggingFace.
            </p>
          </div>

          {/* Get Token Link */}
          <Button
            variant="link"
            className="justify-start px-0 text-sm"
            onClick={handleOpenHuggingFace}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Get your API token from HuggingFace
          </Button>

          {/* Environment Variable Note */}
          <div className="bg-muted text-muted-foreground rounded-lg p-3 text-xs">
            <strong>Tip:</strong> You can also set your token via the{' '}
            <code className="bg-background rounded px-1">VITE_HF_TOKEN</code> environment variable
            for development.
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          {hasExistingToken && (
            <Button variant="destructive" onClick={handleRemove} className="w-full sm:w-auto">
              Remove Token
            </Button>
          )}
          <Button onClick={handleSave} className="w-full sm:w-auto">
            {token.trim() ? 'Save Token' : 'Done'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
