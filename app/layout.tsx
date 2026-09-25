import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "GovAssist — Apply to Government Schemes with AI",
  description:
    "Discover all government schemes you are eligible for and apply with a single click using our AI agent.",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Inter + Plus Jakarta Sans for display headings */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,300..800;1,14..32,300..800&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                borderRadius: "12px",
                fontSize: "13px",
                fontFamily: "Inter, system-ui, sans-serif",
                border: "1px solid #e6eeff",
                boxShadow:
                  "0 4px 16px -4px rgba(0,20,40,0.12), 0 1px 4px rgba(0,0,0,0.06)",
              },
              success: {
                iconTheme: { primary: "#006a61", secondary: "#ffffff" },
              },
              error: {
                iconTheme: { primary: "#ba1a1a", secondary: "#ffffff" },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
