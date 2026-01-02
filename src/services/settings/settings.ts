import { useQuery } from "react-query";
import { getSettings } from "./settings-service";
import { hasAccessToken } from "@/utils/api";

export function useGetSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: getSettings,
    enabled: hasAccessToken(),
  });
}
