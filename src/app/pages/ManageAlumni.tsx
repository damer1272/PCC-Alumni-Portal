import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Search, Eye, ChevronLeft, ChevronRight, GraduationCap, Building2, MapPin } from "lucide-react";
import { COURSES, Alumni } from "../data";
import { storageService } from "../storage";

export default function ManageAlumni() {
  const [alumniList, setAlumniList] = useState<Alumni[]>([]);
  const [search, setSearch] = useState("");
  const [filterCourse, setFilterCourse] = useState("");
  const [page, setPage] = useState(1);
  const PER_PAGE = 8;

  const loadAlumni = async () => {
    const list = await storageService.getAlumni();
    setAlumniList(list);
  };

  useEffect(() => {
    loadAlumni();
  }, []);

  const filtered = alumniList.filter((a) => {
    const q = search.toLowerCase();
    return (
      (a.name.toLowerCase().includes(q) || a.studentId.includes(q) || (a.company && a.company.toLowerCase().includes(q))) &&
      (!filterCourse || a.course === filterCourse)
    );
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE) || 1;
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="space-y-5 font-[Inter,sans-serif]">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Alumni Directory & Records</h1>
          <p className="text-xs text-slate-500 mt-0.5">View graduate records, student verification info, and current employment details.</p>
        </div>
        <span className="text-xs text-slate-500 font-semibold bg-white border border-stone-200 px-3.5 py-1.5 rounded-xl self-start sm:self-auto shadow-2xs">
          Total Graduates: <strong className="text-slate-900">{alumniList.length}</strong>
        </span>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-2xs flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-52">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search alumni by name, student ID, or employer..."
            className="w-full pl-11 pr-4 py-2.5 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#FF8A3D]/30 bg-stone-50 text-slate-900"
          />
        </div>

        <select
          value={filterCourse}
          onChange={(e) => { setFilterCourse(e.target.value); setPage(1); }}
          className="border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs bg-stone-50 text-slate-700 font-medium focus:outline-none"
        >
          <option value="">All Programs / Courses</option>
          {COURSES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* View-Only Alumni Records Table (Status column removed) */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="px-6 py-3.5">Alumni Profile</th>
                <th className="px-6 py-3.5">Student ID</th>
                <th className="px-6 py-3.5">Program</th>
                <th className="px-6 py-3.5">Class Batch</th>
                <th className="px-6 py-3.5">Current Role & Company</th>
                <th className="px-6 py-3.5 text-right">View Profile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-medium text-slate-700">
              {paged.map((a) => (
                <tr key={a.id} className="hover:bg-stone-50/80 transition-colors">
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#18345d] flex items-center justify-center text-white text-xs font-bold flex-shrink-0 overflow-hidden shadow-2xs border border-white">
                        {a.avatar && (a.avatar.startsWith("data:") || a.avatar.startsWith("http")) ? (
                          <img src={a.avatar} alt={a.name} className="w-full h-full object-cover" />
                        ) : (
                          <span>{a.avatar || a.name.slice(0, 2).toUpperCase()}</span>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{a.name}</p>
                        <p className="text-[11px] text-slate-500">{a.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3.5 font-mono text-slate-800 font-semibold">{a.studentId}</td>
                  <td className="px-6 py-3.5 text-slate-800">{a.course}</td>
                  <td className="px-6 py-3.5 font-semibold text-slate-900">{a.year}</td>
                  <td className="px-6 py-3.5">
                    {a.position ? (
                      <div>
                        <p className="font-semibold text-slate-900">{a.position}</p>
                        <p className="text-[11px] text-[#2563eb]">{a.company || "Pagadian Capitol College"}</p>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">Not specified</span>
                    )}
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    <Link
                      to={`/admin/alumni/${a.id}`}
                      title="View Full Profile Details"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#FF8A3D] to-[#ff7a22] hover:from-[#ff7a22] hover:to-[#e66914] text-white text-xs font-bold transition-all shadow-2xs"
                    >
                      <Eye className="w-3.5 h-3.5" /> View Details
                    </Link>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <p className="font-bold text-sm text-slate-800">No alumni records found</p>
                    <p className="text-xs text-slate-400 mt-0.5">Try searching with a different keyword or clearing your filters.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <p className="text-slate-500 font-medium">
            Showing {filtered.length === 0 ? 0 : (page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length} alumni
          </p>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-8 h-8 rounded-xl border border-stone-200 flex items-center justify-center text-slate-600 hover:bg-stone-50 disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setPage(i + 1)}
                className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                  page === i + 1 ? "bg-[#FF8A3D] text-white shadow-2xs" : "border border-stone-200 text-slate-600 hover:bg-stone-50 cursor-pointer"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-8 h-8 rounded-xl border border-stone-200 flex items-center justify-center text-slate-600 hover:bg-stone-50 disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
