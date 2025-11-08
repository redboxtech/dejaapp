/* eslint-disable no-console */
const log = (...args: unknown[]) => {
  if (__DEV__) {
    console.log("[DejaApp]", ...args);
  }
};

const warn = (...args: unknown[]) => {
  if (__DEV__) {
    console.warn("[DejaApp]", ...args);
  }
};

const error = (...args: unknown[]) => {
  if (__DEV__) {
    console.error("[DejaApp]", ...args);
  }
};

export const logger = {
  log,
  warn,
  error
};

