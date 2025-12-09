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
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      (window as any).deferredPrompt = promptEvent;
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    const prompt = deferredPrompt || (window as any).deferredPrompt;
    if (!prompt) return;

    try {
      prompt.prompt();
      const { outcome } = await prompt.userChoice;

      if (outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
      }
    } catch (error) {
      console.error('Installation error:', error);
    }
  };

  const features = [
    {
      icon: WifiOff,
      title: t.pwa.offlineAccess,
      description: t.pwa.offlineDescription
    },
    {
      icon: Zap,
      title: t.pwa.lightningFast,
      description: t.pwa.lightningDescription
    },
    {
      icon: Smartphone,
      title: t.pwa.nativeFeel,
      description: t.pwa.nativeDescription
    }
  ];

  return (
    <main className="min-h-screen pt-20 px-4 pb-16 md:pb-6">
      <div className="container max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2 animate-fade-in">
          <h1 className="text-4xl font-bold text-gradient">{t.pwa.installTitle}</h1>
          <p className="text-muted-foreground">
            {t.pwa.installDescription}
          </p>
        </div>

        {/* Primary Install Button */}
        <div className="animate-fade-in" style={{ animationDelay: '0.05s' }}>
          {isInstalled ? (
            <div className="text-center py-6 space-y-3 glass rounded-2xl">
              <CheckCircle className="h-16 w-16 text-success mx-auto" />
              <div className="space-y-1">
                <p className="text-lg font-semibold">{t.pwa.installed}</p>
                <p className="text-sm text-muted-foreground">
                  {t.pwa.installedDescription}
                </p>
              </div>
            </div>
          ) : (
            <Button
              onClick={handleInstall}
              className="w-full"
              variant="gradient"
              size="lg"
            >
              <Download className="h-5 w-5 mr-2" />
              {t.install_button}
            </Button>
          )}
        </div>

        {/* Install Card */}
        <Card className="animate-fade-in" style={{ animationDelay: '0.15s' }}>
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
              {t.pwa.installDescription}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-6 space-y-3">
              <div className="space-y-2 text-left text-sm">
                <p className="font-semibold">{t.pwa.manualInstall}</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>{t.pwa.iosSafari}</li>
                  <li>{t.pwa.androidChrome}</li>
                  <li>{t.pwa.desktopChrome}</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="grid gap-4 md:grid-cols-3 animate-fade-in" style={{ animationDelay: '0.25s' }}>
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