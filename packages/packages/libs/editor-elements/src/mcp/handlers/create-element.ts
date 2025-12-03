import { type Props, type TransformablePropValue } from '@elementor/editor-props';

import { createElementStyle } from '../../styles/create-element-style';
import { createElement } from '../../sync/create-element';
import { getContainer } from '../../sync/get-container';
import { getCurrentDocumentContainer } from '../../sync/get-current-document-container';
import { getElementType } from '../../sync/get-element-type';

export function handleCreateElement( {
	elementType,
	containerId,
	props = {},
	styles,
}: {
	elementType: string;
	containerId: string;
	props?: Record< string, TransformablePropValue< string > >;
	styles?: Props;
} ): { elementId: string; type: string } {
	let container = containerId === 'document' ? getCurrentDocumentContainer() : getContainer( containerId );

	if ( ! container ) {
		if ( containerId === 'document' ) {
			throw new Error( 'Document container not found. Please ensure the editor is initialized.' );
		}
		throw new Error( `Container with ID "${ containerId }" not found` );
	}

	const containerElType = container.model.get( 'elType' );
	const isDocument = container.id === 'document' || containerElType === 'document';

	if ( isDocument ) {
		const containerModel = {
			elType: 'e-div-block',
		};

		const createdContainer = createElement( {
			containerId: container.id,
			model: containerModel,
			options: { useHistory: true },
		} );

		createElementStyle( {
			elementId: createdContainer.id,
			classesProp: 'classes',
			label: 'local',
			meta: { breakpoint: 'desktop', state: null },
			props: {
				display: { $$type: 'string', value: 'flex' },
				'flex-direction': { $$type: 'string', value: 'row' },
				'flex-wrap': { $$type: 'string', value: 'wrap' },
			},
		} );

		container = getContainer( createdContainer.id );

		if ( ! container ) {
			throw new Error( 'Failed to create container for widget. Cannot create widgets directly in the document.' );
		}
	}

	const actualContainerId = container.id;

	const elementTypeData = getElementType( elementType );

	if ( ! elementTypeData ) {
		throw new Error( `Element type "${ elementType }" not found or is not atomic` );
	}

	const model = {
		widgetType: elementType,
		elType: 'widget',
		settings: props,
	};

	const createdElement = createElement( {
		containerId: actualContainerId,
		model,
		options: { useHistory: true },
	} );

	if ( styles ) {
		createElementStyle( {
			elementId: createdElement.id,
			classesProp: 'classes',
			label: 'local',
			meta: { breakpoint: 'desktop', state: null },
			props: styles,
		} );
	}

	return {
		elementId: createdElement.id,
		type: elementType,
	};
}
