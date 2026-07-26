# 0005 — Route Registration

- **Wave:** side-quests / wave_1
- **ADR:** [0001 — Mandarin Character Bingo Generator](../../../adrs/side_quests/0001_mandarin_bingo_generator.md) (Placement)
- **Depends on:** [0003_mandarin_bingo_ui](./0003_mandarin_bingo_ui.md)

## Goal

Expose the bingo mini-app at a stable, deep-linkable Angular route under the Side Quests URL namespace.

## Path

ADR example: `side-quests/mandarin-bingo`.

Register in [`src/app/app.routes.ts`](../../../src/app/app.routes.ts):

```ts
{
  path: 'side-quests/mandarin-bingo',
  component: MandarinBingoComponent,
}
```

Place the route **before** the wildcard `{ path: '**', redirectTo: '' }` entry.

## Import

Import `MandarinBingoComponent` from:

```text
src/app/components/side-quests/mandarin-bingo/mandarin-bingo.component.ts
```

(Adjust path if the component file name differs, but keep the `side-quests/mandarin-bingo/` directory from ADR 0001—not `hosted_projects/`.)

## Smoke checks

- Navigating to `/side-quests/mandarin-bingo` renders the bingo UI (no redirect to home).
- Hard refresh on that URL still loads the component (SPA fallback is already handled by existing static hosting; no extra S3 rule required beyond current SPA setup).
- Unknown paths still redirect home via `**`.

## Acceptance criteria

- [ ] Route registered and reachable.
- [ ] Component lazy-loading is optional; eager import matching `toy-agentic-framework-v0` is acceptable for v1.
- [ ] No auth guards.

## Out of scope

- Adding the home-tab listing card (see [0007](./0007_side_quests_listing_link.md)).
- Changing CloudFront/S3 configuration.
