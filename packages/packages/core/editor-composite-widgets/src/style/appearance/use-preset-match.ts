import { type ElementID, styleRerenderEvents } from '@elementor/editor-elements';
import { getBreakpointsTree, useActiveBreakpoint } from '@elementor/editor-responsive';
import { __privateUseListenTo as useListenTo, commandEndEvent } from '@elementor/editor-v1-adapters';

import { type CompositeWidgetPreset, type CompositeWidgetPresetOption } from '../../types';
import { type PresetContext } from './build-preset-writes';
import { getPresetParts } from './get-preset-parts';
import { matchesPresetValue } from './preset-values';
import { DESKTOP_BREAKPOINT, getBreakpointPath, resolvePropsAtPath } from './resolve-breakpoint-value';

export function usePresetMatch( rootId: ElementID, preset: CompositeWidgetPreset ): string | null {
	const breakpoint = useActiveBreakpoint() ?? DESKTOP_BREAKPOINT;
	const parts = useListenTo(
		[
			...styleRerenderEvents,
			commandEndEvent( 'document/elements/create' ),
			commandEndEvent( 'document/elements/delete' ),
		],
		() => getPresetParts( rootId, preset ),
		[ rootId, preset ]
	);

	return findMatchingPresetOption( {
		options: preset.options,
		parts,
		breakpoint,
		breakpointsTree: getBreakpointsTree(),
	} );
}

export function findMatchingPresetOption( {
	options,
	parts,
	breakpoint,
	breakpointsTree,
}: PresetContext & { options: CompositeWidgetPresetOption[] } ): string | null {
	const path = getBreakpointPath( breakpointsTree, breakpoint );

	const isMatch = ( option: CompositeWidgetPresetOption ) => {
		const presentEntries = option.set.flatMap( ( entry ) => {
			const part = parts[ entry.part ];

			return part ? [ { entry, part } ] : [];
		} );

		return (
			presentEntries.length > 0 &&
			presentEntries.every( ( { entry, part } ) => {
				const current = resolvePropsAtPath( part.propsByBreakpoint, path );

				return Object.entries( resolvePropsAtPath( entry.style, path ) ).every( ( [ key, value ] ) =>
					matchesPresetValue( current[ key ], value )
				);
			} )
		);
	};

	return options.find( isMatch )?.id ?? null;
}
