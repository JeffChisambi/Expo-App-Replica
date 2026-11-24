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

const brandBlue = '#2080BD';
const brandYellow = '#F2E51A';
const mutedSlate = '#667A8A';
const black = '#000000';
const white = '#FFFFFF';

const colors = {
  light: {
    // Legacy aliases map to the approved four-color brand palette.
    text: black,
    tint: brandBlue,

    // Core surfaces
    background: white,
    foreground: black,

    // Cards / elevated surfaces
    card: white,
    cardForeground: black,

    // Primary action color (buttons, links, active states)
    primary: brandBlue,
    primaryForeground: white,

    // Secondary / less-emphasis interactive surfaces
    secondary: '#0000000A',
    secondaryForeground: black,

    // Muted / subdued elements (dividers, timestamps, placeholders)
    muted: white,
    mutedForeground: mutedSlate,

    // Accent highlights (badges, selected items, focus rings)
    accent: brandYellow,
    accentForeground: black,

    // Destructive actions (delete, error states)
    destructive: black,
    destructiveForeground: white,

    // Borders and input outlines
    border: '#00000026',
    input: '#0000004D',

    // STEM SmartStudy palette
    ink: black,
    softInk: mutedSlate,
    quiet: mutedSlate,
    line: '#00000026',
    deep: brandBlue,
    heroStart: brandBlue,
    heroEnd: brandBlue,
    heroAccent: brandYellow,
    heroSoft: white,
    teal: brandBlue,
    amber: brandYellow,
    amberInk: brandBlue,
    coral: brandBlue,
    paleBlue: '#EAF4FA',
    paleTeal: '#EAF6F4',
    paleAmber: '#F1F5F8',
    paleCoral: '#FCEFF0',
    bottomBar: white,
    white,
    scrim: '#00000080',
    heroOverlay: '#FFFFFF1F',
    heroOverlaySoft: '#FFFFFF0F',
  },

  // Border radius (in px). Sync from the sibling web artifact's --radius
  // CSS variable. This value applies to cards, buttons, inputs, and modals.
  radius: 20,
};

export default colors;
