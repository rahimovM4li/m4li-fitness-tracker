import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, CheckCircle, Smartphone, Zap, WifiOff } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/**
 * Dedicated installation page for PWA
 */
export default function Install() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setIsInstalled(true);
      setDeferredPrompt(null);
    }
  };

  const features = [
    {
      icon: WifiOff,
      title: 'Offline Access',
      description: 'Use the app even without internet connection'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Instant loading and smooth performance'
    },
    {
      icon: Smartphone,
      title: 'Native Feel',
      description: 'Works just like a native mobile app'
    }
  ];

  return (
    <main className="min-h-screen pb-20 px-4 pt-6">
      <div className="container max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2 animate-fade-in">
          <h1 className="text-4xl font-bold text-gradient">Install M4li-fit</h1>
          <p className="text-muted-foreground">
            Get the full app experience on your device
          </p>
        </div>

        {/* Install Card */}
        <Card className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <CardHeader className="text-center pb-4">
            <div className="w-24 h-24 mx-auto mb-4 rounded-2xl gradient-primary p-1">
              <div className="w-full h-full bg-background rounded-xl flex items-center justify-center">
                <img 
                  src="/icon-192.png" 
                  alt="M4li-fit Icon" 
                  className="w-20 h-20 rounded-xl"
                />
              </div>
            </div>
            <CardTitle className="text-2xl">M4li-fit PWA</CardTitle>
            <CardDescription>
              Progressive Web App - Install for the best experience
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isInstalled ? (
              <div className="text-center py-6 space-y-3">
                <CheckCircle className="h-16 w-16 text-success mx-auto" />
                <div className="space-y-1">
                  <p className="text-lg font-semibold">App Installed!</p>
                  <p className="text-sm text-muted-foreground">
                    You can now use M4li-fit as a standalone app
                  </p>
                </div>
              </div>
            ) : deferredPrompt ? (
              <Button
                onClick={handleInstall}
                className="w-full"
                variant="gradient"
                size="lg"
              >
                <Download className="h-5 w-5 mr-2" />
                Install Now
              </Button>
            ) : (
              <div className="text-center py-6 space-y-3">
                <p className="text-sm text-muted-foreground">
                  Installation is available on mobile devices and supported browsers.
                </p>
                <div className="space-y-2 text-left text-sm">
                  <p className="font-semibold">Manual Installation:</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li><strong>iOS Safari:</strong> Tap Share → Add to Home Screen</li>
                    <li><strong>Android Chrome:</strong> Menu → Install App</li>
                    <li><strong>Desktop Chrome:</strong> Address bar → Install icon</li>
                  </ul>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Features */}
        <div className="grid gap-4 md:grid-cols-3 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          {features.map((feature, index) => (
            <Card key={index}>
              <CardContent className="pt-6 text-center space-y-2">
                <div className="w-12 h-12 mx-auto rounded-lg bg-primary/10 flex items-center justify-center">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}