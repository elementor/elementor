import { type ExtendedWindow, type V1Element } from './types';

type V1Model = V1Element[ 'model' ];

export type ModelResult = {
	model: V1Model;
};

export function getModel( id: string, parentModel?: V1Model ): ModelResult | null {
	const extendedWindow = window as unknown as ExtendedWindow;
	const container = extendedWindow.elementor?.getContainer?.( id ) ?? null;

	if ( container ) {
		return { model: container.model };
	}

	if ( parentModel ) {
		const childModels = parentModel.get( 'elements' ) ?? [];
		const model = childModels.find( ( m ) => m.get( 'id' ) === id );

		if ( model ) {
			return { model };
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
