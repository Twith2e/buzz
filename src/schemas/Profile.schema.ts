import * as z from "zod";

export const profileSchema = z.object({
  displayName: z.string().nonempty("Display name field can not be empty"),
});

export type ProfileSchema = z.infer<typeof profileSchema>;
