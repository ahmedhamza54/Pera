"use client";

import React from "react";

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-white text-black px-6 md:px-20 py-16 font-sans">
      <section className="max-w-4xl mx-auto space-y-12">
        <header className="text-center border-b border-black pb-8">
          <h1 className="text-4xl font-bold tracking-tight">Privacy Policy</h1>
          <p className="text-sm text-gray-700 mt-2">Effective Date: October 2025</p>
        </header>

        <article className="space-y-8 leading-relaxed text-lg">
          <p>
            At <strong>Pera</strong>, your privacy is our top priority. This Privacy Policy explains how we collect,
            use, and protect your information when you use our AI Productivity & Discipline Assistant app.
          </p>

          <section>
            <h2 className="text-2xl font-semibold border-b border-black pb-1 mb-4">
              1. Information We Collect
            </h2>
            <p>
              We may collect information such as your name, email address, and app activity (like tasks, notes,
              schedules, and preferences). This data helps the app personalize reminders, progress tracking, and
              productivity insights. We do not knowingly collect data from anyone under the age of 13.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold border-b border-black pb-1 mb-4">
              2. How We Use Your Information
            </h2>
            <p>
              Your data is used solely to improve your experience — scheduling meetings, generating emails, tracking
              progress, and providing AI-based recommendations. We never sell or share your data with third parties
              for advertising purposes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold border-b border-black pb-1 mb-4">
              3. Data Storage and Security
            </h2>
            <p>
              We use secure cloud-based services with encryption to store your information safely. Access to your data
              is limited and protected by authentication measures to prevent unauthorized access or misuse.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold border-b border-black pb-1 mb-4">
              4. Your Rights
            </h2>
            <p>
              You can request to view, edit, or delete your personal data at any time by contacting our support team.
              You can also disable data syncing or delete your account directly from within the app.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold border-b border-black pb-1 mb-4">
              5. Changes to This Policy
            </h2>
            <p>
              We may update this Privacy Policy periodically. All changes will be posted here, and continued use of the
              app indicates acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold border-b border-black pb-1 mb-4">
              6. Contact Us
            </h2>
            <p>
              For questions about this Privacy Policy, contact us at{" "}
              <a href="mailto:support@pera.ai" className="underline hover:text-gray-600">
                support@pera.ai
              </a>
              .
            </p>
          </section>
        </article>

        <footer className="text-center text-gray-700 text-sm border-t border-black pt-8">
          © {new Date().getFullYear()} Pera. All rights reserved.
        </footer>
      </section>
    </main>
  );
}
