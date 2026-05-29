import "./globals.css";

export const metadata = {
  title: "VEX Autonomous Simulator",
  description: "A local sandbox for compiling and rendering robot trajectories",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-950 text-slate-100 min-h-screen font-sans">
        {/* Persistent Top Navigation Bar */}
        <header className="w-full bg-slate-900 border-b border-slate-800 sticky top-0 z-50 px-6 py-4 flex justify-between items-center shadow-md">
          <div className="text-xl font-black font-mono tracking-wider text-red-500">
            VEX <span className="text-slate-100">SIMULATOR</span>
          </div>
          
        </header>

        {children}
        </body>
      </html>
  );
}