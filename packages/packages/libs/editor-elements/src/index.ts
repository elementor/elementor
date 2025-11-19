// types
export * from './types';
export type * from './sync/types';

// hooks
export { useElementChildren, type ElementChildren, type ElementModel } from './hooks/use-element-children';
export { useElementEditorSettings } from './hooks/use-element-editor-settings';
export { useElementSetting, useElementSettings } from './hooks/use-element-setting';
export { useParentElement } from './hooks/use-parent-element';
export { useSelectedElement } from './hooks/use-selected-element';

// utils
export { createElement, type CreateElementParams } from './sync/create-element';
export { createElements } from './sync/create-elements';
export { deleteElement } from './sync/delete-element';
export { dropElement, type DropElementParams } from './sync/drop-element';
export { duplicateElement, type DuplicateElementParams } from './sync/duplicate-element';
export {
	duplicateElements,
	type DuplicatedElement,
	type DuplicatedElementsResult,
	type DuplicateElementsParams,
} from './sync/duplicate-elements';
export { generateElementId } from './sync/generate-element-id';
export { getContainer, selectElement } from './sync/get-container';
export { getCurrentDocumentContainer } from './sync/get-current-document-container';
export { getCurrentDocumentId } from './sync/get-current-document-id';
export { getElementEditorSettings } from './sync/get-element-editor-settings';
export { getElementLabel } from './sync/get-element-label';
export { getElementSetting, getElementSettings } from './sync/get-element-setting';
export { getElementStyles } from './sync/get-element-styles';
export { getElementType } from './sync/get-element-type';
export { getElements } from './sync/get-elements';
export { getSelectedElements } from './sync/get-selected-elements';
export { getWidgetsCache } from './sync/get-widgets-cache';
export { moveElement, type MoveElementParams } from './sync/move-element';
export {
	moveElements,
	type MovedElement,
	type MovedElementsResult,
	type MoveElementsParams,
} from './sync/move-elements';
export { removeElements } from './sync/remove-elements';
export { replaceElement } from './sync/replace-element';
export { updateElementEditorSettings } from './sync/update-element-editor-settings';
export { updateElementSettings, type UpdateElementSettingsArgs } from './sync/update-element-settings';

export {
	getAnchoredAncestorId,
	getAnchoredDescendantId,
	getLinkInLinkRestriction,
	isElementAnchored,
	type LinkInLinkRestriction,
} from './link-restriction';
export { ELEMENT_STYLE_CHANGE_EVENT, styleRerenderEvents } from './styles/consts';
export {
	createElementStyle,
	shouldCreateNewLocalStyle,
	type CreateElementStyleArgs,
} from './styles/create-element-style';
export { deleteElementStyle } from './styles/delete-element-style';
export { updateElementStyle, type UpdateElementStyleArgs } from './styles/update-element-style';

export { useElementInteractions } from './hooks/use-element-interactions';
export { getElementInteractions } from './sync/get-element-interactions';
export { playElementInteractions, updateElementInteractions } from './sync/update-element-interactions';

export { initMcp as initElementsMcp } from './mcp';
