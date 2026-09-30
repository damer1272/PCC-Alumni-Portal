import { useState, useEffect } from "react";
import {
  Download, Upload, FileSpreadsheet, FolderArchive, ShieldAlert, CheckCircle2,
  Trash2, FileText, Info, ArrowRight, Sparkles, Filter, Eye, AlertCircle
} from "lucide-react";
import * as XLSX from "xlsx";
import { storageService, BatchGraduateFile } from "../storage";
import { Alumni } from "../data";
import { toast } from "sonner";

const DEFAULT_CSV_CONTENT = `Student ID,Full Name,Course,Batch Year
2026-0101,Juan Dela Cruz,Bachelor of Science in Information Technology (BSIT),2026
2026-0102,Maria Clara Santos,Bachelor of Science in Accountancy (BSA),2026
2026-0103,Pedro Penduko,Bachelor of Science in Criminology (BSCrim),2026
2026-0104,Ana Marie Reyes,Bachelor of Science in Business Administration (BSBA),2026
2026-0105,Jose Protasio Rizal,Bachelor of Secondary Education (BSEd),2026`;

// Comprehensive course identification function for 5 PCC courses
const identifyCourse = (val: any): string | null => {
  if (val === null || val === undefined) return null;
  const str = String(val).replace(/[^\x20-\x7E]/g, "").trim();
  if (!str || str.length < 2) return null;

  // Ignore header column labels
  const lower = str.toLowerCase();
  if (
    lower === "course" || lower === "program" || lower === "degree" ||
    lower === "student id" || lower === "full name" || lower === "batch year" ||
    lower === "student_id" || lower === "name" || lower === "year"
  ) {
    return null;
  }

  // 1. Check parenthetical acronym e.g. (BSIT), (BSA), (BSCrim), (BSBA), (BSEd)
  const match = str.match(/\(([^)]+)\)/);
  if (match && match[1]) {
    const code = match[1].trim().toUpperCase();
    if (code.includes("IT") || code.includes("INFO")) return "BSIT";
    if (code.includes("BSA") || code.includes("ACCT")) return "BSA";
    if (code.includes("CRIM")) return "BSCrim";
    if (code.includes("BA") || code.includes("BUS")) return "BSBA";
    if (code.includes("BSED") || code.includes("SEC") || code.includes("EDUC")) return "BSEd";
  }

  // 2. Keyword pattern matching across 5 course names and acronyms
  if (
    lower.includes("information technology") || lower.includes("bsit") ||
    lower.includes("computer science") || lower.includes("bscs") ||
    lower.includes("info tech") || lower.includes("bs-it")
  ) {
    return "BSIT";
  }

  if (
    lower.includes("accountancy") || lower.includes("accounting") ||
    lower.includes("bsa") || lower.includes("bs-a") || lower.includes("financial management")
  ) {
    return "BSA";
  }

  if (
    lower.includes("criminology") || lower.includes("bscrim") ||
    lower.includes("bs crim") || lower.includes("criminologist")
  ) {
    return "BSCrim";
  }

  if (
    lower.includes("business administration") || lower.includes("bsba") ||
    lower.includes("bs ba") || lower.includes("business admin") || lower.includes("entrepreneurship") ||
    lower.includes("marketing management") || lower.includes("human resource")
  ) {
    return "BSBA";
  }

  if (
    lower.includes("secondary education") || lower.includes("bsed") ||
    lower.includes("sec ed") || lower.includes("education") || lower.includes("b.s.ed")
  ) {
    return "BSEd";
  }

  // Exact acronym match
  const cleanCode = str.toUpperCase().trim();
  if (cleanCode === "BSIT" || cleanCode === "IT") return "BSIT";
  if (cleanCode === "BSA") return "BSA";
  if (cleanCode === "BSCRIM") return "BSCrim";
  if (cleanCode === "BSBA") return "BSBA";
  if (cleanCode === "BSED" || cleanCode === "EDUC") return "BSEd";

  return null;
};

