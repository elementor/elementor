import { GLOBAL_CLASSES_URI } from './classes-resource';

export const mcpDescription = `
Tools for managing and applying Global CSS classes to elements within the Elementor editor.

Global classes support multiple variants, allowing users to define different styles for various states (e.g., normal, hover, active) or devices (e.g., desktop, tablet, mobile). This flexibility enables more dynamic and responsive designs.
The default variant is 'desktop', which applies to all devices unless overridden by specific device variants.

Every variant "props" property containes a PropValue for each style property.

The current list of global-classes is available at ${ GLOBAL_CLASSES_URI } resource, which changes whenever the global classes are updated or the list is modified.
<important>
Before using tools that require class IDs or names, always refer to the latest data from the global-classes resource to ensure accuracy.
</important>

<important>
Global classes shares the same styles schema as element styles.
Before creating or modifying global classes, read the styles schema dynamic resources available at elementor://styles/schema/{property}.
</important>

`;
