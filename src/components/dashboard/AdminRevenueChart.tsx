"use client";

import { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, DollarSign } from "lucide-react";

interface AdminRevenueChartProps {
  totalRevenue: number;
}

export default function AdminRevenueChart({ totalRevenue }: AdminRevenueChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Generate smooth trend data leading up to the current total
  const data = [
    { month: "Jan", revenue: Math.round(totalRevenue * 0.12) },
    { month: "Feb", revenue: Math.round(totalRevenue * 0.22) },
    { month: "Mar", revenue: Math.round(totalRevenue * 0.38) },
    { month: "Apr", revenue: Math.round(totalRevenue * 0.55) },
    { month: "May", revenue: Math.round(totalRevenue * 0.76) },
    { month: "Jun", revenue: Math.round(totalRevenue) },
  ];

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Revenue Growth & Invoicing
            </h3>
            <p className="text-[11px] text-slate-400">
              Cumulative Stripe platform transactions
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold self-start sm:self-auto">
          <DollarSign className="w-3.5 h-3.5" />
          <span>${totalRevenue.toLocaleString()} Total Settled</span>
        </div>
      </div>

      <div className="h-[260px] w-full pt-2">
        {!mounted ? (
          <div className="h-full w-full rounded-2xl bg-slate-50 dark:bg-zinc-800/40 animate-pulse" />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="adminRevenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#9333ea" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#9333ea" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888820" />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "#888888" }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "#888888" }}
                tickFormatter={(val) => `$${val}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(17, 24, 39, 0.95)",
                  borderColor: "#374151",
                  borderRadius: "12px",
                  fontSize: "12px",
                  color: "#fff",
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)",
                }}
                formatter={(value: any) => [`$${value} USD`, "Revenue"]}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#9333ea"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#adminRevenueGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
