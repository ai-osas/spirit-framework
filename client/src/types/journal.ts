import { z } from "zod";

export interface MediaPreview {
  id: string;
  type: 'image' | 'audio';
  url: string;
  name: string;
}

export const mediaSchema = z.object({
  id: z.string(),
  file_type: z.enum(['image', 'audio']),
  file_url: z.string()
});

export type Media = z.infer<typeof mediaSchema>;
