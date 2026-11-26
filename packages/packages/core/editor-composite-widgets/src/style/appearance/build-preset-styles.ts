import { type ElementStylesEntry } from '@elementor/editor-canvas';
import {
	getElementLocalStyle,
	getElementStylesInheritance,
	makeBreakpointsInheritancePaths,
} from '@elementor/editor-editing-panel';
import { type ElementID } from '@elementor/editor-elements';
import { type Props, type PropValue } from '@elementor/editor-props';
import { type BreakpointId, getBreakpointsTree } from '@elementor/editor-responsive';

import { type CompositeWidgetPresetOption, type CompositeWidgetPresetWrite } from '../../types';
import { type WidgetPartContainers } from './get-widget-part-containers';
import { mergePresetValue, resolvePresetProps } from './preset-values';

type BreakpointsPaths = ReturnType< typeof makeBreakpointsInheritancePaths >;

type BuildPresetStylesArgs = {
	option: CompositeWidgetPresetOption;
	containers: WidgetPartContainers;
	breakpoint: BreakpointId;
};

export function buildPresetStyles( { option, containers, breakpoint }: BuildPresetStylesArgs ): ElementStylesEntry[] {
	const paths = makeBreakpointsInheritancePaths( getBreakpointsTree() );

	return option.set.flatMap( ( entry ) => {
		const container = containers[ entry.part ];

		if ( ! container ) {
			return [];
		}

		const variants = getBreakpointsToWrite( entry, breakpoint, paths ).map( ( writeBreakpoint ) => {
			const presetProps =
				writeBreakpoint === breakpoint
					? resolvePresetProps( entry.style, [ ...paths[ breakpoint ], breakpoint ] )
					: entry.style[ writeBreakpoint ] ?? {};

			return {
				meta: { breakpoint: writeBreakpoint, state: null },
				props: mergeIntoLocalValues( container.id, writeBreakpoint, presetProps ),
			};
		} );

		return [ { container, variants } ];
	} );
}

function getBreakpointsToWrite(
	entry: CompositeWidgetPresetWrite,
	breakpoint: BreakpointId,
	paths: BreakpointsPaths
): BreakpointId[] {
	const explicitDescendants = ( Object.keys( paths ) as BreakpointId[] ).filter(
		( candidate ) => paths[ candidate ].includes( breakpoint ) && entry.style[ candidate ]
	);

	return [ breakpoint, ...explicitDescendants ];
}

function mergeIntoLocalValues( elementId: ElementID, breakpoint: BreakpointId, presetProps: Props ): Props {
	const localStyleId = getElementLocalStyle( elementId )?.styleId;
	const snapshot = getElementStylesInheritance( elementId )?.getSnapshot( { breakpoint, state: null } );

	const getLocalValue = ( prop: string ): PropValue | undefined =>
		snapshot?.[ prop ]?.find( ( { style } ) => style.id === localStyleId )?.value;

	return Object.fromEntries(
		Object.entries( presetProps ).map( ( [ prop, value ] ) => [
			prop,
			mergePresetValue( prop, getLocalValue( prop ), value ),
		] )
	);
}
