import { useState, useEffect } from "react";
import { Download, FileText, BarChart2, Users, FolderArchive, TrendingUp, Sparkles, CheckCircle2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Alumni } from "../data";
import { storageService, BatchGraduateFile } from "../storage";
import { toast } from "sonner";

const COLORS = ["#10b981", "#2563eb", "#ef4444", "#8b5cf6", "#f59e0b"];

const ALL_COURSE_CODES = ["BSIT", "BSBA", "BSA", "BSCrim", "BSEd"];

export default function Reports() {
  const [alumniList, setAlumniList] = useState<Alumni[]>([]);
  const [batchFiles, setBatchFiles] = useState<BatchGraduateFile[]>([]);

  const loadData = async () => {
    const [alumni, files] = await Promise.all([
      storageService.getAlumni(),
      storageService.getBatchGraduateFiles(),
    ]);
    setAlumniList(alumni);
    setBatchFiles(files);
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalAlumni = alumniList.length;
  const totalBatchFiles = batchFiles.length;
  const totalRosterGraduates = batchFiles.reduce((sum, f) => sum + f.totalGraduates, 0);
  const grandTotalGraduates = totalAlumni + totalRosterGraduates;

  const employed = alumniList.filter((a) => a.status === "Employed").length;
  const selfEmployed = alumniList.filter((a) => a.status === "Self-Employed").length;
  const unemployed = alumniList.filter((a) => a.status === "Unemployed").length;
  const contStudies = alumniList.filter((a) => a.status === "Continuing Studies").length;

  const employmentRate = totalAlumni > 0 ? (((employed + selfEmployed) / totalAlumni) * 100).toFixed(1) : "0.0";

  const employmentStatus = [
    { name: "Employed", value: employed },
    { name: "Self-Employed", value: selfEmployed },
    { name: "Unemployed", value: unemployed },
    { name: "Cont. Studies", value: contStudies },
  ].filter((d) => d.value > 0);

  // Compute course distribution ensuring ALL courses are pre-populated (showing 0 if no graduates yet)
  const courseCounts: Record<string, number> = {};
  ALL_COURSE_CODES.forEach((c) => {
    courseCounts[c] = 0;
  });

  // 1. Aggregate from registered alumni
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

  // 2. Aggregate from stored Batch Graduate Files
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

  // Convert map to array for chart containing ALL courses
  const courseData = ALL_COURSE_CODES.map((code) => ({
    course: code,
    graduates: courseCounts[code] || 0,
  }));

  // Compute batch year distribution combining alumni and batch files
  const batchCounts: Record<string, number> = {};
  alumniList.forEach((a) => {
    const yr = String(a.year);
    batchCounts[yr] = (batchCounts[yr] || 0) + 1;
  });
  batchFiles.forEach((f) => {
    const yr = String(f.batchYear);
    batchCounts[yr] = (batchCounts[yr] || 0) + f.totalGraduates;
  });

  const yearData = Object.entries(batchCounts)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([year, count]) => ({ year, count }));

  // Compute top companies
  const companyCounts: Record<string, number> = {};
  alumniList.forEach((a) => {
    if (a.company) {
      companyCounts[a.company] = (companyCounts[a.company] || 0) + 1;
    }
  });
  const companyData = Object.entries(companyCounts)
    .slice(0, 5)
    .map(([company, count]) => ({ company, count }));

  const handleExportCSV = () => {
    const rows: string[] = [];

    rows.push("=== INSTITUTIONAL SUMMARY REPORT ===");
    rows.push(`Report Date,${new Date().toLocaleDateString()}`);
    rows.push(`Grand Total Recorded Graduates,${grandTotalGraduates}`);
    rows.push(`Registered Active Alumni,${totalAlumni}`);
    rows.push(`Batch Files Roster Graduates,${totalRosterGraduates}`);
    rows.push(`Employment Rate,${employmentRate}%`);
    rows.push("");

    rows.push("=== GRADUATES COUNT PER COURSE (ALL COURSES) ===");
    rows.push("Course Acronym,Total Graduates Count");
    ALL_COURSE_CODES.forEach((c) => {
      rows.push(`${c},${courseCounts[c] || 0}`);
    });
    rows.push("");

    rows.push("=== STORED BATCH DOCUMENTS REGISTRY ===");
    rows.push("File Name,Batch Year,Total Graduates,Upload Date");
    batchFiles.forEach((f) => {
      rows.push(`"${f.fileName}",${f.batchYear},${f.totalGraduates},"${f.uploadDate}"`);
    });
    rows.push("");

    rows.push("=== REGISTERED ALUMNI DIRECTORY ===");
    rows.push("ID,Name,Student ID,Email,Course,Year,Status,Company,Position,Location");
    alumniList.forEach((a) => {
      rows.push(
        [
          a.id,
          `"${a.name}"`,
          `"${a.studentId}"`,
          `"${a.email}"`,
          `"${a.course}"`,
          a.year,
          `"${a.status}"`,
          `"${a.company || ""}"`,
          `"${a.position || ""}"`,
          `"${a.location || ""}"`,
        ].join(",")
      );
    });

    const csvContent = "data:text/csv;charset=utf-8," + rows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `pcc_institutional_report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Institutional CSV analytics report downloaded!");
  };

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6 font-[Inter,sans-serif] pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#2563eb] text-xs font-bold mb-2">
            <BarChart2 className="w-3.5 h-3.5" /> Institutional Analytics & Reporting Engine
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Alumni Analytics & Reports</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Generates live institutional reports combining registered alumni data and stored batch graduate files.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleExportPDF}
            className="flex items-center gap-2 border border-stone-200 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-stone-100 transition-colors cursor-pointer shadow-2xs bg-white"
          >
            <FileText className="w-4 h-4 text-rose-500" /> Print / Export PDF
          </button>
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-gradient-to-r from-[#FF8A3D] to-[#ff7a22] hover:from-[#ff7a22] hover:to-[#e66914] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-md shadow-[#FF8A3D]/25"
          >
            <Download className="w-4 h-4" /> Export Report (.CSV)
          </button>
        </div>
      </div>

      {/* Top Metric Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-[#2563eb] flex items-center justify-center mb-3">
            <Users className="w-5 h-5" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{grandTotalGraduates}</p>
          <p className="text-xs font-bold text-slate-800 mt-0.5">Total Recorded Graduates</p>
          <p className="text-[11px] text-slate-400 mt-1">{totalAlumni} registered · {totalRosterGraduates} from batch files</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 text-[#FF8A3D] flex items-center justify-center mb-3">
            <FolderArchive className="w-5 h-5" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{totalBatchFiles}</p>
          <p className="text-xs font-bold text-slate-800 mt-0.5">Batch Files Vault</p>
          <p className="text-[11px] text-slate-400 mt-1">{totalRosterGraduates} graduates recorded in files</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
            <TrendingUp className="w-5 h-5" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{employmentRate}%</p>
          <p className="text-xs font-bold text-slate-800 mt-0.5">Employment Rate</p>
          <p className="text-[11px] text-slate-400 mt-1">{employed + selfEmployed} employed registered alumni</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center mb-3">
            <Sparkles className="w-5 h-5" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{ALL_COURSE_CODES.length}</p>
          <p className="text-xs font-bold text-slate-800 mt-0.5">Academic Programs</p>
          <p className="text-[11px] text-slate-400 mt-1">All 8 PCC courses tracked</p>
        </div>
      </div>

      {/* Analytics Visualizations */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Graduates Per Course Chart (SHOWS ALL 8 COURSES) */}
        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs lg:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base">Graduates Per Course (All Programs)</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-[#2563eb] border border-blue-200">
                  Showing All 8 Academic Courses
                </span>
              </div>
              <p className="text-xs text-slate-500">Live breakdown of graduate counts across all Pagadian Capitol College programs</p>
            </div>
            <span className="text-xs font-bold text-slate-600 bg-stone-100 px-3 py-1 rounded-xl self-start sm:self-auto">
              Total: {grandTotalGraduates} Graduates
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={courseData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="course" fontSize={11} stroke="#475569" fontWeight="bold" />
                <YAxis fontSize={11} stroke="#64748b" />
                <Tooltip
                  formatter={(val: number) => [`${val} graduates`, "Total Count"]}
                  contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "12px" }}
                />
                <Bar dataKey="graduates" fill="#1a3a6b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Table summary of all 8 courses */}
          <div className="mt-5 border-t border-stone-100 pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-medium">
            {ALL_COURSE_CODES.map((code) => (
              <div key={code} className="bg-stone-50 rounded-xl p-3 border border-stone-200 flex items-center justify-between">
                <span className="font-bold text-slate-800">{code}</span>
                <span className="font-extrabold text-[#2563eb] text-sm bg-white px-2 py-0.5 rounded-lg border border-stone-200">
                  {courseCounts[code] || 0}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Employment Status Distribution */}
        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs flex flex-col justify-between">
          <h3 className="font-bold text-slate-900 text-base mb-4">Employment Status Distribution</h3>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={employmentStatus}
                  cx="50%"
                  cy="50%"
                  outerRadius={85}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                  fontSize={11}
                >
                  {employmentStatus.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-stone-100 text-xs font-semibold">
            {employmentStatus.map((d, i) => (
              <div key={d.name} className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-slate-700">{d.name}:</span>
                <span className="font-bold text-slate-900 ml-auto">{d.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Graduates Per Batch Year */}
        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs flex flex-col justify-between">
          <h3 className="font-bold text-slate-900 text-base mb-4">Graduates Per Batch Year</h3>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={yearData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="year" fontSize={11} stroke="#64748b" />
                <YAxis fontSize={11} stroke="#64748b" />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] text-slate-400 text-center pt-3 border-t border-stone-100">
            Combined totals from alumni registrations and stored batch files.
          </p>
        </div>
      </div>
    </div>
  );
}
