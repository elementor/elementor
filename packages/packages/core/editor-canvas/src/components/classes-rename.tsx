import { useEffect } from 'react';
import { getV1DocumentsManager, type V1Document } from '@elementor/editor-documents';
import { type V1Element } from '@elementor/editor-elements';
import { stylesRepository } from '@elementor/editor-styles-repository';
import { hash } from '@elementor/utils';

export const ClassesRename = () => {
	useEffect( () => {
		subscribeToStylesRepository();
	}, [] );

	return null;
};

const subscribeToStylesRepository = () => {
	stylesRepository.subscribe( ( previous, current ) => {
		const currentIds = Object.keys( current );

		currentIds
			.filter( ( id ) => {
				return id in previous && hash( previous[ id ] ) !== hash( current[ id ] );
			} )
			.forEach( ( id ) => {
				const previousStyle = previous[ id ];
				const currentStyle = current[ id ];

				if ( previousStyle.label !== currentStyle.label ) {
					renameClass( previousStyle.label, currentStyle.label );
				}
			} );
	} );
};

const renameClass = ( oldClassName: string, newClassName: string | undefined ) => {
	if ( ! newClassName ) {
		return;
	}

	Object.values< V1Document >( getV1DocumentsManager().documents ).forEach( ( document ) => {
		const container = document.container as V1Element;

		container.view?.el?.querySelectorAll( `.elementor .${ oldClassName }` ).forEach( ( element ) => {
			element.classList.replace( oldClassName, newClassName );
		} );
	} );
};
