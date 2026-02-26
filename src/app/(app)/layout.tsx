import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppHeader } from "@/components/layout/app-header";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Height uses --tab-bar-height token (default 49px = 48px tab bar + 1px border)
    // Override --tab-bar-height in globals.css if the tab bar height changes
    <div
      className="flex"
      style={{ height: "calc(100vh - var(--tab-bar-height))" }}
    >
      {/* Desktop sidebar — hidden on mobile, shown at md+ */}
      <AppSidebar />

      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <AppHeader />
        {/* Content padding driven by --content-padding token
            Compact: 1rem | Standard: 1.5rem | Spacious: 2rem */}
        <main
          className="flex-1 overflow-y-auto"
          style={{ padding: "var(--content-padding)" }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
