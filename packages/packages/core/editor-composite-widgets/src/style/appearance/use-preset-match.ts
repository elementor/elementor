import { useMemo } from 'react';
import {
	getElementStylesInheritance,
	isEqual,
	makeBreakpointsInheritancePaths,
	type StylesInheritanceAPI,
	type StylesInheritanceSnapshot,
} from '@elementor/editor-editing-panel';
import { type ElementID } from '@elementor/editor-elements';
import { isTransformable, type ObjectPropValue, type PropValue } from '@elementor/editor-props';
import { type BreakpointId, getBreakpointsTree } from '@elementor/editor-responsive';
import { getStylesSchema } from '@elementor/editor-styles';

import { type CompositeWidgetPreset, type CompositeWidgetPresetOption } from '../../types';
import { useWidgetPartContainers, type WidgetPartContainers } from '../use-widget-part-containers';
import { getPresetPartNames, isObjectStyleProp, resolvePresetProps } from './preset-values';

type PartStyles = {
	inheritance: StylesInheritanceAPI;
	snapshot: StylesInheritanceSnapshot;
};

type FindMatchingPresetOptionArgs = {
	options: CompositeWidgetPresetOption[];
	containers: WidgetPartContainers;
	breakpoint: BreakpointId;
};

export function usePresetMatch( rootId: ElementID, preset: CompositeWidgetPreset, breakpoint: BreakpointId ) {
	const parts = useMemo( () => getPresetPartNames( preset ), [ preset ] );
	const containers = useWidgetPartContainers( rootId, parts );

	return findMatchingPresetOption( { options: preset.options, containers, breakpoint } );
}

export function findMatchingPresetOption( {
	options,
	containers,
	breakpoint,
}: FindMatchingPresetOptionArgs ): string | null {
	const paths = makeBreakpointsInheritancePaths( getBreakpointsTree() );
	const path = [ ...( paths[ breakpoint ] ?? [] ), breakpoint ];
	const partStyles = getPartStyles( containers, breakpoint );

	const isMatch = ( option: CompositeWidgetPresetOption ) => {
		const presentEntries = option.set.flatMap( ( entry ) => {
			const styles = partStyles[ entry.part ];

			return styles ? [ { entry, styles } ] : [];
		} );

		return (
			presentEntries.length > 0 &&
			presentEntries.every( ( { entry, styles } ) =>
				Object.entries( resolvePresetProps( entry.style, path ) ).every( ( [ prop, value ] ) =>
					matchesEffectiveValue( styles, prop, value )
				)
			)
		);
	};

	return options.find( isMatch )?.id ?? null;
}

function getPartStyles(
	containers: WidgetPartContainers,
	breakpoint: BreakpointId
): Partial< Record< string, PartStyles > > {
	return Object.fromEntries(
		Object.entries( containers ).flatMap( ( [ part, container ] ) => {
			const inheritance = container ? getElementStylesInheritance( container.id ) : null;
			const snapshot = inheritance?.getSnapshot( { breakpoint, state: null } );

			return inheritance && snapshot ? [ [ part, { inheritance, snapshot } ] ] : [];
		} )
	);
}

function matchesEffectiveValue( { inheritance, snapshot }: PartStyles, prop: string, value: PropValue ): boolean {
	if ( ! isObjectStyleProp( prop ) || ! isTransformable( value ) ) {
		return isEqual( snapshot[ prop ]?.[ 0 ]?.value, value );
	}

	const propType = getStylesSchema()?.[ prop ];

	return Object.entries( ( value as ObjectPropValue ).value ).every( ( [ key, nestedValue ] ) =>
		isEqual( inheritance.getInheritanceChain( snapshot, [ prop, key ], propType )[ 0 ]?.value, nestedValue )
	);
}
