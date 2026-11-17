import type { JobStatus, PaymentStatus } from "@/types";
import { Check, Clock, X, AlertTriangle, CreditCard } from "lucide-react";

interface StatusTimelineProps {
  status: JobStatus;
  paymentStatus: PaymentStatus;
}

export default function StatusTimeline({ status, paymentStatus }: StatusTimelineProps) {
  if (status === "cancelled" || status === "rejected") {
    return (
      <div className="p-3 rounded-xl bg-slate-100 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 flex items-center gap-2 text-xs text-slate-600 dark:text-zinc-300">
        <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
        <span>
          Job has concluded with status: <strong className="capitalize text-rose-600">{status}</strong>
        </span>
      </div>
    );
  }

  const steps = [
    { key: "requested", label: "Requested" },
    { key: "accepted", label: "Accepted" },
    { key: "in-progress", label: "In Progress" },
    { key: "completed", label: "Completed" },
    { key: "paid", label: "Paid" },
  ];

  const getStepIndex = () => {
    if (paymentStatus === "paid") return 4;
    if (status === "completed") return 3;
    if (status === "in-progress") return 2;
    if (status === "accepted") return 1;
    return 0;
  };

  const currentIndex = getStepIndex();

  return (
    <div className="w-full py-2">
      <div className="flex items-center justify-between relative">
        {/* Background Connecting Line */}
        <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-0.5 bg-slate-200 dark:bg-zinc-700 -z-0" />

        {/* Active Line Fill */}
        <div
          className="absolute top-1/2 left-0 -translate-y-1/2 h-0.5 bg-blue-600 transition-all duration-500 -z-0"
          style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step, idx) => {
          const isFinished = idx <= currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <div key={step.key} className="flex flex-col items-center relative z-10">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-sm ${
                  isFinished
                    ? "bg-blue-600 text-white"
                    : "bg-white dark:bg-zinc-800 border-2 border-slate-300 dark:border-zinc-700 text-slate-400"
                } ${isCurrent ? "ring-4 ring-blue-100 dark:ring-blue-950/80 scale-110" : ""}`}
              >
                {isFinished ? <Check className="w-3.5 h-3.5" /> : idx + 1}
              </div>
              <span
                className={`text-[10px] mt-1 font-semibold whitespace-nowrap ${
                  isCurrent
                    ? "text-blue-600 dark:text-blue-400 font-bold"
                    : isFinished
                    ? "text-slate-800 dark:text-zinc-200"
                    : "text-slate-400"
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
