import { Dialog, DialogContent } from "./ui/dialog";
import { NewContactSchema, newContactSchema } from "@/schemas/NewContact";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import useSearchEmail from "@/hooks/useSearchEmail";
import { Loader } from "lucide-react";
import api from "@/utils/api";
import { useState } from "react";

const NewContactForm = ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) => {
  const { handleSearch, isSearching, result } = useSearchEmail();
  const [addingContact, setAddingContact] = useState(false);

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

  async function onSubmit(data: NewContactSchema): Promise<void> {
    setAddingContact(true);
    try {
      const response = await api.post("/users/add-contact", {
        friendEmail: data.email,
        localName: `${data.firstName} ${data.lastName}`,
      });
      if (response.status === 200) {
        setOpen(false);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setAddingContact(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <h2 className="text-3xl mb-3">Add new contact</h2>
          <div className={`flex flex-col`}>
            <div
              className={`flex gap-2 items-center border rounded-lg border-b-3 px-2  ${
                errors.email
                  ? "border-b-red-500"
                  : result && "border-b-green-300"
              }`}
            >
              <input
                className={`h-10 text-sm outline-none w-full`}
                placeholder="Enter contact email"
                type="text"
                {...register("email", {
                  onChange: (e) =>
                    handleSearch((e.target as HTMLInputElement).value),
                })}
              />
              {isSearching && (
                <Loader
                  className="animate-spin grow"
                  size={14}
                  color="#28282B"
                />
              )}
            </div>
            {errors.email ? (
              <p className="text-red-500 text-xs">{errors.email.message}</p>
            ) : (
              result && (
                <p className="text-green-500 text-xs">Email exists as a user</p>
              )
            )}
          </div>
          <div className="space-y-3">
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
