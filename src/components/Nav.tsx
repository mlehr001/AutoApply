"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, useAuth } from "@clerk/nextjs";
import { NAV_ITEMS, COLORS, NAV_HEIGHT } from "@/lib/constants";

export default function Nav() {
  const pathname = usePathname();
  const { isSignedIn } = useAuth();

  // Don't render nav on the public landing page
  if (pathname === "/") return null;

  return (
    <nav
      style={{
        background:     COLORS.navyDark,
        height:         NAV_HEIGHT,
        display:        "flex",
        alignItems:     "center",
        justifyContent: "space-between",
        padding:        "0 32px",
        borderBottom:   "2px solid rgba(255,255,255,0.08)",
        position:       "sticky",
        top:            0,
        zIndex:         100,
        boxSizing:      "border-box",
      }}
    >
      {/* Left — wordmark + nav links */}
      <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
        <Link
          href="/dashboard"
          style={{
            fontFamily:     "var(--font-raleway), sans-serif",
            fontWeight:     800,
            fontSize:       15,
            color:          "#fff",
            textDecoration: "none",
            letterSpacing:  "-0.01em",
            whiteSpace:     "nowrap",
          }}
        >
          ResumAI
        </Link>

        {isSignedIn && (
          <div style={{ display: "flex", gap: 2 }}>
            {NAV_ITEMS.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    padding:        "6px 14px",
                    fontSize:       11,
                    fontFamily:     "var(--font-raleway), sans-serif",
                    fontWeight:     700,
                    letterSpacing:  "0.07em",
                    textTransform:  "uppercase",
                    color:          active ? "#fff" : "rgba(255,255,255,0.45)",
                    textDecoration: "none",
                    borderBottom:   active
                      ? "2px solid #fff"
                      : "2px solid transparent",
                    transition:     "color 0.15s, border-color 0.15s",
                    lineHeight:     `${NAV_HEIGHT - 2}px`,
                  }}
                >
                  {item.icon} {item.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Right — user button */}
      {isSignedIn && (
        <UserButton
          appearance={{
            elements: {
              avatarBox: { width: 30, height: 30 },
            },
          }}
        />
      )}
    </nav>
  );
}
