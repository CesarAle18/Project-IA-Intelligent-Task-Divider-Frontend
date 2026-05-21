"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Sparkles,
  BarChart3,
  History,
  Settings,
  Cpu,
  Moon,
  Sun,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { checkHealth } from "@/lib/api";

const navItems = [
  { href: "/", label: "Predicción", icon: Sparkles },
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/historial", label: "Historial", icon: History },
  { href: "/configuracion", label: "Configuración", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();
  const [apiStatus, setApiStatus] = useState<"online" | "offline" | "checking">(
    "checking",
  );
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkApiStatus = async () => {
      const health = await checkHealth();
      setApiStatus(health.status === "healthy" ? "online" : "offline");
    };
    checkApiStatus();
    const interval = setInterval(checkApiStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    const shouldBeDark = savedTheme === "dark" || (!savedTheme && prefersDark);
    setIsDark(shouldBeDark);
    document.documentElement.classList.toggle("dark", shouldBeDark);
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    localStorage.setItem("theme", newIsDark ? "dark" : "light");
    document.documentElement.classList.toggle("dark", newIsDark);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-60 md:flex-col md:fixed md:inset-y-0 bg-sidebar border-r border-sidebar-border">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 py-5 border-b border-sidebar-border">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary">
              <Cpu className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-sidebar-foreground">
                IA Task Divider
              </span>
              <span className="text-xs text-muted-foreground">
                Estimador inteligente
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent",
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="px-4 py-4 border-t border-sidebar-border space-y-3">
            {/* API Status */}
            <div className="flex items-center justify-between px-2 py-2 rounded-lg bg-sidebar-accent">
              <span className="text-xs font-medium text-muted-foreground">
                API Status
              </span>
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "w-2 h-2 rounded-full",
                    apiStatus === "online" && "bg-emerald-500",
                    apiStatus === "offline" && "bg-red-500",
                    apiStatus === "checking" && "bg-amber-500 animate-pulse",
                  )}
                />
                <span className="text-xs text-sidebar-foreground capitalize">
                  {apiStatus === "checking" ? "..." : apiStatus}
                </span>
              </div>
            </div>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="w-full justify-start gap-2 text-muted-foreground hover:text-sidebar-foreground"
            >
              {isDark ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
              <span className="text-xs">
                {isDark ? "Modo claro" : "Modo oscuro"}
              </span>
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-sidebar border-t border-sidebar-border z-50">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-sidebar-foreground",
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
