import React from "react"

const PrivacyPolicy = () => (
  <div>
    <h1>Privacy Policy</h1>

    <p>Last updated: 2026-09-07</p>

    <h2>Signed Out</h2>

    <p>If you don't sign in, this site collects no personal data. Your solved/starred/notes progress is stored only in your browser's local storage and never leaves your device.</p>

    <h2>Signed In</h2>

    <p>Signing in with Google or GitHub is optional and lets your progress follow you across devices. Sign-in is handled by Firebase Authentication, which stores your account identifier, email address, and display name as provided by Google or GitHub. Your progress data (solved/starred/notes) is stored in Firestore, a Google Cloud database, keyed to your account.</p>

    <p>This data is never shared with any third party, is not used for advertising or analytics, and is readable only by your own signed-in account -- Firestore security rules deny every other request.</p>

    <h2>Data Deletion</h2>

    <p>To delete your account and progress data, sign in and contact us at the address below; we will delete your Firestore document and Firebase Authentication account. Signing out at any time returns you to the signed-out, no-data-collected experience above.</p>

    <h2>Changes to This Privacy Policy</h2>

    <p>Any future changes will appear on this page.</p>

    <h2>Contact Us</h2>

    <p>If you have any questions about this Privacy Policy, please contact us at: BrainStellarPuzzles@facebook.com</p>

  </div>
)

export default PrivacyPolicy
