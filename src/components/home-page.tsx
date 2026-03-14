'use client';

import Link from "next/link";
import { useUser } from '@clerk/nextjs';
import { useI18n } from '@/contexts/i18n-provider';
import { Button } from "@/components/ui/button";
import Header from '@/components/header';

export default function HomePage() {
  const { t } = useI18n();
  const { isSignedIn } = useUser();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <main className="container mx-auto px-4">
        <section className="py-20 md:py-32 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
            {t('Hero.title')}
            <br />
            <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              {t('Hero.titleHighlight')}
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            {t('Hero.description')}
            <br />
            <span className="font-medium">{t('Hero.descriptionHighlight')}</span>
          </p>
          <Link href={isSignedIn ? "/dashboard/new" : "/sign-up"}>
            <Button size="lg" className="px-10 h-12 text-lg shadow-lg shadow-primary/25">
              {isSignedIn ? t('Hero.ctaLoggedIn') : t('Hero.cta')}
            </Button>
          </Link>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">{t('Features.title')}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon="🔒"
              title={t('Features.private.title')}
              description={t('Features.private.description')}
            />
            <FeatureCard
              icon="👥"
              title={t('Features.onetoone.title')}
              description={t('Features.onetoone.description')}
            />
            <FeatureCard
              icon="🌐"
              title={t('Features.nodownload.title')}
              description={t('Features.nodownload.description')}
            />
            <FeatureCard
              icon="💰"
              title={t('Features.pricing.title')}
              description={t('Features.pricing.description')}
            />
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-20">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">{t('Pricing.title')}</h2>
          <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">
            {t('Pricing.subtitle')}
          </p>
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
            />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t mt-20 py-10 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold">o2o</span>
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

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="text-center p-6 rounded-2xl bg-card border shadow-sm hover:shadow-md transition-shadow">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
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
}: {
  name: string;
  price: string;
  minutes: string;
  features: string[];
  cta: string;
  variant: 'default' | 'outline';
  badge?: string;
  isSignedIn?: boolean;
}) {
  return (
    <div className={`relative rounded-2xl p-8 text-center ${
      variant === 'default'
        ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20'
        : 'bg-card border shadow-sm'
    }`}>
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
