import { useNavigation } from "@/contexts/NavigationContext";
import Dashboard from "@/pages/Dashboard";
import Status from "./Status";
import Settings from "./Settings";

const CurrentScreen = () => {
  const { current } = useNavigation();
  switch (current.name) {
    case "conversations":
      return <Dashboard />;
    case "status":
      return <Status />;
    case "settings":
      return <Settings />;
    default:
      return <Dashboard />;
  }
};

export default CurrentScreen;
