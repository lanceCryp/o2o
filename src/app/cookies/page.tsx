import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Link href="/">
          <Button variant="ghost" className="mb-8">
            ← 返回首页
          </Button>
        </Link>

        <article className="prose prose-neutral dark:prose-invert max-w-none">
          <h1 className="text-4xl font-bold mb-8">Cookie Policy</h1>
          <p className="text-muted-foreground mb-8">
            Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. What Are Cookies</h2>
            <p className="mb-4">
              Cookies are small text files that are placed on your device (computer, smartphone, or tablet) when you visit a website. They help the website remember information about your visit, which can make it easier to visit the site again and make the site more useful to you.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Types of Cookies We Use</h2>

            <h3 className="text-xl font-medium mt-6 mb-3">2.1 Necessary Cookies</h3>
            <p className="mb-4">
              These cookies are essential for the website to function properly. They enable basic functions like page navigation, secure access to protected areas, and form submission. Without these cookies, the website cannot function properly.
            </p>
            <p className="mb-4">
              <strong>Examples:</strong> Session cookies, authentication cookies, security cookies
            </p>

            <h3 className="text-xl font-medium mt-6 mb-3">2.2 Functional Cookies</h3>
            <p className="mb-4">
              These cookies remember your choices and preferences (such as your language preference, theme preference, or region) to provide enhanced, personalized features. They help us remember your settings and provide a more customized experience.
            </p>
            <p className="mb-4">
              <strong>Examples:</strong> Language preference, theme preference (light/dark mode)
            </p>

            <h3 className="text-xl font-medium mt-6 mb-3">2.3 Analytics Cookies</h3>
            <p className="mb-4">
              These cookies collect anonymous information about how visitors use our website. We use this data to improve and optimize the site, understand which pages are most popular, and see how visitors move around the site.
            </p>
            <p className="mb-4">
              <strong>Examples:</strong> Page view tracking, session duration, bounce rate analysis
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. How We Use Cookies</h2>
            <p className="mb-4">We use cookies for the following purposes:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li><strong>Authentication:</strong> To keep you signed in during your session</li>
              <li><strong>Preferences:</strong> To remember your settings and preferences</li>
              <li><strong>Analytics:</strong> To understand how users interact with our website</li>
              <li><strong>Security:</strong> To protect your account and detect suspicious activity</li>
              <li><strong>Performance:</strong> To improve the speed and reliability of our services</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Third-Party Cookies</h2>
            <p className="mb-4">
              We use certain third-party services that may also place cookies on your device. These include:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li><strong>Clerk:</strong> For user authentication and account management</li>
              <li><strong>Stripe:</strong> For payment processing (when you purchase credits)</li>
            </ul>
            <p className="mb-4">
              These third parties have their own privacy policies and cookie policies. We recommend reviewing their policies to understand how they use cookies.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Managing Your Cookie Preferences</h2>
            <p className="mb-4">
              You can control and manage cookies in various ways:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li><strong>Cookie Consent Banner:</strong> When you first visit our website, you can choose which types of cookies to accept through our cookie consent banner</li>
              <li><strong>Browser Settings:</strong> Most browsers allow you to refuse to accept cookies or to delete cookies already stored on your device</li>
              <li><strong>Clear Cookies:</strong> You can delete all cookies that are currently on your device through your browser settings</li>
            </ul>
            <p className="mb-4">
              <strong>Note:</strong> Blocking or deleting cookies may impact your experience on our website. Some features may not function properly without necessary cookies.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Cookie Updates</h2>
            <p className="mb-4">
              We may update this Cookie Policy from time to time to reflect changes in our practices or for operational, legal, or regulatory reasons. We encourage you to revisit this page periodically.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Contact Us</h2>
            <p className="mb-4">
              If you have any questions about our use of cookies or this Cookie Policy, please contact us at:
            </p>
            <p className="mb-4">
              Email: <a href="mailto:privacy@o2o.app" className="text-primary hover:underline">privacy@o2o.app</a>
            </p>
          </section>

          <section className="mt-12 pt-8 border-t">
            <div className="flex gap-4">
              <Link href="/privacy">
                <Button variant="link" className="p-0">Privacy Policy</Button>
              </Link>
              <Link href="/terms">
                <Button variant="link" className="p-0">Terms of Service</Button>
              </Link>
            </div>
          </section>
        </article>
      </div>
    </div>
  );
}
