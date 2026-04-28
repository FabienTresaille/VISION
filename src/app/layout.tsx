import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { ChatBot } from "@/components/layout/ChatBot";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "Vision | Alsek - Pilotage Veille Technologique",
  description:
    "Plateforme de pilotage de veille technologique et de gestion du cycle de vie des offres pour Alsek ESN.",
  keywords: "veille technologique, ESN, offres, infrastructure IT, cybersécurité",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="dark">
      <body className="bg-surface-0 text-gray-200 antialiased">
        <Providers>
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
              <Header />
              <main className="flex-1 overflow-y-auto p-6 lg:p-8">
                {children}
              </main>
            </div>
          </div>
          <ChatBot />
        </Providers>
      </body>
    </html>
  );
}
