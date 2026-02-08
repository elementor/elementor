import { type V1Element } from './types';

export type V1Model = V1Element[ 'model' ];

export type V1Collection = V1Model[] & {
	remove: ( model: V1Model ) => void;
	add: ( model: V1Model, options?: { at?: number }, silent?: boolean ) => void;
	indexOf: ( model: V1Model ) => number;
};

export type ModelResult = {
	model: V1Model;
};

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
