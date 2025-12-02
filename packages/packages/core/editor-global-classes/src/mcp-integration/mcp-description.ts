import { GLOBAL_CLASSES_URI } from './classes-resource';

export const mcpDescription = `
Tools for managing and applying Global CSS classes to elements within the Elementor editor.

Global classes support multiple variants, allowing users to define different styles for various states (e.g., normal, hover, active) or devices (e.g., desktop, tablet, mobile). This flexibility enables more dynamic and responsive designs.
The default variant is 'desktop', which applies to all devices unless overridden by specific device variants.

Every variant "props" property containes a PropValue for each style property.

The current list of global-classes is available at ${ GLOBAL_CLASSES_URI } resource, which changes whenever the global classes are updated or the list is modified.

For creating or modifying global classes, read the styles schema resource available from 'editor-canvas' mcp.
`;
