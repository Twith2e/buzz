import { useQuery } from "react-query";
import { getStatuses } from "./status-service";

export function useGetStatuses() {
  return useQuery({
    queryKey: ["statuses"],
    queryFn: () => getStatuses(),
  });
}
