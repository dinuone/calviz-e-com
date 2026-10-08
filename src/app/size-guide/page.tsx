import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { Ruler, Sparkles, CheckCircle2, ArrowRight, Info, ShieldCheck, Tag } from "lucide-react";
import { fetchSizeCharts } from "@/lib/api";
import { SizeChart } from "@/types";

export const metadata = {
  title: "Sizing & Fit Guide | CALVIZ",
  description: "Measurement charts and garment fit guidelines for CALVIZ apparel.",
};

export const revalidate = 60;

export default async function SizeGuidePage() {
  const sizeCharts = await fetchSizeCharts();

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col justify-between">
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 md:px-8 pt-36 md:pt-44 pb-20">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="font-mono text-xs uppercase tracking-widest text-neutral-500 font-bold block mb-2">
            SIZE GUIDE
          </span>
          <h1 className="text-3xl md:text-4xl font-black uppercase text-black tracking-tight font-mono">
            CALVIZ SIZING &amp; FIT GUIDE
          </h1>
          <p className="text-sm text-neutral-600 mt-3 font-medium leading-relaxed">
            CALVIZ garments feature a relaxed drop-shoulder cut with structured heavyweight fabric. All measurement charts below reflect the exact sizing of our garments.
          </p>
        </div>

        {/* Dynamic Size Chart Matrices from Backend */}
        {sizeCharts && sizeCharts.length > 0 ? (
          <div className="space-y-10 mb-12">
            {sizeCharts.map((chart, idx) => {
              let rows: Array<{ size: string; [key: string]: string }> = [];
              try {
                rows = JSON.parse(chart.measurementsJson || "[]");
              } catch {}

              const columns = rows.length > 0
                ? Object.keys(rows[0]).filter((k) => k !== "size")
                : [];

              return (
                <div
                  key={chart.id || idx}
                  className="bg-white rounded-2xl border border-neutral-200/80 shadow-md overflow-hidden"
                >
                  {/* Card Header */}
                  <div className="p-6 bg-black text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Ruler className="w-5 h-5 text-emerald-400" />
                        <h2 className="text-sm sm:text-base font-black uppercase tracking-wider font-mono">
                          {chart.name}
                        </h2>
                      </div>
                      {chart.fitType && (
                        <p className="text-xs text-emerald-400 font-mono font-medium flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>{chart.fitType}</span>
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {chart.categoryHint && (
                        <span className="font-mono text-[10px] uppercase font-bold text-neutral-300 bg-neutral-900 px-3 py-1 rounded-lg border border-neutral-800">
                          {chart.categoryHint}
                        </span>
                      )}
                      {chart.isDefault && (
                        <span className="font-mono text-[10px] uppercase font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-800">
                          Standard Matrix
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Description & Model Info */}
                  {(chart.description || chart.modelStats) && (
                    <div className="p-5 bg-neutral-50/70 border-b border-neutral-200/80 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono text-neutral-700">
                      {chart.description && (
                        <p className="leading-relaxed">
                          <strong className="text-black uppercase block mb-0.5">Garment Fit:</strong>
                          {chart.description}
                        </p>
                      )}
                      {chart.modelStats && (
                        <div className="p-3 bg-white rounded-xl border border-neutral-200 flex items-start gap-2">
                          <Info className="w-4 h-4 text-neutral-500 shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-black uppercase block mb-0.5">Model Info:</strong>
                            <p className="text-neutral-600">{chart.modelStats}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Interactive Measurement Matrix Table */}
                  {rows.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left font-mono text-xs">
                        <thead className="bg-neutral-100/70 text-neutral-600 uppercase border-b border-neutral-200">
                          <tr>
                            <th className="p-4 sm:px-6 font-bold text-black">SIZE</th>
                            {columns.map((col) => (
                              <th key={col} className="p-4 sm:px-6 font-bold capitalize">
                                {col.replace(/_/g, " ")} (INCHES)
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                          {rows.map((row, rIdx) => (
                            <tr key={rIdx} className="hover:bg-neutral-50/80 transition-colors">
                              <td className="p-4 sm:px-6 font-black text-black text-sm">{row.size}</td>
                              {columns.map((col) => (
                                <td key={col} className="p-4 sm:px-6 font-medium text-neutral-800">
                                  {row[col] || "—"}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-8 text-center text-xs font-mono text-neutral-500">
                      Measurement specs available on request.
                    </div>
                  )}

                  {/* Care Instructions Footer */}
                  {chart.careInstructions && (
                    <div className="p-4 bg-neutral-900 text-neutral-300 text-[11px] font-mono flex items-center gap-2 border-t border-neutral-800">
                      <Tag className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>
                        <strong>Care Advisory:</strong> {chart.careInstructions}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty / Fallback message */
          <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center mb-12 shadow-sm">
            <Ruler className="w-10 h-10 text-neutral-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-black font-mono uppercase mb-1">
              Garment Specifications
            </h3>
            <p className="text-xs text-neutral-500 font-mono max-w-md mx-auto">
              Size charts are currently being updated. Check back shortly or view specifications on individual product pages.
            </p>
          </div>
        )}

        {/* Fit Guidelines & Pro-Tips */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 space-y-4 shadow-xs">
            <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 font-bold block">
              FIT GUIDE
            </span>
            <h3 className="text-lg font-black uppercase text-black font-mono tracking-tight">
              HOW TO MEASURE
            </h3>
            <div className="space-y-3 text-xs text-neutral-700 leading-relaxed font-medium">
              <p>
                <strong>1. Chest:</strong> Measure around the fullest part of your chest, keeping the measuring tape horizontal under your arms.
              </p>
              <p>
                <strong>2. Length:</strong> Measure from the highest point of the shoulder seam straight down to the bottom hemline.
              </p>
              <p>
                <strong>3. Shoulder:</strong> Measure across the upper back from shoulder point to shoulder point.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 space-y-4 shadow-xs">
            <span className="font-mono text-[10px] uppercase tracking-widest text-emerald-600 font-bold block">
              ZERO-RISK SIZING
            </span>
            <h3 className="text-lg font-black uppercase text-black font-mono tracking-tight">
              7-DAY EFFORTLESS SIZE EXCHANGES
            </h3>
            <p className="text-xs text-neutral-600 leading-relaxed font-medium">
              Unsure about your exact fit? Order your preferred size with confidence. If you prefer a different shoulder drape or torso length, our express courier will deliver the replacement size directly to your door within 7 days.
            </p>
            <div className="pt-2">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white text-xs font-mono font-bold uppercase rounded-xl hover:bg-neutral-800 transition-colors shadow-sm"
              >
                <span>EXPLORE CATALOG →</span>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
