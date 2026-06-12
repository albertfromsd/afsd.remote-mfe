/// <reference types="@rsbuild/core/types" />

/**
 * Imports the SVG file as a React component.
 * @requires [@rsbuild/plugin-svgr](https://npmjs.com/package/@rsbuild/plugin-svgr)
 */
declare module '*.svg?react' {
  import type React from 'react';
  const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  export default ReactComponent;
}

// Stylesheet ambients. @rsbuild/core/types declares image/font/audio
// modules but not styles. Required so `import './foo.scss'` typechecks under
// `noUncheckedSideEffectImports`, and so CSS-module default imports have
// a string-map shape.
declare module '*.module.scss' {
  const classes: { readonly [key: string]: string };
  export default classes;
}
declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}
declare module '*.scss';
declare module '*.sass';
declare module '*.css';
