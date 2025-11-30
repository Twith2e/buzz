import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SignupSchema, signupSchema } from "../schemas/SignupSchema";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../utils/api";

export default function AuthPage() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signupSchema),
  });

  async function onSubmit(data: SignupSchema) {
    setIsLoading(true);
    try {
      const response = await api.post("/users/send-otp", data);
      if (response && response.status === 200) {
        console.log(response);
        navigate(`/otp/${response.data.hashedEmail}`);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
      reset();
    }
  }

  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <div className="hidden md:flex w-1/2 bg-[#33BEE7] justify-center items-center">
        <h1 className="font-bold text-4xl text-white font-rubik">JOIN US</h1>
      </div>
      <div className="md:w-1/2 flex flex-col justify-center items-center">
        <div className="w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 font-rubik">
            EMAIL INPUT
          </h2>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4 font-sans"
          >
            <div className="wrapper-custom">
              <label htmlFor="email" className="label-custom font-rubik">
                Fill in your Email
              </label>
              <input
                {...register("email")}
                className="input-custom"
                type="email"
                id="email"
                placeholder="Email"
              />
              {errors.email && (
                <p className="error-message">{errors.email.message}</p>
              )}
            </div>
            <button
              disabled={isLoading}
              className="bg-[#33BEE7] text-white py-2 px-3 font-sans mt-4 disabled:bg-blue-200 disabled:cursor-not-allowed w-full justify-center flex"
            >
              {isLoading ? (
                <div className="h-6 w-6 rounded-full border-2 border-t-blue-600 border-blue-300 animate-spin"></div>
              ) : (
                <span>Submit</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
