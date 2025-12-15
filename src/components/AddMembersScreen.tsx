import { alphabets } from "@/data/data";
import SelectedContact from "./SelectedContact";

const AddMembers = ({
  selectedContacts,
  setSelectedContacts,
}: {
  selectedContacts: string[];
  setSelectedContacts: (selectedContacts: string[]) => void;
}) => {
  return (
    <>
      {selectedContacts && selectedContacts.length > 0 && (
        <div className="px-3 space-y-3">
          <h2 className="underline">Selected contacts</h2>
          <div className="flex gap-2 overflow-x-auto">
            {selectedContacts.map((contact) => (
              <SelectedContact key={contact} id={contact} />
            ))}
          </div>
        </div>
      )}
      <div>
        {alphabets.map(
          (alphabet) =>
            alphabet.contacts?.length > 0 && (
              <div className="px-3" key={alphabet.value}>
                <h2 className="text-lg font-bold">
                  {alphabet.contacts?.length > 0 && alphabet.name}
                </h2>
                <ul className="space-y-3 mb-3">
                  {alphabet.contacts &&
                    alphabet.contacts.length > 0 &&
                    alphabet.contacts.map((contact) => (
                      <li
                        className="flex justify-between items-center bg-white p-2 rounded-lg border"
                        key={contact._id}
                      >
                        <label className="w-full" htmlFor={contact._id}>
                          {contact.localName}
                        </label>
                        <input
                          className="h-4 w-4 accent-blue-500"
                          checked={selectedContacts.includes(
                            contact.contactProfile._id
                          )}
                          onChange={() => {
                            if (
                              selectedContacts.includes(
                                contact.contactProfile._id
                              )
                            ) {
                              setSelectedContacts(
                                selectedContacts.filter(
                                  (selectedContact) =>
                                    selectedContact !==
                                    contact.contactProfile._id
                                )
                              );
                            } else {
                              setSelectedContacts([
                                ...selectedContacts,
                                contact.contactProfile._id,
                              ]);
                            }
                          }}
                          type="checkbox"
                          name="contact"
                          id={contact._id}
                        />
                      </li>
                    ))}
                </ul>
              </div>
            )
        )}
      </div>
    </>
  );
};

export default AddMembers;
