declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}

declare module 'react' {
  const React: any;
  export default React;
  // Tipagens mínimas para permitir uso genérico de useState e evitar TS2347
  export function useState<T = any>(
    initialState: T | (() => T)
  ): [T, (value: T | ((prev: T) => T)) => void];
  export function useEffect(effect: () => void | (() => void), deps?: any[]): void;
  export function useMemo<T>(factory: () => T, deps: any[]): T;
  export function useContext<T = any>(context: any): T;
  export function createContext<T = any>(defaultValue?: T): any;
  export type ReactNode = any;
  export type FC<P = {}> = (props: P & { children?: ReactNode }) => any;
  export as namespace React;
}

// Fornecer namespace React para usos como React.ComponentProps, React.ChangeEvent, etc.
declare namespace React {
  // Muito permissivo de propósito, para projetos sem @types/react
  type ReactNode = any;
  type ComponentProps<T extends any> = any;
  type ChangeEvent<T = any> = {
    target: any;
    currentTarget?: any;
  } & Record<string, any>;
  type FormEvent<T = any> = {
    preventDefault: (...args: any[]) => void;
  } & Record<string, any>;
  type MouseEvent<T = any> = {
    stopPropagation: (...args: any[]) => void;
    preventDefault?: (...args: any[]) => void;
    target?: any;
    currentTarget?: any;
  } & Record<string, any>;
}

declare module 'react/jsx-runtime' {
  const jsx: any;
  export { jsx };
  const Fragment: any;
  export { Fragment };
  const jsxs: any;
  export { jsxs };
  export default any;
}

declare module 'sonner' {
  export const toast: any;
  export type ToasterProps = any;
  export const Toaster: any;
}

declare module '@/lib/api' {
  export function apiFetch<T = any>(input: string, init?: any): Promise<T>;
}