export default function BatchGraduateFiles() {
  const [fileList, setFileList] = useState<BatchGraduateFile[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [filterYear, setFilterYear] = useState<string>("All");
  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const loadFiles = async () => {
    const list = await storageService.getBatchGraduateFiles();
    setFileList(list);
  };

  useEffect(() => {
    loadFiles();

    // Auto-poll Supabase every 5s to sync batch document uploads across all devices automatically
    const interval = setInterval(() => {
      loadFiles();
    }, 5000);

    const handleFocus = () => {
      loadFiles();
    };
    window.addEventListener("focus", handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  // Download official Excel / CSV template
  const handleDownloadTemplate = () => {
    const blob = new Blob([DEFAULT_CSV_CONTENT], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "PCC_Batch_Graduates_Template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Downloaded official Excel/CSV Batch Graduates Template!");
  };

  // Parse 2D array rows from SheetJS
  const parseAndSaveBatchRows = async (fileName: string, fileSizeStr: string, rawRows: any[]) => {
    if (!rawRows || rawRows.length <= 1) {
      toast.error("The uploaded document is empty or missing data rows.");
      return;
    }

    const courseCounts: Record<string, number> = {};
    let totalCount = 0;
    const parsedGraduates: Partial<Alumni>[] = [];

    // Find header row index
    let headerIdx = 0;
    for (let i = 0; i < Math.min(rawRows.length, 5); i++) {
      const rowStr = Array.isArray(rawRows[i]) ? rawRows[i].join(" ").toLowerCase() : "";
      if (rowStr.includes("course") || rowStr.includes("name") || rowStr.includes("id")) {
        headerIdx = i;
        break;
      }
    }

    const headerRow = Array.isArray(rawRows[headerIdx]) ? rawRows[headerIdx] : [];
    
    // Find column indexes
    let idColIdx = -1;
    let nameColIdx = -1;
    let courseColIdx = -1;
    let yearColIdx = -1;

    headerRow.forEach((cellVal: any, idx: number) => {
      const valStr = String(cellVal || "").toLowerCase().trim();
      if (valStr.includes("id") || valStr.includes("student")) idColIdx = idx;
      else if (valStr.includes("name") || valStr.includes("full")) nameColIdx = idx;
      else if (valStr.includes("course") || valStr.includes("program") || valStr.includes("degree")) courseColIdx = idx;
      else if (valStr.includes("year") || valStr.includes("batch")) yearColIdx = idx;
    });

    // Process data rows
    for (let i = headerIdx + 1; i < rawRows.length; i++) {
      const row = Array.isArray(rawRows[i]) ? rawRows[i] : [];
      if (row.length === 0) continue;

      let foundCourse: string | null = null;
      if (courseColIdx !== -1 && row[courseColIdx] !== undefined) {
        foundCourse = identifyCourse(row[courseColIdx]);
      }

      if (!foundCourse) {
        for (const cell of row) {
          const candidate = identifyCourse(cell);
          if (candidate) {
            foundCourse = candidate;
            break;
          }
        }
      }

      const studentIdVal = idColIdx !== -1 && row[idColIdx] !== undefined ? String(row[idColIdx]).trim() : "";
      const nameVal = nameColIdx !== -1 && row[nameColIdx] !== undefined ? String(row[nameColIdx]).trim() : "";
      const yearVal = yearColIdx !== -1 && row[yearColIdx] !== undefined ? parseInt(String(row[yearColIdx]), 10) : Number(selectedYear);

      const hasData = studentIdVal || nameVal || foundCourse || row.some((cell: any) => String(cell || "").trim().length > 1);

      if (hasData) {
        const finalCourse = foundCourse || "BSIT";
        courseCounts[finalCourse] = (courseCounts[finalCourse] || 0) + 1;
        totalCount++;

        const cleanName = nameVal || `Graduate ${i}`;
        const cleanEmail = `${cleanName.toLowerCase().replace(/[^a-z0-9]/g, ".")}@pcc.edu.ph`;
        parsedGraduates.push({
          studentId: studentIdVal || `2026-${String(100 + i).padStart(4, "0")}`,
          name: cleanName,
          course: finalCourse,
          year: isNaN(yearVal) ? Number(selectedYear) : yearVal,
          email: cleanEmail,
          status: "Active",
          employmentStatus: "Employed",
        });
      }
    }

    if (totalCount === 0) {
      toast.error("Could not parse graduate rows from file. Please use the downloaded template.");
      return;
    }

    // 1. Add Batch Document Record to database & local storage
    await storageService.addBatchGraduateFile({
      fileName,
      batchYear: Number(selectedYear),
      uploadDate: new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
      uploadedBy: "PCC Admin",
      fileSize: fileSizeStr,
      totalGraduates: totalCount,
      courseCounts,
      description: description.trim() || `Official graduate roster file for Class of ${selectedYear}.`,
    });

    // 2. Import parsed graduates into Alumni Directory & Database!
    let importMsg = "";
    if (parsedGraduates.length > 0) {
      const importRes = await storageService.batchImportAlumni(parsedGraduates);
      importMsg = ` Registered ${importRes.totalProcessed} graduates to the Alumni Directory database.`;
    }

    toast.success(
      `Successfully processed ${fileName}! Recorded ${totalCount} graduates across ${Object.keys(courseCounts).length} courses.${importMsg}`
    );

    setDescription("");
    loadFiles();
  };

  // Upload file handler using SheetJS
  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    const sizeInKB = (file.size / 1024).toFixed(1);
    const sizeStr = file.size > 1048576 ? `${(file.size / 1048576).toFixed(1)} MB` : `${sizeInKB} KB`;

    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const buffer = e.target?.result;
        let workbook: XLSX.WorkBook;

        if (file.name.endsWith(".csv")) {
          const text = typeof buffer === "string" ? buffer : new TextDecoder().decode(buffer as ArrayBuffer);
          workbook = XLSX.read(text, { type: "string" });
        } else {
          workbook = XLSX.read(buffer, { type: "array" });
        }

        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawRows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        await parseAndSaveBatchRows(file.name, sizeStr, rawRows);
      } catch (err) {
        console.error("Excel parse error:", err);
        toast.error("Failed to parse file. Please upload a valid CSV or Excel spreadsheet.");
      } finally {
        setIsUploading(false);
      }
    };

    if (file.name.endsWith(".csv")) {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  };

  // Quick Demo Pre-filled Upload Button
  const handleQuickDemoUpload = async () => {
    setIsUploading(true);
    try {
      const workbook = XLSX.read(DEFAULT_CSV_CONTENT, { type: "string" });
      const firstSheet = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheet];
      const rawRows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      await parseAndSaveBatchRows(
        `Batch_${selectedYear}_Official_Roster_List.csv`,
        "42.5 KB",
        rawRows
      );
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  // Delete batch file
  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete stored file "${name}"?`)) {
      await storageService.deleteBatchGraduateFile(id);
      toast.success(`Deleted file "${name}". Dashboard metrics recalculated.`);
      loadFiles();
    }
  };

  // Filtered files
  const filteredFiles = fileList.filter(
    (f) => filterYear === "All" || String(f.batchYear) === filterYear
  );

  const totalGraduatesFromFiles = fileList.reduce((sum, f) => sum + f.totalGraduates, 0);

  return (
    <div className="space-y-6 font-[Inter,sans-serif] pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0d1f3c] via-[#18345d] to-[#2563eb] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-60 h-60 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-amber-300 text-xs font-semibold mb-3">
              <FolderArchive className="w-3.5 h-3.5" /> Institutional Document Vault
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Batch Graduate Document Files</h1>
            <p className="text-blue-100/80 text-xs sm:text-sm mt-1 max-w-2xl">
              Store official batch graduate spreadsheets per course to populate course total analytics and populate alumni directory records in your live Supabase database.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#FF8A3D] to-[#ff7a22] hover:from-[#ff7a22] hover:to-[#e66914] text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-md shadow-[#FF8A3D]/25 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" /> Download Excel Template
            </button>
          </div>
        </div>
      </div>

      {/* Safeguard Rule Banner */}
      <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 text-amber-900 shadow-2xs">
        <ShieldAlert className="w-5 h-5 text-[#FF8A3D] flex-shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="font-bold text-amber-950 text-sm">Live Supabase Database Synchronization</p>
          <p className="text-amber-900/90 leading-relaxed font-medium">
            Files uploaded here (.XLSX, .XLS, .CSV) are parsed to extract <strong>graduates count per course</strong> and automatically save document records and graduate entries directly into your <strong>Supabase live database</strong>.
          </p>
        </div>
      </div>

      {/* Main Grid: Template Spec & Upload Section */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Column: Template Instructions & Preview */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-stone-200 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 text-slate-900 font-bold text-base mb-1">
              <FileSpreadsheet className="w-5 h-5 text-[#2563eb]" /> Standard Excel File Format
            </div>
            <p className="text-xs text-slate-500">Download our pre-formatted spreadsheet template, fill in your graduate names per course, and upload.</p>

            {/* Steps List */}
            <div className="mt-4 space-y-3">
              {[
                { step: "1", text: "Download the official CSV/Excel template using the button above." },
                { step: "2", text: "Enter Student ID, Full Name, Course, and Batch Year for each graduate." },
                { step: "3", text: "Upload the completed file to update dashboard course metrics." },
              ].map((s) => (
                <div key={s.step} className="flex items-start gap-3 text-xs text-slate-700">
                  <span className="w-6 h-6 rounded-full bg-blue-50 border border-blue-200 text-[#2563eb] font-bold flex items-center justify-center text-xs flex-shrink-0">
                    {s.step}
                  </span>
                  <span className="font-medium pt-0.5">{s.text}</span>
                </div>
              ))}
            </div>

            {/* Template Format Preview Table */}
            <div className="mt-5 border border-stone-200 rounded-2xl overflow-hidden bg-stone-50/50">
              <div className="bg-stone-100/80 px-3.5 py-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-stone-200 flex items-center justify-between">
                <span>Excel Column Structure</span>
                <span className="text-[#2563eb] font-mono">.csv / .xlsx</span>
              </div>
              <div className="p-3 overflow-x-auto">
                <table className="w-full text-[11px] text-left font-mono">
                  <thead>
                    <tr className="text-slate-400 border-b border-stone-200">
                      <th className="pb-1 pr-2 font-semibold">Student ID</th>
                      <th className="pb-1 pr-2 font-semibold">Full Name</th>
                      <th className="pb-1 pr-2 font-semibold">Course</th>
                      <th className="pb-1 font-semibold">Batch</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-600 divide-y divide-stone-100">
                    <tr>
                      <td className="py-1 pr-2 text-slate-900 font-bold">2026-0101</td>
                      <td className="py-1 pr-2">Juan Dela Cruz</td>
                      <td className="py-1 pr-2 text-[#2563eb]">BSIT</td>
                      <td className="py-1">2026</td>
                    </tr>
                    <tr>
                      <td className="py-1 pr-2 text-slate-900 font-bold">2026-0102</td>
                      <td className="py-1 pr-2">Maria Santos</td>
                      <td className="py-1 pr-2 text-emerald-600">BSA</td>
                      <td className="py-1">2026</td>
                    </tr>
                    <tr>
                      <td className="py-1 pr-2 text-slate-900 font-bold">2026-0103</td>
                      <td className="py-1 pr-2">Pedro Penduko</td>
                      <td className="py-1 pr-2 text-purple-600">BSCrim</td>
                      <td className="py-1">2026</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="w-full inline-flex items-center justify-center gap-2 bg-stone-100 hover:bg-stone-200 text-slate-800 font-bold py-2.5 px-4 rounded-xl text-xs border border-stone-200 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#FF8A3D]" /> Download Template File (.CSV)
          </button>
        </div>

        {/* Right Column: Upload Document Zone */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-stone-200 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Upload Batch Graduate Document</h3>
            <p className="text-xs text-slate-500">Select batch year, drop your filled spreadsheet, and process course totals.</p>

            <div className="mt-4 grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Graduation Batch Year</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="w-full border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs bg-stone-50 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-[#FF8A3D]/30"
                >
                  {[2026, 2025, 2024, 2023, 2022, 2021, 2020].map((y) => (
                    <option key={y} value={y}>Class Batch of {y}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Optional Notes / Remarks</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Official signed roster for Batch 2026"
                  className="w-full border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs bg-stone-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF8A3D]/30"
                />
              </div>
            </div>

            {/* Drag and Drop File Zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragActive(false);
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handleFileUpload(e.dataTransfer.files[0]);
                }
              }}
              className={`mt-4 border-2 border-dashed rounded-2xl p-8 text-center transition-all flex flex-col items-center justify-center ${
                dragActive ? "border-[#FF8A3D] bg-amber-50/50" : "border-stone-200 bg-stone-50/50 hover:bg-stone-100/50"
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#FF8A3D] border border-amber-200 flex items-center justify-center mb-3 shadow-2xs">
                <Upload className="w-6 h-6" />
              </div>
              <p className="font-bold text-slate-800 text-xs">
                Drag and drop your filled Excel / CSV document here
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">Supports .CSV, .XLSX, .XLS files up to 25MB</p>

              <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                <label className="inline-flex items-center gap-2 bg-[#18345d] hover:bg-[#0d1f3c] text-white font-bold px-4 py-2 rounded-xl text-xs cursor-pointer shadow-2xs transition-colors">
                  <FileText className="w-3.5 h-3.5" /> Browse Computer File
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileUpload(e.target.files[0]);
                      }
                    }}
                  />
                </label>

                <button
                  type="button"
                  onClick={handleQuickDemoUpload}
                  disabled={isUploading}
                  className="inline-flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-[#FF8A3D] border border-amber-200 font-bold px-3.5 py-2 rounded-xl text-xs transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Test Demo Roster File
                </button>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Official Institutional Records</span>
            <span>SheetJS Row Scanner Active</span>
          </div>
        </div>
      </div>

      {/* Stored Batch Files Roster Registry */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-base">Stored Batch Documents Registry</h3>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-[#2563eb] border border-blue-200">
                {fileList.length} Files ({totalGraduatesFromFiles} Total Recorded Graduates)
              </span>
            </div>
            <p className="text-xs text-slate-500">Manage uploaded batch graduate files and inspect course count breakdowns</p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-stone-200 text-xs bg-stone-50 text-slate-700 font-bold focus:outline-none"
            >
              <option value="All">All Batch Years</option>
              <option value="2026">Batch 2026</option>
              <option value="2025">Batch 2025</option>
              <option value="2024">Batch 2024</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-stone-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-stone-200">
                <th className="px-6 py-3.5">Document File</th>
                <th className="px-6 py-3.5">Batch Year</th>
                <th className="px-6 py-3.5">Total Graduates</th>
                <th className="px-6 py-3.5">Course Count Breakdown</th>
                <th className="px-6 py-3.5">Uploaded Date</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-medium text-slate-700">
              {filteredFiles.map((file) => (
                <tr key={file.id} className="hover:bg-stone-50/80 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#2563eb] border border-blue-200 flex items-center justify-center font-bold flex-shrink-0">
                        <FileSpreadsheet className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-xs">{file.fileName}</p>
                        <p className="text-[11px] text-slate-400">{file.fileSize} · {file.description || "Official batch roster"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-amber-50 text-[#FF8A3D] font-bold text-xs border border-amber-200">
                      Batch {file.batchYear}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-900 text-sm">
                    {file.totalGraduates} <span className="text-xs font-normal text-slate-500">graduates</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1.5 max-w-md">
                      {Object.entries(file.courseCounts || {}).map(([course, count]) => (
                        <span
                          key={course}
                          className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-100 text-slate-800 border border-stone-200"
                        >
                          {course}: <strong>{count}</strong>
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-xs">{file.uploadDate}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={handleDownloadTemplate}
                        title="Download Original Spreadsheet"
                        className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-slate-700 transition-colors cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(file.id, file.fileName)}
                        title="Delete Document"
                        className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredFiles.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    <div className="w-12 h-12 rounded-2xl bg-stone-100 text-slate-400 flex items-center justify-center mx-auto mb-2">
                      <FolderArchive className="w-6 h-6" />
                    </div>
                    <p className="font-bold text-sm text-slate-700">No stored batch documents found</p>
                    <p className="text-xs text-slate-400 mt-0.5">Upload a batch graduate CSV or Excel document above to compute course totals.</p>
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
