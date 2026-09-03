import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { useAudit } from "../../context/AuditContext";
import { useTheme } from "../../context/ThemeContext";
import { User, Mail, Lock, Camera, Upload, Trash2, Save, Shield, Calendar, KeyRound, LogOut, Eye, EyeOff, Loader2 } from "lucide-react";

export function AdminAccount() {
  const { user, updateAvatar, updateProfile, changePassword, logout, isLoggingOut } = useAuth();
  const { show } = useToast();
  const { addLog } = useAudit();
  const { isDark } = useTheme();
  const [profile, setProfile] = useState({ name: user?.name || "", email: user?.email || "" });
  const [profilePass, setProfilePass] = useState("");
  const [profileMsg, setProfileMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar || null);
  const [avatarMsg, setAvatarMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [sec, setSec] = useState({ old: "", nw: "", confirm: "" });
  const [secMsg, setSecMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "security">("profile");

  useEffect(() => {
    if (user) {
      setProfile({ name: user.name, email: user.email });
      setAvatarPreview(user.avatar || null);
    }
  }, [user]);

  useEffect(() => {
    if (profileMsg) { const t = setTimeout(() => setProfileMsg(null), 3000); return () => clearTimeout(t); }
  }, [profileMsg]);
  useEffect(() => {
    if (avatarMsg) { const t = setTimeout(() => setAvatarMsg(null), 3000); return () => clearTimeout(t); }
  }, [avatarMsg]);
  useEffect(() => {
    if (secMsg) { const t = setTimeout(() => setSecMsg(null), 3000); return () => clearTimeout(t); }
  }, [secMsg]);

  if (!user) return null;

  const cardClass = isDark ? "bg-[#1a1a1a] border-white/10 text-white" : "bg-white border-dark/5 text-dark";
  const inputClass = isDark ? "bg-[#101010] border-white/10 text-white placeholder:text-white/40 focus:border-primary/40" : "bg-background border-dark/10 text-dark focus:border-primary/40";
  const mutedClass = isDark ? "text-white/60" : "text-muted";

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setAvatarMsg({ text: "Only image files allowed", ok: false }); return; }
    if (file.size > 5 * 1024 * 1024) { setAvatarMsg({ text: "Image too large (max 5MB)", ok: false }); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const data = reader.result as string;
      if (data.length > 5 * 1024 * 1024) { setAvatarMsg({ text: "Base64 too large (max 5MB)", ok: false }); return; }
      setAvatarPreview(data);
      setAvatarMsg(null);
    };
    reader.readAsDataURL(file);
  };

  const handleAvatarSave = async () => {
    if (!avatarPreview) { setAvatarMsg({ text: "Please select an image", ok: false }); return; }
    const r = await updateAvatar(avatarPreview);
    setAvatarMsg({ text: r.msg, ok: r.ok });
    show(r.msg, r.ok);
    if (r.ok) await addLog("update", "admin-avatar", user.id, "Updated admin avatar", user.name, user.email);
  };

  const handleAvatarRemove = async () => {
    const r = await updateAvatar(null);
    setAvatarPreview(null);
    setAvatarMsg({ text: r.msg, ok: r.ok });
    show(r.msg, r.ok);
    if (r.ok) await addLog("update", "admin-avatar", user.id, "Removed admin avatar", user.name, user.email);
  };

  const handleProfile = async () => {
    if (!profile.name.trim()) { setProfileMsg({ text: "Name required", ok: false }); return; }
    if (!profile.email.trim()) { setProfileMsg({ text: "Email required", ok: false }); return; }
    const r = await updateProfile(profile.name, profile.email, profilePass || undefined);
    setProfileMsg({ text: r.msg, ok: r.ok });
    show(r.msg, r.ok);
    if (r.ok) {
      await addLog("update", "admin-profile", user.id, `Updated profile ${profile.name} / ${profile.email}`, user.name, user.email);
      setProfilePass("");
    }
  };

  const handlePass = async () => {
    if (sec.nw !== sec.confirm) { setSecMsg({ text: "New passwords do not match", ok: false }); return; }
    const r = await changePassword(sec.old, sec.nw);
    setSecMsg({ text: r.msg, ok: r.ok });
    show(r.msg, r.ok);
    if (r.ok) {
      await addLog("update", "admin-security", user.id, "Changed admin password", user.name, user.email);
      setSec({ old: "", nw: "", confirm: "" });
    }
  };

  return (
    <div className="space-y-6 max-w-[900px]">
      <div>
        <h2 className={`font-poppins font-bold text-[20px] flex items-center gap-2 ${isDark ? "text-white" : "text-dark"}`}><Shield size={20} className="text-primary" /> Admin Account</h2>
        <p className={`font-poppins text-sm ${mutedClass}`}>Manage your photo, email and password • All lucide icons • Light/Dark aware</p>
      </div>

      {/* Top card */}
      <div className={`rounded-2xl border p-6 shadow-sm flex flex-col md:flex-row items-center gap-6 ${cardClass}`}>
        <div className={`relative w-24 h-24 rounded-full overflow-hidden border-2 shadow-md flex items-center justify-center font-poppins font-bold text-2xl shrink-0 ${isDark ? "border-white/20 bg-primary text-white" : "border-white bg-primary text-white"}`}>
          {avatarPreview || user.avatar ? <img src={avatarPreview || user.avatar} alt="" className="w-full h-full object-cover" /> : user.name[0].toUpperCase()}
          <span className={`absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center border-2 ${isDark ? "bg-white text-dark border-[#1a1a1a]" : "bg-dark text-white border-white"}`}><Camera size={14} /></span>
        </div>
        <div className="flex-1 min-w-0 text-center md:text-left">
          <p className={`font-poppins font-bold text-lg flex items-center justify-center md:justify-start gap-2 ${isDark ? "text-white" : "text-dark"}`}>{user.name} <span className={`px-2 py-1 rounded-full text-[10px] font-poppins font-bold ${user.role === "admin" ? "bg-primary text-white" : "bg-dark text-white"}`}>{user.role.toUpperCase()}</span> <span className={`px-2 py-1 rounded-full text-[10px] font-poppins ${isDark ? "bg-white/10 text-white/70" : "bg-background text-muted"}`}>{user.provider}</span></p>
          <p className={`font-poppins text-sm flex items-center justify-center md:justify-start gap-1.5 ${mutedClass}`}><Mail size={14} /> {user.email}</p>
          <p className={`font-poppins text-xs mt-1 flex items-center justify-center md:justify-start gap-1.5 ${mutedClass}`}><Calendar size={12} /> Joined {new Date(user.createdAt).toLocaleDateString()} • ID {user.id}</p>
          <div className="flex flex-wrap gap-2 mt-3 justify-center md:justify-start">
            <span className={`px-3 py-1 rounded-full text-xs font-poppins font-semibold border ${isDark ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-green-50 text-green-700 border-green-200"}`}>● Active</span>
            <span className={`px-3 py-1 rounded-full text-xs font-poppins font-semibold border ${isDark ? "bg-white/5 text-white/70 border-white/10" : "bg-background text-muted border-dark/5"}`}>{isDark ? "Dark Mode" : "Light Mode"} Admin</span>
          </div>
        </div>
        <button onClick={async () => { await logout(); }} disabled={isLoggingOut} className={`px-5 py-2.5 rounded-full font-poppins font-semibold text-sm flex items-center gap-2 border-2 disabled:opacity-60 ${isDark ? "bg-transparent border-white/20 text-white hover:bg-white/10" : "bg-white border-dark/10 text-dark hover:border-red-200 hover:text-red-600"}`}>
          {isLoggingOut ? <><Loader2 size={16} className="animate-spin" /> Logging out...</> : <><LogOut size={16} /> Logout</>}
        </button>
      </div>

      {/* Tabs */}
      <div className={`flex rounded-full p-1 w-fit ${isDark ? "bg-white/10" : "bg-background"}`}>
        <button onClick={() => setActiveTab("profile")} className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-poppins font-semibold text-sm transition-all ${activeTab === "profile" ? (isDark ? "bg-white text-dark shadow" : "bg-dark text-white shadow") : mutedClass}`}>
          <User size={16} /> Profile
        </button>
        <button onClick={() => setActiveTab("security")} className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-poppins font-semibold text-sm transition-all ${activeTab === "security" ? (isDark ? "bg-white text-dark shadow" : "bg-dark text-white shadow") : mutedClass}`}>
          <Lock size={16} /> Security
        </button>
      </div>

      {activeTab === "profile" && (
        <div className={`rounded-2xl border p-6 shadow-sm space-y-6 ${cardClass}`}>
          <div>
            <h3 className={`font-poppins font-bold text-lg flex items-center gap-2 ${isDark ? "text-white" : "text-dark"}`}><Camera size={18} className="text-primary" /> Photo</h3>
            <p className={`font-poppins text-xs ${mutedClass}`}>JPG/PNG, max 5MB base64 • Recommended 400×400</p>
          </div>

          <div className={`rounded-2xl p-6 border flex flex-col items-center gap-4 ${isDark ? "bg-white/5 border-white/10" : "bg-background border-dark/5"}`}>
            <div className={`w-28 h-28 rounded-full overflow-hidden border-2 shadow-md flex items-center justify-center font-poppins font-bold text-3xl ${isDark ? "border-white/20 bg-primary text-white" : "border-white bg-primary text-white"}`}>
              {avatarPreview || user.avatar ? <img src={avatarPreview || user.avatar} alt="" className="w-full h-full object-cover" /> : user.name[0].toUpperCase()}
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              <label className={`px-5 py-2.5 rounded-full font-poppins font-semibold text-sm cursor-pointer flex items-center gap-2 border-2 ${isDark ? "bg-white text-dark border-white hover:bg-background" : "bg-dark text-white border-dark hover:bg-primary"}`}>
                <Upload size={16} /> Change Photo
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </label>
              {(avatarPreview || user.avatar) && (
                <button onClick={handleAvatarRemove} className={`px-5 py-2.5 rounded-full font-poppins font-semibold text-sm flex items-center gap-2 border-2 ${isDark ? "bg-transparent border-white/20 text-white hover:bg-white/10" : "bg-white border-dark/10 hover:border-red-200 hover:text-red-600"}`}>
                  <Trash2 size={16} /> Remove
                </button>
              )}
              {avatarPreview && avatarPreview !== user.avatar && (
                <button onClick={handleAvatarSave} className="px-5 py-2.5 rounded-full bg-primary text-white font-poppins font-semibold text-sm flex items-center gap-2 hover:bg-primary-hover">
                  <Save size={16} /> Save Photo
                </button>
              )}
            </div>
            {avatarMsg && <p className={`font-poppins text-sm px-4 py-2 rounded-xl border text-center w-full ${avatarMsg.ok ? (isDark ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-green-50 text-green-700 border-green-200") : (isDark ? "bg-amber-500/20 text-amber-400 border-amber-500/30" : "bg-amber-50 text-amber-700 border-amber-200")}`}>{avatarMsg.text}</p>}
          </div>

          <div className="space-y-4">
            <h4 className={`font-poppins font-bold flex items-center gap-2 ${isDark ? "text-white" : "text-dark"}`}><User size={16} className="text-primary" /> Personal Info</h4>
            <div>
              <label className={`font-poppins font-medium text-[13px] flex items-center gap-1.5 ${isDark ? "text-white" : "text-dark"}`}><User size={14} /> Full Name *</label>
              <input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} placeholder="Borcelle Admin" className={`mt-1.5 w-full px-4 py-3 rounded-xl border text-sm font-poppins outline-none ${inputClass}`} />
            </div>
            <div>
              <label className={`font-poppins font-medium text-[13px] flex items-center gap-1.5 ${isDark ? "text-white" : "text-dark"}`}><Mail size={14} /> Email *</label>
              <input value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} type="email" placeholder="borcelle.admin@gmail.com" className={`mt-1.5 w-full px-4 py-3 rounded-xl border text-sm font-poppins outline-none ${inputClass}`} />
              {user.provider === "email" && <p className={`font-poppins text-xs mt-1 ${mutedClass}`}>Changing email requires current password</p>}
            </div>
            {user.provider === "email" && (
              <div>
                <label className={`font-poppins font-medium text-[13px] flex items-center gap-1.5 ${isDark ? "text-white" : "text-dark"}`}><KeyRound size={14} /> Current Password (if changing email)</label>
                <div className="relative mt-1.5">
                  <input value={profilePass} onChange={(e) => setProfilePass(e.target.value)} type={showOld ? "text" : "password"} placeholder="••••••••" className={`w-full px-4 py-3 pr-10 rounded-xl border text-sm font-poppins outline-none ${inputClass}`} />
                  <button type="button" onClick={() => setShowOld(!showOld)} className={`absolute right-3 top-1/2 -translate-y-1/2 ${mutedClass}`}>{showOld ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                </div>
              </div>
            )}
            {profileMsg && <p className={`font-poppins text-sm px-4 py-2.5 rounded-xl border ${profileMsg.ok ? (isDark ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-green-50 text-green-700 border-green-200") : (isDark ? "bg-amber-500/20 text-amber-400 border-amber-500/30" : "bg-amber-50 text-amber-700 border-amber-200")}`}>{profileMsg.text}</p>}
            <button onClick={handleProfile} className="w-full bg-primary text-white font-poppins font-semibold py-3.5 rounded-full hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 shadow-md">
              <Save size={16} /> Save Changes
            </button>
            <div className={`rounded-xl p-4 border ${isDark ? "bg-white/5 border-white/10" : "bg-background border-dark/5"}`}>
              <p className={`font-poppins font-semibold text-sm flex items-center gap-2 ${isDark ? "text-white" : "text-dark"}`}><Shield size={14} className="text-primary" /> Account Info</p>
              <p className={`font-poppins text-xs mt-1 ${mutedClass}`}>ID: {user.id}</p>
              <p className={`font-poppins text-xs ${mutedClass}`}>Role: {user.role} • Provider: {user.provider}</p>
              <p className={`font-poppins text-xs ${mutedClass}`}>Status: {user.isActive ? "Active" : "Inactive"}</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === "security" && (
        <div className={`rounded-2xl border p-6 shadow-sm ${cardClass}`}>
          <h3 className={`font-poppins font-bold text-lg flex items-center gap-2 ${isDark ? "text-white" : "text-dark"}`}><Lock size={18} className="text-primary" /> Security</h3>
          <p className={`font-poppins text-sm mt-1 ${mutedClass}`}>Change your password • Requires current password</p>

          {user.provider === "google" ? (
            <div className={`mt-6 rounded-xl p-4 text-center border ${isDark ? "bg-amber-500/10 border-amber-500/20" : "bg-amber-50 border-amber-200"}`}>
              <p className={`font-poppins font-semibold ${isDark ? "text-amber-400" : "text-amber-800"}`}>Google account has no password</p>
              <p className={`font-poppins text-sm mt-1 ${mutedClass}`}>You logged in via Google — password change is not needed.</p>
            </div>
          ) : (
            <div className="space-y-4 mt-6">
              <div>
                <label className={`font-poppins font-medium text-[13px] flex items-center gap-1.5 ${isDark ? "text-white" : "text-dark"}`}><KeyRound size={14} /> Current Password *</label>
                <div className="relative mt-1.5">
                  <input value={sec.old} onChange={(e) => setSec({ ...sec, old: e.target.value })} type={showOld ? "text" : "password"} placeholder="Current" className={`w-full px-4 py-3 pr-10 rounded-xl border text-sm font-poppins outline-none ${inputClass}`} />
                  <button type="button" onClick={() => setShowOld(!showOld)} className={`absolute right-3 top-1/2 -translate-y-1/2 ${mutedClass}`}>{showOld ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                </div>
              </div>
              <div>
                <label className={`font-poppins font-medium text-[13px] flex items-center gap-1.5 ${isDark ? "text-white" : "text-dark"}`}><Lock size={14} /> New Password *</label>
                <div className="relative mt-1.5">
                  <input value={sec.nw} onChange={(e) => setSec({ ...sec, nw: e.target.value })} type={showNew ? "text" : "password"} placeholder="Min 8 chars, upper/lower/number" className={`w-full px-4 py-3 pr-10 rounded-xl border text-sm font-poppins outline-none ${inputClass}`} />
                  <button type="button" onClick={() => setShowNew(!showNew)} className={`absolute right-3 top-1/2 -translate-y-1/2 ${mutedClass}`}>{showNew ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                </div>
              </div>
              <div>
                <label className={`font-poppins font-medium text-[13px] flex items-center gap-1.5 ${isDark ? "text-white" : "text-dark"}`}><Shield size={14} /> Confirm New Password *</label>
                <input value={sec.confirm} onChange={(e) => setSec({ ...sec, confirm: e.target.value })} type="password" placeholder="Repeat new password" className={`mt-1.5 w-full px-4 py-3 rounded-xl border text-sm font-poppins outline-none ${inputClass}`} />
              </div>
              {secMsg && <p className={`font-poppins text-sm px-4 py-2.5 rounded-xl border ${secMsg.ok ? (isDark ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-green-50 text-green-700 border-green-200") : (isDark ? "bg-amber-500/20 text-amber-400 border-amber-500/30" : "bg-amber-50 text-amber-700 border-amber-200")}`}>{secMsg.text}</p>}
              <button onClick={handlePass} className="w-full bg-primary text-white font-poppins font-semibold py-3.5 rounded-full hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 shadow-md">
                <KeyRound size={16} /> Change Password
              </button>
              <p className={`font-poppins text-xs text-center ${mutedClass}`}>Password must be 8+ chars, include upper, lower & number • Demo hash `btoa` (not secure for prod)</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}