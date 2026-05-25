import { type V1ElementModelProps } from '@elementor/editor-elements';

export const DOCUMENT_EL_TYPE = 'document';
export const WIDGET_EL_TYPE = 'widget';
export const DEFAULT_DOCUMENT_WIDGET_WRAPPER = 'e-flexbox';

export function wrapRootWidgetForDocumentParent(
	modelTree: V1ElementModelProps,
	parentElType: string | undefined,
	generateWrapperId: () => string
): { model: V1ElementModelProps; wrapped: boolean } {
	if ( parentElType !== DOCUMENT_EL_TYPE || modelTree.elType !== WIDGET_EL_TYPE ) {
		return { model: modelTree, wrapped: false };
	}

	return {
		model: {
			id: generateWrapperId(),
			elType: DEFAULT_DOCUMENT_WIDGET_WRAPPER,
			skipDefaultChildren: true,
			elements: [ modelTree ] as unknown as V1ElementModelProps[ 'elements' ],
			editor_settings: {},
		},
		wrapped: true,
	};
}
