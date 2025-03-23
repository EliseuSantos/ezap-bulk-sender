import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeWrapper } from "@/components/theme-wrapper";
import { ReactQueryProvider } from "@/lib/react-query-provider";
import { ContactsProvider } from "../context/contacts-context";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ezap Bulk Sender",
  description: "Scalable WhatsApp Message Delivery System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-muted/30`}>
        <ReactQueryProvider>
          <ThemeWrapper>
            <ContactsProvider>{children}</ContactsProvider>
          </ThemeWrapper>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
