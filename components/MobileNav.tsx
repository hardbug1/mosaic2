"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export type MobileNavTab = "boards" | "notifications" | "search" | "settings";

interface MobileNavProps {
  active: MobileNavTab;
  unreadCount?: number;
}

const TABS: {
  id: MobileNavTab;
  label: string;
  icon: string;
  href: string;
}[] = [
  { id: "boards", label: "보드", icon: "dashboard", href: "/boards" },
  { id: "notifications", label: "알림", icon: "notifications", href: "/notifications" },
  { id: "search", label: "검색", icon: "search", href: "/boards" },
  { id: "settings", label: "내 정보", icon: "person", href: "/settings" },
];

export default function MobileNav({ active, unreadCount = 0 }: MobileNavProps) {
  return (
    <>
      <style>{`
        .mobile-nav {
          display: none;
        }
        @media (max-width: 768px) {
          .mobile-nav {
            display: flex;
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            z-index: 200;
            height: 64px;
            padding-bottom: env(safe-area-inset-bottom, 0px);
            background: rgba(254, 247, 255, 0.88);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border-top: 1px solid var(--md-sys-color-outline-variant);
            align-items: stretch;
          }
          [data-theme="dark"] .mobile-nav,
          .md-dark .mobile-nav {
            background: rgba(20, 18, 24, 0.90);
          }
          .mobile-nav-tab {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 3px;
            text-decoration: none;
            color: var(--md-sys-color-on-surface-variant);
            font-family: var(--md-sys-typescale-plain-font);
            font-size: 10px;
            font-weight: 600;
            position: relative;
            padding-bottom: 4px;
          }
          .mobile-nav-tab.is-active {
            color: var(--md-sys-color-primary);
          }
          .mobile-nav-tab.is-active .md-icon {
            font-variation-settings: "FILL" 1, "wght" 400, "GRAD" 0, "opsz" 24;
          }
          .mobile-nav-badge {
            position: absolute;
            top: 6px;
            left: calc(50% + 4px);
            min-width: 16px;
            height: 16px;
            border-radius: 9999px;
            background: var(--md-sys-color-error);
            color: var(--md-sys-color-on-error);
            font-size: 9px;
            font-weight: 700;
            font-family: var(--md-sys-typescale-plain-font);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0 3px;
            pointer-events: none;
          }
        }
      `}</style>
      <nav className="mobile-nav" aria-label="하단 탭 내비게이션">
        {TABS.map((tab) => {
          const isActive = active === tab.id;
          const showBadge =
            tab.id === "notifications" && unreadCount > 0;
          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={`mobile-nav-tab${isActive ? " is-active" : ""}`}
            >
              <span className="md-icon" style={{ fontSize: 24 }}>
                {tab.icon}
              </span>
              <span>{tab.label}</span>
              {showBadge && (
                <span className="mobile-nav-badge">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
