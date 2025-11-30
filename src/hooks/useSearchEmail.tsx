import { useState } from "react";
import useContact from "./useContact";
import { FindContactResponse, User } from "@/utils/types";
import api from "@/utils/api";
import { isValidEmail } from "@/utils/validation";

export default function useSearchEmail() {
  const { filterContacts } = useContact();
  const [result, setResult] = useState<Partial<User> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  async function handleSearch(email: string): Promise<void> {
    let timeout: ReturnType<typeof setTimeout>;
    if (!isValidEmail(email)) {
      filterContacts(email);
    } else {
      clearTimeout(timeout);
      setIsSearching(true);
      timeout = setTimeout(async () => {
        try {
          const response = await api.get<FindContactResponse>(
            `/users/find/?email=${email}`
          );
          if (response.data.matched) {
            setResult(response.data.user);
          } else {
            setResult(null);
          }
        } catch (error) {
          console.log(error);
          setError(error);
        } finally {
          setIsSearching(false);
        }
      }, 2000);
    }
  }

  return { result, handleSearch, error, isSearching };
}
