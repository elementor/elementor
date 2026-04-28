import {
	addModelToParent,
	findModelInDocument,
	generateElementId,
	getContainer,
	type V1Element,
	type V1ElementModelProps,
} from '@elementor/editor-elements';

import { type ElementView } from './types';

export function createPendingElement(
	wrapperView: ElementView,
	data: Partial< V1ElementModelProps >,
	options: { edit?: boolean; at?: number } = {}
): { getContainer: () => V1Element } | undefined {
	const parentContainer = wrapperView.getContainer();
	const model: Partial< V1ElementModelProps > = { ...data };

	if ( ! model.id ) {
		model.id = generateElementId();
	}

	if ( ! model.elements ) {
		model.elements = [];
	}

	const added = addModelToParent( parentContainer.id, model as V1ElementModelProps, options );

	if ( ! added ) {
		return undefined;
	}

	const childId = model.id;
	const childModel = findModelInDocument( childId );

	if ( ! childModel ) {
		return undefined;
	}

	const pendingContainer: V1Element = {
		id: childId,
		settings: { get: () => ( {} ), set: () => ( {} ), toJSON: () => ( {} ) } as V1Element[ 'settings' ],
		parent: parentContainer,
		model: childModel as V1Element[ 'model' ],
		view: undefined,
		lookup() {
			return getContainer( childId ) ?? pendingContainer;
		},
	};

	if ( options.edit !== false ) {
		selectChildWhenWrapperRenders( wrapperView, childId );
	}

	return { getContainer: () => pendingContainer };
}

function selectChildWhenWrapperRenders( wrapperView: ElementView, childId: string ): void {
	wrapperView.once( 'render', () => {
		const childContainer = getContainer( childId );

		if ( childContainer?.model?.trigger ) {
			childContainer.model.trigger( 'request:edit' );
			return;
		}

		wrapperView.model?.trigger?.( 'request:edit' );
	} );
}
