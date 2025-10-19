// types
export * from './types';
export type {
	V1Element,
	V1ElementData,
	V1ElementModelProps,
	V1ElementSettingsProps,
	V1ElementConfig,
} from './sync/types';

// hooks
export { useElementSetting, useElementSettings } from './hooks/use-element-setting';
export { useSelectedElement } from './hooks/use-selected-element';
export { useParentElement } from './hooks/use-parent-element';
export { useElementChildren, type ElementChildren, type ElementModel } from './hooks/use-element-children';
export { useElementEditorSettings } from './hooks/use-element-editor-settings';

// utils
export { createElement, type CreateElementParams } from './sync/create-element';
export { updateElementEditorSettings } from './sync/update-element-editor-settings';
export { moveElement, type MoveElementParams } from './sync/move-element';
export {
	moveElements,
	type MoveElementsParams,
	type MovedElement,
	type MovedElementsResult,
} from './sync/move-elements';
export { duplicateElement, type DuplicateElementParams } from './sync/duplicate-element';
export { createElements } from './sync/create-elements';
export {
	duplicateElements,
	type DuplicateElementsParams,
	type DuplicatedElement,
	type DuplicatedElementsResult,
} from './sync/duplicate-elements';
export { deleteElement } from './sync/delete-element';
export { removeElements } from './sync/remove-elements';
export { getContainer, selectElement } from './sync/get-container';
export { getElementType } from './sync/get-element-type';
export { getElementSetting, getElementSettings } from './sync/get-element-setting';
export { getElementEditorSettings } from './sync/get-element-editor-settings';
export { getElementStyles } from './sync/get-element-styles';
export { getElementLabel } from './sync/get-element-label';
export { getElements } from './sync/get-elements';
export { getCurrentDocumentId } from './sync/get-current-document-id';
export { getSelectedElements } from './sync/get-selected-elements';
export { getWidgetsCache } from './sync/get-widgets-cache';
export { updateElementSettings, type UpdateElementSettingsArgs } from './sync/update-element-settings';
export { generateElementId } from './sync/generate-element-id';
export { replaceElement } from './sync/replace-element';
export { getCurrentDocumentContainer } from './sync/get-current-document-container';
export { dropElement, type DropElementParams } from './sync/drop-element';

export { ELEMENT_STYLE_CHANGE_EVENT, styleRerenderEvents } from './styles/consts';
export {
	createElementStyle,
	shouldCreateNewLocalStyle,
	type CreateElementStyleArgs,
} from './styles/create-element-style';
export { updateElementStyle, type UpdateElementStyleArgs } from './styles/update-element-style';
export { deleteElementStyle } from './styles/delete-element-style';
export {
	isElementAnchored,
	getAnchoredDescendantId,
	getAnchoredAncestorId,
	getLinkInLinkRestriction,
	type LinkInLinkRestriction,
} from './link-restriction';
