import { BiSolidImageAdd } from "react-icons/bi";
import { IoIosInformationCircle } from "react-icons/io";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProfileSchema, profileSchema } from "../schemas/Profile.schema";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../utils/api";

export default function Onboard() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const {
    reset,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(profileSchema),
  });

  const { id } = useParams();

  async function onSubmit(data: ProfileSchema) {
    setIsLoading(true);
    try {
      console.log(data.displayName);
      const response = await api.post("/users/register", {
        displayName: data.displayName,
        email: id,
      });
      if (response.status === 200) {
        console.log(response);
        localStorage.setItem("tapo_accessToken", response.data.accessToken);
        navigate(`/dashboard`);
      }
    } catch (error) {
      console.log(error);
    } finally {
      reset();
      setIsLoading(false);
    }
  }
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <div className="hidden md:flex w-1/2 bg-[#33BEE7] justify-center items-center">
        <h1 className="font-bold text-4xl text-white font-rubik">
          ALMOST DONE
        </h1>
      </div>
      <div className="md:w-1/2 flex flex-col justify-center items-center py-6 lg:py-0 px-3 lg:px-0">
        <div className="w-full max-w-md flex flex-col justify-center items-center">
          <h2 className="text-xl lg:text-2xl font-bold mb-6 text-gray-800 font-rubik">
            COMPLETE YOUR PROFILE
          </h2>
          <form
            className="flex flex-col gap-3 w-full items-center font-sans"
            onSubmit={handleSubmit(onSubmit)}
          >
            <label htmlFor="">Profile Picture</label>
            <label
              className="border border-gray-400 rounded-full h-40 w-40 flex items-center justify-center"
              htmlFor="profile-picture"
            >
              <BiSolidImageAdd size={50} />
            </label>
            <input
              className="hidden"
              type="file"
              name="Profile Picture"
              id="profile-picture"
            />
            <div className="wrapper-custom">
              <label
                htmlFor="display-name"
                className="label-custom flex gap-2 items-center"
              >
                Display Name
                <span>
                  <IoIosInformationCircle
                    color={"#33BEE7"}
                    size={20}
                    title="This is what other users see when they don't have you on their list"
                  />
                </span>
              </label>
              <input
                {...register("displayName")}
                type="text"
                id="display-name"
                name="displayName"
                placeholder="Display Name"
                className="input-custom"
              />
              {errors.displayName && (
                <p className="error-message">{errors.displayName.message}</p>
              )}
            </div>
            <button
              className="bg-sky-300 py-2 px-3 rounded-md text-white font-sans disabled:bg-blue-200 w-full flex justify-center mt-3 cursor-pointer hover:opacity-90"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="h-6 w-6 border-2 border-t-brandSky border-blue-300 animate-spin rounded-full"></div>
              ) : (
                <span>Complete Registration</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
