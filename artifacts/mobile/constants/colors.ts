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
    text: '#0a0a0a',
    tint: '#2f95dc',

    // Core surfaces
    background: '#ffffff',
    foreground: '#0a0a0a',

    // Cards / elevated surfaces
    card: '#f9f9f9',
    cardForeground: '#0a0a0a',

    // Primary action color (buttons, links, active states)
    primary: '#2f95dc',
    primaryForeground: '#ffffff',

    // Secondary / less-emphasis interactive surfaces
    secondary: '#f0f0f0',
    secondaryForeground: '#1a1a1a',

    // Muted / subdued elements (dividers, timestamps, placeholders)
    muted: '#f0f0f0',
    mutedForeground: '#737373',

    // Accent highlights (badges, selected items, focus rings)
    accent: '#f0f0f0',
    accentForeground: '#1a1a1a',

    // Destructive actions (delete, error states)
    destructive: '#ef4444',
    destructiveForeground: '#ffffff',

    // Borders and input outlines
    border: '#e5e5e5',
    input: '#e5e5e5',

    // Morning Therapy palette
    ink: '#272832',
    softInk: '#7D7E89',
    quiet: '#A8A9B2',
    line: '#ECECF1',
    lavenderStart: '#7776F7',
    lavenderEnd: '#6357DD',
    coralStart: '#FF8850',
    coralEnd: '#F45B3C',
    aqua: '#91E6E6',
    aquaDeep: '#4CAFC6',
    peach: '#FFD0AD',
    yellow: '#F6CC63',
    paleBlue: '#EDF4FC',
    paleLavender: '#F2F1FF',
    palePink: '#FFF0ED',
    bottomBar: '#FFFFFF',
    softWhite: '#FFFFFFCC',
    whiteGlow: '#FFFFFF94',
    modalScrim: '#1A1B2657',
    profilePlaceholder: '#E8F0F8',
    online: '#6D82E8',
  },

  // Border radius (in px). Sync from the sibling web artifact's --radius
  // CSS variable. This value applies to cards, buttons, inputs, and modals.
  radius: 20,
};

export default colors;
