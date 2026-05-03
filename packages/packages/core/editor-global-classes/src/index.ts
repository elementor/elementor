export { GLOBAL_CLASSES_URI } from './mcp-integration/classes-resource';

export { init } from './init';

export { loadExistingClasses, loadExistingClassSync } from './load-existing-classes';
export { fetchAndDispatchGlobalClasses, indexEntriesToClassLabels } from './load-global-classes-state';
export type { GlobalClassIndexEntry } from './api';
