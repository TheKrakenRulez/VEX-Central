import ClientLayout from "./ClientLayout";
import "./globals.css";

export const metadata = {
  title: "VEX Central",
  description: "A local sandbox for compiling and rendering robot trajectories",
  icons: {
    icon: [
      {
        url: "/vex-central-logo-transparent.png",
        sizes: "any",
      },
    ],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-950 text-slate-100 min-h-screen font-sans flex flex-col">
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}