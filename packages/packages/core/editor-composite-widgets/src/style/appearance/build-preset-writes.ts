import { type StyleWrite } from '@elementor/editor-editing-panel';
import { type Props } from '@elementor/editor-props';
import { type BreakpointId, type BreakpointNode } from '@elementor/editor-responsive';

import { type CompositeWidgetPresetOption, type CompositeWidgetPresetWrite } from '../../types';
import { type PresetPart, type PresetParts } from './get-preset-parts';
import { mergePresetValue } from './preset-values';
import { getBreakpointPath, getDescendantBreakpoints, resolvePropsAtPath } from './resolve-breakpoint-value';

export type PresetContext = {
	parts: PresetParts;
	breakpoint: BreakpointId;
	breakpointsTree: BreakpointNode;
};

type BuildPresetWritesArgs = PresetContext & {
	option: CompositeWidgetPresetOption;
};

export function buildPresetWrites( {
	option,
	parts,
	breakpoint,
	breakpointsTree,
}: BuildPresetWritesArgs ): StyleWrite[] {
	return option.set.flatMap( ( entry ) => {
		const part = parts[ entry.part ];

		if ( ! part ) {
			return [];
		}

		return getBreakpointsToWrite( entry, breakpoint, breakpointsTree ).flatMap( ( writeBreakpoint ) => {
			const path = getBreakpointPath( breakpointsTree, writeBreakpoint );
			const presetProps =
				writeBreakpoint === breakpoint
					? resolvePropsAtPath( entry.style, path )
					: entry.style[ writeBreakpoint ] ?? {};

			return Object.keys( presetProps ).length
				? [
						{
							target: part.target,
							meta: { breakpoint: writeBreakpoint, state: null },
							props: mergeIntoCurrent( part, path, presetProps ),
						},
				  ]
				: [];
		} );
	} );
}

function getBreakpointsToWrite(
	entry: CompositeWidgetPresetWrite,
	breakpoint: BreakpointId,
	breakpointsTree: BreakpointNode
): BreakpointId[] {
	const explicitDescendants = getDescendantBreakpoints( breakpointsTree, breakpoint ).filter(
		( descendant ) => entry.style[ descendant ]
	);

	return [ breakpoint, ...explicitDescendants ];
}

function mergeIntoCurrent( part: PresetPart, path: BreakpointId[], presetProps: Props ): Props {
	const current = resolvePropsAtPath( part.propsByBreakpoint, path );

	return Object.fromEntries(
		Object.entries( presetProps ).map( ( [ key, value ] ) => [ key, mergePresetValue( current[ key ], value ) ] )
	);
}
