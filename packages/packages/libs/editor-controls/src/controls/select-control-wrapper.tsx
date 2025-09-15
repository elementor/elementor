import * as React from 'react';
import { useEffect, useState } from 'react';
import { __ } from '@wordpress/i18n';

import { createControl } from '../create-control';
import { SelectControl, type SelectOption } from './select-control';

type ExtendedWindow = Window & {
	elementor: { $previewContents: [ HTMLIFrameElement ]; config: { document: { id: string } } };
};

const getOffCanvasElements = () => {
	const extendedWindow = window as unknown as ExtendedWindow;
	const documentId = extendedWindow.elementor.config.document.id;
	const offCanvasElements = extendedWindow.elementor.$previewContents[ 0 ].querySelectorAll(
		`[data-elementor-id="${ documentId }"] .elementor-widget-off-canvas.elementor-element-edit-mode`
	);

	const result = Array.from( offCanvasElements as unknown as HTMLElement[] ).map( ( offCanvasElement ) => {
		return {
			label: offCanvasElement.querySelector( '.e-off-canvas' )?.getAttribute( 'aria-label' ) ?? '',
			value: offCanvasElement.dataset.id,
		} as SelectOption;
	} );

	return [
		{
			label: __( 'Select a widget', 'elementor' ),
			value: 'select',
			disabled: true,
		},
		...result,
	];
};

const collectionMethods = {
	'off-canvas': getOffCanvasElements,
} as const;

type SelectControlWrapperProps = Parameters< typeof SelectControl >[ 0 ] & {
	collectionId?: keyof typeof collectionMethods;
};

const useDynamicOptions = (
	collectionId?: keyof typeof collectionMethods,
	initialOptions?: SelectControlWrapperProps[ 'options' ]
) => {
	const [ options, setOptions ] = useState< SelectControlWrapperProps[ 'options' ] >( initialOptions ?? [] );

	useEffect( () => {
		if ( ! collectionId || ! collectionMethods[ collectionId ] ) {
			setOptions( initialOptions ?? [] );
			return;
		}
		setOptions( collectionMethods[ collectionId ]() );
	}, [ collectionId, initialOptions ] );

	return options;
};

export const SelectControlWrapper = createControl(
	( { collectionId, options, ...props }: SelectControlWrapperProps ) => {
		const actualOptions = useDynamicOptions( collectionId, options );

		return <SelectControl options={ actualOptions } { ...props } />;
	}
);
