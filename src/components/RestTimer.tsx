import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Timer, X, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface RestTimerProps {
  onClose: () => void;
}

export function RestTimer({ onClose }: RestTimerProps) {
  const { t } = useLanguage();
  const [seconds, setSeconds] = useState(() => {
    const saved = localStorage.getItem('restDuration');
    return saved ? parseInt(saved) : 60;
  });
  const [isRunning, setIsRunning] = useState(true);
  const [duration, setDuration] = useState(seconds);
  const [isMuted, setIsMuted] = useState(() => {
    const saved = localStorage.getItem('timerMuted');
    return saved === 'true';
  });
  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem('timerVolume');
    return saved ? parseFloat(saved) : 0.7;
  });


  useEffect(() => {
    if (!isRunning || seconds <= 0) return;

    const interval = setInterval(() => {
      setSeconds(prev => {
        if (prev <= 1) {
          // Timer finished - play sound and vibrate
          try {
            const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBi2Azfbe');
            audio.volume = isMuted ? 0 : volume;
            audio.play().catch(() => {});
          } catch (e) {}
          
          // Vibrate if supported
          if (navigator.vibrate) {
            navigator.vibrate([200, 100, 200]);
          }
          
          setIsRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, seconds, isMuted, volume]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const adjustDuration = (newDuration: number) => {
    setDuration(newDuration);
    setSeconds(newDuration);
    localStorage.setItem('restDuration', newDuration.toString());
  };

  const reset = () => {
    setSeconds(duration);
    setIsRunning(true);
  };

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    localStorage.setItem('timerMuted', newMuted.toString());
  };

  const handleVolumeChange = (newVolume: number[]) => {
    const vol = newVolume[0];
    setVolume(vol);
    localStorage.setItem('timerVolume', vol.toString());
  };

  return (
    <Card className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-40 animate-scale-in shadow-lg border-2 border-primary">
      <CardContent className="p-3 md:p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Timer className="h-5 w-5 text-primary" />
            <span className="font-semibold text-sm md:text-base">{t.common.restTimer || 'Rest Timer'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Button size="icon" variant="ghost" onClick={toggleMute} className="h-8 w-8">
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
            <Button size="icon" variant="ghost" onClick={onClose} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="text-center mb-4">
          <div className="text-5xl md:text-6xl font-bold text-gradient mb-2">
            {formatTime(seconds)}
          </div>
          {seconds === 0 && (
            <p className="text-success font-semibold animate-pulse text-sm md:text-base">
              {t.common.timeUp || 'Time\'s up!'}
            </p>
          )}
        </div>

        {!isMuted && (
          <div className="mb-4 px-2">
            <div className="flex items-center gap-2 mb-2">
              <Volume2 className="h-3.5 w-3.5 text-muted-foreground" />
              <Slider
                value={[volume]}
                onValueChange={handleVolumeChange}
                max={1}
                step={0.1}
                className="flex-1"
              />
              <span className="text-xs text-muted-foreground w-8 text-right">
                {Math.round(volume * 100)}%
              </span>
            </div>
          </div>
        )}

        <div className="flex gap-2 mb-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsRunning(!isRunning)}
            className="flex-1 h-10 touch-manipulation"
          >
            {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button variant="outline" size="sm" onClick={reset} className="flex-1 h-10 touch-manipulation">
            {t.common.reset || 'Reset'}
          </Button>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {[30, 60, 90, 120].map(dur => (
            <Button
              key={dur}
              variant={duration === dur ? "default" : "outline"}
              size="sm"
              onClick={() => adjustDuration(dur)}
              className="h-10 touch-manipulation text-xs md:text-sm"
            >
              {dur}s
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}