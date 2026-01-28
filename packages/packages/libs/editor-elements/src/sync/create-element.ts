import { __privateRunCommandSync as runCommandSync } from '@elementor/editor-v1-adapters';

import { getContainer } from './get-container';
import { getModel, type V1Collection, type V1Model } from './get-model';
import { type V1Element, type V1ElementModelProps, type V1ElementSettingsProps } from './types';

type Options = {
	useHistory?: boolean;
	at?: number;
	clone?: boolean;
	edit?: boolean;
};

export type CreateElementParams = {
	containerId: string;
	options?: Options;
	model?: Omit< V1ElementModelProps, 'settings' | 'id' > & { settings?: V1ElementSettingsProps; id?: string };
};

export function createElement( { containerId, model, options }: CreateElementParams ): V1Element {
	const container = getContainer( containerId );

	if ( container ) {
		return createElementViaContainer( { container, model, options } );
	}

	return createElementViaModel( { containerId, model, options } );
}

function createElementViaContainer( {
	container,
	model,
	options,
}: {
	container: NonNullable< ReturnType< typeof getContainer > >;
	model: CreateElementParams[ 'model' ];
	options: CreateElementParams[ 'options' ];
} ): V1Element {
	return runCommandSync< V1Element >( 'document/elements/create', {
		container,
		model,
		options: { edit: false, ...options },
	} );
}

function createElementViaModel( { containerId, model: modelData, options = {} }: CreateElementParams ): V1Element {
	const targetResult = getModel( containerId );

	if ( ! targetResult ) {
		throw new Error( `Container with ID "${ containerId }" not found` );
	}

	const { model: targetModel } = targetResult;
	const targetCollection = targetModel.get( 'elements' ) as V1Collection | undefined;

	if ( ! targetCollection ) {
		throw new Error( `Container with ID "${ containerId }" has no elements collection` );
	}

	const insertAt = options.at;

	targetCollection.add( modelData as unknown as V1Model, insertAt !== undefined ? { at: insertAt } : {}, true );

	const elementId = modelData?.id;

	if ( ! elementId ) {
		throw new Error( 'Model data must have an id when creating via model fallback' );
	}

	const container = getContainer( elementId );

	if ( container ) {
		return container;
	}

	return {
		id: elementId,
		model: modelData as unknown as V1Model,
		settings: modelData?.settings ?? {},
	} as V1Element;
}
