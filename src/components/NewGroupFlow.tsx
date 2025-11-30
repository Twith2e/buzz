import AddMembers from "./AddMembersScreen";
import AddTitle from "./AddTitleScreen";

const NewGroupFlow = ({
  selectedContacts,
  setSelectedContacts,
  step,
  setTitle,
}: {
  selectedContacts: string[];
  setSelectedContacts: (selectedContacts: string[]) => void;
  step: number;
  setTitle: (title: string) => void;
}) => {
  return step === 0 ? (
    <AddMembers
      selectedContacts={selectedContacts}
      setSelectedContacts={setSelectedContacts}
    />
  ) : (
    <AddTitle selectedContacts={selectedContacts} setTitle={setTitle} />
  );
};

export default NewGroupFlow;
