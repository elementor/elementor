# Visual proof — examples

## Editor bug

```markdown
## Visual proof
**Broken:** Z-index stayed disabled on Tablet when Position was inherited from Desktop.
**Where:** Edit with Elementor → select a container → Style → Position → device switcher
**Steps:** on Desktop set Position to Absolute → switch to Tablet → open Style → Position → set Z-index to 5
**Pass:** Z-index is enabled on Tablet and value 5 is accepted
**Fail:** Z-index remains disabled on Tablet
```

## Skip — not an editor bug

```markdown
## Visual proof
#skip_proof
Task adds a new Style control; visual proof is editor-bugs only.
```

## Skip — cannot run on Core Playground

```markdown
## Visual proof
#skip_proof
Fix needs a plugin that playground-preview does not install.
```

## Skip — this skill / docs

```markdown
## Visual proof
#skip_proof
Docs-only change to Cursor skill text; no editor UI.
```
