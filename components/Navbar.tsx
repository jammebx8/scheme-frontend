"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import Image from "next/image";
import {
  LayoutDashboard,
  Search,
  FileText,
  LogOut,
  User,
  ChevronDown,
  Menu,
  X,
  RefreshCw,
} from "lucide-react";
import { useState, useEffect } from "react";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/schemes", label: "Schemes", icon: Search },
  { href: "/applications", label: "Applications", icon: FileText },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const [dropdown, setDropdown] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setLoading(true);
    setProgress(25);

    const t1 = setTimeout(() => setProgress(70), 120);
    const t2 = setTimeout(() => setProgress(100), 320);
    const t3 = setTimeout(() => {
      setLoading(false);
      setProgress(0);
    }, 650);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [pathname]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <>
      {/* Progress Bar */}
      <div
        className={cn(
          "fixed top-0 left-0 z-[70] h-[3px] bg-emerald-500 transition-all duration-300",
          loading ? "opacity-100" : "opacity-0"
        )}
        style={{ width: `${progress}%` }}
      />

      {/* Navbar */}
      <header className="fixed top-0 inset-x-0 z-50 border-b border-slate-200/70 bg-white/90 backdrop-blur-xl shadow-[0_4px_30px_rgba(15,23,42,0.06)]">
      <div className="w-full h-[72px] px-6 lg:px-8 flex items-center justify-between">

          {/* Logo */}
          <Link
            href="/dashboard"
            className="flex items-center shrink-0 group"
          >
            <div className="group-hover:scale-105 transition-transform duration-200">
              <Image
                src="/Agent Image - Design a modern_ professional logo for a digital government services portal that unifi.png"
                alt="GovAssist — AI Government Platform"
                width={160}
                height={44}
                className="h-11 w-auto object-contain"
                priority
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center bg-slate-100 rounded-2xl p-1 gap-1">
            {NAV.map(({ href, label, icon: Icon }) => {
              const active =
                pathname === href ||
                (href !== "/dashboard" && pathname.startsWith(href));

              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200",
                    active
                      ? "bg-white text-emerald-700 shadow-sm"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/70"
                  )}
                >
                  <Icon size={16} strokeWidth={2} />
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-3">

            {/* Refresh button */}
            <button className="hidden lg:flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-100 transition">
              <RefreshCw size={16} className="text-slate-600" />
            </button>

            {/* Profile */}
            <div className="relative hidden sm:block">
              <button
                onClick={() => setDropdown(!dropdown)}
                className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 hover:shadow-md transition-all"
              >
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-600 to-emerald-500 flex items-center justify-center text-white font-bold text-sm shadow">
                  {user?.full_name?.[0]?.toUpperCase() ||
                    user?.email?.[0]?.toUpperCase() ||
                    "U"}
                </div>

                <div className="hidden lg:block text-left">
                  <p className="text-sm font-semibold text-slate-900 leading-none">
                    {user?.full_name?.split(" ")[0] || "User"}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Citizen</p>
                </div>

                <ChevronDown size={15} className="text-slate-400" />
              </button>

              {dropdown && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setDropdown(false)}
                  />

                  <div className="absolute right-0 mt-3 w-64 rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden z-20">

                    <div className="px-5 py-4 bg-slate-50 border-b">
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        Signed in
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-900 truncate">
                        {user?.email}
                      </p>
                    </div>

                    <Link
                      href="/onboarding"
                      onClick={() => setDropdown(false)}
                      className="flex items-center gap-3 px-5 py-3.5 text-sm hover:bg-slate-50 transition"
                    >
                      <User size={16} />
                      Edit Profile
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-5 py-3.5 text-sm text-red-600 hover:bg-red-50 transition"
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Mobile Menu */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden h-11 w-11 flex items-center justify-center rounded-xl border border-slate-200"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileOpen && (
          <div className="md:hidden border-t bg-white">
            {NAV.map(({ href, label, icon: Icon }) => {
              const active = pathname.startsWith(href);

              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-6 py-4 text-sm font-medium",
                    active
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-slate-700"
                  )}
                >
                  <Icon size={18} />
                  {label}
                </Link>
              );
            })}

            <div className="border-t px-6 py-3">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 text-red-600 py-2 text-sm"
              >
                <LogOut size={18} />
                Sign Out
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Spacer */}
      <div className="h-[72px]" />
    </>
  );
}