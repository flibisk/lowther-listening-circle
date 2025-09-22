import { z } from 'zod'

export const webflowLeadSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  ref: z.string().trim().optional(),
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
  utm_term: z.string().optional(),
  utm_content: z.string().optional()
})
export type WebflowLeadInput = z.infer<typeof webflowLeadSchema>
