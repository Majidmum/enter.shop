// @react-three/fiber v8 augments the classic global `JSX.IntrinsicElements`
// namespace. React 19's types (@types/react) resolve JSX elements through
// `React.JSX.IntrinsicElements` instead, so without this bridge TypeScript
// doesn't see <mesh>, <group>, <boxGeometry> etc. as valid JSX elements.
import type { ThreeElements } from '@react-three/fiber';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}

export {};
