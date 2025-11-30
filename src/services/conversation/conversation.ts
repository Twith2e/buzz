import { useQuery } from "react-query";
import { getConversations } from "./conversation-service";

export function useGetConversations() {
  return useQuery({
    queryKey: ["conversations"],
    queryFn: () => getConversations(),
  });
}
