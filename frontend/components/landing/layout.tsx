import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI DB Monitor",
  description:
    "AI-Powered Autonomous Database Monitoring Platform using Artificial Intelligence for real-time monitoring, predictive analytics, anomaly detection, and database optimization.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
