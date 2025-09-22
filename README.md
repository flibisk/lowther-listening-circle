# Lowther Listening Circle

Separate affiliate and knowledge base app.

## Quick start
1. Create a Postgres db. Set `DATABASE_URL`.
2. `pnpm i`
3. `pnpm db:push`
4. Add the real `public/fonts/HVMuse.ttf`.
5. `pnpm dev`

## Webflow form
- POST to `https://your-domain.com/api/webflow/lead`
- Add header `Authorization: Bearer <WEBFLOW_FORM_SECRET>`
- Hidden fields: `ref`, `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`

## Referral clicks
- Share links like `/r/LW-PETE`
- Or call `POST /api/click` with `{ "ref": "LW-PETE", "url": "/page" }`

## Attribution
- `ref` on form wins
- Else recent click by IP within 30 days
- Stored on Lead with `affSource`

No AI code yet. Chat page is a placeholder.

