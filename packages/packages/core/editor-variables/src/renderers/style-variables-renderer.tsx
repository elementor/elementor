import * as React from 'react';
import { useEffect, useState } from 'react';
import { __privateUseListenTo as useListenTo, commandEndEvent } from '@elementor/editor-v1-adapters';
import { Portal } from '@elementor/ui';

import { styleVariablesRepository } from '../style-variables-repository';
import { getCanvasIframeDocument } from '../sync/get-canvas-iframe-document';
import { type StyleVariables, type Variable } from '../types';

const VARIABLES_WRAPPER = 'body';

export function StyleVariablesRenderer() {
	const container = usePortalContainer();
	const styleVariables = useStyleVariables();

	const hasVariables = Object.keys( styleVariables ).length > 0;

	if ( ! container || ! hasVariables ) {
		return null;
	}

	const cssVariables = convertToCssVariables( styleVariables );
	const wrappedCss = `${ VARIABLES_WRAPPER }{${ cssVariables }}`;

	return (
		<Portal container={ container }>
			<style data-e-style-id="e-variables" key={ wrappedCss }>
				{ wrappedCss }
			</style>
		</Portal>
	);
}

function usePortalContainer() {
	return useListenTo( commandEndEvent( 'editor/documents/attach-preview' ), () => getCanvasIframeDocument()?.head );
}

function useStyleVariables() {
	const [ variables, setVariables ] = useState< StyleVariables >( {} );

	useEffect( () => {
		const unsubscribe = styleVariablesRepository.subscribe( setVariables );

		return () => {
			unsubscribe();
		};
	}, [] );

	return variables;
}

function cssVariableDeclaration( key: string, variable: Variable ) {
	const variableName = variable?.deleted ? key : variable.label;
	const value = variable.value;

	return `--${ variableName }:${ value };`;
}

function convertToCssVariables( variables: StyleVariables ): string {
	const listOfVariables = Object.entries( variables );
	return listOfVariables.map( ( [ key, variable ] ) => cssVariableDeclaration( key, variable ) ).join( '' );
}
