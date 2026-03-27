export const Colors = {
  primary: '#ffb900',
  primaryDark: '#C1121F',
  background: '#fffbeb',
  surface: '#461901',
  surfaceAlt: '#16213E',
  surfaceLight: '#2D2D44',
  text: '#7b3306',
  textMuted: '#e17100',
  textDim: 'rgba(225, 113, 0, 0.5)',
  input: '#FFFFFF',
  buttonBackground: '#ffb900',
  buttonBackgroundDark: '#461901',
  buttonText: '#461901',
  buttonTextLight: '#ffffff',
  badge: '#fee685',
  success: '#2DC653',
  successDim: '#1A7A32',
  error: '#E63946',
  errorDim: '#7A1E24',
  notification: '#e17100',
  warning: '#F4A261',
  accent: '#FF8906',
  white: '#FFFFFF',
  black: '#000000',
  border: '#e17100',
  overlay: 'rgba(0,0,0,0.5)',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Typography = {
  heading1: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: Colors.text,
    letterSpacing: -0.5,
  },
  heading2: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  heading3: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    color: Colors.text,
  },
  bodyBold: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  caption: {
    fontSize: 13,
    fontWeight: '400' as const,
    color: Colors.textMuted,
  },
  label: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.textMuted,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
  },
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const Shadow = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
};
