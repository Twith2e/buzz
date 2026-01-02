import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { otpSchema, OtpSchema } from "../schemas/Otp.schema";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";
import { OTPInput } from "input-otp";
import FakeDash from "../components/FakeDash";
import Slot from "../components/Slot";
import api from "@/utils/api";
import { VerifyOtpResponse } from "@/utils/types";

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
        alert("otp resent!");
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
        setEmail(response.data.hashedEmail);
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
    <div className="min-h-screen flex flex-col md:flex-row">
      <div className="hidden md:flex w-1/2 bg-[#33BEE7] justify-center items-center">
        <h1 className="font-bold text-4xl text-white font-rubik">JOIN US</h1>
      </div>
      <div className="md:w-1/2 flex flex-col justify-center items-center py-6 lg:py-0 px-4">
        <div className="w-full max-w-md flex flex-col justify-center items-center">
          <h2 className="text-xl lg:text-2xl font-bold mb-6 text-gray-800 font-rubik">
            ENTER VERIFICATION CODE
          </h2>
          <p className="text-center text-xs mb-6 text-gray-600">
            Kindly input the 6-digit OTP has been sent to <br />
            <span className="text-gray-700 font-medium">
              {email || (id && `${id.substring(0, 5)}...`)}
            </span>
          </p>

          <div
            className={`w-full flex flex-col items-center p-4 rounded-lg border-2 transition-colors ${
              error ? "border-red-500 bg-white" : "border-gray-200 bg-white"
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
              containerClassName="group flex items-center"
              render={({ slots }) => (
                <>
                  <div className="flex">
                    {slots.slice(0, 3).map((slot, idx) => (
                      <Slot key={idx} {...slot} />
                    ))}
                  </div>

                  <FakeDash />

                  <div className="flex">
                    {slots.slice(3).map((slot, idx) => (
                      <Slot key={idx} {...slot} />
                    ))}
                  </div>
                </>
              )}
            />
          </div>

          {error && (
            <p className="text-red-600 text-sm font-medium mt-3 text-center">
              {error}
            </p>
          )}

          <div className="mt-6 relative w-full flex flex-col items-center">
            <p className="font-sans font-bold text-xs lg:text-sm text-gray-700">
              Didn't receive the OTP?{" "}
              <span>
                <button
                  className="font-normal text-blue-500 hover:text-blue-600 transition-colors disabled:text-gray-300 disabled:cursor-not-allowed"
                  disabled={cooldown > 0 || isLoading}
                  onClick={handleResendOTP}
                >
                  {cooldown > 0 ? `RESEND OTP (${cooldown})` : "RESEND OTP"}
                </button>
              </span>
            </p>
            {isLoading && (
              <div className="mt-3 h-6 w-6 rounded-full border-blue-200 border-3 border-t-blue-400 animate-spin"></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
