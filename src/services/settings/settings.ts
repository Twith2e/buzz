import { useQuery } from "react-query";
import { getSettings } from "./settings-service";

export function useGetSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: getSettings,
  });
}
