import { COMPONENT_DOCUMENT_TYPE } from '@elementor/editor-documents';
import { type V1Element } from '@elementor/editor-elements';

export function getCompositionTargetContainer(
	documentContainer: V1Element,
	documentType: string | undefined
): V1Element {
	return documentType === COMPONENT_DOCUMENT_TYPE && documentContainer.children?.[ 0 ] ?? documentContainer
}
