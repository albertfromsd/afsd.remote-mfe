import { defineConfig, loadEnv } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginSass } from '@rsbuild/plugin-sass';
import { aliases } from './config.alias';
import { APP_ID, APP_TITLE, DEV_PORT, MF_NAME, MF_FILENAME } from './rsbuild.constants';

const { publicVars, rawPublicVars } = loadEnv({
  prefixes: ['PUBLIC_', 'APP_'],
});

export default defineConfig({
  plugins: [pluginReact(), pluginSass()],

  resolve: {
    alias: aliases,
  },

  source: {
    define: {
      ...publicVars,
      'process.env': JSON.stringify(rawPublicVars),
      __APP_NAME__: JSON.stringify(APP_ID),
    },
  },

  server: {
    port: DEV_PORT,
    open: true,
  },

  dev: {
    hmr: true,
  },

  html: {
    title: APP_TITLE,
  },

  moduleFederation: {
    options: {
      name: MF_NAME,
      filename: MF_FILENAME,
      exposes: {
        './App': './src/App',
      },
      remotes: {},
      shared: {
        react: {
          singleton: true,
          eager: true,
          requiredVersion: false,
        },
        'react-dom': {
          singleton: true,
          eager: true,
          requiredVersion: false,
        },
        'react-router-dom': {
          singleton: true,
          eager: true,
          requiredVersion: false,
        },
        zustand: {
          singleton: true,
          eager: true,
          requiredVersion: false,
        },
      },
    },
  },
});