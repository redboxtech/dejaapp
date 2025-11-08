import { TextStyle } from "react-native";

const fontFamily = {
  regular: "System",
  medium: "System",
  semiBold: "System"
};

export const typography: Record<string, TextStyle> = {
  regular: {
    fontFamily: fontFamily.regular,
    fontWeight: "400"
  },
  medium: {
    fontFamily: fontFamily.medium,
    fontWeight: "500"
  },
  semiBold: {
    fontFamily: fontFamily.semiBold,
    fontWeight: "600"
  }
};

