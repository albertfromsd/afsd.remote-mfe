/**
 * Plop generators for the AFSD remote template.
 *
 * ─────────────────────────────────────────────────────────────────────
 * No `slice` generator here — INTENTIONAL.
 *
 * Slices are part of the cross-template AppState contract and the host
 * owns the canonical definition. Adding one from the remote would split
 * authorship and defeat `pnpm check:sync`. See STATE_CONTRACT.md (this
 * repo) for the full rules.
 *
 * To add a slice (the only correct workflow):
 *   1. cd ../afsd.host-mfe && pnpm gen:slice
 *   2. Compose it into the host's store.ts.
 *   3. Mirror the fields into this repo's src/shared/stores/localStore.ts.
 *   4. Mirror the type into this repo's src/shared/types/remotes.d.ts.
 *   5. Run `pnpm check:sync` here to verify parity with the host.
 *   6. Bump STORAGE.STORE_VERSION in app.constants.ts on BOTH sides iff
 *      the persisted shape changed incompatibly.
 * ─────────────────────────────────────────────────────────────────────
 */

export default function plop(/** @type {import('plop').NodePlopAPI} */ plop) {
  plop.setGenerator('component', {
    description: 'Leaf UI primitive in src/components/<Name>/',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Component name (PascalCase):',
        validate: (v) => /^[A-Z]\w+$/.test(v) || 'Must start with an uppercase letter.',
      },
    ],
    actions: [
      {
        type: 'add',
        path: 'src/components/{{pascalCase name}}/{{pascalCase name}}.tsx',
        templateFile: 'plop-templates/component/Component.tsx.hbs',
      },
      {
        type: 'add',
        path: 'src/components/{{pascalCase name}}/{{pascalCase name}}.module.scss',
        templateFile: 'plop-templates/component/Component.module.scss.hbs',
      },
      {
        type: 'add',
        path: 'src/components/{{pascalCase name}}/{{pascalCase name}}.test.tsx',
        templateFile: 'plop-templates/component/Component.test.tsx.hbs',
      },
      {
        type: 'add',
        path: 'src/components/{{pascalCase name}}/index.ts',
        templateFile: 'plop-templates/component/index.ts.hbs',
      },
    ],
  });

  plop.setGenerator('page', {
    description: 'Route-level page in src/pages/<Name>/',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Page name (PascalCase):',
        validate: (v) => /^[A-Z]\w+$/.test(v) || 'Must start with an uppercase letter.',
      },
    ],
    actions: [
      {
        type: 'add',
        path: 'src/pages/{{pascalCase name}}/{{pascalCase name}}.tsx',
        templateFile: 'plop-templates/page/Page.tsx.hbs',
      },
      {
        type: 'add',
        path: 'src/pages/{{pascalCase name}}/index.ts',
        templateFile: 'plop-templates/page/index.ts.hbs',
      },
    ],
  });
}
