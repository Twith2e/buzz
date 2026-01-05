import { useUserContext } from "@/contexts/UserContext";
import { Contact } from "@/utils/types";
import { useEffect, useState } from "react";

export default function useContact() {
  const { contactList, fetchingContactList } = useUserContext();
  const [contacts, setContacts] = useState<Contact[]>(() => contactList ?? []);

  function filterContacts(input: string) {
    if (!input) {
      setContacts(contactList || []);
      return;
    }
    const filteredContacts = contactList?.filter((contact) =>
      contact.localName.toLowerCase().includes(input.toLowerCase())
    );
    setContacts(filteredContacts || []);
  }

  useEffect(() => {
    setContacts(contactList ?? []);
  }, [contactList]);

  return { contactList, fetchingContactList, contacts, filterContacts };
}
