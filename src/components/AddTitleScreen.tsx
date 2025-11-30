import SelectedContact from "./SelectedContact";

const AddTitle = ({
  selectedContacts,
  setTitle,
}: {
  selectedContacts: string[];
  setTitle: (title: string) => void;
}) => {
  return (
    <div className="px-3">
      <div className="flex gap-2 items-center">
        {selectedContacts.map((contact) => (
          <SelectedContact key={contact} id={contact} />
        ))}
      </div>
      <form className="mt-3 h-[200px] flex flex-col justify-between">
        <div className="flex flex-col gap-2">
          <label htmlFor="title">Provide a group name</label>
          <input
            className="border border-[#007bff] rounded-lg outline-none px-2 py-3 text-sm"
            placeholder="Group name"
            type="text"
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
      </form>
    </div>
  );
};

export default AddTitle;
