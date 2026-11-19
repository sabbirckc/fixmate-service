import React from "react";
import Link from "next/link";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color?: "blue" | "amber" | "emerald" | "purple" | "rose";
  href?: string;
  loading?: boolean;
}

const colorStyles: Record<
  "blue" | "amber" | "emerald" | "purple" | "rose",
  { bg: string; text: string; hoverBorder: string }
> = {
  blue: {
    bg: "bg-blue-50 dark:bg-blue-950/40",
    text: "text-blue-600 dark:text-blue-400",
    hoverBorder: "hover:border-blue-500 dark:hover:border-blue-500",
  },
  amber: {
    bg: "bg-amber-50 dark:bg-amber-950/40",
    text: "text-amber-600 dark:text-amber-400",
    hoverBorder: "hover:border-amber-500 dark:hover:border-amber-500",
  },
  emerald: {
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    text: "text-emerald-600 dark:text-emerald-400",
    hoverBorder: "hover:border-emerald-500 dark:hover:border-emerald-500",
  },
  purple: {
    bg: "bg-purple-50 dark:bg-purple-950/40",
    text: "text-purple-600 dark:text-purple-400",
    hoverBorder: "hover:border-purple-500 dark:hover:border-purple-500",
  },
  rose: {
    bg: "bg-rose-50 dark:bg-rose-950/40",
    text: "text-rose-600 dark:text-rose-400",
    hoverBorder: "hover:border-rose-500 dark:hover:border-rose-500",
  },
};

export default function StatCard({
  title,
  value,
  icon: Icon,
  color = "blue",
  href,
  loading = false,
}: StatCardProps) {
  const c = colorStyles[color] || colorStyles.blue;

  const content = (
    <div
      className={`p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm flex items-center gap-4 transition-all group ${
        href ? `cursor-pointer ${c.hoverBorder}` : ""
      }`}
    >
      <div
        className={`w-12 h-12 rounded-xl ${c.bg} ${c.text} flex items-center justify-center font-bold shrink-0 group-hover:scale-105 transition-transform`}
      >
        <Icon className="w-6 h-6" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
          {title}
        </p>
        <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5 truncate">
          {loading ? "..." : value}
        </p>
      </div>
    </div>
  );

  if (href) {
    return <Link href={href} className="block">{content}</Link>;
  }

  return content;
}
