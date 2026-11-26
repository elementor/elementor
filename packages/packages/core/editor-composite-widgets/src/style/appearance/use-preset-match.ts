import {
	getElementStylesInheritance,
	isEqual,
	makeBreakpointsInheritancePaths,
	type StylesInheritanceAPI,
	type StylesInheritanceSnapshot,
} from '@elementor/editor-editing-panel';
import { type ElementID, styleRerenderEvents } from '@elementor/editor-elements';
import { isTransformable, type ObjectPropValue, type PropValue } from '@elementor/editor-props';
import { type BreakpointId, getBreakpointsTree } from '@elementor/editor-responsive';
import { getStylesSchema } from '@elementor/editor-styles';
import { __privateUseListenTo as useListenTo, commandEndEvent } from '@elementor/editor-v1-adapters';

import { type CompositeWidgetPreset, type CompositeWidgetPresetOption } from '../../types';
import { getWidgetPartContainers, type WidgetPartContainers } from './get-widget-part-containers';
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
	return useListenTo(
		[
			...styleRerenderEvents,
			commandEndEvent( 'document/elements/set-settings' ),
			commandEndEvent( 'document/elements/create' ),
			commandEndEvent( 'document/elements/delete' ),
		],
		() =>
			findMatchingPresetOption( {
				options: preset.options,
				containers: getWidgetPartContainers( rootId, getPresetPartNames( preset ) ),
				breakpoint,
			} ),
		[ rootId, preset, breakpoint ]
	);
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
