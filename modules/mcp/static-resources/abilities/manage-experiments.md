Turns Elementor experiments and features on or off, and turns the Atomic Editor (V4) on or off. Use `list-experiments` first to get the exact `name` and the current state.

ALWAYS ask the user for explicit confirmation before calling this tool, and never change an experiment the user did not ask about. Before `deactivate`, show the user the experiment's `deactivation_warning` when it has one.

Actions:
- `enable_atomic_editor`: turns on the Atomic Editor (V4). Use this when another tool reports that the Atomic Editor is required and the user agrees to turn it on. Needs no `name`.
- `disable_atomic_editor`: turns the Atomic Editor off. Needs no `name`. V4 tools stop working until it is turned on again.
- `activate`, `deactivate`: switch one experiment on or off. Requires `name`.
- `reset`: put one experiment back to its default state. Requires `name`.

Activating an experiment fails with a conflict error when an experiment it depends on is inactive; activate that dependency first (with the user's confirmation). Deactivating an experiment also deactivates the experiments that depend on it. Requires administrator permission.
