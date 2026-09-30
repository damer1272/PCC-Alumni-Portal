import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Building2, MapPin, Calendar, Trash2, Eye, Lock, DollarSign, Edit2, Save, X } from "lucide-react";
import { STATUSES, EmploymentRecord } from "../data";
import { storageService } from "../storage";
import { toast } from "sonner";

export default function CareerTracking() {
  const [history, setHistory] = useState<EmploymentRecord[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<EmploymentRecord | null>(null);

  const [form, setForm] = useState({
    status: STATUSES[0],
    company: "",
    position: "",
    location: "",
    date: new Date().toISOString().split("T")[0],
    salary: "₱30,000 – ₱50,000",
    showSalaryPublicly: true,
  });

  const loadHistory = async () => {
    const records = await storageService.getEmploymentHistory();
    setHistory(records);
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const resetForm = () => {
    setEditingRecord(null);
    setForm({
      status: STATUSES[0],
      company: "",
      position: "",
      location: "",
      date: new Date().toISOString().split("T")[0],
      salary: "₱30,000 – ₱50,000",
      showSalaryPublicly: true,
    });
  };

  const openCreate = () => {
    resetForm();
    setShowForm(true);
  };

  const openEdit = (emp: EmploymentRecord) => {
    setEditingRecord(emp);
    setForm({
      status: emp.status || STATUSES[0],
      company: emp.company || "",
      position: emp.position || "",
      location: emp.location || "",
      date: emp.date || new Date().toISOString().split("T")[0],
      salary: emp.salary || "₱30,000 – ₱50,000",
      showSalaryPublicly: emp.showSalaryPublicly ?? true,
    });
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.company || !form.position) {
      toast.error("Please enter both Company and Position!");
      return;
    }

    if (editingRecord) {
      await storageService.updateEmploymentRecord(editingRecord.id, form);
      toast.success("Career entry updated successfully!");
    } else {
      await storageService.addEmploymentRecord(form);
      toast.success("New role added to your career timeline!");
    }

    resetForm();
    setShowForm(false);
    loadHistory();
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to remove this role from your timeline?")) {
      await storageService.deleteEmploymentRecord(id);
      toast.success("Role removed.");
      loadHistory();
    }
  };

  return (
    <div className="max-w-3xl space-y-10 font-[Inter,sans-serif]">
      {/* Page Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-[#2d5a9e] font-semibold mb-2">Career Tracking</p>
          <h1 className="font-[Cormorant_Garamond,serif] text-4xl md:text-5xl font-semibold text-[#0d2850] leading-tight">
            Your Professional Path
          </h1>
          <p className="mt-2 text-sm text-[#1a3a6b]/65 max-w-md">
            Maintain your living career timeline. Update your positions, employers, and employment details anytime.
          </p>
        </div>
        <button
          type="button"
          onClick={showForm ? () => setShowForm(false) : openCreate}
          className="inline-flex items-center gap-2 bg-[#1a3a6b] text-[#F5F0E8] text-sm font-semibold px-5 py-3 rounded-xl hover:bg-[#0d2850] transition-colors shadow-sm cursor-pointer"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? "Close Form" : "Add New Role"}
        </button>
      </div>

      {/* CREATE / EDIT FORM */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-2xl border border-[#1a3a6b]/15 bg-white/90 backdrop-blur-sm p-6 mb-2 shadow-[0_8px_30px_rgba(26,58,107,0.08)]">
              <div className="flex items-center justify-between border-b border-stone-200 pb-3 mb-5">
                <h2 className="font-[Cormorant_Garamond,serif] text-2xl font-bold text-[#0d2850]">
                  {editingRecord ? "Edit Employment Entry" : "Add Employment Details"}
                </h2>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#FF8A3D]/10 text-[#FF8A3D] border border-[#FF8A3D]/20">
                  {editingRecord ? "Editing Mode" : "New Record"}
                </span>
              </div>

              <form className="space-y-4" onSubmit={handleSave}>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#2d5a9e] mb-1.5">
                    Employment Status
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full border border-[#1a3a6b]/15 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/25 bg-[#e6edf5]/60 text-slate-900"
                  >
                    {STATUSES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#2d5a9e] mb-1.5">Company / Employer</label>
                    <input
                      required
                      value={form.company}
                      onChange={(e) => setForm({ ...form, company: e.target.value })}
                      placeholder="e.g. Accenture Philippines"
                      className="w-full border border-[#1a3a6b]/15 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/25 bg-[#e6edf5]/60 text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#2d5a9e] mb-1.5">Position / Job Title</label>
                    <input
                      required
                      value={form.position}
                      onChange={(e) => setForm({ ...form, position: e.target.value })}
                      placeholder="e.g. Software Engineer"
                      className="w-full border border-[#1a3a6b]/15 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/25 bg-[#e6edf5]/60 text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#2d5a9e] mb-1.5">Location</label>
                    <input
                      value={form.location}
                      onChange={(e) => setForm({ ...form, location: e.target.value })}
                      placeholder="e.g. BGC, Taguig City"
                      className="w-full border border-[#1a3a6b]/15 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/25 bg-[#e6edf5]/60 text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#2d5a9e] mb-1.5">Start Date</label>
                    <input
                      type="date"
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                      className="w-full border border-[#1a3a6b]/15 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/25 bg-[#e6edf5]/60 text-slate-900"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#2d5a9e] mb-1.5">
                      Salary Range
                    </label>
                    <select
                      value={form.salary}
                      onChange={(e) => setForm({ ...form, salary: e.target.value })}
                      className="w-full border border-[#1a3a6b]/15 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/25 bg-[#e6edf5]/60 text-slate-900"
                    >
                      {[
                        "Below ₱15,000",
                        "₱15,000 – ₱30,000",
                        "₱30,000 – ₱50,000",
                        "₱50,000 – ₱80,000",
                        "₱80,000 – ₱100,000",
                        "Above ₱100,000",
                      ].map((r) => (
                        <option key={r}>{r}</option>
                      ))}
                    </select>

                    {/* Salary Privacy Option Checkbox */}
                    <div className="mt-3.5 p-3 rounded-xl bg-[#e6edf5]/50 border border-[#1a3a6b]/10">
                      <label className="flex items-center gap-2.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          id="showSalaryPublicly"
                          checked={form.showSalaryPublicly}
                          onChange={(e) => setForm({ ...form, showSalaryPublicly: e.target.checked })}
                          className="w-4 h-4 rounded border-slate-300 accent-[#FF8A3D] cursor-pointer"
                        />
                        <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                          {form.showSalaryPublicly ? (
                            <Eye className="w-3.5 h-3.5 text-[#2563eb]" />
                          ) : (
                            <Lock className="w-3.5 h-3.5 text-amber-600" />
                          )}
                          Show salary range publicly on your profile timeline
                        </span>
                      </label>
                      <p className="text-[11px] text-slate-500 mt-1 pl-6">
                        {form.showSalaryPublicly
                          ? "Public: Visible to fellow alumni and employers visiting your profile."
                          : "Private: Hidden from other users and visible only to you."}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-3 border-t border-stone-100">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 bg-[#1a3a6b] text-[#F5F0E8] font-bold px-6 py-3 rounded-xl hover:bg-[#0d2850] transition-colors text-xs cursor-pointer shadow-sm"
                  >
                    <Save className="w-4 h-4" /> {editingRecord ? "Update Role" : "Save Employment Role"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      resetForm();
                      setShowForm(false);
                    }}
                    className="px-6 py-3 rounded-xl border border-stone-300 text-slate-700 text-xs font-semibold hover:bg-stone-100 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* EMPLOYMENT TIMELINE LIST */}
      <section>
        <h2 className="text-[11px] uppercase tracking-[0.2em] text-[#2d5a9e] font-bold mb-5">
          Employment Timeline
        </h2>
        <div className="relative space-y-0 pl-2">
          <div className="absolute left-[19px] top-3 bottom-3 w-px bg-[#1a3a6b]/15" />
          {history.map((emp) => (
            <article key={emp.id} className="relative flex gap-5 pb-8 last:pb-0">
              <div className="relative z-10 w-10 h-10 rounded-full bg-[#1a3a6b] border-4 border-[#e6edf5] flex-shrink-0 flex items-center justify-center shadow-2xs">
                <Building2 className="w-3.5 h-3.5 text-[#F5F0E8]" />
              </div>
              <div className="flex-1 rounded-2xl border border-[#1a3a6b]/10 bg-white/90 backdrop-blur-sm p-5 shadow-2xs">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-[Cormorant_Garamond,serif] text-xl font-bold text-[#0d2850]">
                      {emp.position}
                    </p>
                    <p className="text-xs font-semibold text-[#1a3a6b]/80 mt-0.5">{emp.company}</p>
                  </div>

                  {/* ACTION BUTTONS: EDIT & DELETE */}
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-[11px] px-2.5 py-1 rounded-lg font-bold border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {emp.status}
                    </span>

                    {/* EDIT ICON BUTTON */}
                    <button
                      type="button"
                      onClick={() => openEdit(emp)}
                      className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 flex items-center justify-center transition-colors cursor-pointer"
                      title="Edit Role Details"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    {/* DELETE ICON BUTTON */}
                    <button
                      type="button"
                      onClick={() => handleDelete(emp.id)}
                      className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 flex items-center justify-center transition-colors cursor-pointer"
                      title="Delete Role"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 mt-3.5 text-xs text-[#1a3a6b]/80 font-medium">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#2d5a9e]" /> {emp.location || "Location not set"}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#2d5a9e]" /> {emp.date}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-[#2d5a9e]" />
                    <span className="font-bold text-slate-900">{emp.salary}</span>
                    {emp.showSalaryPublicly === false ? (
                      <span className="ml-1 inline-flex items-center gap-1 text-[10px] bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-full font-bold">
                        <Lock className="w-3 h-3 text-amber-700" /> Private (Only you)
                      </span>
                    ) : (
                      <span className="ml-1 inline-flex items-center gap-1 text-[10px] bg-blue-50 text-blue-900 border border-blue-200 px-2 py-0.5 rounded-full font-bold">
                        <Eye className="w-3 h-3 text-blue-700" /> Public
                      </span>
                    )}
                  </span>
                </div>
              </div>
            </article>
          ))}

          {history.length === 0 && (
            <div className="rounded-2xl border border-dashed border-[#1a3a6b]/20 bg-white/50 py-12 text-center ml-12">
              <p className="font-[Cormorant_Garamond,serif] text-2xl text-[#0d2850]">No roles added yet</p>
              <p className="text-xs text-[#1a3a6b]/50 mt-1">Add your employment entry to start building your career timeline.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
