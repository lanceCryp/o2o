'use client';

import Link from "next/link";
import { useUser } from '@clerk/nextjs';
import { useI18n } from '@/contexts/i18n-provider';
import { Button } from "@/components/ui/button";
import Header from '@/components/header';
import ParticleBackground from '@/components/particle-background';

export default function HomePage() {
  const { t } = useI18n();
  const { isSignedIn } = useUser();

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-background via-background to-muted/10">
      {/* Particle Background - Fixed at the very back */}
      <ParticleBackground />

      {/* Header */}
      <Header />

      {/* Hero Section */}
      <main className="container mx-auto px-4">
        <section className="py-24 md:py-36 text-center relative">
          {/* Background decoration - behind particles */}
          <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border mb-6 animate-fade-in">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="text-sm font-medium">{t('Hero.badge') || 'Secure & Private'}</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight animate-fade-in-up">
            {t('Hero.title')}
            <br />
            <span className="bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent">
              {t('Hero.titleHighlight')}
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in-up animation-delay-200">
            {t('Hero.description')}
            <br />
            <span className="font-medium text-foreground">{t('Hero.descriptionHighlight')}</span>
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up animation-delay-400">
            <Link href={isSignedIn ? "/dashboard/new" : "/sign-up"}>
              <Button size="lg" className="px-10 h-12 text-lg shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow duration-300">
                {isSignedIn ? t('Hero.ctaLoggedIn') : t('Hero.cta')}
              </Button>
            </Link>
            <Link href="#features">
              <Button variant="outline" size="lg" className="px-10 h-12 text-lg">
                {t('Hero.learnMore') || 'Learn More'}
              </Button>
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="mt-16 flex flex-wrap justify-center gap-8 text-sm text-muted-foreground animate-fade-in animation-delay-600">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>End-to-End Encrypted</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>No Data Storage</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Instant Setup</span>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 relative">
          <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
            <div className="absolute top-1/2 -left-40 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
            <div className="absolute top-1/2 -right-40 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
          </div>

          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">{t('Features.title')}</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              {t('Features.subtitle') || 'Everything you need for secure, private conversations'}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon="🔒"
              title={t('Features.private.title')}
              description={t('Features.private.description')}
              delay={0}
            />
            <FeatureCard
              icon="👥"
              title={t('Features.onetoone.title')}
              description={t('Features.onetoone.description')}
              delay={100}
            />
            <FeatureCard
              icon="🌐"
              title={t('Features.nodownload.title')}
              description={t('Features.nodownload.description')}
              delay={200}
            />
            <FeatureCard
              icon="💰"
              title={t('Features.pricing.title')}
              description={t('Features.pricing.description')}
              delay={300}
            />
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-24 relative">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Get started in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <StepCard
              step="01"
              title="Create Account"
              description="Sign up for free and get 100 minutes of free trial time"
            />
            <StepCard
              step="02"
              title="Start a Room"
              description="Create a private room and share the link with your guest"
            />
            <StepCard
              step="03"
              title="Connect Securely"
              description="Enjoy end-to-end encrypted 1-on-1 video conversation"
            />
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-24 relative">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">{t('Pricing.title')}</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              {t('Pricing.subtitle')}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <PricingCard
              name={t('Pricing.starter.name')}
              price={t('Pricing.starter.price')}
              minutes={t('Pricing.starter.minutes')}
              features={[
                t('Pricing.starter.sessionLimit'),
                t('Pricing.starter.noExpiration'),
                t('Pricing.starter.hdVideo'),
              ]}
              cta={t('Pricing.starter.cta')}
              variant="outline"
              isSignedIn={isSignedIn}
              delay={0}
            />
            <PricingCard
              name={t('Pricing.standard.name')}
              price={t('Pricing.standard.price')}
              minutes={t('Pricing.standard.minutes')}
              features={[
                t('Pricing.standard.sessionLimit'),
                t('Pricing.standard.noExpiration'),
                t('Pricing.standard.hdVideo'),
                t('Pricing.standard.screenSharing'),
              ]}
              cta={t('Pricing.standard.cta')}
              variant="default"
              badge={t('Pricing.standard.bestValue')}
              isSignedIn={isSignedIn}
              delay={100}
            />
            <PricingCard
              name={t('Pricing.unlimited.name')}
              price={t('Pricing.unlimited.price')}
              minutes={t('Pricing.unlimited.minutes')}
              features={[
                t('Pricing.unlimited.sessionLimit'),
                t('Pricing.unlimited.noExpiration'),
                t('Pricing.unlimited.hdVideo'),
                t('Pricing.unlimited.allFeatures'),
              ]}
              cta={t('Pricing.unlimited.cta')}
              variant="outline"
              isSignedIn={isSignedIn}
              delay={200}
            />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t mt-24 py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-bold mb-4">o2o</h3>
              <p className="text-sm text-muted-foreground">
                Private 1-on-1 video calls with end-to-end encryption.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#features" className="hover:text-foreground transition-colors">Features</Link></li>
                <li><Link href="/dashboard/billing" className="hover:text-foreground transition-colors">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/sign-in" className="hover:text-foreground transition-colors">Sign In</Link></li>
                <li><Link href="/sign-up" className="hover:text-foreground transition-colors">Sign Up</Link></li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8 border-t">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold">o2o</span>
              <span className="text-sm text-muted-foreground">© {new Date().getFullYear()} {t('Footer.copyright')}</span>
            </div>
            <div className="flex gap-6">
              <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t('Footer.privacy')}
              </Link>
              <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t('Footer.terms')}
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description, delay }: { icon: string; title: string; description: string; delay?: number }) {
  return (
    <div
      className="text-center p-6 rounded-2xl bg-card border shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}

function StepCard({ step, title, description }: { step: string; title: string; description: string }) {
  return (
    <div className="text-center p-6 rounded-2xl bg-card/50 border">
      <div className="text-6xl font-bold text-primary/10 mb-4">{step}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}

function PricingCard({
  name,
  price,
  minutes,
  features,
  cta,
  variant,
  badge,
  isSignedIn,
  delay,
}: {
  name: string;
  price: string;
  minutes: string;
  features: string[];
  cta: string;
  variant: 'default' | 'outline';
  badge?: string;
  isSignedIn?: boolean;
  delay?: number;
}) {
  return (
    <div
      className={`relative rounded-2xl p-8 text-center animate-fade-in-up ${
        variant === 'default'
          ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 hover:shadow-primary/30'
          : 'bg-card border shadow-sm hover:shadow-lg'
      } transition-all duration-300 hover:-translate-y-1`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {badge && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-1 rounded-full text-xs font-medium whitespace-nowrap">
          {badge}
        </span>
      )}
      <h3 className="text-2xl font-bold mb-2">{name}</h3>
      <div className="flex items-baseline justify-center gap-1 mb-2">
        <span className="text-5xl font-bold">{price}</span>
      </div>
      <p className={`text-sm mb-6 ${variant === 'default' ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
        {minutes}
      </p>
      <ul className="text-left space-y-3 mb-8">
        {features.map((feature, i) => (
          <li key={i} className="flex items-center gap-2 text-sm">
            <span className={variant === 'default' ? 'text-primary-foreground' : ''}>✓</span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <Link href={isSignedIn ? "/dashboard/billing" : "/sign-up"}>
        <Button
          variant={variant === 'default' ? 'secondary' : 'default'}
          className="w-full"
        >
          {cta}
        </Button>
      </Link>
    </div>
  );
}
