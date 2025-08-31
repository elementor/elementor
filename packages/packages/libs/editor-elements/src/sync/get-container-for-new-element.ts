import { getContainer } from './get-container';
import getCurrentDocumentContainer from './get-current-document-container';
import { getSelectedElements } from './get-selected-elements';
import { type V1Element } from './types';

export const getContainerForNewElement = (): { container: V1Element | null; options?: { at: number } } => {
	const currentDocumentContainer = getCurrentDocumentContainer();
	const selectedElements = getSelectedElements();

	const fallback = { container: currentDocumentContainer };

	if ( selectedElements.length !== 1 ) {
		return fallback;
	}

	const selectedEl = getContainer( selectedElements[ 0 ].id );

	if ( ! selectedEl ) {
		return fallback;
	}

	let container;
	let options;

	switch ( selectedEl.model.get( 'elType' ) ) {
		case 'widget': {
			if ( ! selectedEl.parent ) {
				return fallback;
			}

			container = selectedEl.parent;

			const selectedElIndex = selectedEl.parent.children?.findIndex( ( el ) => el.id === selectedEl.id ) ?? -1;
			if ( selectedElIndex > -1 ) {
				options = { at: selectedElIndex + 1 };
			}
			break;
		}
		case 'section': {
			if ( ! selectedEl.children?.[ 0 ] ) {
				return fallback;
			}

			container = selectedEl.children[ 0 ];
			break;
		}
		default: {
			container = selectedEl;
			break;
		}
	}

	return { container, options };
};
