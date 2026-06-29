import * as React from 'react';
import { useEffect, useState } from 'react';

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

	return Array.from( offCanvasElements as unknown as HTMLElement[] ).map( ( offCanvasElement ) => {
		return {
			label: offCanvasElement.querySelector( '.e-off-canvas' )?.getAttribute( 'aria-label' ) ?? '',
			value: offCanvasElement.dataset.id,
		} as SelectOption;
	} );
};

const getFormElements = () => {
	const extendedWindow = window as unknown as ExtendedWindow;
	const documentId = extendedWindow.elementor.config.document.id;
	const selectors = [
		`[data-elementor-id="${ documentId }"] input[id]:not([type="hidden"]):not([type="reset"]):not([type="button"])`,
		`[data-elementor-id="${ documentId }"] select[id]`,
		`[data-elementor-id="${ documentId }"] textarea[id]`,
	];
	const formElements = extendedWindow.elementor.$previewContents[ 0 ].querySelectorAll<
		HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
	>( selectors.join( ', ' ) );

	return Array.from( formElements ).map( ( formElement ) => {
		const tagName = formElement.tagName.toLowerCase();
		return {
			label: `${ formElement.id } (${ tagName === 'input' ? formElement.getAttribute( 'type' ) : tagName })`,
			value: formElement.id,
		} as SelectOption;
	} );
};

const collectionMethods = {
	'off-canvas': getOffCanvasElements,
	'form-elements': getFormElements,
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
