import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useGetUser } from "../services/user/user";
import { useNavigate } from "react-router-dom";
import { Contact, User } from "@/utils/types";
import { useGetContactList } from "@/services/contact/contact";
import { ImperativePanelGroupHandle } from "react-resizable-panels";
import useMediaStream from "@/hooks/useMediaStream";

type UserContextType = {
  user: User | null;
  fetchingUser: boolean;
  fetchingContactList: boolean;
  contactList: Contact[] | null;
  setContactList: (contactList: Contact[] | null) => void;
  chatAreaRef: React.RefObject<ImperativePanelGroupHandle>;
  isAreaClicked: boolean;
  setIsAreaClicked: (isClicked: boolean) => void;
  mediaOnboarded: boolean;
  requestMediaDevices: () => void;
  stream: MediaStream | null;
  hasPermission: boolean;
  stopMedia: () => void;
};

const UserContext = createContext<UserContextType | null>(null);

export function UserContextProvider({ children }) {
  const { data, isLoading: fetchingContactList } = useGetContactList();
  const [contactList, setContactList] = useState<Contact[] | null>(null);
  const [isAreaClicked, setIsAreaClicked] = useState(false);
  const chatAreaRef = useRef<ImperativePanelGroupHandle>(null);
  const { data: user, isLoading: fetchingUser } = useGetUser();
  const navigate = useNavigate();
  const {
    mediaOnboarded,
    requestMediaDevices,
    stream,
    hasPermission,
    stopMedia,
  } = useMediaStream();

  useEffect(() => {
    if (fetchingUser || !user) return;
    const publicPrefixes = ["/", "/signup", "/otp", "/complete-registration"];

    const path = location.pathname;

    const isOnPublicRoute = publicPrefixes.some(
      (prefix) => path === prefix || path.startsWith(prefix + "/*")
    );
    if (isOnPublicRoute) {
      navigate("/dashboard", { replace: true });
    }
  }, [fetchingUser, user, location.pathname, navigate]);

  useEffect(() => {
    if (data && !fetchingContactList) {
      setContactList(data);
    }
  }, [data]);

  return (
    <UserContext.Provider
      value={{
        user,
        fetchingUser,
        contactList,
        setContactList,
        fetchingContactList,
        chatAreaRef,
        isAreaClicked,
        setIsAreaClicked,
        mediaOnboarded,
        requestMediaDevices,
        stream,
        hasPermission,
        stopMedia,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUserContext() {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error("useUserContext must be used within a UserContextProvider");
  }
  return ctx;
}
