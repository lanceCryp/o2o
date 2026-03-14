import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of Service for o2o - Private 1-on-1 Video Calls",
  robots: {
    index: false,
    follow: false,
  },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 bg-background/80 backdrop-blur-sm z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              o2o
            </span>
          </Link>
          <Link href="/">
            <Button variant="outline">Back to Home</Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        <Card>
          <CardContent className="pt-6 space-y-6 prose prose-neutral dark:prose-invert max-w-none">
            <section>
              <h2 className="text-2xl font-semibold mb-3">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground">
                By accessing or using o2o ("the Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, do not use the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">2. Description of Service</h2>
              <p className="text-muted-foreground">
                o2o provides a platform for private 1-on-1 video calls. The service includes:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                <li>Creating private video call rooms</li>
                <li>End-to-end encrypted video communication</li>
                <li>Pay-per-minute or subscription-based pricing</li>
                <li>No download required - browser-based access</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">3. User Accounts</h2>
              <p className="text-muted-foreground mb-3">To use the Service, you must:</p>
              <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                <li>Be at least 18 years old</li>
                <li>Create an account with accurate information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Notify us immediately of any unauthorized access</li>
              </ul>
              <p className="text-muted-foreground mt-3">
                You are responsible for all activities that occur under your account.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">4. Acceptable Use</h2>
              <p className="text-muted-foreground mb-3">You agree NOT to use the Service to:</p>
              <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                <li>Transmit harmful, threatening, or abusive content</li>
                <li>Engage in illegal activities or promote illegal acts</li>
                <li>Harass, abuse, or harm another person</li>
                <li>Distribute viruses or malicious code</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Record or share calls without consent of all participants</li>
                <li>Use the service for commercial purposes without permission</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">5. Payments and Refunds</h2>
              <p className="text-muted-foreground mb-3">Payment Terms:</p>
              <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                <li>All payments are processed through Stripe</li>
                <li>Purchased minutes do not expire (unless otherwise stated)</li>
                <li>Subscription fees are billed monthly or annually</li>
                <li>Subscriptions can be cancelled at any time</li>
                <li>No refunds for partial months or unused minutes</li>
              </ul>
              <p className="text-muted-foreground mt-3">
                Prices are subject to change with 30 days notice.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">6. Free Trial</h2>
              <p className="text-muted-foreground">
                New users receive 100 free trial minutes. Free trial minutes expire 30 days after account creation. One trial per user.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">7. Intellectual Property</h2>
              <p className="text-muted-foreground">
                The Service and its original content, features, and functionality are owned by o2o and are protected by international copyright, trademark, and other intellectual property laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">8. Privacy</h2>
              <p className="text-muted-foreground">
                Your use of the Service is also governed by our <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">9. Disclaimer of Warranties</h2>
              <p className="text-muted-foreground">
                THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">10. Limitation of Liability</h2>
              <p className="text-muted-foreground">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, O2O SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">11. Termination</h2>
              <p className="text-muted-foreground">
                We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, for any reason, including if you breach these Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">12. Governing Law</h2>
              <p className="text-muted-foreground">
                These Terms shall be governed by and construed in accordance with the laws of the jurisdiction where o2o operates, without regard to its conflict of law provisions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">13. Changes to Terms</h2>
              <p className="text-muted-foreground">
                We reserve the right to modify these Terms at any time. We will notify users of material changes via email or through the Service. Continued use of the Service after changes constitutes acceptance of the new Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">14. Contact Us</h2>
              <p className="text-muted-foreground">
                If you have any questions about these Terms, please contact us at: legal@o2o.video
              </p>
            </section>
          </CardContent>
        </Card>
      </main>

      <footer className="border-t py-8 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} o2o. All rights reserved.</p>
          <div className="flex justify-center gap-4 mt-2">
            <Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-foreground">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
