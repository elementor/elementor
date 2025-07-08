// types
export * from './types';
export type { V1Element, V1ElementModelProps, V1ElementSettingsProps, V1ElementConfig } from './sync/types';

// hooks
export { useElementSetting, useElementSettings } from './hooks/use-element-setting';
export { useElementType } from './hooks/use-element-type';
export { useSelectedElement } from './hooks/use-selected-element';
export { useParentElement } from './hooks/use-parent-element';

// utils
export { getContainer, selectElement } from './sync/get-container';
export { getElementSetting, getElementSettings } from './sync/get-element-setting';
export { getElementStyles } from './sync/get-element-styles';
export { getElementLabel } from './sync/get-element-label';
export { getElements } from './sync/get-elements';
export { getCurrentDocumentId } from './sync/get-current-document-id';
export { getSelectedElements } from './sync/get-selected-elements';
export { getWidgetsCache } from './sync/get-widgets-cache';
export { updateElementSettings, type UpdateElementSettingsArgs } from './sync/update-element-settings';

export { ELEMENT_STYLE_CHANGE_EVENT, styleRerenderEvents } from './styles/consts';
export { createElementStyle, type CreateElementStyleArgs } from './styles/create-element-style';
export { updateElementStyle, type UpdateElementStyleArgs } from './styles/update-element-style';
export { deleteElementStyle } from './styles/delete-element-style';
export {
	isElementAnchored,
	getAnchoredDescendantId,
	getAnchoredAncestorId,
	getLinkInLinkRestriction,
	type LinkInLinkRestriction,
} from './link-restriction';
