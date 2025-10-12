"use client";

import React from "react";

export default function DeleteAccountPage() {
  return (
    <main className="min-h-screen bg-white text-black px-6 md:px-20 py-16 font-sans">
      <section className="max-w-4xl mx-auto space-y-12">
        <header className="text-center border-b border-black pb-8">
          <h1 className="text-4xl font-bold tracking-tight">Delete Your Account</h1>
          <p className="text-sm text-gray-700 mt-2">
            Instructions for permanently deleting your Pera account and data
          </p>
        </header>

        <article className="space-y-8 leading-relaxed text-lg">
          <p>
            If you wish to delete your account and all associated data from{" "}
            <strong>Pera</strong>, you can do so easily from within the app.
          </p>

          <section>
            <h2 className="text-2xl font-semibold border-b border-black pb-1 mb-4">
              Steps to Delete Your Account
            </h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>Open the <strong>Pera</strong> app.</li>
              <li>Tap the <strong>“+”</strong> button beside the Pera logo.</li>
              <li>Go to <strong>Profile</strong>.</li>
              <li>Scroll down until you find the <strong>“Delete Account”</strong> button.</li>
              <li>Confirm deletion.</li>
            </ol>
            <p className="mt-4">
              Once confirmed, <strong>your account and all associated personal data will be permanently deleted immediately</strong>.
              This includes tasks, notes, schedules, and any other information you’ve added to the app.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold border-b border-black pb-1 mb-4">
              Data Deletion Policy
            </h2>
            <p>
              We do not retain any user data after account deletion. All information is removed from our systems immediately.
              If you choose to return to Pera later, you will need to create a new account.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold border-b border-black pb-1 mb-4">
              Need Help?
            </h2>
            <p>
              If you experience any issues deleting your account, please contact our support team at{" "}
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
