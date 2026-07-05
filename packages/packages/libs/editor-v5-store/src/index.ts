export { getAtomicCatalog, getAtomicWidgetConfig } from './catalog';
export {
	createElement,
	documentSlice,
	getElementById,
	hydrate,
	markSaved,
	removeElement,
	select,
	updateSetting,
	type DocumentSliceState,
} from './document-slice';
export { collectElementIds, generateElementId } from './generate-id';
export { isLegacyDocument } from './is-legacy-document';
export type { AtomicWidgetConfig, DocumentState, ElementNode } from './types';
