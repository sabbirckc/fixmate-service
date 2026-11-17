import Link from "next/link";
import { ArrowRight, Clock, MapPin, Tag, Wrench } from "lucide-react";
import type { Service } from "@/types";

interface ServiceCardProps {
  service: Service;
}

export default function ServiceCard({ service }: ServiceCardProps) {
  return (
    <div className="group flex flex-col h-full bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/90 dark:border-zinc-800 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden hover:-translate-y-1">
      {/* Banner Image */}
      <div className="relative aspect-16/10 w-full overflow-hidden bg-slate-100 dark:bg-zinc-800">
        <img
          src={service.image}
          alt={service.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-blue-600/90 backdrop-blur-md text-white shadow-sm">
            {service.category}
          </span>
          <span className="px-2 py-0.5 text-xs font-medium rounded-lg bg-slate-900/80 backdrop-blur-md text-slate-200">
            {service.serviceMode}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        {/* Title */}
        <h3 className="font-bold text-base text-slate-900 dark:text-white line-clamp-2 min-h-12 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {service.title}
        </h3>

        {/* Short Description */}
        <p className="text-xs text-slate-500 dark:text-zinc-400 line-clamp-2 mt-1 mb-4 flex-1">
          {service.description}
        </p>

        {/* Info Chips */}
        <div className="space-y-1.5 py-2.5 border-y border-slate-100 dark:border-zinc-800/80 text-xs text-slate-600 dark:text-zinc-400">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-500">
              <Clock className="w-3.5 h-3.5 text-blue-500" /> Duration
            </span>
            <span className="font-medium text-slate-800 dark:text-zinc-200">{service.estimatedDuration}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-500">
              <MapPin className="w-3.5 h-3.5 text-blue-500" /> Area
            </span>
            <span className="font-medium text-slate-800 dark:text-zinc-200 truncate max-w-[140px]">{service.serviceArea}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-500">
              <Wrench className="w-3.5 h-3.5 text-blue-500" /> Technician
            </span>
            <span className="font-semibold text-slate-800 dark:text-zinc-200 truncate max-w-[140px]">{service.technicianName}</span>
          </div>
        </div>

        {/* Bottom Price & Action */}
        <div className="mt-4 pt-1 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">Starts from</span>
            <span className="text-xl font-black text-slate-900 dark:text-white">
              ${service.basePrice}
            </span>
          </div>

          <Link
            href={`/services/${service._id}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white dark:bg-blue-950/40 dark:text-blue-400 dark:hover:bg-blue-600 dark:hover:text-white font-semibold text-xs transition-all shadow-sm group-hover:bg-blue-600 group-hover:text-white"
          >
            <span>View Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
