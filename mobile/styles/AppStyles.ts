import { StyleSheet, Dimensions } from 'react-native'

const { width, height } = Dimensions.get('window')

// Color constants
export const COLORS = {
  PRIMARY: '#3b82f6',
  PRIMARY_DARK: '#1d4ed8',
  SECONDARY: '#6b7280',
  SUCCESS: '#10b981',
  ERROR: '#ef4444',
  WARNING: '#f59e0b',
  WHITE: '#ffffff',
  BLACK: '#000000',
  GRAY: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  BACKGROUND: '#f9fafb',
  SURFACE: '#ffffff',
  BORDER: '#e5e7eb',
}

// Spacing constants
export const SPACING = {
  XS: 4,
  SM: 8,
  MD: 16,
  LG: 24,
  XL: 32,
  XXL: 48,
}

// Font size constants
export const FONT_SIZES = {
  XS: 12,
  SM: 14,
  BASE: 16,
  LG: 18,
  XL: 20,
  XXL: 24,
  XXXL: 32,
}

// Border radius constants
export const BORDER_RADIUS = {
  SM: 4,
  MD: 8,
  LG: 12,
  XL: 16,
  FULL: 9999,
}

// Screen size constants
export const SCREEN = {
  WIDTH: width,
  HEIGHT: height,
}

// Common styles
export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND,
  },
  card: {
    backgroundColor: COLORS.SURFACE,
    borderRadius: BORDER_RADIUS.LG,
    padding: SPACING.MD,
    marginVertical: SPACING.SM,
    marginHorizontal: SPACING.MD,
    shadowColor: COLORS.BLACK,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  button: {
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: SPACING.SM,
    paddingHorizontal: SPACING.MD,
    borderRadius: BORDER_RADIUS.MD,
    alignItems: 'center',
  },
  buttonSecondary: {
    backgroundColor: COLORS.GRAY[200],
    paddingVertical: SPACING.SM,
    paddingHorizontal: SPACING.MD,
    borderRadius: BORDER_RADIUS.MD,
    alignItems: 'center',
  },
  buttonText: {
    color: COLORS.WHITE,
    fontSize: FONT_SIZES.BASE,
    fontWeight: '600',
  },
  buttonTextSecondary: {
    color: COLORS.GRAY[800],
    fontSize: FONT_SIZES.BASE,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: BORDER_RADIUS.MD,
    padding: SPACING.SM,
    fontSize: FONT_SIZES.BASE,
    backgroundColor: COLORS.WHITE,
  },
  title: {
    fontSize: FONT_SIZES.XXL,
    fontWeight: 'bold',
    color: COLORS.GRAY[900],
    marginBottom: SPACING.SM,
  },
  subtitle: {
    fontSize: FONT_SIZES.LG,
    fontWeight: '600',
    color: COLORS.GRAY[800],
    marginBottom: SPACING.SM,
  },
  text: {
    fontSize: FONT_SIZES.BASE,
    color: COLORS.GRAY[700],
    lineHeight: 24,
  },
  textSecondary: {
    fontSize: FONT_SIZES.SM,
    color: COLORS.GRAY[500],
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.BORDER,
    marginVertical: SPACING.MD,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND,
    padding: SPACING.XL,
  },
  errorText: {
    fontSize: FONT_SIZES.BASE,
    color: COLORS.ERROR,
    textAlign: 'center',
    marginBottom: SPACING.MD,
  },
}) 