/**
 * Plop generators for the AFSD remote template.
 *
 * No `slice` generator here — slices are part of the cross-template
 * AppState contract and the host owns the canonical definition (see
 * ../afsd.host-mfe/STATE_CONTRACT.md). To add a slice, run
 * `pnpm gen:slice` from the host template, then mirror its shape into
 * `src/shared/stores/localStore.ts` and `src/shared/types/remotes.d.ts`.
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
