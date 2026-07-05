// "Twilight & Ember" design system — ported from the Stitch design tokens.
const lightColors = {
  surface: '#fdf9f4',
  surfaceDim: '#ddd9d5',
  surfaceBright: '#fdf9f4',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#f7f3ee',
  surfaceContainer: '#f1ede8',
  surfaceContainerHigh: '#ebe8e3',
  surfaceContainerHighest: '#e6e2dd',
  onSurface: '#1c1c19',
  onSurfaceVariant: '#55423e',
  inverseSurface: '#31302d',
  inverseOnSurface: '#f4f0eb',
  outline: '#88726c',
  outlineVariant: '#dbc1ba',
  surfaceTint: '#9a442c',
  primary: '#97422a',
  onPrimary: '#ffffff',
  primaryContainer: '#b75940',
  onPrimaryContainer: '#fffbff',
  inversePrimary: '#ffb5a1',
  secondary: '#85532e',
  onSecondary: '#ffffff',
  secondaryContainer: '#febb8e',
  onSecondaryContainer: '#794925',
  tertiary: '#914350',
  onTertiary: '#ffffff',
  tertiaryContainer: '#af5b68',
  onTertiaryContainer: '#fffbff',
  error: '#ba1a1a',
  onError: '#ffffff',
  errorContainer: '#ffdad6',
  onErrorContainer: '#93000a',
  primaryFixed: '#ffdbd1',
  primaryFixedDim: '#ffb5a1',
  onPrimaryFixed: '#3b0900',
  onPrimaryFixedVariant: '#7c2d17',
  secondaryFixed: '#ffdcc6',
  secondaryFixedDim: '#fbb88b',
  onSecondaryFixed: '#301400',
  onSecondaryFixedVariant: '#693c19',
  tertiaryFixed: '#ffd9dd',
  tertiaryFixedDim: '#ffb2bb',
  onTertiaryFixed: '#3e0312',
  onTertiaryFixedVariant: '#772e3c',
  background: '#fdf9f4',
  onBackground: '#1c1c19',
  surfaceVariant: '#e6e2dd',
};

// Dark counterpart — not a naive inversion. Surfaces get a warm brown-black
// undertone (not neutral gray) to keep the terracotta identity; primary/
// secondary/tertiary shift toward the light theme's already-defined
// "inverse"/"Fixed" accent family since the light-mode primary reads poorly
// on a dark background. `*Fixed`/`*FixedDim`/`onFixed*` roles are
// intentionally identical to light mode (Material 3 convention — used where
// a color must stay constant regardless of scheme, e.g. a badge over a photo).
const darkColors = {
  surface: '#15100e',
  surfaceDim: '#15100e',
  surfaceBright: '#3c332f',
  surfaceContainerLowest: '#0f0b09',
  surfaceContainerLow: '#1d1613',
  surfaceContainer: '#221a17',
  surfaceContainerHigh: '#2c221e',
  surfaceContainerHighest: '#382c27',
  onSurface: '#f0e3de',
  onSurfaceVariant: '#dbc1ba',
  inverseSurface: '#f0e3de',
  inverseOnSurface: '#31302d',
  outline: '#a58c85',
  outlineVariant: '#55423e',
  surfaceTint: '#ffb5a1',
  primary: '#ffb5a1',
  onPrimary: '#5c1a09',
  primaryContainer: '#7c2d17',
  onPrimaryContainer: '#ffdbd1',
  inversePrimary: '#97422a',
  secondary: '#fbb88b',
  onSecondary: '#4a2800',
  secondaryContainer: '#693c19',
  onSecondaryContainer: '#ffdcc6',
  tertiary: '#ffb2bb',
  onTertiary: '#5e1125',
  tertiaryContainer: '#772e3c',
  onTertiaryContainer: '#ffd9dd',
  error: '#ffb4ab',
  onError: '#690005',
  errorContainer: '#93000a',
  onErrorContainer: '#ffdad6',
  primaryFixed: '#ffdbd1',
  primaryFixedDim: '#ffb5a1',
  onPrimaryFixed: '#3b0900',
  onPrimaryFixedVariant: '#7c2d17',
  secondaryFixed: '#ffdcc6',
  secondaryFixedDim: '#fbb88b',
  onSecondaryFixed: '#301400',
  onSecondaryFixedVariant: '#693c19',
  tertiaryFixed: '#ffd9dd',
  tertiaryFixedDim: '#ffb2bb',
  onTertiaryFixed: '#3e0312',
  onTertiaryFixedVariant: '#772e3c',
  background: '#15100e',
  onBackground: '#f0e3de',
  surfaceVariant: '#55423e',
};

export const fonts = {
  display: 'LibreCaslonText_400Regular',
  displayItalic: 'LibreCaslonText_400Regular_Italic',
  displayBold: 'LibreCaslonText_700Bold',
  body: 'BeVietnamPro_400Regular',
  bodyMedium: 'BeVietnamPro_500Medium',
  bodySemiBold: 'BeVietnamPro_600SemiBold',
  bodyBold: 'BeVietnamPro_700Bold',
};

export const type = {
  display: { fontFamily: fonts.display, fontSize: 40, lineHeight: 46, letterSpacing: -0.4 },
  headlineLg: { fontFamily: fonts.display, fontSize: 32, lineHeight: 40 },
  headlineLgMobile: { fontFamily: fonts.display, fontSize: 28, lineHeight: 36 },
  headlineMd: { fontFamily: fonts.display, fontSize: 24, lineHeight: 32 },
  bodyLg: { fontFamily: fonts.body, fontSize: 18, lineHeight: 28 },
  bodyMd: { fontFamily: fonts.body, fontSize: 16, lineHeight: 24 },
  labelMd: { fontFamily: fonts.bodySemiBold, fontSize: 14, lineHeight: 20, letterSpacing: 0.7 },
  labelSm: { fontFamily: fonts.bodyMedium, fontSize: 12, lineHeight: 16, letterSpacing: 0.3 },
};

export const radii = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  full: 9999,
};

export const spacing = {
  unit: 8,
  marginMobile: 20,
  stackSm: 8,
  stackMd: 16,
  stackLg: 32,
};

const lightShadows = {
  sunsetGlow: {
    shadowColor: '#9a442c',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 6,
  },
  bottomSheet: {
    shadowColor: '#9a442c',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.14,
    shadowRadius: 20,
    elevation: 10,
  },
};

// Terracotta-tinted shadows read as muddy smudges on a dark background, so
// dark mode shadows shift toward black and rely more on elevation/borders.
const darkShadows = {
  sunsetGlow: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 6,
  },
  bottomSheet: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 10,
  },
};

export interface Theme {
  colors: typeof lightColors;
  fonts: typeof fonts;
  type: typeof type;
  radii: typeof radii;
  spacing: typeof spacing;
  shadows: typeof lightShadows;
  scheme: 'light' | 'dark';
}

export const lightTheme: Theme = {
  colors: lightColors,
  fonts,
  type,
  radii,
  spacing,
  shadows: lightShadows,
  scheme: 'light',
};

export const darkTheme: Theme = {
  colors: darkColors,
  fonts,
  type,
  radii,
  spacing,
  shadows: darkShadows,
  scheme: 'dark',
};
