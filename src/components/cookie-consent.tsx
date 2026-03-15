"use client";

import { useState, useEffect } from "react";
import { useI18n } from "@/contexts/i18n-provider";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type CookiePreferences = {
  necessary: boolean;
  functional: boolean;
  analytics: boolean;
};

const DEFAULT_PREFERENCES: CookiePreferences = {
  necessary: true,
  functional: false,
  analytics: false,
};

const COOKIE_CONSENT_KEY = "cookie-consent";
const COOKIE_PREFERENCES_KEY = "cookie-preferences";

export default function CookieConsent() {
  const { t } = useI18n();
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>(DEFAULT_PREFERENCES);

  useEffect(() => {
    const hasConsented = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!hasConsented) {
      setIsVisible(true);
    } else {
      const savedPrefs = localStorage.getItem(COOKIE_PREFERENCES_KEY);
      if (savedPrefs) {
        setPreferences(JSON.parse(savedPrefs));
      }
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "all");
    localStorage.setItem(
      COOKIE_PREFERENCES_KEY,
      JSON.stringify({ necessary: true, functional: true, analytics: true })
    );
    setIsVisible(false);
  };

  const handleRejectAll = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "rejected");
    localStorage.setItem(
      COOKIE_PREFERENCES_KEY,
      JSON.stringify(DEFAULT_PREFERENCES)
    );
    setIsVisible(false);
  };

  const handleSavePreferences = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "custom");
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(preferences));
    setShowPreferences(false);
    setIsVisible(false);
  };

  const togglePreference = (key: keyof CookiePreferences) => {
    if (key === "necessary") return;
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t shadow-lg animate-slide-up">
      <div className="container mx-auto px-4 py-6">
        {showPreferences ? (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">
                {t("CookieConsent.preferences.title")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t("CookieConsent.preferences.description")}
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start justify-between p-4 rounded-lg border bg-card">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {t("CookieConsent.preferences.necessary.title")}
                    </span>
                    <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                      {t("CookieConsent.preferences.necessary.alwaysActive")}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t("CookieConsent.preferences.necessary.description")}
                  </p>
                </div>
              </div>

              <div className="flex items-start justify-between p-4 rounded-lg border bg-card">
                <div className="space-y-1">
                  <div className="font-medium">
                    {t("CookieConsent.preferences.functional.title")}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t("CookieConsent.preferences.functional.description")}
                  </p>
                </div>
                <button
                  onClick={() => togglePreference("functional")}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    preferences.functional
                      ? "bg-primary"
                      : "bg-muted"
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 rounded-full bg-background shadow transition-transform ${
                      preferences.functional
                        ? "translate-x-7"
                        : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-start justify-between p-4 rounded-lg border bg-card">
                <div className="space-y-1">
                  <div className="font-medium">
                    {t("CookieConsent.preferences.analytics.title")}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t("CookieConsent.preferences.analytics.description")}
                  </p>
                </div>
                <button
                  onClick={() => togglePreference("analytics")}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    preferences.analytics
                      ? "bg-primary"
                      : "bg-muted"
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 rounded-full bg-background shadow transition-transform ${
                      preferences.analytics
                        ? "translate-x-7"
                        : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setShowPreferences(false)}
              >
                {t("Common.back")}
              </Button>
              <Button onClick={handleSavePreferences}>
                {t("CookieConsent.savePreferences")}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">
                {t("CookieConsent.title")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t("CookieConsent.description")}{" "}
                <Link
                  href="/cookies"
                  className="text-primary hover:underline"
                >
                  {t("CookieConsent.policyLink")}
                </Link>
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreferences(true)}
              >
                {t("CookieConsent.customize")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRejectAll}
              >
                {t("CookieConsent.rejectAll")}
              </Button>
              <Button size="sm" onClick={handleAcceptAll}>
                {t("CookieConsent.acceptAll")}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
