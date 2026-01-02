import { useEffect, useState, useRef } from "react";
import {
  Loader,
  LucideSettings,
  LucideUser,
  LucideSun,
  LucideMoon,
  LucideMonitor,
  LucideLogOut,
  LucideCamera,
} from "lucide-react";
import Sidebar from "./Sidebar";
import { useUserContext } from "@/contexts/UserContext";
import { useThemeContext } from "@/contexts/ThemeContext";
import Option from "./Options";
import BottomBar from "./BottomBar";
import { useUpdateUser } from "@/services/user/user";
import {
  getCloudinarySignature,
  uploadFileToCloudinary,
} from "@/utils/cloudinary";
import api from "@/utils/api";
import { toast } from "sonner";

export default function Settings() {
  const { user, fetchingUser } = useUserContext();
  const { theme, updatingSettings } = useThemeContext();
  const updateUserMutation = useUpdateUser();

  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [updatingProfilePic, setUpdatingProfilePic] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const onLogout = async () => {
    try {
      await api.post("/users/logout");
      toast.success("Logged out successfully");
      localStorage.removeItem("tapo_accessToken");
      window.location.href = "/";
    } catch (error) {
      toast.error("Error logging out");
      console.error("Error logging out:", error);
    }
  };

  const handleProfilePicChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUpdatingProfilePic(true);
    try {
      const signData = await getCloudinarySignature("profile-pics");
      const uploadResponse = await uploadFileToCloudinary(file, signData);
      await updateUserMutation.mutateAsync({
        profilePic: uploadResponse.secure_url,
      });
    } catch (error) {
      console.error("Error updating profile picture:", error);
    } finally {
      setUpdatingProfilePic(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!open) return;
      if (
        menuRef.current?.contains(e.target as Node) ||
        triggerRef.current?.contains(e.target as Node)
      ) {
        return;
      }
      setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="flex h-screen bg-background text-foreground">
      {isMobile ? <BottomBar /> : <Sidebar />}
      <div className={`flex flex-1 ${isMobile ? "pb-16" : ""}`}>
        <div className="px-6 py-4 border-r border-gray-200 dark:border-gray-800 w-full lg:w-[300px]">
          <h1 className="text-2xl font-semibold mb-3">Settings</h1>

          {fetchingUser && (
            <div className="flex items-center gap-2">
              <Loader className="animate-spin" />
              <span>Loading...</span>
            </div>
          )}

          {!fetchingUser && user && (
            <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 py-3 relative">
              <div className="relative">
                {user.profilePic ? (
                  <img
                    src={user.profilePic}
                    alt="profile"
                    className="w-12 h-12 rounded-full"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center shrink-0">
                    <LucideUser className="text-white" />
                  </div>
                )}
                <button
                  onClick={triggerFileInput}
                  disabled={updatingProfilePic}
                  className="absolute -bottom-1 -right-1 bg-blue-500 hover:bg-blue-600 text-white p-1 rounded-full transition disabled:opacity-50"
                  title="Change profile picture"
                >
                  {updatingProfilePic ? (
                    <Loader className="animate-spin" size={12} />
                  ) : (
                    <LucideCamera size={12} />
                  )}
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleProfilePicChange}
                className="hidden"
              />
              <div className="flex flex-col">
                <span className="font-medium">{user.displayName}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {user.email}
                </span>
              </div>
            </div>
          )}

          <div className="mt-6">
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-2">
              Appearance
            </label>
            <div className="flex flex-col justify-between h-[calc(100vh-280px)] lg:h-[calc(100vh-220px)]">
              {/* Theme button / menu */}
              <div className="relative inline-block w-full">
                <button
                  ref={triggerRef}
                  disabled={updatingSettings}
                  onClick={() => setOpen((s) => !s)}
                  aria-haspopup="true"
                  aria-expanded={open}
                  className={`inline-flex items-center justify-between px-3 py-2 rounded-md border border-gray-200 dark:border-gray-700 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition w-full ${
                    updatingSettings && "animate-pulse"
                  }`}
                >
                  <div className="flex gap-3 items-center">
                    <LucideSettings size={16} />
                    <span className="font-medium">Theme</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 capitalize">
                    {updatingSettings ? (
                      <Loader className="animate-spin" size={13} />
                    ) : (
                      theme
                    )}
                  </span>
                </button>

                {/* Animated expanding panel */}
                <div
                  ref={menuRef}
                  role="menu"
                  aria-label="Theme options"
                  className={`absolute left-0 mt-2 w-full z-10 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden transform origin-top transition-all ${
                    open
                      ? "opacity-100 scale-100 translate-y-0"
                      : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                  }`}
                >
                  <div className="p-2 space-y-2">
                    <Option
                      label="Dark"
                      icon={LucideMoon}
                      value="dark"
                      onClick={() => setOpen(false)}
                    />
                    <Option
                      label="Light"
                      icon={LucideSun}
                      value="light"
                      onClick={() => setOpen(false)}
                    />
                    <Option
                      label="System"
                      icon={LucideMonitor}
                      value="system"
                      onClick={() => setOpen(false)}
                    />
                  </div>
                </div>
              </div>

              {/* Logout */}
              <div className="mt-6">
                <button
                  onClick={onLogout}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-md border border-red-200 dark:border-red-900/50 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                >
                  <LucideLogOut size={16} />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 lg:flex flex-col items-center justify-center gap-3 bg-background text-foreground hidden">
          <LucideSettings size={50} />
          <span className="text-4xl">Settings</span>
          <p className="text-center max-w-lg text-gray-500 dark:text-gray-500">
            Change your app appearance and account options here. Theme is
            persisted across sessions.
          </p>
        </div>
      </div>
    </div>
  );
}
