import { useQuery, useMutation, useQueryClient } from "react-query";
import { getUser, updateUser } from "./user-service";

export function useGetUser() {
  return useQuery({
    queryKey: ["get-user"],
    queryFn: () => getUser(),
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
