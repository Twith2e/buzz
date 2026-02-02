import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { otpSchema } from "../schemas/Otp.schema";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { OTPInput } from "input-otp";
import FakeDash from "../components/FakeDash";
import Slot from "../components/Slot";
import api from "@/utils/api";
import { VerifyOtpResponse } from "@/utils/types";
import { toast } from "sonner";

export default function OtpPage() {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [cooldown, setCooldown] = useState(30);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const {
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(otpSchema),
  });

  const { id } = useParams();

  async function handleResendOTP() {
    setIsLoading(true);
    try {
      const response = await api.post("/users/send-otp", { email: id });
      if (response.status === 200) {
        toast.info("otp resent!");
      }
      setCooldown(30);
    } catch (error) {
      console.log("Error resending OTP:", error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (cooldown === 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  async function onSubmit() {
    setError("");
    setIsLoading(true);
    try {
      const response = await api.post<VerifyOtpResponse>("/users/verify-otp", {
        otp,
        email: id,
      });
      if (response && response.status === 200) {
        console.log(response);
        setEmail(response.data.email);
        if (response.data.isNewUser) {
          navigate(`/complete-registration/${response.data.email}`);
        } else {
          localStorage.setItem("tapo_accessToken", response.data.accessToken);
          navigate(`/dashboard`);
        }
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || "Invalid OTP. Please try again.";
      setError(errorMessage);
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
            Verify your identity
          </h1>
          <p className="text-sm text-gray-600">
            Enter the 6-digit code we sent to{" "}
            <span className="font-medium text-gray-900">
              {email || (id ? `${id.substring(0, 5)}...` : "your email")}
            </span>
          </p>
        </div>

        <div className="space-y-6">
          <div
            className={`w-full flex justify-center p-4 rounded-lg bg-gray-50 border transition-all duration-200 ${
              error ? "border-red-500 bg-red-50" : "border-gray-200"
            }`}
          >
            <OTPInput
              maxLength={6}
              value={otp}
              onChange={(value) => {
                setOtp(value);
                setError("");
              }}
              onComplete={onSubmit}
              containerClassName="group flex items-center justify-center gap-2"
              render={({ slots }) => (
                <>
                  <div className="flex gap-2">
                    {slots.slice(0, 3).map((slot, idx) => (
                      <Slot key={idx} {...slot} />
                    ))}
                  </div>

                  <FakeDash />

                  <div className="flex gap-2">
                    {slots.slice(3).map((slot, idx) => (
                      <Slot key={idx} {...slot} />
                    ))}
                  </div>
                </>
              )}
            />
          </div>

          {error && (
            <p className="text-sm font-medium text-red-600 text-center animate-in fade-in slide-in-from-top-1">
              {error}
            </p>
          )}

          <div className="flex flex-col items-center space-y-4">
            <button
              onClick={handleResendOTP}
              disabled={cooldown > 0 || isLoading}
              className="text-sm font-bold text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {cooldown > 0 ? (
                <span>Resend code in {cooldown}s</span>
              ) : (
                <span>Resend verification code</span>
              )}
            </button>

            {isLoading && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="h-4 w-4 rounded-full border-2 border-t-transparent border-blue-600 animate-spin"></div>
                Verifying...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
