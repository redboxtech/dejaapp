import React from "react";
import { StyleSheet, View, ViewProps } from "react-native";

import { colors, spacing } from "@theme/index";

type ScreenContainerProps = ViewProps & {
  children: React.ReactNode;
};

export const ScreenContainer = ({
  children,
  style,
  ...rest
}: ScreenContainerProps) => {
  return (
    <View style={[styles.container, style]} {...rest}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundMuted,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: 0
  }
});

