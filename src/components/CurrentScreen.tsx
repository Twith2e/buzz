import { useNavigation } from "@/contexts/NavigationContext";
import Dashboard from "@/pages/Dashboard";
import Status from "./Status";

const CurrentScreen = () => {
  const { current } = useNavigation();
  switch (current.name) {
    case "conversations":
      return <Dashboard />;
    case "status":
      return <Status />;
    default:
      return <Dashboard />;
  }
};

export default CurrentScreen;
