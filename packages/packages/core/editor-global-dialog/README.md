# @elementor/editor-global-dialog

Global dialog manager for the Elementor editor.  
Provides a centralized system for displaying modal dialogs and confirmations within the editor environment.

[//]: # ()
[//]: # (## Features)

[//]: # ()
[//]: # (- Centralized global dialog handling)

[//]: # (- React-based modal system)

[//]: # (- Easy integration with editor state and store)

[//]: # (- Compatible with `@elementor/ui`)

[//]: # ()
[//]: # (## Installation)

[//]: # ()
[//]: # (```bash)

[//]: # (npm install @elementor/editor-global-dialog)

[//]: # (```)

[//]: # ()
[//]: # (or)

[//]: # ()
[//]: # (```bash)

[//]: # (yarn add @elementor/editor-global-dialog)

[//]: # (```)

[//]: # ()
[//]: # (## Usage)

[//]: # ()
[//]: # (```tsx)

[//]: # (import { GlobalDialogProvider, useGlobalDialog } from '@elementor/editor-global-dialog';)

[//]: # ()
[//]: # (const App = &#40;&#41; => &#40;)

[//]: # (  <GlobalDialogProvider>)

[//]: # (    <EditorUI />)

[//]: # (  </GlobalDialogProvider>)

[//]: # (&#41;;)

[//]: # ()
[//]: # (// In a component)

[//]: # (const { openDialog } = useGlobalDialog&#40;&#41;;)

[//]: # ()
[//]: # (openDialog&#40;{)

[//]: # (  title: 'Confirm Deletion',)

[//]: # (  content: 'Are you sure you want to delete this item?',)

[//]: # (  confirmLabel: 'Delete',)

[//]: # (  cancelLabel: 'Cancel',)

[//]: # (  onConfirm: &#40;&#41; => { /* your logic */ },)

[//]: # (}&#41;;)

[//]: # (```)

[//]: # ()
[//]: # (## Peer Dependencies)

[//]: # ()
[//]: # (Ensure your project includes the following versions:)

[//]: # ()
[//]: # (- `react` `^18.3.1`)

[//]: # (- `react-dom` `^18.3.1`)

[//]: # ()
[//]: # (## Development)

[//]: # ()
[//]: # (To build the package:)

[//]: # ()
[//]: # (```bash)

[//]: # (npm run build)

[//]: # (```)

[//]: # ()
[//]: # (For development watch mode:)

[//]: # ()
[//]: # (```bash)

[//]: # (npm run dev)

[//]: # (```)

[//]: # ()
[//]: # (## License)

[//]: # ()
[//]: # (GPL-3.0-or-later © Elementor)
