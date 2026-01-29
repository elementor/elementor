import { type ExtendedWindow, type V1Element } from './types';

export type V1Model = V1Element[ 'model' ];

export type V1Collection = V1Model[] & {
	remove: ( model: V1Model ) => void;
	add: ( model: V1Model, options?: { at?: number }, silent?: boolean ) => void;
	indexOf: ( model: V1Model ) => number;
};

export type ModelResult = {
	model: V1Model;
};

export type ModelWithParentResult = {
	model: V1Model;
	parentModel: V1Model;
	collection: V1Collection;
	index: number;
};

export function getModel( id: string, parentModel?: V1Model ): ModelResult | null {
	const extendedWindow = window as unknown as ExtendedWindow;

	const container = extendedWindow.elementor?.getContainer?.( id );

	if ( container ) {
		return { model: container.model };
	}

	if ( parentModel ) {
		const model = findChildById( parentModel, id );
		return model ? { model } : null;
	}

	return findModel( id );
}

export function findModel( id: string ): ModelResult | null {
	const documentModel = getDocumentModel();

	if ( ! documentModel ) {
		return null;
	}

	const result = findModelRecursive( documentModel, id, false );

	return result ? { model: result.model } : null;
}

export function findModelWithParent( id: string ): ModelWithParentResult | null {
	const documentModel = getDocumentModel();

	if ( ! documentModel ) {
		return null;
	}

	return findModelRecursive( documentModel, id, true );
}

function findModelRecursive( parentModel: V1Model, id: string, includeParent: true ): ModelWithParentResult | null;
function findModelRecursive( parentModel: V1Model, id: string, includeParent: false ): ModelResult | null;
function findModelRecursive(
	parentModel: V1Model,
	id: string,
	includeParent: boolean
): ModelWithParentResult | ModelResult | null {
	const collection = parentModel.get( 'elements' ) as V1Collection | undefined;

	if ( ! collection ) {
		return null;
	}

	const childModels = [ ...collection ] as V1Model[];

	for ( let index = 0; index < childModels.length; index++ ) {
		const childModel = childModels[ index ];

		if ( childModel.get( 'id' ) === id ) {
			if ( includeParent ) {
				return { model: childModel, parentModel, collection, index };
			}

			return { model: childModel };
		}

		const found = findModelRecursive( childModel, id, includeParent as true );

		if ( found ) {
			return found;
		}
	}

	return null;
}

export function findChildRecursive( model: V1Model, predicate: ( model: V1Model ) => boolean ): ModelResult | null {
	const childModels = ( model.get( 'elements' ) ?? [] ) as V1Model[];

	for ( const childModel of childModels ) {
		if ( predicate( childModel ) ) {
			return { model: childModel };
		}

		const found = findChildRecursive( childModel, predicate );

		if ( found ) {
			return found;
		}
	}

	return null;
}

export function getElementChildren( model: V1Model, predicate?: ( model: V1Model ) => boolean ): ModelResult[] {
	const childModels = ( model.get( 'elements' ) ?? [] ) as V1Model[];

	return childModels
		.filter( ( childModel ) => ! predicate || predicate( childModel ) )
		.map( ( childModel ) => ( { model: childModel } ) );
}

function getDocumentModel(): V1Model | null {
	const extendedWindow = window as unknown as ExtendedWindow;

	return extendedWindow.elementor?.documents?.getCurrent?.()?.container?.model ?? null;
}

function findChildById( parentModel: V1Model, id: string ): V1Model | null {
	const childModels = ( parentModel.get( 'elements' ) ?? [] ) as V1Model[];

	return childModels.find( ( m ) => m.get( 'id' ) === id ) ?? null;
}
