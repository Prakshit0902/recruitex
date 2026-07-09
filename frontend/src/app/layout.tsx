import type { Metadata } from "next";
import "./globals.css";
import NavBar from "@/components/navbar";
import { ThemeProvider } from "@/components/theme-provider";
import { AppProvider } from "@/context/AppContext";
import { SocketProvider } from "@/context/SocketContext";

export const metadata: Metadata = {
  title: "HireHeaven - Find Your Dream Job",
  description: "Connect with top employers and discover opportunities that match your skills.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AppProvider>
          <SocketProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <NavBar />
              {children}
            </ThemeProvider>
          </SocketProvider>
        </AppProvider>
      </body>
    </html>
  );
}
