import { useQuery } from "react-query";
import { getStatuses } from "./status-service";
import { hasAccessToken } from "@/utils/api";

export function useGetStatuses() {
  return useQuery({
    queryKey: ["statuses"],
    queryFn: () => getStatuses(),
    enabled: hasAccessToken(),
  });
}
