import { useState } from 'react';
import { Mic, Upload, Play, Pause, Volume2, AudioWaveform, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const VoiceCloning = () => {
  const { toast } = useToast();
  const [text, setText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleGenerate = async () => {
    if (!text.trim()) {
      toast({
        title: "Text required",
        description: "Please enter some text to convert to speech.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setAudioUrl(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/nanogpt-tts`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, voice: 'alloy' }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'TTS generation failed');
      }

      const audioBlob = await response.blob();
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);

      toast({
        title: "Audio generated",
        description: "Your speech has been generated successfully.",
      });
    } catch (error) {
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Failed to generate speech",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const togglePlayback = () => {
    const audio = document.getElementById('tts-audio') as HTMLAudioElement;
    if (audio) {
      if (isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const pricingTiers = [
    {
      name: 'Basic',
      price: '£9.99',
      period: '/month',
      features: ['100 minutes of audio', 'Standard voices', 'MP3 export', 'Email support'],
      popular: false,
    },
    {
      name: 'Pro',
      price: '£29.99',
      period: '/month',
      features: ['500 minutes of audio', 'All premium voices', 'Voice cloning (3 voices)', 'WAV & MP3 export', 'Priority support'],
      popular: true,
    },
    {
      name: 'Business',
      price: '£79.99',
      period: '/month',
      features: ['2000 minutes of audio', 'Unlimited voice cloning', 'API access', 'Commercial license', 'Dedicated support'],
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            AI-Powered Voice Synthesis
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
            Clone Any Voice with
            <br />
            <span className="text-gradient">Lifelike Precision</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Transform text into natural-sounding speech using cutting-edge AI. Create custom voice clones from just 10 seconds of audio.
          </p>
        </div>
      </section>

      {/* TTS Demo Section */}
      <section className="container mx-auto px-4 py-12">
        <Card className="max-w-3xl mx-auto border-border/50 bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AudioWaveform className="w-5 h-5 text-primary" />
              Try Text-to-Speech
            </CardTitle>
            <CardDescription>
              Enter your text below to generate natural-sounding speech
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Enter text to convert to speech..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-[120px] resize-none"
              maxLength={5000}
            />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {text.length} / 5000 characters
              </span>
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !text.trim()}
                className="gap-2"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4" />
                    Generate Speech
                  </>
                )}
              </Button>
            </div>

            {audioUrl && (
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={togglePlayback}
                  className="shrink-0"
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </Button>
                <audio
                  id="tts-audio"
                  src={audioUrl}
                  onEnded={() => setIsPlaying(false)}
                  className="w-full"
                  controls
                />
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Why Choose Our Voice AI</h2>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Card className="border-border/50 bg-card/50">
            <CardContent className="p-6 text-center">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Mic className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Voice Cloning</h3>
              <p className="text-muted-foreground text-sm">
                Clone any voice from just 5-10 seconds of audio. Perfect for personalized content.
              </p>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card/50">
            <CardContent className="p-6 text-center">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <AudioWaveform className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Natural Speech</h3>
              <p className="text-muted-foreground text-sm">
                AI-generated speech that sounds human, with natural intonation and emotion.
              </p>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card/50">
            <CardContent className="p-6 text-center">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Upload className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Easy Export</h3>
              <p className="text-muted-foreground text-sm">
                Download your audio in multiple formats. Perfect for podcasts, videos, and more.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-4">Simple Pricing</h2>
        <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
          Pay with XMR for complete privacy. Up to 60% cheaper than competitors.
        </p>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {pricingTiers.map((tier) => (
            <Card
              key={tier.name}
              className={`border-border/50 relative ${
                tier.popular ? 'bg-primary/5 border-primary/30' : 'bg-card/50'
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-2">{tier.name}</h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold">{tier.price}</span>
                  <span className="text-muted-foreground">{tier.period}</span>
                </div>
                <ul className="space-y-2 mb-6">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  variant={tier.popular ? 'default' : 'outline'}
                >
                  Get Started
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default VoiceCloning;
