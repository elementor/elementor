# Accessibility

Applies to widget output markup and editor UI. WCAG-grounded only; preferences go to `product`.
- Semantics: correct elements/roles, heading order, lists, landmarks; no div-buttons.
- ARIA: valid roles/states, `aria-expanded/controls/labelledby` kept in sync with state; no redundant ARIA.
- Keyboard: all interactions reachable and operable, visible focus, logical tab order, focus trap/return for popovers and dialogs, Escape closes.
- Names: labels for inputs and icon-only buttons, alt text, link text, `title` vs `aria-label` use.
- Visual: contrast, not relying on color alone, text resize/zoom, `prefers-reduced-motion` for animation, RTL.
- Dynamic updates: live regions where content changes.
- Editor controls/panels: label association, MUI/`@elementor/ui` accessible props used correctly.

Cite the WCAG criterion in `why`. Lens name `accessibility`. Follow common.md.
