import "./globals.css";

export const metadata = {
  title: "Haibara - Minimalist Bookmark Navigator",
  description:
    "Haibara is a minimalist personal navigation tool that helps you efficiently manage bookmarks and quickly access your favorite websites.",
  keywords: ["bookmark manager", "navigation", "startpage", "minimalist", "Haibara"],
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
