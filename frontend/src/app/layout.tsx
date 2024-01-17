import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "../components/navbar/navbar";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="container">
          <Navbar />
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
