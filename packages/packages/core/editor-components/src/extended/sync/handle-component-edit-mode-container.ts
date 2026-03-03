import { type V1Document } from '@elementor/editor-documents';
import { createElement, selectElement, type V1Element } from '@elementor/editor-elements';
import { registerDataHook } from '@elementor/editor-v1-adapters';

import { COMPONENT_DOCUMENT_TYPE } from '../consts';
import { isEditingComponent } from '../utils/is-editing-component';

const V4_DEFAULT_CONTAINER_TYPE = 'e-flexbox';

type Container = Omit< V1Element, 'children' | 'parent' > & {
	document?: V1Document;
	parent?: Container;
	children?: Container[];
};

export function initHandleComponentEditModeContainer() {
	initRedirectDropIntoComponent();
	initHandleTopLevelElementDelete();
}

export type DeleteArgs = {
	container?: Container;
	containers?: Container[];
};

function initHandleTopLevelElementDelete() {
	registerDataHook( 'after', 'document/elements/delete', ( args: DeleteArgs ) => {
		if ( ! isEditingComponent() ) {
			return;
		}

		const containers = args.containers ?? ( args.container ? [ args.container ] : [] );

		for ( const container of containers ) {
			if ( ! container.parent || ! isComponent( container.parent ) ) {
				continue;
			}

			const component = container.parent;
			const isComponentEmpty = component.children?.length === 0;

			if ( isComponentEmpty ) {
				createEmptyTopLevelContainer( container.parent );
			}
		}
	} );
}

type DropArgs = {
	container?: Container;
	containers?: Container[];
	model?: unknown;
	options?: unknown;
};

function initRedirectDropIntoComponent() {
	registerDataHook( 'dependency', 'preview/drop', ( args: DropArgs ) => {
		if ( ! isEditingComponent() ) {
			return true;
		}

		const containers = args.containers ?? ( args.container ? [ args.container ] : [] );

		for ( const container of containers ) {
			if ( ! isComponent( container ) ) {
				continue;
			}

			const { shouldRedirect, container: redirectedContainer } = getComponentContainer( container );

			if ( ! shouldRedirect ) {
				continue;
			}

			if ( args.containers ) {
				const index = args.containers.indexOf( container );
				args.containers[ index ] = redirectedContainer;
			} else {
				args.container = redirectedContainer;
			}
		}

		return true;
	} );
}

function createEmptyTopLevelContainer( container: Container ) {
	const newContainer = createElement( {
		container,
		model: { elType: V4_DEFAULT_CONTAINER_TYPE },
	} );

	selectElement( newContainer.id );
}

function getComponentContainer( container: Container ): { shouldRedirect: boolean; container: Container } {
	const topLevelElement = container.children?.[ 0 ];

	if ( topLevelElement ) {
		return { shouldRedirect: true, container: topLevelElement };
	}

	return { shouldRedirect: false, container };
}

function isComponent( container: Container ): boolean {
	const isDocument = container.id === 'document';

	if ( ! isDocument ) {
		return false;
	}

	return container.document?.config.type === COMPONENT_DOCUMENT_TYPE;
}
