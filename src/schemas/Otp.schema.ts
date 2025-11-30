import * as z from "zod";

export const otpSchema = z.object({
  otp: z.string(),
});

export type OtpSchema = z.infer<typeof otpSchema>;
