import { useGetStatuses } from "@/services/status/status";
import { Status, VisibleStatus } from "@/utils/types";
import {
  Dispatch,
  SetStateAction,
  useState,
  useContext,
  createContext,
  ReactNode,
  useEffect,
} from "react";

type StatusContextType = {
  status: {
    mine: Array<Status>;
    visible: Array<VisibleStatus>;
  };
  setStatus: Dispatch<
    SetStateAction<{ mine: Array<Status>; visible: Array<VisibleStatus> }>
  >;
};

const StatusContext = createContext<StatusContextType | null>({
  status: {
    mine: [],
    visible: [],
  },
  setStatus: () => {},
});

export default function StatusContextProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { data } = useGetStatuses();

  const [status, setStatus] = useState({
    mine: data?.mine || [],
    visible: data?.visible || [],
  });

  useEffect(() => {
    if (data) {
      setStatus({
        mine: data.mine || [],
        visible: data.visible || [],
      });
    }
  }, [data]);

  return (
    <StatusContext.Provider value={{ status, setStatus }}>
      {children}
    </StatusContext.Provider>
  );
}

export function useStatusContext() {
  const context = useContext(StatusContext);
  if (!context) {
    throw new Error(
      "useStatusContext must be used within a StatusContextProvider"
    );
  }
  return context;
}
