import type { Metadata } from "next";
import "./globals.css";
import { DocsLayout } from "@/components/DocsLayout";

export const metadata: Metadata = {
  title: "AgentGate Documentation",
  description: "Developer documentation for AgentGate — the identity and access control layer for AI agents.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <DocsLayout>{children}</DocsLayout>
      </body>
    </html>
  );
}
