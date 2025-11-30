import { useQuery } from "react-query";
import { getUser } from "./user-service";

export function useGetUser() {
  return useQuery({
    queryKey: ["get-user"],
    queryFn: () => getUser(),
  });
}
