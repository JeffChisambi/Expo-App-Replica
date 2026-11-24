/**
 * Semantic design tokens for the mobile app.
 *
 * These tokens mirror the naming conventions used in web artifacts (index.css)
 * so that multi-artifact projects share a cohesive visual identity.
 *
 * Replace the placeholder values below with values that match the project's
 * brand. If a sibling web artifact exists, read its index.css and convert the
 * HSL values to hex so both artifacts use the same palette.
 *
 * To add dark mode, add a `dark` key with the same token names.
 * The useColors() hook will automatically pick it up.
 */

const colors = {
  light: {
    // Legacy aliases (kept for backward compatibility)
    text: '#18243A',
    tint: '#4668E8',

    // Core surfaces
    background: '#F7F8FC',
    foreground: '#18243A',

    // Cards / elevated surfaces
    card: '#FFFFFF',
    cardForeground: '#18243A',

    // Primary action color (buttons, links, active states)
    primary: '#4668E8',
    primaryForeground: '#ffffff',

    // Secondary / less-emphasis interactive surfaces
    secondary: '#F0F3F8',
    secondaryForeground: '#18243A',

    // Muted / subdued elements (dividers, timestamps, placeholders)
    muted: '#F0F3F8',
    mutedForeground: '#68768C',

    // Accent highlights (badges, selected items, focus rings)
    accent: '#EAF0FF',
    accentForeground: '#18243A',

    // Destructive actions (delete, error states)
    destructive: '#ef4444',
    destructiveForeground: '#ffffff',

    // Borders and input outlines
    border: '#E5EAF2',
    input: '#E5EAF2',

    // STEM SmartStudy palette
    ink: '#18243A',
    softInk: '#68768C',
    quiet: '#98A3B4',
    line: '#E5EAF2',
    deep: '#192A49',
    heroStart: '#3858C9',
    heroEnd: '#263F99',
    heroAccent: '#FFD16A',
    heroSoft: '#D7E1FF',
    teal: '#168C81',
    amber: '#F1B84C',
    amberInk: '#9C6A12',
    coral: '#E56D55',
    paleBlue: '#EAF0FF',
    paleTeal: '#E5F5F1',
    paleAmber: '#FFF5DE',
    paleCoral: '#FFF0EB',
    bottomBar: '#FFFFFF',
    white: '#FFFFFF',
    scrim: '#14203F75',
    heroOverlay: '#FFFFFF14',
    heroOverlaySoft: '#FFFFFF0F',
  },

  // Border radius (in px). Sync from the sibling web artifact's --radius
  // CSS variable. This value applies to cards, buttons, inputs, and modals.
  radius: 20,
};

export default colors;
