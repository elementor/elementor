import { undoable } from '@elementor/editor-v1-adapters';
import { __ } from '@wordpress/i18n';

import { createElement, type CreateElementParams } from './create-element';
import { deleteElement } from './delete-element';
import { getContainer } from './get-container';
import { type ExtendedWindow, type V1Element, type V1ElementModelProps } from './types';

type CreateElementsParams = {
	elements: CreateElementParams[];
	title: string;
	subtitle?: string;
};

type CreatedElement = {
	container: V1Element;
	containerId: string;
	parentContainer: V1Element;
	parentContainerId: string;
	model: V1ElementModelProps;
	options?: CreateElementParams[ 'options' ];
};

type CreatedElementsResult = {
	createdElements: CreatedElement[];
};

export type { CreateElementsParams, CreatedElement, CreatedElementsResult };

function getDocumentContainer(): V1Element | null {
	const extendedWindow = window as unknown as ExtendedWindow;

	return extendedWindow.elementor?.documents?.getCurrent?.()?.container ?? null;
}

function findModelById(
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	elements: any,
	id: string
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
): any | null {
	if ( ! elements ) {
		return null;
	}

	const models = elements.models ?? elements;

	if ( ! Array.isArray( models ) ) {
		return null;
	}

	for ( const model of models ) {
		const modelId = typeof model.get === 'function' ? model.get( 'id' ) : model.id;

		if ( modelId === id ) {
			return model;
		}

		const childElements = typeof model.get === 'function' ? model.get( 'elements' ) : model.elements;
		const found = findModelById( childElements, id );

		if ( found ) {
			return found;
		}
	}

	return null;
}

function addModelToParent(
	parentModelId: string,
	childModelData: V1ElementModelProps,
	options?: CreateElementParams[ 'options' ]
): boolean {
	const doc = getDocumentContainer();

	if ( ! doc?.model ) {
		return false;
	}

	const elements = doc.model.get( 'elements' as never );
	const parentModel = findModelById( elements, parentModelId );

	if ( ! parentModel ) {
		return false;
	}

	const parentElements = typeof parentModel.get === 'function' ? parentModel.get( 'elements' ) : null;

	if ( ! parentElements ) {
		return false;
	}

	const addOptions: Record< string, unknown > = { silent: true };

	if ( options?.at !== undefined ) {
		addOptions.at = options.at;
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	( parentElements as any ).add( childModelData, addOptions, true );

	return true;
}

function resolveContainer( container: V1Element, id: string ): V1Element | null {
	const looked = container.lookup?.();

	if ( looked?.view?.el?.isConnected ) {
		return looked;
	}

	return getContainer( id );
}

export const createElements = ( {
	elements,
	title,
	subtitle = __( 'Item added', 'elementor' ),
}: CreateElementsParams ): CreatedElementsResult => {
	const undoableCreate = undoable(
		{
			do: ( { elements: elementsParam }: { elements: CreateElementParams[] } ): CreatedElementsResult => {
				const createdElements: CreatedElement[] = [];

				elementsParam.forEach( ( { container, options, ...elementParams } ) => {
					const parentContainer = container.lookup?.() ?? container;

					if ( ! parentContainer ) {
						throw new Error( 'Parent container not found' );
					}

					const element = createElement( {
						container: parentContainer,
						...elementParams,
						options: { ...options, useHistory: false },
					} );

					createdElements.push( {
						container: element,
						containerId: element.id,
						parentContainer,
						parentContainerId: parentContainer.id,
						model: element.model?.toJSON() || {},
						options,
					} );
				} );

				return { createdElements };
			},
			undo: ( _: { elements: CreateElementParams[] }, { createdElements }: CreatedElementsResult ) => {
				[ ...createdElements ].reverse().forEach( ( { container, containerId } ) => {
					const freshContainer = resolveContainer( container, containerId );

					if ( freshContainer ) {
						deleteElement( {
							container: freshContainer,
							options: { useHistory: false },
						} );
					}
				} );
			},
			redo: (
				_: { elements: CreateElementParams[] },
				{ createdElements }: CreatedElementsResult
			): CreatedElementsResult => {
				const newElements: CreatedElement[] = [];

				createdElements.forEach( ( { parentContainer, parentContainerId, model, options } ) => {
					const freshParent = resolveContainer( parentContainer, parentContainerId );

					if ( freshParent ) {
						const element = createElement( {
							container: freshParent,
							model,
							options: { ...options, useHistory: false },
						} );

						newElements.push( {
							container: element,
							containerId: element.id,
							parentContainer: freshParent,
							parentContainerId,
							model: element.model.toJSON(),
							options,
						} );

						return;
					}

					if ( addModelToParent( parentContainerId, model, options ) ) {
						newElements.push( {
							container: parentContainer,
							containerId: model.id,
							parentContainer,
							parentContainerId,
							model,
							options,
						} );
					}
				} );

				return { createdElements: newElements };
			},
		},
		{
			title,
			subtitle,
		}
	);

	return undoableCreate( { elements } );
};
