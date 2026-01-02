import { useQuery } from "react-query";
import { getContactList } from "./contact-service";
import { hasAccessToken } from "@/utils/api";

export function useGetContactList() {
  return useQuery({
    queryKey: ["contact"],
    queryFn: () => getContactList(),
    enabled: hasAccessToken(),
  });
}
