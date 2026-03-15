import { type V1Element } from '@elementor/editor-elements';

const COMPONENT_DOCUMENT_TYPE = 'elementor_component';

export function getCompositionTargetContainer(
	documentContainer: V1Element,
	documentType: string | undefined
): V1Element {
	if ( documentType === COMPONENT_DOCUMENT_TYPE && documentContainer.children?.[ 0 ] ) {
		return documentContainer.children[ 0 ];
	}

	return documentContainer;
}
