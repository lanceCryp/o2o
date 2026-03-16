"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useI18n } from "@/contexts/i18n-provider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Header from "@/components/header";

interface Meeting {
  id: string;
  name: string;
  status: string;
  createdAt: string;
  endedAt?: string;
  duration: number;
  isHost: boolean;
}

interface HistoryResponse {
  meetings: Meeting[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function HistoryPage() {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const { t } = useI18n();

  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      return;
    }

    fetchHistory(page);
  }, [isLoaded, isSignedIn, page]);

  const fetchHistory = async (pageNum: number) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/history?page=${pageNum}&limit=10`);
      if (!res.ok) throw new Error("Failed to fetch history");
      const data = (await res.json()) as HistoryResponse;
      setMeetings(data.meetings);
      setTotalPages(data.pagination.totalPages);
    } catch (err) {
      console.error("Failed to fetch history:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "ended":
        return t("History.status.ended");
      case "active":
        return t("History.status.active");
      case "waiting":
        return t("History.status.waiting");
      default:
        return status;
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background">
        <Header showDashboardLink />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-muted-foreground">
            {t("Common.loading")}
          </div>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-background">
        <Header showDashboardLink />
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>{t("History.signInRequired")}</CardTitle>
              <CardDescription>{t("History.signInToView")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/sign-in">
                <Button className="w-full">{t("Common.signIn")}</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header showDashboardLink />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="gap-2 mb-4"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              {t("Common.back")}
            </Button>
            <h1 className="text-2xl font-bold mb-2">
              {t("Dashboard.history.title")}
            </h1>
            <p className="text-muted-foreground">
              {t("Dashboard.history.description")}
            </p>
          </div>

          {isLoading && meetings.length === 0 ? (
            <Card>
              <CardContent className="py-8">
                <div className="text-center text-muted-foreground">
                  {t("Common.loading")}
                </div>
              </CardContent>
            </Card>
          ) : meetings.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>{t("History.emptyState.title")}</CardTitle>
                <CardDescription>
                  {t("History.emptyState.description")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/dashboard/new">
                  <Button>{t("History.emptyState.createButton")}</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="space-y-4">
                {meetings.map((meeting) => (
                  <Card key={meeting.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">
                            {meeting.name}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-1">
                            <span className="text-xs">
                              {formatDate(meeting.createdAt)}
                            </span>
                            {meeting.isHost && (
                              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                {t("History.host")}
                              </span>
                            )}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-mono text-muted-foreground">
                            {formatDuration(meeting.duration)}
                          </span>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              meeting.status === "ended"
                                ? "bg-muted text-muted-foreground"
                                : meeting.status === "active"
                                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                  : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                            }`}
                          >
                            {getStatusText(meeting.status)}
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    {t("History.pagination.previous")}
                  </Button>
                  <span className="text-sm text-muted-foreground px-4">
                    {t("History.pagination.pageInfo")
                      .replace("{current}", page.toString())
                      .replace("{total}", totalPages.toString())}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    {t("History.pagination.next")}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
