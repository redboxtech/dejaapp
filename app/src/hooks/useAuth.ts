import { useCallback } from "react";
import { shallow } from "zustand/shallow";

import { useAuthStore } from "@store/index";

export const useAuth = () => {
  const { isAuthenticated, user, signIn, signOut, initialize } = useAuthStore(
    (state) => ({
      isAuthenticated: state.isAuthenticated,
      user: state.user,
      signIn: state.signIn,
      signOut: state.signOut,
      initialize: state.initialize
    }),
    shallow
  );

  const safeSignIn = useCallback(signIn, [signIn]);
  const safeSignOut = useCallback(signOut, [signOut]);
  const safeInitialize = useCallback(initialize, [initialize]);

  return {
    isAuthenticated,
    user,
    signIn: safeSignIn,
    signOut: safeSignOut,
    initialize: safeInitialize
  };
};

