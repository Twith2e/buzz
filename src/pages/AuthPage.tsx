import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SignupSchema, signupSchema } from "../schemas/SignupSchema";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../utils/api";
import { Link } from "react-router-dom";
import { Lock } from "lucide-react";

export default function AuthPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
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

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-gray-200 shadow-xl rounded-2xl p-8 space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="flex flex-col items-center text-center space-y-2">
          <Link to="/" className="flex items-center gap-2 mb-4">
            <img src="/logo.png" alt="Buzz Logo" className="w-12 h-12" />
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Sign in to Buzz
          </h1>
          <p className="text-sm text-gray-600">
            Enter your email to get started. We'll send you a verification code.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-medium leading-none text-gray-900 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Email address
            </label>
            <input
              {...register("email")}
              className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200"
              type="email"
              id="email"
              placeholder="name@example.com"
            />
            {errors.email && (
              <p className="text-sm font-medium text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>

          <button
            disabled={isLoading}
            className="inline-flex items-center justify-center rounded-md text-sm font-bold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2 w-full shadow-sm"
          >
            {isLoading ? (
              <div className="h-5 w-5 rounded-full border-2 border-t-transparent border-white animate-spin"></div>
            ) : (
              <span>Get Verification Code</span>
            )}
          </button>
        </form>

        <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
          <Lock size={12} />
          <span>Your data is end-to-end encrypted</span>
        </div>
      </div>
    </div>
  );
}
