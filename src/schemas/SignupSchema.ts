import { z } from "zod";

export const signupSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email")
    .min(1, "Email is required"),
});

export type SignupSchema = z.infer<typeof signupSchema>;
