import { Dialog, DialogContent } from "./ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader } from "lucide-react";
import { useState } from "react";
import { NewContactSchema, newContactSchema } from "@/schemas/NewContact";
import { useUpsertContact } from "@/hooks/useUpsertContact";
import { useUserContext } from "@/contexts/UserContext";

const NewContactForm = ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) => {
  const [addingContact, setAddingContact] = useState(false);

  const upsert = useUpsertContact();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NewContactSchema>({
    resolver: zodResolver(newContactSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
    },
  });

  const { contactList } = useUserContext();

  function onSubmit(data: NewContactSchema) {
    setAddingContact(true);

    upsert.mutate(
      {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
      },
      {
        onSuccess: () => {
          setOpen(false);
          console.log(contactList);
        },
        onSettled: () => {
          setAddingContact(false); // stop loading spinner
        },
        onError: (err) => {
          console.error(err);
          setAddingContact(false); // stop spinner even on error
        },
      }
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <h2 className="text-3xl mb-3">Add new contact</h2>
          <div className="flex flex-col">
            <div
              className={`flex gap-2 items-center border rounded-lg border-b-3 px-2 ${
                errors.email ? "border-b-red-500" : ""
              }`}
            >
              <input
                className="h-10 text-sm outline-none w-full"
                placeholder="Enter contact email"
                type="text"
                {...register("email")}
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-xs">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-3 mt-3">
            <div className="flex flex-col">
              <label htmlFor="firstName">First name</label>
              <input
                className="h-8 px-2 text-sm outline-none w-full border rounded-lg"
                placeholder="First name"
                type="text"
                {...register("firstName")}
              />
              {errors.firstName && (
                <p className="text-red-500 text-xs">
                  {errors.firstName.message}
                </p>
              )}
            </div>
            <div className="flex flex-col">
              <label htmlFor="lastName">Last name</label>
              <input
                className="h-8 px-2 text-sm outline-none w-full border rounded-lg"
                placeholder="Last name"
                type="text"
                {...register("lastName")}
              />
              {errors.lastName && (
                <p className="text-red-500 text-xs">
                  {errors.lastName.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-2 items-center mt-3">
            <button
              className="h-8 px-2 text-sm outline-none w-full bg-sky-500 text-white rounded-md"
              disabled={addingContact}
            >
              {addingContact ? (
                <div className="flex gap-2 items-center text-sm justify-center">
                  <Loader className="animate-spin" />
                  <span>Adding</span>
                </div>
              ) : (
                "Add contact"
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewContactForm;
