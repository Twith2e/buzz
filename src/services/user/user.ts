import { useQuery, useMutation, useQueryClient } from "react-query";
import { getUser, updateUser } from "./user-service";
import { hasAccessToken } from "@/utils/api";

export function useGetUser() {
  return useQuery({
    queryKey: ["get-user"],
    queryFn: () => getUser(),
    enabled: hasAccessToken(),
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      queryClient.invalidateQueries(["get-user"]);
    },
  });
}
