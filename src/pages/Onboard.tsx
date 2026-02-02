import { BiSolidImageAdd } from "react-icons/bi";
import { IoIosInformationCircle } from "react-icons/io";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProfileSchema, profileSchema } from "../schemas/Profile.schema";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../utils/api";
import {
  getCloudinarySignature,
  uploadFileToCloudinary,
} from "../utils/cloudinary";

export default function Onboard() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [profilePicFile, setProfilePicFile] = useState<File | null>(null);
  const [profilePicPreview, setProfilePicPreview] = useState<string | null>(
    null,
  );
  const {
    reset,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(profileSchema),
  });

  const { id } = useParams();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePicFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePicPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  async function onSubmit(data: ProfileSchema) {
    setIsLoading(true);
    try {
      let profilePicUrl = null;
      if (profilePicFile) {
        const formData = new FormData();
        formData.append("file", profilePicFile);
        formData.append("upload_preset", "avatar_unsigned");

        const upload = await fetch(
          `https://api.cloudinary.com/v1_1/${
            import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
          }/image/upload`,
          {
            method: "POST",
            body: formData,
          },
        )
          .then((res) => res.json())
          .catch(() => {})
          .finally(() => {
            setIsLoading(false);
          });
        profilePicUrl = upload?.secure_url || null;
      }
      const response = await api.post("/users/register", {
        displayName: data.displayName,
        email: id,
        profilePic: profilePicUrl,
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
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-gray-200 shadow-xl rounded-2xl p-8 space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="flex flex-col items-center text-center space-y-2">
          <img src="/logo.png" alt="Buzz Logo" className="w-12 h-12 mb-4" />
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Complete your profile
          </h1>
          <p className="text-sm text-gray-600">
            Add a photo and name so friends can recognize you.
          </p>
        </div>

        <form
          className="flex flex-col gap-6 w-full font-sans"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="flex justify-center">
            <div className="relative group">
              <label
                className="w-32 h-32 rounded-full border-2 border-dashed border-gray-300 hover:border-blue-500 flex items-center justify-center cursor-pointer overflow-hidden transition-colors bg-gray-50"
                htmlFor="profile-picture"
              >
                {profilePicPreview ? (
                  <img
                    src={profilePicPreview}
                    alt="Profile preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-1 text-gray-500">
                    <BiSolidImageAdd size={32} />
                    <span className="text-xs font-medium">Add Photo</span>
                  </div>
                )}
                <div className="rounded-full absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-xs font-medium">Change</span>
                </div>
              </label>
              <input
                className="hidden"
                type="file"
                name="Profile Picture"
                id="profile-picture"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="display-name"
              className="text-sm font-medium leading-none flex items-center gap-2 text-gray-900"
            >
              Display Name
              <span
                className="text-gray-500"
                title="This is what other users see"
              >
                <IoIosInformationCircle
                  className="text-blue-500/80 hover:text-blue-600 transition-colors cursor-help"
                  size={16}
                />
              </span>
            </label>
            <input
              {...register("displayName")}
              type="text"
              id="display-name"
              name="displayName"
              placeholder="e.g. Alex Smith"
              className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200"
            />
            {errors.displayName && (
              <p className="text-sm font-medium text-red-600">
                {errors.displayName.message}
              </p>
            )}
          </div>

          <button
            className="inline-flex items-center justify-center rounded-md text-sm font-bold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2 w-full mt-2 shadow-sm"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="h-5 w-5 rounded-full border-2 border-t-transparent border-white animate-spin"></div>
            ) : (
              <span>Get Started</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
