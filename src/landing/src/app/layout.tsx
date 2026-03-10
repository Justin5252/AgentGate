import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AgentGate - The Identity Layer for AI Agents",
  description:
    "Every AI agent in your company needs an identity. AgentGate gives you control over what they can access, when, and why.",
  keywords: [
    "AI agents",
    "identity management",
    "access control",
    "AI security",
    "agent governance",
  ],
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
