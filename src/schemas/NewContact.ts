import * as z from "zod";

export const newContactSchema = z
  .object({
    email: z.string().email(),
    firstName: z.string().trim().optional(),
    lastName: z.string().trim().optional(),
  })
  .refine((data) => !!data.firstName || !!data.lastName, {
    message: "Either first name or last name is required",
    path: ["firstName"],
  });

export type NewContactSchema = z.infer<typeof newContactSchema>;
