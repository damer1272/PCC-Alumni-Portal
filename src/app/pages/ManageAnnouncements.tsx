import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, X, Save } from "lucide-react";
import { Announcement } from "../data";
import { storageService } from "../storage";
import { toast } from "sonner";

export default function ManageAnnouncements() {
  const [list, setList] = useState<Announcement[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [form, setForm] = useState({ title: "", content: "", category: "Event" });

  const loadAnnouncements = async () => {
    const data = await storageService.getAnnouncements();
    setList(data);
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  function openCreate() {
    setEditing(null);
    setForm({ title: "", content: "", category: "Event" });
    setShowModal(true);
  }

  function openEdit(a: Announcement) {
    setEditing(a);
    setForm({ title: a.title, content: a.content, category: a.category });
    setShowModal(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.content) {
      toast.error("Please fill in both title and content!");
      return;
    }

    if (editing) {
      await storageService.updateAnnouncement(editing.id, form);
      toast.success("Announcement updated successfully!");
    } else {
      await storageService.addAnnouncement({
        ...form,
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        createdBy: "Alumni Affairs",
      });
      toast.success("New announcement published!");
    }

    setShowModal(false);
    loadAnnouncements();
  }

  async function handleDelete(id: number, title: string) {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      await storageService.deleteAnnouncement(id);
      toast.success("Announcement deleted.");
      loadAnnouncements();
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Manage Announcements</h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-[#1a3a6b] text-white text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-[#0d2850] transition-colors shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" /> New Announcement
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Title</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Created By</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {list.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-800">{a.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-1 max-w-xs">{a.content}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-lg font-medium">{a.category}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-xs">{a.date}</td>
                  <td className="px-6 py-4 text-gray-500">{a.createdBy}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(a)}
                        className="w-8 h-8 rounded-lg bg-yellow-50 text-yellow-600 flex items-center justify-center hover:bg-yellow-100 cursor-pointer"
                        title="Edit Announcement"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(a.id, a.title)}
                        className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 cursor-pointer"
                        title="Delete Announcement"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <form onSubmit={handleSave} className="relative bg-white rounded-3xl shadow-2xl p-6 w-full max-w-md z-10 border border-gray-100">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-gray-900">{editing ? "Edit Announcement" : "New Announcement"}</h2>
              <button type="button" onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Title</label>
                <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/30 bg-gray-50" placeholder="Announcement title" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Category</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/30 bg-gray-50">
                  {["Event", "Job Fair", "Scholarship", "Award", "Meeting", "General"].map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Content</label>
                <textarea required value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={4} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/30 bg-gray-50 resize-none" placeholder="Announcement details..." />
              </div>
              <div className="flex gap-3 pt-2 justify-end">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-50 cursor-pointer">Cancel</button>
                <button type="submit" className="flex items-center gap-2 bg-[#1a3a6b] text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-[#0d2850] transition-colors text-xs cursor-pointer shadow-sm">
                  <Save className="w-4 h-4" /> Save Announcement
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

