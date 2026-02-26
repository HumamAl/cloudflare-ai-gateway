"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { APP_CONFIG } from "@/lib/config";
import {
  Activity,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  User,
  ArrowRight,
  Github,
  ListTree,
  Workflow,
  Database,
  Wrench,
  Table2,
  Zap,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════════
// AGENT CUSTOMIZATION ZONE
// Nav items use domain vocabulary from the AI Gateway toolchain.
// Icons chosen to match engineering/infrastructure conventions.
// ═══════════════════════════════════════════════════════════════════════════

const navItems = [
  { href: "/",            label: "Gateway",    icon: Activity  },
  { href: "/traces",      label: "Traces",     icon: ListTree  },
  { href: "/pipeline",    label: "Pipeline",   icon: Workflow  },
  { href: "/indexes",     label: "Indexes",    icon: Database  },
  { href: "/tool-calls",  label: "Tool Calls", icon: Wrench    },
  { href: "/sql-queries", label: "SQL Queries", icon: Table2   },
];

function SidebarLogo({ collapsed }: { collapsed: boolean }) {
  return (
    <div className="p-4 border-b border-white/8 flex items-center gap-3">
      {/* Zap icon signals edge computing / AI infrastructure */}
      <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center shrink-0 border border-primary/20">
        <Zap className="w-4 h-4 text-primary" />
      </div>
      {!collapsed && (
        <div className="overflow-hidden">
          <h1 className="font-semibold text-sm leading-tight truncate text-white/90">
            {APP_CONFIG.appName}
          </h1>
          {/* "Proposal Demo" subtitle with pulsing availability indicator — always visible */}
          <p className="text-[10px] text-white/30 font-mono tracking-widest uppercase flex items-center gap-1.5">
            Proposal Demo
            <span className="relative inline-flex h-1.5 w-1.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/60 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" />
            </span>
          </p>
        </div>
      )}
    </div>
  );
}

function SidebarNav({ collapsed }: { collapsed: boolean }) {
  const pathname = usePathname();

  return (
    <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
      {navItems.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== "/" && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            style={{ paddingTop: "var(--nav-item-py)", paddingBottom: "var(--nav-item-py)" }}
            className={cn(
              "flex items-center gap-3 px-3 rounded-md text-sm transition-colors",
              "duration-[60ms] ease-out",
              isActive
                ? "bg-primary/15 text-white font-medium border border-primary/20"
                : "text-white/50 hover:text-white/80 hover:bg-white/5"
            )}
          >
            <item.icon
              className={cn(
                "w-4 h-4 shrink-0",
                isActive ? "text-primary" : "text-white/40"
              )}
            />
            {!collapsed && <span className="truncate">{item.label}</span>}
          </Link>
        );
      })}
    </nav>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// FIXED ZONE — DO NOT MODIFY
// These sub-components are structural conversion elements.
// They import text from APP_CONFIG but their structure must not change.
// ═══════════════════════════════════════════════════════════════════════════

function SidebarCrossTabLinks({ collapsed }: { collapsed: boolean }) {
  return (
    <div className="px-2 pt-2 border-t border-white/8 space-y-0.5">
      <Link
        href="/challenges"
        style={{ paddingTop: "var(--nav-item-py)", paddingBottom: "var(--nav-item-py)" }}
        className="flex items-center gap-3 px-3 rounded-md text-sm text-white/40 hover:text-white/70 hover:bg-white/5 transition-colors duration-[60ms] ease-out"
      >
        <Lightbulb className="w-4 h-4 shrink-0" />
        {!collapsed && <span>My Approach</span>}
      </Link>
      <Link
        href="/proposal"
        style={{ paddingTop: "var(--nav-item-py)", paddingBottom: "var(--nav-item-py)" }}
        className="flex items-center gap-3 px-3 rounded-md text-sm text-white/40 hover:text-white/70 hover:bg-white/5 transition-colors duration-[60ms] ease-out"
      >
        <User className="w-4 h-4 shrink-0" />
        {!collapsed && <span>Work With Me</span>}
      </Link>
    </div>
  );
}

function SidebarMicroCTA({ collapsed }: { collapsed: boolean }) {
  if (collapsed) return null;
  return (
    <div className="px-3 py-2">
      <div className="p-3 rounded-lg border border-primary/20 bg-primary/8">
        <p className="text-xs font-medium text-white/80 mb-1">
          Like what you see?
        </p>
        <p className="text-[11px] text-white/40 mb-2 leading-relaxed">
          Built this for your project. Let&apos;s talk.
        </p>
        <Link
          href="/proposal"
          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors duration-[60ms] ease-out"
        >
          See proposal <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}

function SidebarFooter({ collapsed }: { collapsed: boolean }) {
  return (
    <div className="border-t border-white/8 p-2 space-y-1">
      {!collapsed && (
        <p className="px-3 text-xs text-white/30">
          Built for{" "}
          <span className="text-white/60 font-medium">
            {APP_CONFIG.projectName}
          </span>{" "}
          by Humam
        </p>
      )}
      <a
        href="https://github.com/HumamAl"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-3 py-1.5 rounded-md text-[11px] text-primary/60 hover:text-primary hover:bg-primary/10 transition-colors duration-[60ms] ease-out"
      >
        <Github className="w-3.5 h-3.5 shrink-0" />
        {!collapsed && <span>by Humam ↗</span>}
      </a>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTED SIDEBAR CONTENT
// Used both in the desktop aside and in the mobile Sheet drawer.
// ═══════════════════════════════════════════════════════════════════════════

export function SidebarContent({ collapsed }: { collapsed: boolean }) {
  return (
    <>
      {/* ── AGENT CUSTOMIZES: Logo and app identity ── */}
      <SidebarLogo collapsed={collapsed} />

      {/* ── AGENT CUSTOMIZES: Feature page navigation ── */}
      <SidebarNav collapsed={collapsed} />

      {/* ── FIXED: Cross-tab links to /challenges and /proposal ── */}
      <SidebarCrossTabLinks collapsed={collapsed} />

      {/* ── FIXED: "Like what you see?" micro-CTA card ── */}
      <SidebarMicroCTA collapsed={collapsed} />

      {/* ── FIXED: "Built for [project] by Humam" attribution ── */}
      <SidebarFooter collapsed={collapsed} />
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// DESKTOP SIDEBAR SHELL
// Width driven by --sidebar-width and --sidebar-collapsed-width CSS tokens.
// Background driven by --sidebar-bg token (override to tint per domain).
// ═══════════════════════════════════════════════════════════════════════════

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className="h-full border-r border-white/8 hidden md:flex flex-col transition-all duration-[60ms] ease-out"
      style={{
        width: collapsed
          ? "var(--sidebar-collapsed-width)"
          : "var(--sidebar-width)",
        background: "var(--sidebar-bg)",
        minWidth: collapsed
          ? "var(--sidebar-collapsed-width)"
          : "var(--sidebar-width)",
      }}
    >
      <SidebarContent collapsed={collapsed} />

      {/* Collapse toggle */}
      <div className="p-2 border-t border-white/8">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-white/30 hover:text-white/60 hover:bg-white/5 w-full transition-colors duration-[60ms] ease-out"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
