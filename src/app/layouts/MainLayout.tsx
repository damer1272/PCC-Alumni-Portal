import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  GraduationCap, LayoutDashboard, User, Briefcase, Users, Megaphone,
  UserCog, BarChart2, Menu, Bell, ChevronDown, UserPlus, Check,
  LogOut, Shield, Home, X, Search, Sparkles, FolderArchive, Heart
} from "lucide-react";
import { storageService, ProfileData, NotificationItem } from "../storage";
import { Alumni } from "../data";
import { toast } from "sonner";

type Role = "alumni" | "admin";

interface SidebarSection {
  label: string;
  items: { to: string; icon: React.ElementType; label: string }[];
}

const alumniNav = [
  { to: "/alumni/dashboard", icon: Home, label: "Home", short: "Home" },
  { to: "/alumni/career", icon: Briefcase, label: "Career", short: "Career" },
  { to: "/alumni/announcements", icon: Megaphone, label: "News", short: "News" },
  { to: "/alumni/profile", icon: User, label: "Profile", short: "You" },
];

const adminNav: SidebarSection[] = [
  {
    label: "Admin",
    items: [
      { to: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
      { to: "/admin/alumni", icon: Users, label: "Manage Alumni" },
      { to: "/admin/announcements", icon: Megaphone, label: "Announcements" },
      { to: "/admin/reports", icon: BarChart2, label: "Reports" },
      { to: "/admin/users", icon: UserCog, label: "User Management" },
    ],
  },
];

interface Props {
  role?: Role;
}

function NetworkBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute -top-32 -right-24 w-[520px] h-[520px] rounded-full bg-[#2d5a9e]/18 blur-3xl" />
      <div className="absolute top-1/3 -left-40 w-[420px] h-[420px] rounded-full bg-[#1a3a6b]/12 blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-[360px] h-[280px] rounded-full bg-[#0d2850]/10 blur-3xl" />
      <svg className="absolute inset-0 w-full h-full opacity-[0.14]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="net" width="72" height="72" patternUnits="userSpaceOnUse">
            <circle cx="6" cy="6" r="1.25" fill="#1a3a6b" />
            <circle cx="42" cy="38" r="1" fill="#2d5a9e" />
            <path d="M6 6L42 38" stroke="#1a3a6b" strokeWidth="0.4" />
            <path d="M42 38L70 12" stroke="#2d5a9e" strokeWidth="0.35" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#net)" />
      </svg>
    </div>
  );
}

