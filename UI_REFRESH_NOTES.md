# UI Refresh Notes

This cosmetic pass intentionally leaves application logic, API calls, authentication, booking/payment flows, schedules, analytics, and data models unchanged.

## Updated visual system
- Violet/fuchsia brand accent with slate neutrals
- Global typography, form focus states, and smoother interactions
- Reusable surface/button/badge utility classes in `src/index.css`
- Glassy sticky navigation with clearer role-aware navigation
- Redesigned landing page with hero, CTA, and feature cards
- Redesigned login experience
- Richer event discovery page with filter shell, loading skeletons, and empty states
- Upgraded event cards with image treatment, date badge, location, and price hierarchy
- Improved event details layout, metadata cards, sticky ticket panel, and schedule styling
- Consistent slate/violet cosmetic treatment applied across existing organizer/admin/booking pages

## Intentionally not changed
- Route structure
- API endpoints
- Business logic
- Auth/role logic
- Booking/payment/ticket logic
- Organizer/admin behavior

Before replacing your current frontend, keep your existing `.env` locally. This package contains `.env.example` instead of `.env` so environment-specific values are not bundled.
