import { COMPONENT_DOCUMENT_TYPE } from '@elementor/editor-documents';
import { type V1Element } from '@elementor/editor-elements';

export function getCompositionTargetContainer(
	documentContainer: V1Element,
	documentType: string | undefined
): V1Element {
	const firstChild = documentContainer.children?.[ 0 ];

	if ( documentType === COMPONENT_DOCUMENT_TYPE && firstChild ) {
		return firstChild;
	}

	return documentContainer;
}
