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

export default function OtpPage() {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [cooldown, setCooldown] = useState(30);
  const [email, setEmail] = useState("");
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
    setIsLoading(true);
    try {
      const response = await api.post("/users/verify-otp", {
        otp,
        email: id,
      });
      if (response && response.status === 200) {
        console.log(response);
        setEmail(response.data.email);
        navigate(`/complete-registration/${response.data.email}`);
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
        <h1 className="font-bold text-4xl text-white font-rubik">JOIN US</h1>
      </div>
      <div className="md:w-1/2 flex flex-col justify-center items-center">
        <div className="w-full max-w-md flex flex-col justify-center items-center">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 font-rubik">
            ENTER VERIFICATION CODE
          </h2>
          <p className="text-center">
            Kindly input the 6-digit OTP has been sent to <br />
            <span className="text-gray-500">{email && email}</span>
          </p>
          <OTPInput
            maxLength={6}
            value={otp}
            onChange={setOtp}
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
          <div className="mt-5 relative">
            <p className="font-sans font-bold text-sm">
              Didn't receive the OTP?{" "}
              <span>
                <button
                  className="font-normal text-blue-500 disabled:text-gray-300 disabled:cursor-not-allowed"
                  disabled={cooldown > 0}
                  onClick={handleResendOTP}
                >
                  {cooldown > 0 ? `RESEND OTP (${cooldown})` : "RESEND OTP"}
                </button>
              </span>
            </p>
            {isLoading && (
              <div className="absolute left-[50%] h-6 w-6 rounded-full border-blue-200 border-3 border-t-blue-400 animate-spin"></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
