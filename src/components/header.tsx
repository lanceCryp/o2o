"use client";

import Link from "next/link";
import { useUser, UserButton } from "@clerk/nextjs";
import { useI18n } from "@/contexts/i18n-provider";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/theme-toggle";
import LanguageToggle from "@/components/language-toggle";

interface HeaderProps {
  showDashboardLink?: boolean;
}

export default function Header({ showDashboardLink = false }: HeaderProps) {
  const { t } = useI18n();
  const { isLoaded, isSignedIn } = useUser();

  return (
    <header className="border-b sticky top-0 bg-background/80 backdrop-blur-sm z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            o2o
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />
          {isLoaded && isSignedIn ? (
            <>
              <Link href="/dashboard">
                <Button variant="ghost" className="hidden sm:inline-flex">
                  {t("Common.dashboard")}
                </Button>
              </Link>
              <UserButton />
            </>
          ) : (
            <>
              <Link href="/sign-in">
                <Button variant="ghost">{t("Common.signIn")}</Button>
              </Link>
              <Link href="/sign-up">
                <Button>{t("Common.signUp")}</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
