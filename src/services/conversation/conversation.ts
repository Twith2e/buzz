import { useQuery } from "react-query";
import { getConversations } from "./conversation-service";
import { hasAccessToken } from "@/utils/api";

export function useGetConversations() {
  return useQuery({
    queryKey: ["conversations"],
    queryFn: () => getConversations(),
    enabled: hasAccessToken(),
  });
}
