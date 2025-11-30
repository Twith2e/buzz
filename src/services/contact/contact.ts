import { useQuery } from "react-query";
import { getContactList } from "./contact-service";

export function useGetContactList() {
  return useQuery({
    queryKey: ["contact"],
    queryFn: () => getContactList(),
  });
}
