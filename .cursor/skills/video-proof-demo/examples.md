# Video demo — examples

## Feature (editor control)

```markdown
## Video demo
**Where:** Edit with Elementor → select a container → Style → Position
**Steps:** add a Flexbox container → open Style → Position → set Position to Absolute → set Z-index to 10
**Pass:** Z-index control is enabled and accepts 10; canvas shows the positioned container
**Fail:** Z-index stays disabled or value does not apply
```

## Bug (Broken caption + fixed path)

```markdown
## Video demo
**Broken:** Z-index stayed disabled on Tablet when Position was inherited from Desktop.
**Where:** Edit with Elementor → select a container → Style → Position → device switcher
**Steps:** on Desktop set Position to Absolute → switch to Tablet → open Style → Position → set Z-index to 5
**Pass:** Z-index is enabled on Tablet and value 5 is accepted
**Fail:** Z-index remains disabled on Tablet
```

## Smoke (CI / infra PR that still benefits from a screenshot)

```markdown
## Video demo
**Where:** WordPress admin → Pages → Add New → Edit with Elementor
**Steps:** open Elementor → wait until the panel and canvas load → capture screenshot
**Pass:** editor shell is visible with panel and canvas
**Fail:** blank preview iframe or editor error overlay
```

## Skip (docs / skill-only)

```markdown
## Video demo
#skip_video
Docs-only change to agent skill text; no user-facing UI.
```
