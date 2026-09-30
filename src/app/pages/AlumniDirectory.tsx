import { useState, useEffect } from "react";
import { Link } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Search, Linkedin, Github, Facebook, Instagram, ExternalLink, MapPin, User, Sparkles, X, Filter, SlidersHorizontal, CheckCircle2 } from "lucide-react";
import { COURSES, YEARS, STATUSES, Alumni } from "../data";
import { storageService, ProfileData } from "../storage";

const statusTone: Record<string, string> = {
  Employed: "text-emerald-700 bg-emerald-50 border-emerald-200",
  "Self-Employed": "text-[#2563eb] bg-blue-50 border-blue-200",
  Unemployed: "text-red-700 bg-red-50 border-red-200",
  "Continuing Studies": "text-purple-700 bg-purple-50 border-purple-200",
};

const trendingTags = [
  { label: "#BSIT", query: "BSIT" },
  { label: "#BSBA", query: "BSBA" },
  { label: "#ClassOf2024", year: "2024" },
  { label: "#SoftwareEngineers", query: "Engineer" },
  { label: "#Accenture", query: "Accenture" },
  { label: "#PagadianCity", query: "Pagadian" },
  { label: "#Employed", status: "Employed" },
];

export default function AlumniDirectory() {
  const [alumniList, setAlumniList] = useState<Alumni[]>([]);
  const [currentProfile, setCurrentProfile] = useState<ProfileData | null>(null);
  const [search, setSearch] = useState("");
  const [filterCourse, setFilterCourse] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    storageService.getAlumni().then(setAlumniList);
    storageService.getProfile().then(setCurrentProfile);
  }, []);

  const filtered = alumniList.filter((a) => {
    const q = search.toLowerCase().trim();
    const matchQuery =
      !q ||
      a.name.toLowerCase().includes(q) ||
      a.course.toLowerCase().includes(q) ||
      (a.company && a.company.toLowerCase().includes(q)) ||
      (a.position && a.position.toLowerCase().includes(q)) ||
      (a.location && a.location.toLowerCase().includes(q)) ||
      (a.studentId && a.studentId.toLowerCase().includes(q));

    const matchCourse = !filterCourse || a.course === filterCourse;
    const matchYear = !filterYear || String(a.year) === filterYear;
    const matchStatus = !filterStatus || a.status === filterStatus;

    return matchQuery && matchCourse && matchYear && matchStatus;
  });

  const clearAll = () => {
    setSearch("");
    setFilterCourse("");
    setFilterYear("");
    setFilterStatus("");
  };

  const hasActiveFilters = Boolean(search || filterCourse || filterYear || filterStatus);

  return (
    <div className="space-y-8 font-[Inter,sans-serif] max-w-6xl mx-auto pb-12">
      {/* SOCIAL MEDIA SEARCH ENGINE HERO HEADER */}
      <header className="space-y-4 text-center sm:text-left">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF8A3D]/15 text-[#FF8A3D] text-[11px] font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Social Search Engine
          </span>
          <h1 className="font-[Cormorant_Garamond,serif] text-4xl sm:text-5xl font-bold text-slate-900 leading-tight">
            Search PCC Network
          </h1>
          <p className="text-sm text-slate-600 max-w-xl mt-1">
            Discover batchmates, alumni professionals, recruiters, and colleagues across Pagadian Capitol College.
          </p>
        </div>

        {/* HERO SEARCH ENGINE INPUT BAR */}
        <div className="relative max-w-3xl shadow-lg rounded-2xl overflow-hidden bg-white border border-stone-200">
          <div className="relative flex items-center">
            <Search className="absolute left-4.5 w-5 h-5 text-[#FF8A3D]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search alumni by name, position, company, course, or student ID..."
              className="w-full pl-12 pr-28 py-4 text-sm sm:text-base text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF8A3D]/40 font-medium"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-24 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`absolute right-3 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                showFilters || filterCourse || filterYear || filterStatus
                  ? "bg-[#18345d] text-white"
                  : "bg-stone-100 text-slate-700 hover:bg-stone-200"
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" /> Filters
            </button>
          </div>
        </div>

        {/* TRENDING QUICK SEARCH TAGS (Social Media Style) */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1">Trending:</span>
          {trendingTags.map((tag) => (
            <button
              key={tag.label}
              type="button"
              onClick={() => {
                if (tag.query) setSearch(tag.query);
                if (tag.year) setFilterYear(tag.year);
                if (tag.status) setFilterStatus(tag.status);
              }}
              className="px-3 py-1 rounded-full bg-stone-100 hover:bg-[#FF8A3D]/15 hover:text-[#FF8A3D] text-slate-600 text-xs font-bold transition-all border border-stone-200 cursor-pointer"
            >
              {tag.label}
            </button>
          ))}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearAll}
              className="text-xs text-red-600 font-bold hover:underline ml-auto cursor-pointer flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" /> Clear Search
            </button>
          )}
        </div>
      </header>

      {/* FILTER CONTROLS PANEL */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-[#FF8A3D]" /> Refine Search Results
                </h3>
                {hasActiveFilters && (
                  <span className="text-xs font-semibold text-[#2563eb]">
                    Showing {filtered.length} matching alumni
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Course Program</label>
                  <select
                    value={filterCourse}
                    onChange={(e) => setFilterCourse(e.target.value)}
                    className="w-full border border-stone-300 rounded-xl px-3 py-2 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#FF8A3D]/40"
                  >
                    <option value="">All Courses</option>
                    {COURSES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Class Batch Year</label>
                  <select
                    value={filterYear}
                    onChange={(e) => setFilterYear(e.target.value)}
                    className="w-full border border-stone-300 rounded-xl px-3 py-2 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#FF8A3D]/40"
                  >
                    <option value="">All Batches</option>
                    {YEARS.map((y) => (
                      <option key={y} value={y}>Class of {y}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Employment Status</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full border border-stone-300 rounded-xl px-3 py-2 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#FF8A3D]/40"
                  >
                    <option value="">All Statuses</option>
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SEARCH RESULTS COUNT HEADER */}
      <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-stone-200 pb-2">
        <span>Alumni Search Results ({filtered.length})</span>
        {search && <span className="text-[#FF8A3D]">Keyword: &ldquo;{search}&rdquo;</span>}
      </div>

      {/* SEARCH RESULTS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((alumni) => {
          const isSelf = currentProfile && (
            (alumni.email && currentProfile.email && alumni.email.toLowerCase() === currentProfile.email.toLowerCase()) ||
            (alumni.studentId && currentProfile.studentId && alumni.studentId === currentProfile.studentId) ||
            (alumni.name && currentProfile.name && alumni.name.toLowerCase() === currentProfile.name.toLowerCase())
          );

          return (
            <motion.article
              key={alumni.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className={`group relative overflow-hidden rounded-2xl border ${
                isSelf ? "border-[#FF8A3D]/40 bg-gradient-to-b from-amber-50/60 to-white" : "border-stone-200 bg-white"
              } p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-start gap-3.5">
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-[#18345d] to-[#2563eb] text-white flex items-center justify-center font-[Cormorant_Garamond,serif] font-bold text-xl overflow-hidden shadow-sm">
                      {alumni.avatar && (alumni.avatar.startsWith("data:") || alumni.avatar.startsWith("http")) ? (
                        <img src={alumni.avatar} alt={alumni.name} className="w-full h-full object-cover" />
                      ) : (
                        alumni.name.slice(0, 2).toUpperCase()
                      )}
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="font-bold text-slate-900 truncate text-base">{alumni.name}</p>
                      {isSelf && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] uppercase font-bold tracking-wider bg-[#FF8A3D] text-white px-2 py-0.5 rounded-full shadow-2xs">
                          You
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{alumni.course}</p>
                    <p className="text-[11px] text-[#2563eb] mt-0.5 font-bold">Class of {alumni.year}</p>
                  </div>
                </div>

                <div className="mt-3.5 space-y-2">
                  <span className={`inline-flex text-[10px] px-2.5 py-0.5 rounded-md font-bold border ${statusTone[alumni.status] ?? "bg-gray-50 text-gray-600 border-gray-200"}`}>
                    {alumni.status}
                  </span>
                  {alumni.company && (
                    <p className="text-xs text-slate-700 truncate font-medium">
                      <span className="font-bold text-slate-900">{alumni.position}</span>
                      <span className="text-slate-400"> · </span>
                      {alumni.company}
                    </p>
                  )}
                  {alumni.location && (
                    <p className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                      <MapPin className="w-3 h-3 text-slate-400" /> {alumni.location}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3.5 mt-4 border-t border-stone-100">
                <div className="flex gap-2">
                  {alumni.linkedin && (
                    <a href={alumni.linkedin} target="_blank" rel="noopener noreferrer" className="text-[#2563eb] hover:opacity-80 transition-opacity" aria-label="LinkedIn">
                      <Linkedin className="w-4 h-4" />
                    </a>
                  )}
                  {alumni.github && (
                    <a href={alumni.github} target="_blank" rel="noopener noreferrer" className="text-slate-800 hover:opacity-80 transition-opacity" aria-label="GitHub">
                      <Github className="w-4 h-4" />
                    </a>
                  )}
                  {alumni.facebook && (
                    <a href={alumni.facebook} target="_blank" rel="noopener noreferrer" className="text-[#1877f2] hover:opacity-80 transition-opacity" aria-label="Facebook">
                      <Facebook className="w-4 h-4" />
                    </a>
                  )}
                  {alumni.instagram && (
                    <a href={alumni.instagram} target="_blank" rel="noopener noreferrer" className="text-[#e1306c] hover:opacity-80 transition-opacity" aria-label="Instagram">
                      <Instagram className="w-4 h-4" />
                    </a>
                  )}
                </div>
                {isSelf ? (
                  <Link
                    to="/alumni/profile"
                    className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-[#FF8A3D] text-white text-xs font-bold hover:bg-[#ff7a22] transition-all shadow-xs"
                  >
                    <User className="w-3.5 h-3.5" /> My Profile
                  </Link>
                ) : (
                  <Link
                    to={`/alumni/directory/${alumni.id}`}
                    className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-stone-100 text-slate-700 text-xs font-bold hover:bg-[#18345d] hover:text-white transition-all shadow-xs"
                  >
                    View Profile <ExternalLink className="w-3 h-3" />
                  </Link>
                )}
              </div>
            </motion.article>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-3xl border border-dashed border-stone-300 bg-white py-16 text-center space-y-2">
          <p className="font-[Cormorant_Garamond,serif] text-3xl font-bold text-slate-900">No Alumni Found</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">Try searching for a different name, course program, company, or clearing your active filters.</p>
          <button
            type="button"
            onClick={clearAll}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FF8A3D] text-white text-xs font-bold hover:bg-[#ff7a22] transition-all shadow-xs cursor-pointer mt-2"
          >
            Clear Search & Filters
          </button>
        </div>
      )}
    </div>
  );
}
