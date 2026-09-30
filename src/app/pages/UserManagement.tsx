import { useState, useEffect } from "react";
import { Search, CheckCircle2, XCircle, Trash2, Key, UserPlus, X, Save } from "lucide-react";
import { storageService, UserItem } from "../storage";
import { toast } from "sonner";

export default function UserManagement() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", role: "Alumni" as "Alumni" | "Admin", status: "Active" as "Active" | "Inactive" | "Pending" });

  const loadUsers = async () => {
    const list = await storageService.getUsers();
    setUsers(list);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email) {
      toast.error("Please provide both name and email!");
      return;
    }
    const avatarInitials = form.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "AL";

    await storageService.addUser(form);

    // Synchronize to Alumni directory as well
    await storageService.addAlumni({
      name: form.name,
      email: form.email,
      studentId: `2024-${Math.floor(10000 + Math.random() * 90000)}`,
      course: "BS Computer Science",
      year: 2024,
      status: "Employed",
      avatar: avatarInitials,
      company: "",
      position: "",
      location: "",
      saying: "",
    });

    toast.success(`User ${form.name} created and added to Alumni Directory!`);
    setShowModal(false);
    loadUsers();
  };

  async function toggleStatus(id: number, currentStatus: string) {
    const nextStatus = currentStatus === "Active" ? "Inactive" : "Active";
    await storageService.updateUser(id, { status: nextStatus });
    toast.success(`User status updated to ${nextStatus}.`);
    loadUsers();
  }

  async function handleDeleteUser(id: number, name: string) {
    if (confirm(`Are you sure you want to delete user ${name}?`)) {
      await storageService.deleteUser(id);
      toast.success(`Deleted ${name}.`);
      loadUsers();
    }
  }

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">User Management</h1>
        <button
          onClick={() => {
            setForm({ name: "", email: "", role: "Alumni", status: "Active" });
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-[#1a3a6b] text-white text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-[#0d2850] transition-colors shadow-sm cursor-pointer"
        >
          <UserPlus className="w-4 h-4" /> Add New User
        </button>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users..." className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/30 bg-gray-50" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Role</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#1a3a6b] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {u.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-800">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-xs">{u.email}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-1 rounded-lg font-medium ${u.role === "Admin" ? "bg-purple-50 text-purple-700" : "bg-blue-50 text-blue-700"}`}>{u.role}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-1 rounded-lg font-medium ${
                      u.status === "Active" ? "bg-green-50 text-green-700" :
                      u.status === "Inactive" ? "bg-red-50 text-red-700" :
                      "bg-yellow-50 text-yellow-700"
                    }`}>{u.status}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => toggleStatus(u.id, u.status)} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${u.status === "Active" ? "bg-red-50 text-red-500 hover:bg-red-100" : "bg-green-50 text-green-600 hover:bg-green-100"}`} title={u.status === "Active" ? "Deactivate" : "Activate"}>
                        {u.status === "Active" ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                      </button>
                      <button onClick={() => toast.info(`Password reset link generated for ${u.email}`)} className="w-8 h-8 rounded-lg bg-yellow-50 text-yellow-600 flex items-center justify-center hover:bg-yellow-100 cursor-pointer" title="Reset Password">
                        <Key className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDeleteUser(u.id, u.name)} className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 cursor-pointer" title="Delete">
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

      {/* Add User Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <form onSubmit={handleAddUser} className="relative bg-white rounded-3xl shadow-2xl p-6 w-full max-w-md z-10 border border-gray-100 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="font-semibold text-gray-900">Add New System User</h2>
              <button type="button" onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/30" placeholder="e.g. Alex Morgan" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
                <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/30" placeholder="user@domain.com" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">System Role</label>
                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as "Alumni" | "Admin" })} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/30">
                  <option value="Alumni">Alumni</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Initial Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as "Active" | "Inactive" | "Pending" })} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/30">
                  <option value="Active">Active</option>
                  <option value="Pending">Pending Approval</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 pt-3 justify-end border-t border-gray-100">
              <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-50 cursor-pointer">Cancel</button>
              <button type="submit" className="flex items-center gap-2 bg-[#1a3a6b] text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-[#0d2850] transition-colors text-xs cursor-pointer shadow-sm">
                <Save className="w-4 h-4" /> Save User
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

