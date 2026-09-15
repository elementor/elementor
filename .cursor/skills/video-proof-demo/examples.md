# Video demo — examples

## Editor bug (record)

```markdown
## Video demo
**Broken:** Z-index stayed disabled on Tablet when Position was inherited from Desktop.
**Where:** Edit with Elementor → select a container → Style → Position → device switcher
**Steps:** on Desktop set Position to Absolute → switch to Tablet → open Style → Position → set Z-index to 5
**Pass:** Z-index is enabled on Tablet and value 5 is accepted
**Fail:** Z-index remains disabled on Tablet
```

## Skip — not an editor bug

```markdown
## Video demo
#skip_video
Task adds a new Style control; video recording is editor-bugs only for now.
```

## Skip — needs Pro

```markdown
## Video demo
#skip_video
Fix is in Atomic Form (Pro). Core Playground cannot show this editor path yet.
```

## Skip — docs / skill-only

```markdown
## Video demo
#skip_video
Docs-only change to agent skill text; no user-facing editor UI.
```
