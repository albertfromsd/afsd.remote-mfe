# State Contract (remote-side)

The federated `AppState` shape lives in **three files** spread across the
host/remote pair. Nothing at the build or runtime level forces them into
sync — this document and `scripts/check-sync.ts` do.

The canonical version of this contract lives in the host:
[../afsd.host-mfe/STATE_CONTRACT.md](../afsd.host-mfe/STATE_CONTRACT.md). This
file restates the rules from the remote's perspective for devs who cloned
this repo as their starting point and may not have the host alongside.

## The three files

| File                                                       | Role                                            | Authority           |
| ---------------------------------------------------------- | ----------------------------------------------- | ------------------- |
| `afsd.host-mfe/src/shared/stores/store.ts` + `slices/*.ts` | Canonical implementation. Composed from slices. | **Source of truth** |
| `src/shared/stores/localStore.ts` (this repo)              | Standalone-mode fallback when host isn't there. | Must mirror.        |
| `src/shared/types/remotes.d.ts` (this repo)                | TypeScript declaration for embedded mode.       | Must mirror.        |

In **embedded mode** (this remote loaded by the host), state comes from the
host via Module Federation — `localStore.ts` is unused at runtime but its
type still appears in tests and ambient resolution.

In **standalone mode** (this remote dev-served or rendered alone), the
federation import fails and `storeAccessor.ts` falls back to
`localStore.ts`. If `localStore.ts` lacks a field the host has, the UI
silently breaks in standalone mode only.

## Checklist — the host added a slice field

The host is canonical, so changes start there. When `foo: string` lands in
the host's auth slice:

1. **Pull from the host** — sync your local checkout of `../afsd.host-mfe`.
2. **`localStore.ts`** (this repo) — Add `foo: string;` to `AppState` and initialize in `createLocalStore`.
3. **`remotes.d.ts`** (this repo) — Add `foo: string;` to the `AppState` declaration inside `declare module 'hostTemplate/stores/store'`.
4. **Run `pnpm check:sync`** here to confirm parity. The script resolves the host as `../afsd.host-mfe` by default; override with `SYNC_HOST_PATH` if your layout differs.
5. **Bump `STORAGE.STORE_VERSION`** in `src/shared/config/app.constants.ts` to match the host's value **iff** the persisted shape changed in an incompatible way (renamed field, removed field, type narrowed). New optional fields don't require a bump.

If step 5 is needed, persisted user sessions are wiped on next load — this
is intentional. See [../afsd.host-mfe/docs/adr/0004-session-storage-and-versioning.md](../afsd.host-mfe/docs/adr/0004-session-storage-and-versioning.md).

## Checklist — adding a slice field originated here

Don't. Slice authorship lives in the host so there is exactly one canonical
shape. If you need a new field:

1. Open a PR (or issue) against `../afsd.host-mfe` with the slice change.
2. Once the host change merges, follow the checklist above to mirror it here.

This boundary is what makes `pnpm check:sync` meaningful — if either side
can independently extend `AppState`, the drift check just races back and
forth.

## What the drift check catches

`scripts/check-sync.ts` extracts the field list from each file via regex
and compares them. It catches:

- A field present in host slices but missing from `localStore.ts`.
- A field present in `localStore.ts` but missing from `remotes.d.ts`.
- A type signature divergence on any shared field.

It does **not** catch:

- Implementation drift (host's `addToCart` increments by 2, remote's by 1).
- Type narrowing in one place that's still assignable in the other.

For implementation drift, write a parity test that exercises the same
action on both stores and asserts the same end state. See
`src/shared/stores/localStore.test.ts` here and
`../afsd.host-mfe/src/shared/stores/store.test.ts`.

## When the contract is broken

CI fails with a diff on whichever side ran the check. Local repro:

```bash
pnpm check:sync
```

Resolve by aligning the lagging file to the canonical one (the host). The
drift check doesn't know which side is "right" — that's always a
human/AI judgment call based on what the change was meant to do.

## When you cloned this remote and there's no sibling host

`pnpm check:sync` will warn and exit `0` if `../afsd.host-mfe` doesn't
resolve, unless `SYNC_STRICT=1` is set (CI does set it). For local dev
without the host alongside, either:

- Clone the host as a sibling and run the check periodically, **or**
- Point `SYNC_HOST_PATH` at wherever you keep it, **or**
- Accept that contract drift won't be caught locally — CI will still gate it
  when both repos are checked out side-by-side.
