import { __privateRunCommandSync as runCommandSync } from '@elementor/editor-v1-adapters';

import { getContainer, getRealContainer } from './get-container';
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
	const realContainer = getRealContainer( containerId );

	if ( realContainer ) {
		return createElementViaContainer( { container: realContainer, model, options } );
	}

	return createElementViaModel( { containerId, model, options } );
}

function createElementViaContainer( {
	container,
	model,
	options,
}: {
	container: NonNullable< ReturnType< typeof getRealContainer > >;
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

	const newModel = createModelFromData( modelData );
	const insertAt = options.at;

	if ( insertAt !== undefined ) {
		targetCollection.add( newModel, { at: insertAt }, true );
	} else {
		targetCollection.add( newModel, {}, true );
	}

	const elementId = modelData?.id ?? newModel.get( 'id' );
	const container = getContainer( elementId );

	if ( container ) {
		return container;
	}

	return {
		id: elementId,
		model: newModel,
		settings: newModel.get( 'settings' ) ?? {},
	} as V1Element;
}

function createModelFromData( modelData: CreateElementParams[ 'model' ] ): V1Model {
	return modelData as unknown as V1Model;
}
