import { useUserContext } from "@/contexts/UserContext";

const ConversationTitle = ({ title }: { title: string }) => {
  const { contactList } = useUserContext();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (emailRegex.test(title)) {
    return contactList.find((contact) => contact.email === title)?.localName;
  } else {
    return title;
  }
};
export default ConversationTitle;
