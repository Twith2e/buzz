import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useGetUser } from "../services/user/user";
import { useNavigate } from "react-router-dom";
import { Contact, User } from "@/utils/types";
import { useGetContactList } from "@/services/contact/contact";
import { ImperativePanelGroupHandle } from "react-resizable-panels";

type UserContextType = {
  user: User | null;
  fetchingUser: boolean;
  fetchingContactList: boolean;
  contactList: Contact[] | null;
  chatAreaRef: React.RefObject<ImperativePanelGroupHandle>;
  isAreaClicked: boolean;
  setIsAreaClicked: (isClicked: boolean) => void;
};

const UserContext = createContext<UserContextType | null>(null);

export function UserContextProvider({ children }) {
  const [isAreaClicked, setIsAreaClicked] = useState(false);
  const chatAreaRef = useRef<ImperativePanelGroupHandle>(null);
  const { data: user, isLoading: fetchingUser } = useGetUser();
  const { data: contactList, isLoading: fetchingContactList } =
    useGetContactList();
  const navigate = useNavigate();

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

  return (
    <UserContext.Provider
      value={{
        user,
        fetchingUser,
        contactList,
        fetchingContactList,
        chatAreaRef,
        isAreaClicked,
        setIsAreaClicked,
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
