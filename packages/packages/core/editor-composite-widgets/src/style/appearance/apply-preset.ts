import { createUndoableUpdateStyles } from '@elementor/editor-editing-panel';
import { type ElementID } from '@elementor/editor-elements';
import { type BreakpointId, getBreakpointsTree } from '@elementor/editor-responsive';

import { type CompositeWidgetPreset } from '../../types';
import { buildPresetWrites } from './build-preset-writes';
import { getPresetParts } from './get-preset-parts';

type ApplyPresetArgs = {
	rootId: ElementID;
	preset: CompositeWidgetPreset;
	optionId: string;
	breakpoint: BreakpointId;
};

export function applyPreset( { rootId, preset, optionId, breakpoint }: ApplyPresetArgs ) {
	const option = preset.options.find( ( { id } ) => id === optionId );

	if ( ! option ) {
		return;
	}

	const writes = buildPresetWrites( {
		option,
		parts: getPresetParts( rootId, preset ),
		breakpoint,
		breakpointsTree: getBreakpointsTree(),
	} );

	if ( ! writes.length ) {
		return;
	}

	createUndoableUpdateStyles()( { writes, propDisplayName: preset.label } );
}
