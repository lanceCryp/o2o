import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for o2o - Private 1-on-1 Video Calls",
  robots: {
    index: false,
    follow: false,
  },
};

export default function PrivacyPage() {
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
          <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        <Card>
          <CardContent className="pt-6 space-y-6 prose prose-neutral dark:prose-invert max-w-none">
            <section>
              <h2 className="text-2xl font-semibold mb-3">1. Introduction</h2>
              <p className="text-muted-foreground">
                Welcome to o2o ("we", "our", or "us"). We are committed to protecting your privacy and ensuring you have a positive experience when using our website and services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">2. Information We Collect</h2>
              <h3 className="text-xl font-semibold mb-2">2.1 Information You Provide</h3>
              <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                <li>Account information (email address, username) when you sign up</li>
                <li>Payment information processed through our third-party payment provider Stripe</li>
                <li>Communication data when you contact us for support</li>
              </ul>

              <h3 className="text-xl font-semibold mb-2 mt-4">2.2 Information Collected Automatically</h3>
              <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                <li>Usage data about how you interact with our service</li>
                <li>Device information (browser type, operating system)</li>
                <li>Call metadata (duration, participants) for billing purposes</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">3. How We Use Your Information</h2>
              <p className="text-muted-foreground mb-3">We use the information we collect to:</p>
              <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                <li>Provide, maintain, and improve our services</li>
                <li>Process your payments and manage your account</li>
                <li>Send you service-related communications</li>
                <li>Respond to your comments and questions</li>
                <li>Protect the rights and property of o2o</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">4. Video Call Privacy</h2>
              <p className="text-muted-foreground mb-3">
                o2o is designed with privacy in mind:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                <li><strong>End-to-End Encryption:</strong> All video calls are encrypted end-to-end</li>
                <li><strong>No Recording:</strong> We do not record any video calls</li>
                <li><strong>No Storage:</strong> Video content is never stored on our servers</li>
                <li><strong>1-on-1 Only:</strong> Rooms are limited to 2 participants maximum</li>
                <li><strong>Automatic Deletion:</strong> Room data is deleted when calls end</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">5. Third-Party Services</h2>
              <p className="text-muted-foreground mb-3">We use the following third-party services:</p>
              <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                <li><strong>Clerk:</strong> User authentication and management</li>
                <li><strong>Stripe:</strong> Payment processing</li>
                <li><strong>Daily.co:</strong> Video calling infrastructure</li>
                <li><strong>Cloudflare:</strong> Hosting and security</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">6. Data Retention</h2>
              <p className="text-muted-foreground">
                We retain your account information for as long as your account is active. Call metadata is retained for billing and support purposes. You may request deletion of your account at any time by contacting us.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">7. Your Rights</h2>
              <p className="text-muted-foreground mb-3">Depending on your location, you may have the following rights:</p>
              <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                <li>Access your personal data</li>
                <li>Correct inaccurate data</li>
                <li>Delete your data</li>
                <li>Export your data</li>
                <li>Opt-out of marketing communications</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">8. Security</h2>
              <p className="text-muted-foreground">
                We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">9. Changes to This Policy</h2>
              <p className="text-muted-foreground">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">10. Contact Us</h2>
              <p className="text-muted-foreground">
                If you have any questions about this Privacy Policy, please contact us at: privacy@o2o.video
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
