import path from 'node:path';
import { defineConfig, loadEnv } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginSass } from '@rsbuild/plugin-sass';
import { aliases } from './config.alias';

const appDirectory = __dirname;
const resolveApp = (...segments: string[]) => path.resolve(appDirectory, ...segments);

const { publicVars, rawPublicVars } = loadEnv({
  prefixes: ['PUBLIC_', 'APP_'],
});

export default defineConfig({
  plugins: [pluginReact(), pluginSass()],

  resolve: {
    alias: aliases,
  },

  source: {
    entry: {
      index: './src/main.tsx',
    },
    define: {
      ...publicVars,
      'process.env': JSON.stringify(rawPublicVars),
      __APP_NAME__: JSON.stringify('remote-app'),
    },
  },

  server: {
    port: 3001,
    open: false,
  },

  dev: {
    hmr: true,
  },

  html: {
    title: 'MFE Remote App',
  },

  moduleFederation: {
    options: {
      name: 'remoteTemplate',
      filename: 'remoteEntry.js',

      exposes: {
        './App': './src/App',
      },

      remotes: {},

      shared: {
        react: {
          singleton: true,
          eager: false,
          requiredVersion: false,
        },
        'react-dom': {
          singleton: true,
          eager: false,
          requiredVersion: false,
        },
        'react-router-dom': {
          singleton: true,
          eager: false,
          requiredVersion: false,
        },
        zustand: {
          singleton: true,
          eager: false,
          requiredVersion: false,
        },
      },
    },
  },
});