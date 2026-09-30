import { useState, useEffect } from "react";
import {
  Users, Briefcase, TrendingUp, UserX, BookOpen, ChevronRight,
  Megaphone, BarChart2, UserCog, Search, Filter, Eye, Sparkles, CheckCircle2,
  FolderArchive, FileSpreadsheet
} from "lucide-react";
import { useNavigate } from "react-router";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Alumni } from "../data";
import { storageService, BatchGraduateFile } from "../storage";

const STATUS_COLORS: Record<string, string> = {
  "Employed": "#10b981",
  "Self-Employed": "#2563eb",
  "Unemployed": "#ef4444",
  "Continuing Studies": "#8b5cf6",
};

const ALL_COURSE_CODES = ["BSIT", "BSBA", "BSA", "BSCrim", "BSEd"];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [alumniList, setAlumniList] = useState<Alumni[]>([]);
  const [batchFiles, setBatchFiles] = useState<BatchGraduateFile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");

  const loadDashboardData = () => {
    Promise.all([
      storageService.getAlumni(),
      storageService.getBatchGraduateFiles(),
    ]).then(([alumni, files]) => {
      setAlumniList(alumni);
      setBatchFiles(files);
    });
  };

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 5000);
    window.addEventListener("focus", loadDashboardData);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", loadDashboardData);
    };
  }, []);

  const total = alumniList.length;
  const totalBatchFiles = batchFiles.length;
  const totalRosterGraduates = batchFiles.reduce((sum, f) => sum + f.totalGraduates, 0);

  const employed = alumniList.filter((a) => a.status === "Employed").length;
  const selfEmployed = alumniList.filter((a) => a.status === "Self-Employed").length;
  const unemployed = alumniList.filter((a) => a.status === "Unemployed").length;
  const contStudies = alumniList.filter((a) => a.status === "Continuing Studies").length;

  const employmentRate = total > 0 ? (((employed + selfEmployed) / total) * 100).toFixed(1) : "0.0";

  const employmentData = [
    { name: "Employed", value: employed, color: STATUS_COLORS["Employed"] },
    { name: "Self-Employed", value: selfEmployed, color: STATUS_COLORS["Self-Employed"] },
    { name: "Unemployed", value: unemployed, color: STATUS_COLORS["Unemployed"] },
    { name: "Continuing Studies", value: contStudies, color: STATUS_COLORS["Continuing Studies"] },
  ].filter((d) => d.value > 0);

  // Compute course distribution pre-populating ALL 8 courses with 0
  const courseCounts: Record<string, number> = {};
  ALL_COURSE_CODES.forEach((c) => {
    courseCounts[c] = 0;
  });

  // 1. Count registered alumni
  alumniList.forEach((a) => {
    let key = "BSIT";
    const courseStr = a.course || "";
    const match = courseStr.match(/\(([^)]+)\)/);
    if (match && match[1]) {
      key = match[1].trim().toUpperCase();
    } else if (courseStr.toLowerCase().includes("accountancy") || courseStr.toLowerCase().includes("bsa")) {
      key = "BSA";
    } else if (courseStr.toLowerCase().includes("information technology") || courseStr.toLowerCase().includes("bsit")) {
      key = "BSIT";
    } else if (courseStr.toLowerCase().includes("criminology") || courseStr.toLowerCase().includes("bscrim")) {
      key = "BSCrim";
    } else if (courseStr.toLowerCase().includes("business administration") || courseStr.toLowerCase().includes("bsba")) {
      key = "BSBA";
    } else if (courseStr.toLowerCase().includes("nursing") || courseStr.toLowerCase().includes("bsn")) {
      key = "BSN";
    } else if (courseStr.toLowerCase().includes("elementary education") || courseStr.toLowerCase().includes("beed")) {
      key = "BEEd";
    } else if (courseStr.toLowerCase().includes("secondary education") || courseStr.toLowerCase().includes("bsed")) {
      key = "BSEd";
    } else if (courseStr.toLowerCase().includes("hotel") || courseStr.toLowerCase().includes("bshrm")) {
      key = "BSHRM";
    } else {
      key = courseStr.split(" ")[0] || "BSIT";
    }

    if (courseCounts[key] !== undefined) {
      courseCounts[key] += 1;
    } else {
      courseCounts[key] = (courseCounts[key] || 0) + 1;
    }
  });

  // 2. Count official graduates per course from stored Batch Graduate Files
  batchFiles.forEach((file) => {
    if (file.courseCounts) {
      Object.entries(file.courseCounts).forEach(([rawKey, count]) => {
        let key = rawKey.toUpperCase().trim();
        if (key.includes("BSIT")) key = "BSIT";
        else if (key.includes("BSA")) key = "BSA";
        else if (key.includes("BSCRIM")) key = "BSCrim";
        else if (key.includes("BSBA")) key = "BSBA";
        else if (key.includes("BSN")) key = "BSN";
        else if (key.includes("BEED")) key = "BEEd";
        else if (key.includes("BSED")) key = "BSEd";
        else if (key.includes("BSHRM")) key = "BSHRM";

        if (courseCounts[key] !== undefined) {
          courseCounts[key] += count;
        } else {
          courseCounts[key] = count;
        }
      });
    }
  });

  // Map to array ensuring ALL 8 courses are included
  const courseData = ALL_COURSE_CODES.map((code) => ({
    course: code,
    graduates: courseCounts[code] || 0,
  }));

  // Top course calculation
  const topCourse = Object.entries(courseCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "BSIT";

  // Compute batch year distribution dynamically
  const batchCounts: Record<string, number> = {};
  alumniList.forEach((a) => {
    const yr = String(a.year);
    batchCounts[yr] = (batchCounts[yr] || 0) + 1;
  });
  batchFiles.forEach((f) => {
    const yr = String(f.batchYear);
    batchCounts[yr] = (batchCounts[yr] || 0) + f.totalGraduates;
  });

  const batchData = Object.entries(batchCounts)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([year, count]) => ({ year, count }));

  // Filter recent registrations table
  const filteredRecent = alumniList.filter((a) => {
    const matchesSearch =
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.course.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(a.year).includes(searchQuery);

    const matchesStatus = selectedStatus === "All" || a.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 font-[Inter,sans-serif]">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0d1f3c] via-[#1a3a6b] to-[#2563eb] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-amber-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" /> Official Admin Command Dashboard
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Admin Overview & Analytics</h1>
            <p className="text-blue-100/80 text-xs sm:text-sm mt-1 max-w-xl">
              Monitor graduate metrics, employment distributions, batch graduate documents, and institutional reporting.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => navigate("/admin/batch-files")}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#FF8A3D] to-[#ff7a22] hover:from-[#ff7a22] hover:to-[#e66914] text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-md shadow-[#FF8A3D]/25 transition-all cursor-pointer"
            >
              <FolderArchive className="w-4 h-4" /> Batch Graduate Files
            </button>
            <button
              type="button"
              onClick={() => navigate("/admin/alumni")}
              className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white font-bold px-4 py-2.5 rounded-xl text-xs border border-white/20 transition-all cursor-pointer backdrop-blur-sm"
            >
              <Users className="w-4 h-4" /> Manage Alumni
            </button>
            <button
              type="button"
              onClick={() => navigate("/admin/announcements")}
              className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white font-bold px-4 py-2.5 rounded-xl text-xs border border-white/20 transition-all cursor-pointer backdrop-blur-sm"
            >
              <Megaphone className="w-4 h-4" /> Post News
            </button>
          </div>
        </div>
      </div>

      {/* Top Executive Stats Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          {
            label: "Registered Alumni",
            value: total,
            subtext: "Active platform accounts",
            icon: Users,
            color: "text-blue-600 bg-blue-50 border-blue-100",
          },
          {
            label: "Batch Files Roster",
            value: totalRosterGraduates,
            subtext: `${totalBatchFiles} files stored in vault`,
            icon: FolderArchive,
            color: "text-amber-600 bg-amber-50 border-amber-100",
          },
          {
            label: "Employment Rate",
            value: `${employmentRate}%`,
            subtext: `${employed + selfEmployed} working registered`,
            icon: TrendingUp,
            color: "text-emerald-600 bg-emerald-50 border-emerald-100",
          },
          {
            label: "Employed",
            value: employed,
            subtext: total > 0 ? `${((employed / total) * 100).toFixed(0)}% of total cohort` : "0%",
            icon: Briefcase,
            color: "text-green-600 bg-green-50 border-green-100",
          },
          {
            label: "Self-Employed",
            value: selfEmployed,
            subtext: total > 0 ? `${((selfEmployed / total) * 100).toFixed(0)}% of total cohort` : "0%",
            icon: Sparkles,
            color: "text-indigo-600 bg-indigo-50 border-indigo-100",
          },
        ].map(({ label, value, subtext, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 rounded-xl ${color} border flex items-center justify-center mb-3`}>
              <Icon className="w-4.5 h-4.5" />
            </div>
            <p className="text-2xl font-bold text-slate-900 tracking-tight">{value}</p>
            <p className="text-slate-800 text-xs font-semibold mt-0.5">{label}</p>
            <p className="text-slate-400 text-[11px] mt-1">{subtext}</p>
          </div>
        ))}
      </div>

      {/* Analytics & Data Charts */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Employment Breakdown Donut */}
        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Employment Distribution</h3>
              <p className="text-xs text-slate-500">Breakdown of current employment statuses</p>
            </div>
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              {employmentRate}% Employed
            </span>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={employmentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {employmentData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: number) => [`${val} graduates`, "Count"]}
                  contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "12px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Color legend */}
          <div className="grid grid-cols-2 gap-2 pt-4 border-t border-stone-100 text-xs font-medium">
            {employmentData.map((d) => (
              <div key={d.name} className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-slate-700 truncate">{d.name}:</span>
                <span className="font-bold text-slate-900 ml-auto">{d.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Graduates Per Program / Course (Aggregated from Batch Document Roster Files) */}
        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base">Graduates per Program</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-[#FF8A3D] border border-amber-200">
                  From Batch Documents
                </span>
              </div>
              <p className="text-xs text-slate-500">Graduates count per course generated from uploaded rosters</p>
            </div>
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Top: {topCourse}
            </span>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={courseData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="course" fontSize={11} stroke="#64748b" />
                <YAxis fontSize={11} stroke="#64748b" />
                <Tooltip
                  formatter={(val: number) => [`${val} graduates`, "Total Graduates Count"]}
                  contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "12px" }}
                />
                <Bar dataKey="graduates" fill="#1a3a6b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <p className="text-[11px] text-slate-400 text-center pt-2">
            Generated from stored batch graduate files and active registrations without creating profiles.
          </p>
        </div>

        {/* Graduates per Batch Year */}
        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Graduates per Batch Year</h3>
              <p className="text-xs text-slate-500">Alumni totals categorized by graduation year</p>
            </div>
            <span className="text-[11px] text-slate-500 font-semibold">
              {batchData.length} Batch Cohorts Recorded
            </span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={batchData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="year" fontSize={11} stroke="#64748b" />
                <YAxis fontSize={11} stroke="#64748b" />
                <Tooltip
                  formatter={(val: number) => [`${val} alumni`, "Batch Size"]}
                  contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "12px" }}
                />
                <Bar dataKey="count" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Quick System Action Highlights Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            title: "Batch Graduate Files",
            desc: "Store Excel rosters & generate course totals",
            path: "/admin/batch-files",
            icon: FolderArchive,
            color: "from-amber-500 to-orange-600",
          },
          {
            title: "Alumni Directory",
            desc: "View full list & verify student profiles",
            path: "/admin/alumni",
            icon: Users,
            color: "from-blue-600 to-indigo-700",
          },
          {
            title: "Announcements",
            desc: "Publish job openings & college news",
            path: "/admin/announcements",
            icon: Megaphone,
            color: "from-purple-600 to-indigo-700",
          },
          {
            title: "Reports & Analytics",
            desc: "Generate summary data & employment charts",
            path: "/admin/reports",
            icon: BarChart2,
            color: "from-emerald-600 to-teal-700",
          },
        ].map((item) => (
          <button
            key={item.title}
            type="button"
            onClick={() => navigate(item.path)}
            className="group text-left bg-white p-5 rounded-2xl border border-stone-200 shadow-xs hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} text-white flex items-center justify-center mb-3 shadow-sm group-hover:scale-105 transition-transform`}>
              <item.icon className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1 group-hover:text-[#2563eb] transition-colors">
              {item.title}
              <ChevronRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
            </h4>
            <p className="text-slate-500 text-xs mt-1">{item.desc}</p>
          </button>
        ))}
      </div>

      {/* Recent Registrations Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-stone-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Alumni Registrations</h3>
            <p className="text-xs text-slate-500">Search and filter recorded graduate profiles</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 min-w-44">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search alumni..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-stone-200 text-xs bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF8A3D]/30"
              />
            </div>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-stone-200 text-xs bg-stone-50 text-slate-700 font-medium focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Employed">Employed</option>
              <option value="Self-Employed">Self-Employed</option>
              <option value="Unemployed">Unemployed</option>
              <option value="Continuing Studies">Continuing Studies</option>
            </select>

            <button
              type="button"
              onClick={() => navigate("/admin/alumni")}
              className="text-[#2563eb] hover:text-[#1d4ed8] text-xs font-bold flex items-center gap-1 hover:underline cursor-pointer ml-auto md:ml-0"
            >
              Manage all <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-stone-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-stone-200">
                <th className="px-6 py-3.5">Alumni Profile</th>
                <th className="px-6 py-3.5">Student ID</th>
                <th className="px-6 py-3.5">Program</th>
                <th className="px-6 py-3.5">Batch Year</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-medium text-slate-700">
              {filteredRecent.slice(0, 7).map((a) => (
                <tr key={a.id} className="hover:bg-stone-50/80 transition-colors">
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#18345d] flex items-center justify-center text-white text-xs font-bold flex-shrink-0 overflow-hidden border border-stone-200">
                        {a.avatar && (a.avatar.startsWith("data:") || a.avatar.startsWith("http")) ? (
                          <img src={a.avatar} alt={a.name} className="w-full h-full object-cover" />
                        ) : (
                          <span>{a.avatar || a.name.slice(0, 2).toUpperCase()}</span>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{a.name}</p>
                        <p className="text-[11px] text-slate-400">{a.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3.5 font-mono text-slate-800 font-semibold">{a.studentId}</td>
                  <td className="px-6 py-3.5 text-slate-800">{a.course}</td>
                  <td className="px-6 py-3.5 font-semibold text-slate-900">{a.year}</td>
                  <td className="px-6 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg font-bold ${
                        a.status === "Employed"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : a.status === "Self-Employed"
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : a.status === "Unemployed"
                          ? "bg-rose-50 text-rose-700 border border-rose-200"
                          : "bg-purple-50 text-purple-700 border border-purple-200"
                      }`}
                    >
                      {a.status === "Employed" && <CheckCircle2 className="w-3 h-3" />}
                      {a.status}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    <button
                      type="button"
                      onClick={() => navigate(`/admin/alumni/${a.id}`)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold transition-all text-xs cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-600" /> View
                    </button>
                  </td>
                </tr>
              ))}

              {filteredRecent.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    <p className="font-bold text-sm text-slate-700">No matching alumni found</p>
                    <p className="text-xs text-slate-400 mt-0.5">Try searching with a different term or status filter.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
