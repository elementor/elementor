import {
	getContainer,
	getCurrentDocumentContainer,
	getSelectedElements,
	type V1Element,
} from '@elementor/editor-elements';

export const getContainerForNewElement = (): { container: V1Element | null; options?: { at: number } } => {
	const currentDocumentContainer = getCurrentDocumentContainer();
	const selectedElement = getSelectedElementContainer();

	let container, options;

	if ( selectedElement ) {
		switch ( selectedElement.model.get( 'elType' ) ) {
			case 'widget': {
				container = selectedElement?.parent;

				const selectedElIndex =
					selectedElement?.parent?.children?.findIndex( ( el ) => el.id === selectedElement?.id ) ?? -1;

				if ( selectedElIndex > -1 ) {
					options = { at: selectedElIndex + 1 };
				}

				break;
			}
			case 'section': {
				container = selectedElement?.children?.[ 0 ];
				break;
			}
			default: {
				container = selectedElement;
				break;
			}
		}
	}

	return { container: container ?? currentDocumentContainer, options };
};

function getSelectedElementContainer() {
	const selectedElements = getSelectedElements();
	if ( selectedElements.length !== 1 ) {
		return undefined;
	}
	return getContainer( selectedElements[ 0 ].id );
}
