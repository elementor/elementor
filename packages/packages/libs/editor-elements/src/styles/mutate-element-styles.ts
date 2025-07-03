import { classesPropTypeUtil, type ClassesPropValue } from '@elementor/editor-props';
import { type StyleDefinition, type StyleDefinitionsMap } from '@elementor/editor-styles';
import { __privateRunCommandSync as runCommandSync } from '@elementor/editor-v1-adapters';

import { ElementNotFoundError } from '../errors';
import { getContainer } from '../sync/get-container';
import { type V1Element } from '../sync/types';
import { updateElementSettings } from '../sync/update-element-settings';
import { type ElementID } from '../types';
import { ELEMENT_STYLE_CHANGE_EVENT } from './consts';

type Mutator = ( styles: StyleDefinitionsMap ) => StyleDefinitionsMap;

export function mutateElementStyles( elementId: ElementID, mutator: Mutator ) {
	const container = getContainer( elementId );

	if ( ! container ) {
		throw new ElementNotFoundError( { context: { elementId } } );
	}

	const oldIds = Object.keys( container.model.get( 'styles' ) ?? {} );

	const styles = mutateStyles( container, mutator );

	const newIds = Object.keys( styles );

	clearRemovedClasses( container, {
		oldIds,
		newIds,
	} );

	notifyChanges();

	return styles;
}

function mutateStyles( container: V1Element, mutator: Mutator ) {
	const styles: StyleDefinitionsMap = structuredClone( container.model.get( 'styles' ) ) ?? {};

	const entries = Object.entries( mutator( styles ) )
		.map( ( [ styleId, style ] ) => {
			style.variants = removeEmptyVariants( style );

			return [ styleId, style ] as const;
		} )
		.filter( ( [ , style ] ) => {
			return ! isStyleEmpty( style );
		} );

	const mutatedStyles = Object.fromEntries( entries );

	container.model.set( 'styles', mutatedStyles );

	return mutatedStyles;
}

function removeEmptyVariants( style: StyleDefinition ) {
	return style.variants.filter( ( { props } ) => Object.keys( props ).length > 0 );
}

function isStyleEmpty( style: StyleDefinition ) {
	return style.variants.length === 0;
}

function clearRemovedClasses( container: V1Element, { oldIds, newIds }: { oldIds: string[]; newIds: string[] } ) {
	const removedIds = oldIds.filter( ( id ) => ! newIds.includes( id ) );
	const classesProps = structuredClone( getClassesProps( container ) );

	classesProps.forEach( ( [ , prop ] ) => {
		prop.value = prop.value.filter( ( value ) => ! removedIds.includes( value ) );
	} );

	updateElementSettings( {
		id: container.id,
		props: Object.fromEntries( classesProps ),
		withHistory: false,
	} );
}

function getClassesProps( container: V1Element ) {
	return Object.entries( container.settings.toJSON() ).filter( ( prop ): prop is [ string, ClassesPropValue ] => {
		const [ , value ] = prop;

		return classesPropTypeUtil.isValid( value );
	} );
}

function notifyChanges() {
	dispatchChangeEvent();
	runCommandSync( 'document/save/set-is-modified', { status: true }, { internal: true } );
}

function dispatchChangeEvent() {
	window.dispatchEvent( new CustomEvent( ELEMENT_STYLE_CHANGE_EVENT ) );
}
