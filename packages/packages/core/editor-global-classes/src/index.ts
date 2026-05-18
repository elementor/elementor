export {
	ClassManagerPanelEmbedded,
	type ClassManagerPanelEmbeddedProps,
} from './components/class-manager/class-manager-panel';
export { GLOBAL_CLASSES_URI } from './mcp-integration/classes-resource';

export { init } from './init';
export { registerClassManagerOpen, registerClassManagerToggle } from './open-design-system';

export { loadExistingClasses } from './load-existing-classes';
export { addDocumentClasses } from './load-document-classes';
export type { GlobalClassIndexEntry } from './api';
export { createLabelsForClasses } from './utils/create-labels-for-classes';
