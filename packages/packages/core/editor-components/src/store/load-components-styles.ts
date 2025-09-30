import { type V1ElementData } from '@elementor/editor-elements';
import { type StyleDefinition } from '@elementor/editor-styles';
import { __dispatch as dispatch, __getState as getState } from '@elementor/store';

import { type Element } from '../types';
import { getComponentIds } from '../utils/get-component-ids';
import { selectStyleDefinitionsData, slice } from './store';
import { loadStyles } from './thunks';

type ComponentId = number;

export async function loadComponentsStyles( elements: Element[] ) {
	console.log( 'LOG:: enter load' );
	const componentIds = Array.from( new Set( getComponentIds( elements ) ) );

	if ( ! componentIds.length ) {
		console.error( 'No components found in the document' );
		return;
	}

	const knownComponents = selectStyleDefinitionsData( getState() );
	console.log( 'LOG:: knownComponents', knownComponents );

	const unknownComponentIds = componentIds.filter( ( id ) => ! knownComponents[ id ] );

	if ( ! unknownComponentIds.length ) {
		return;
	}

	console.log( 'LOG:: unknownComponentIds', unknownComponentIds );

	addComponentStyles( unknownComponentIds );
}

export async function addComponentStyles( ids: ComponentId[] ) {
	console.log( 'LOG:: enter addComponentStyles' );
	const newComponents = await loadStyles( ids );
	// dispatch( newComponents );
	console.log( 'LOG:: newComponents', newComponents );

	addStyles( newComponents );

	// Object.values( newComponents ).forEach( ( [ , data ] ) => {
	// 	loadComponentsStyles( data.elements as Element[] );
	// } );
}

function addStyles( data: ( readonly [ ComponentId, V1ElementData ] )[] ) {
	console.log( 'LOG:: enter addComponentStyles', data );

	const styles = data.map( ( [ componentId, componentData ] ) => [ componentId, extractStyles( componentData ) ] );
	console.log( styles );

	dispatch( slice.actions.addStyles( styles ) );
}

function extractStyles( element: V1ElementData ): Array< StyleDefinition > {
	console.log( 'LOG:: enter extractStyles' );
	return [ ...Object.values( element.styles ?? {} ), ...( element.elements ?? [] ).flatMap( extractStyles ) ];
}
