import { useUserContext } from "@/contexts/UserContext";
import { LucideUser } from "lucide-react";

const SelectedContact = ({ id }: { id: string }) => {
  const { contactList } = useUserContext();

  const contact = contactList.find(
    (contact) => contact.contactProfile._id === id
  );

  return (
    <div className="flex gap-1 items-center">
      <div className="w-10 h-10 rounded-full border flex items-center justify-center">
        {contact?.contactProfile.profilePic ? (
          <img
            className="w-10 h-10 rounded-full"
            src={contact?.contactProfile.profilePic || ""}
            alt={contact?.localName}
          />
        ) : (
          <LucideUser />
        )}
      </div>
      <p className="text-sm font-medium text-foreground">
        {contact?.localName || contact?.contactProfile.displayName}
      </p>
    </div>
  );
};

export default SelectedContact;
