import "./globals.css";

export const metadata = {
  title: "Haibara - Minimalist Bookmark Navigator",
  description:
    "Haibara is a minimalist personal navigation tool that helps you efficiently manage bookmarks and quickly access your favorite websites.",
  keywords: ["bookmark manager", "navigation", "startpage", "minimalist", "Haibara"],
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "32x32" },
    ],
    apple: "/icon.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