{/* Facebook-style Header Search Bar */}
function FacebookHeaderSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [alumniList, setAlumniList] = useState<Alumni[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    storageService.getAlumni().then(setAlumniList);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const results = alumniList.filter((a) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      a.name.toLowerCase().includes(q) ||
      a.course.toLowerCase().includes(q) ||
      (a.company && a.company.toLowerCase().includes(q)) ||
      (a.position && a.position.toLowerCase().includes(q)) ||
      (a.studentId && a.studentId.toLowerCase().includes(q))
    );
  }).slice(0, 6);

  const handleSelectAlumni = (id: number) => {
    setIsOpen(false);
    setSearchQuery("");
    navigate(`/alumni/directory/${id}`);
  };

  return (
    <div ref={searchRef} className="relative flex-1 max-w-xs sm:max-w-sm md:max-w-md ml-2 sm:ml-4">
      <div className="relative flex items-center">
        <Search className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsOpen(true);
          }}
          placeholder="Search alumni..."
          className="w-full pl-9 pr-8 py-2 rounded-full bg-stone-100 border border-transparent focus:border-stone-300 focus:bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF8A3D]/30 transition-all font-medium"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="absolute right-2.5 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Facebook-style Live Search Dropdown Popup */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-stone-200 shadow-xl overflow-hidden z-50 font-[Inter,sans-serif]"
          >
            <div className="p-3 border-b border-stone-100 flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <span>{searchQuery ? "Search Results" : "Suggested Alumni"}</span>
              <span className="text-slate-400">{results.length} found</span>
            </div>

            <div className="max-h-72 overflow-y-auto divide-y divide-stone-100">
              {results.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectAlumni(item.id)}
                  className="w-full p-2.5 flex items-center gap-3 text-left hover:bg-stone-50 transition-colors cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#18345d] to-[#2563eb] text-white flex items-center justify-center font-bold text-xs flex-shrink-0 overflow-hidden shadow-xs">
                    {item.avatar && (item.avatar.startsWith("data:") || item.avatar.startsWith("http")) ? (
                      <img src={item.avatar} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      item.name.slice(0, 2).toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 truncate">{item.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {item.position ? `${item.position} · ${item.company || "PCC"}` : item.course}
                    </p>
                  </div>
                  <span className="text-[10px] font-semibold text-[#FF8A3D] bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full flex-shrink-0">
                    {item.year}
                  </span>
                </button>
              ))}

              {results.length === 0 && (
                <div className="p-6 text-center text-xs text-slate-500">
                  <p className="font-semibold">No matching alumni found</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Try searching for another name or program</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AlumniShell() {
  const [profileDropdown, setProfileDropdown] = useState(false);
  const [notifDropdown, setNotifDropdown] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 });
  const [notifMenuPos, setNotifMenuPos] = useState({ top: 0, right: 0 });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<ProfileData | null>(null);

  const profileBtnRef = useRef<HTMLButtonElement>(null);
  const notifBtnRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const loadNotifications = async () => {
    const notifs = await storageService.getNotifications();
    const user = await storageService.getProfile();
    const filtered = notifs.filter((n) => {
      const isAllowedType = n.type === "endorsement" || n.type === "connection_request" || n.type === "connection_accepted";
      if (!isAllowedType) return false;
      if (n.recipientEmail && user?.email) {
        return n.recipientEmail.toLowerCase() === user.email.toLowerCase();
      }
      return true;
    });
    setNotifications(filtered);
  };

  useEffect(() => {
    const loadUser = async () => {
      const u = await storageService.getProfile();
      if (u) setCurrentUser(u);
    };
    loadUser();
    loadNotifications();
    const interval = setInterval(loadNotifications, 5000);
    return () => clearInterval(interval);
  }, [location.pathname]);

  const userInitials = currentUser?.name
    ? currentUser.name
        .split(" ")
        .filter(Boolean)
        .map((n) => n[0])
        .join("")
    : "PCC";

  const isImageAvatar = currentUser?.avatar && (currentUser.avatar.startsWith("data:") || currentUser.avatar.startsWith("http"));
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleLogout = () => {
    setProfileDropdown(false);
    navigate("/");
  };

  const handleAcceptConnection = async (id: string, senderName: string) => {
    await storageService.respondToConnectionRequest(id, "accept");
    toast.success(`You are now connected with ${senderName}!`);
    loadNotifications();
  };

  const handleDeclineConnection = async (id: string) => {
    await storageService.respondToConnectionRequest(id, "decline");
    toast.info("Connection request declined");
    loadNotifications();
  };

  const handleMarkAllRead = async () => {
    await storageService.markAllNotificationsRead();
    toast.success("All notifications marked as read");
    loadNotifications();
  };

  useEffect(() => {
    if (!profileDropdown || !profileBtnRef.current) return;

    const updatePosition = () => {
      if (!profileBtnRef.current) return;
      const rect = profileBtnRef.current.getBoundingClientRect();
      setMenuPos({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    const onPointerDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (profileBtnRef.current?.contains(target)) return;
      if (document.getElementById("alumni-profile-menu")?.contains(target)) return;
      setProfileDropdown(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
      document.removeEventListener("mousedown", onPointerDown);
    };
  }, [profileDropdown]);

  useEffect(() => {
    if (!notifDropdown || !notifBtnRef.current) return;

    const updatePosition = () => {
      if (!notifBtnRef.current) return;
      const rect = notifBtnRef.current.getBoundingClientRect();
      setNotifMenuPos({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    const onPointerDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (notifBtnRef.current?.contains(target)) return;
      if (document.getElementById("alumni-notif-menu")?.contains(target)) return;
      setNotifDropdown(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
      document.removeEventListener("mousedown", onPointerDown);
    };
  }, [notifDropdown]);

  return (
    <div className="relative min-h-screen overflow-hidden font-[Outfit,sans-serif] bg-[#FAF6F0]">
      <NetworkBackdrop />

      {/* FULL WIDTH FIXED TOP NAVIGATION HEADER WITH FACEBOOK SEARCH */}
      <header className="fixed top-0 inset-x-0 z-50 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-sm">
        {/* Accent strip — full width, single bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#1a3a6b] via-[#FF8A3D] to-[#F5C518]" />

        {/* Header container */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <button
              type="button"
              className="md:hidden text-[#1a3a6b]"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <NavLink to="/alumni/dashboard" className="flex items-center gap-2 min-w-0 flex-shrink-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF8A3D] to-[#F5C518] flex items-center justify-center flex-shrink-0 shadow-md shadow-[#FF8A3D]/25">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div className="leading-tight truncate hidden sm:block">
                <p className="font-[Cormorant_Garamond,serif] text-xl font-bold text-slate-900 tracking-tight">
                  PCC Alumni Portal
                </p>
                <p className="text-[10px] uppercase tracking-[0.18em] text-[#2563eb] font-bold">
                  Pagadian Capitol College, Inc.
                </p>
              </div>
            </NavLink>

            {/* Facebook-style Search Bar directly in Header */}
            <FacebookHeaderSearch />
          </div>

          <nav className="hidden md:flex items-center gap-2">
            {alumniNav.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-[#FF8A3D] to-[#ff7a22] text-white shadow-md shadow-[#FF8A3D]/25"
                      : "text-slate-700 hover:text-slate-900 hover:bg-stone-100"
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {/* NOTIFICATION BAR DROPDOWN */}
            <div className="relative">
              <button
                ref={notifBtnRef}
                type="button"
                onClick={() => setNotifDropdown((open) => !open)}
                className="relative w-9 h-9 rounded-xl bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-[#FF8A3D] text-white text-[10px] font-bold flex items-center justify-center border-2 border-white shadow-2xs">
                    {unreadCount}
                  </span>
                )}
              </button>

              {typeof document !== "undefined" &&
                createPortal(
                  <AnimatePresence>
                    {notifDropdown && (
                      <motion.div
                        id="alumni-notif-menu"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                        style={{ top: notifMenuPos.top, right: notifMenuPos.right }}
                        className="fixed w-80 sm:w-96 bg-white border border-stone-200 rounded-2xl shadow-xl overflow-hidden z-[150] font-[Inter,sans-serif]"
                      >
                        {/* NOTIFICATION HEADER */}
                        <div className="p-3.5 border-b border-stone-100 flex items-center justify-between bg-stone-50/80">
                          <div className="flex items-center gap-2">
                            <Bell className="w-4 h-4 text-[#FF8A3D]" />
                            <h3 className="text-xs font-bold text-slate-900">Notifications</h3>
                            {unreadCount > 0 && (
                              <span className="text-[10px] font-bold bg-[#FF8A3D]/10 text-[#FF8A3D] px-2 py-0.5 rounded-full">
                                {unreadCount} new
                              </span>
                            )}
                          </div>
                          {notifications.length > 0 && unreadCount > 0 && (
                            <button
                              type="button"
                              onClick={handleMarkAllRead}
                              className="text-[11px] font-semibold text-[#2563eb] hover:underline cursor-pointer"
                            >
                              Mark all read
                            </button>
                          )}
                        </div>

                        {/* NOTIFICATION LIST */}
                        <div className="max-h-80 overflow-y-auto divide-y divide-stone-100">
                          {notifications.length > 0 ? (
                            notifications.map((item) => (
                              <div
                                key={item.id}
                                className={`p-3.5 flex items-start gap-3 transition-colors ${
                                  item.read ? "bg-white" : "bg-blue-50/30"
                                }`}
                              >
                                {/* Avatar + Notification Type Badge */}
                                <div className="relative flex-shrink-0">
                                  <div className="w-9 h-9 rounded-full bg-[#18345d] text-white flex items-center justify-center font-bold text-xs overflow-hidden shadow-2xs">
                                    {item.senderAvatar && (item.senderAvatar.startsWith("http") || item.senderAvatar.startsWith("data:")) ? (
                                      <img src={item.senderAvatar} alt={item.senderName} className="w-full h-full object-cover" />
                                    ) : (
                                      <span>{item.senderAvatar || "PCC"}</span>
                                    )}
                                  </div>
                                  <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-white flex items-center justify-center shadow-2xs border border-stone-100">
                                    {item.type === "endorsement" ? (
                                      <Heart className="w-2.5 h-2.5 text-rose-500 fill-rose-500" />
                                    ) : item.type === "connection_accepted" ? (
                                      <Check className="w-2.5 h-2.5 text-emerald-600" />
                                    ) : (
                                      <UserPlus className="w-2.5 h-2.5 text-[#2563eb]" />
                                    )}
                                  </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0 space-y-1">
                                  <p className="text-xs text-slate-800 leading-snug">
                                    <strong className="font-bold text-slate-900">{item.senderName}</strong>{" "}
                                    <span className="text-slate-600">{item.message}</span>
                                  </p>
                                  <p className="text-[10px] text-slate-400 font-medium">{item.time}</p>

                                  {/* Action Buttons for Pending Connection Requests */}
                                  {item.type === "connection_request" && item.status === "pending" && (
                                    <div className="flex items-center gap-2 pt-1.5">
                                      <button
                                        type="button"
                                        onClick={() => handleAcceptConnection(item.id, item.senderName)}
                                        className="px-3 py-1 bg-gradient-to-r from-[#FF8A3D] to-[#ff7a22] text-white text-xs font-bold rounded-lg shadow-2xs hover:from-[#ff7a22] hover:to-[#e66914] cursor-pointer"
                                      >
                                        Accept
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDeclineConnection(item.id)}
                                        className="px-3 py-1 bg-stone-100 hover:bg-stone-200 text-slate-700 text-xs font-bold rounded-lg border border-stone-200 cursor-pointer"
                                      >
                                        Decline
                                      </button>
                                    </div>
                                  )}

                                  {item.type === "connection_request" && item.status === "accepted" && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md mt-1">
                                      <Check className="w-3 h-3" /> Connected
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="p-6 text-center space-y-1.5">
                              <p className="text-xs font-bold text-slate-700">No notifications yet</p>
                              <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                                You&apos;ll be notified here when someone endorses your journey updates or sends a connection request.
                              </p>
                            </div>
                          )}
                        </div>

                        {/* FOOTER */}
                        <div className="p-2 border-t border-stone-100 bg-stone-50/60 text-center">
                          <p className="text-[10px] text-slate-400 font-medium">
                            Only journey endorsements &amp; connection requests are shown
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>,
                  document.body
                )}
            </div>

            <div className="relative">
              <button
                ref={profileBtnRef}
                type="button"
                onClick={() => {
                  setProfileDropdown((open) => !open);
                }}
                aria-expanded={profileDropdown}
                aria-haspopup="menu"
                className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-stone-100 transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#FF8A3D] to-[#F5C518] flex items-center justify-center text-white text-xs font-bold overflow-hidden shadow-sm">
                  {isImageAvatar ? (
                    <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                  ) : (
                    userInitials
                  )}
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 hidden sm:block" />
              </button>

              {typeof document !== "undefined" &&
                createPortal(
                  <AnimatePresence>
                    {profileDropdown && (
                      <motion.div
                        id="alumni-profile-menu"
                        role="menu"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                        style={{ top: menuPos.top, right: menuPos.right }}
                        className="fixed w-56 bg-white border border-stone-200 rounded-2xl shadow-xl py-2 z-[150] font-[Inter,sans-serif]"
                      >
                        <div className="px-4 py-3 border-b border-stone-100">
                          <p className="text-sm font-bold text-slate-900 truncate">{currentUser?.name || "Alumni User"}</p>
                          <p className="text-xs text-slate-500 truncate">{currentUser?.email || "user@example.com"}</p>
                        </div>
                        <NavLink
                          to="/alumni/profile"
                          role="menuitem"
                          onClick={() => setProfileDropdown(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-stone-100 font-medium"
                        >
                          <User className="w-4 h-4 text-[#FF8A3D]" /> My Profile
                        </NavLink>
                        <NavLink
                          to="/alumni/career"
                          role="menuitem"
                          onClick={() => setProfileDropdown(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-stone-100 font-medium"
                        >
                          <Briefcase className="w-4 h-4 text-[#2563eb]" /> Career Tracking
                        </NavLink>
                        <div className="border-t border-stone-100 mt-1 pt-1">
                          <button
                            type="button"
                            role="menuitem"
                            onClick={handleLogout}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full font-semibold cursor-pointer"
                          >
                            <LogOut className="w-4 h-4" /> Sign out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>,
                  document.body
                )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm md:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 240 }}
              className="w-72 h-full bg-white p-5 flex flex-col justify-between shadow-2xl font-[Inter,sans-serif]"
              onClick={(e) => e.stopPropagation()}
            >
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-stone-200">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#FF8A3D] flex items-center justify-center text-white">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <span className="font-[Cormorant_Garamond,serif] text-xl font-bold text-slate-900">
                      PCC Portal
                    </span>
                  </div>
                  <button type="button" onClick={() => setMobileOpen(false)} className="text-slate-400 p-1">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="py-4 border-b border-stone-200 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF8A3D] to-[#F5C518] flex items-center justify-center text-white font-bold text-sm overflow-hidden">
                    {isImageAvatar ? (
                      <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                    ) : (
                      userInitials
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 text-sm truncate">{currentUser?.name || "Alumni User"}</p>
                    <p className="text-xs text-slate-500 truncate">{currentUser?.email || "user@example.com"}</p>
                  </div>
                </div>

                <nav className="mt-4 space-y-1">
                  {alumniNav.map(({ to, icon: Icon, label }) => (
                    <NavLink
                      key={to}
                      to={to}
                      onClick={() => setMobileOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                          isActive
                            ? "bg-[#FF8A3D] text-white shadow-md shadow-[#FF8A3D]/25"
                            : "text-slate-700 hover:bg-stone-100"
                        }`
                      }
                    >
                      <Icon className="w-4.5 h-4.5" />
                      {label}
                    </NavLink>
                  ))}
                </nav>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors w-full cursor-pointer"
              >
                <LogOut className="w-4.5 h-4.5" />
                Sign out
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN CONTENT AREA */}
      <main className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-stone-200 py-2 px-3 z-30 flex items-center justify-around shadow-lg">
        {alumniNav.map(({ to, icon: Icon, short }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[10px] font-bold transition-all ${
                isActive ? "text-[#FF8A3D]" : "text-slate-400 hover:text-slate-600"
              }`
            }
          >
            <Icon className="w-5 h-5" />
            <span>{short}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

function AdminShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const adminNavItems = [
    { to: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/admin/alumni", icon: Users, label: "Manage Alumni" },
    { to: "/admin/batch-files", icon: FolderArchive, label: "Batch Files" },
    { to: "/admin/announcements", icon: Megaphone, label: "Announcements" },
    { to: "/admin/reports", icon: BarChart2, label: "Reports" },
    { to: "/admin/users", icon: UserCog, label: "User Management" },
  ];

  return (
    <div className="min-h-screen bg-stone-100 flex font-[Inter,sans-serif] text-slate-900">
      {/* DESKTOP SIDEBAR (240px wide) */}
      <aside className="hidden lg:flex w-64 bg-[#0d1f3c] text-slate-200 flex-col flex-shrink-0 border-r border-slate-800 shadow-xl">
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF8A3D] to-[#F5C518] flex items-center justify-center font-bold text-white shadow-md shadow-[#FF8A3D]/20">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-white text-sm tracking-wide">PCC Admin</h1>
            <p className="text-[10px] text-amber-400 font-bold uppercase tracking-widest">Control Center</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 px-3 pb-2">Main Navigation</p>
          {adminNavItems.map(({ to, icon: Icon, label }) => {
            const isActive = location.pathname === to || (to !== "/admin/dashboard" && location.pathname.startsWith(to));
            return (
              <NavLink
                key={to}
                to={to}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-[#FF8A3D] to-[#ff7a22] text-white shadow-md shadow-[#FF8A3D]/25"
                    : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                }`}
              >
                <Icon className="w-4.5 h-4.5" />
                <span>{label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" /> Sign Out Admin
          </button>
        </div>
      </aside>

      {/* RIGHT MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* TOPBAR */}
        <header className="bg-white border-b border-stone-200 px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between sticky top-0 z-40 shadow-2xs">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="lg:hidden text-slate-700 p-1"
              onClick={() => setMobileOpen(true)}
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:block">
              <h2 className="font-bold text-slate-900 text-sm">Pagadian Capitol College</h2>
              <p className="text-[11px] text-slate-500 font-medium">Administrator Workspace</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-[#FF8A3D] text-[11px] font-bold">
              <Shield className="w-3.5 h-3.5" /> Administrator Access
            </span>

            <button
              type="button"
              onClick={() => navigate("/")}
              className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Log Out
            </button>
          </div>
        </header>

        {/* MOBILE DRAWER */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs lg:hidden"
              onClick={() => setMobileOpen(false)}
            >
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 240 }}
                className="w-64 h-full bg-[#0d1f3c] text-white p-5 flex flex-col justify-between shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-[#FF8A3D] flex items-center justify-center text-white">
                        <Shield className="w-5 h-5" />
                      </div>
                      <span className="font-bold text-white text-base">PCC Admin</span>
                    </div>
                    <button type="button" onClick={() => setMobileOpen(false)} className="text-slate-400 p-1">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <nav className="mt-5 space-y-1.5">
                    {adminNavItems.map(({ to, icon: Icon, label }) => {
                      const isActive = location.pathname === to || (to !== "/admin/dashboard" && location.pathname.startsWith(to));
                      return (
                        <NavLink
                          key={to}
                          to={to}
                          onClick={() => setMobileOpen(false)}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                            isActive
                              ? "bg-[#FF8A3D] text-white shadow-md shadow-[#FF8A3D]/25"
                              : "text-slate-300 hover:bg-slate-800"
                          }`}
                        >
                          <Icon className="w-4.5 h-4.5" />
                          <span>{label}</span>
                        </NavLink>
                      );
                    })}
                  </nav>
                </div>

                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 transition-colors w-full cursor-pointer"
                >
                  <LogOut className="w-4.5 h-4.5" /> Sign Out Admin
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MAIN BODY AREA */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default function MainLayout({ role = "alumni" }: Props) {
  return role === "admin" ? <AdminShell /> : <AlumniShell />;
}
