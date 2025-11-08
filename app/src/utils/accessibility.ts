import { AccessibilityInfo } from "react-native";

export const announce = (message: string) => {
  AccessibilityInfo.announceForAccessibility(message);
};

export const focusOnElement = (reactTag: number) => {
  AccessibilityInfo.setAccessibilityFocus(reactTag);
};


