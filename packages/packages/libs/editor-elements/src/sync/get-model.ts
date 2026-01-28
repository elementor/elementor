import { type ExtendedWindow, type V1Element, type V1ElementSettingsProps } from './types';

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
	const container = extendedWindow.elementor?.getContainer?.( id ) ?? null;

	if ( container ) {
		return { model: container.model };
	}

	if ( parentModel ) {
		const childModels = parentModel.get( 'elements' ) ?? [];
		const model = childModels.find( ( m: V1Model ) => m.get( 'id' ) === id );

		if ( model ) {
			return { model };
		}

		return null;
	}

	const result = findModelWithParent( id );

	if ( result ) {
		return { model: result.model };
	}

	return null;
}

export function findModelWithParent( id: string ): ModelWithParentResult | null {
	const extendedWindow = window as unknown as ExtendedWindow;
	const documentContainer = extendedWindow.elementor?.documents?.getCurrent?.()?.container;

	if ( ! documentContainer ) {
		return null;
	}

	return findModelWithParentRecursive( id, documentContainer.model );
}

function findModelWithParentRecursive( id: string, parentModel: V1Model ): ModelWithParentResult | null {
	const collection = parentModel.get( 'elements' ) as V1Collection | undefined;

	if ( ! collection ) {
		return null;
	}

	const childModels = [ ...collection ] as V1Model[];

	for ( let index = 0; index < childModels.length; index++ ) {
		const childModel = childModels[ index ];

		if ( childModel.get( 'id' ) === id ) {
			return {
				model: childModel,
				parentModel,
				collection,
				index,
			};
		}

		const found = findModelWithParentRecursive( id, childModel );

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

export function createVirtualContainer( model: V1Model, parentModel?: V1Model ): V1Element {
	const rawSettings = ( model.get( 'settings' ) ?? {} ) as V1ElementSettingsProps;

	const settingsProxy = createSettingsProxy( rawSettings, model );

	const virtualContainer: V1Element = {
		id: model.get( 'id' ) as string,
		model,
		settings: settingsProxy,
		view: undefined,
		parent: parentModel ? createVirtualContainer( parentModel ) : undefined,
	};

	return virtualContainer;
}

type SettingsModel = V1Element[ 'settings' ];

function createSettingsProxy( rawSettings: V1ElementSettingsProps, parentModel: V1Model ): SettingsModel {
	return {
		get: ( key ) => rawSettings[ key ],
		set: ( key, value ) => {
			rawSettings[ key ] = value;
			parentModel.set( 'settings', rawSettings );
		},
		toJSON: () => rawSettings,
	} as SettingsModel;
}
