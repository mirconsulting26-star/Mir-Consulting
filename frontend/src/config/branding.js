// Site-wide branding — hard-coded, no DB lookup.
// To change the logo: replace /app/frontend/src/assets/logo.png with a new
// image (any size). The CSS in Navbar/Footer preserves aspect ratio and caps
// the rendered height, so the visual result stays consistent.
import logoSrc from "@/assets/logo.png";

export const LOGO_SRC = logoSrc;

// Social profiles — paste full https:// URLs.
// Leave any value as `null` (or empty string) to hide that social icon.
export const SOCIAL_LINKS = {
    linkedin: "https://www.linkedin.com/company/mir-consulting",
    facebook: null,
    x: null, // formerly Twitter
};
