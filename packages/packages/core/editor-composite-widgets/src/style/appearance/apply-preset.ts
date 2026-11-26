import { undoableApplyElementStyles } from '@elementor/editor-canvas';
import { type ElementID } from '@elementor/editor-elements';
import { type BreakpointId } from '@elementor/editor-responsive';

import { type CompositeWidgetPreset } from '../../types';
import { getWidgetPartContainers } from '../use-widget-part-containers';
import { buildPresetStyles } from './build-preset-styles';
import { getPresetPartNames } from './preset-values';

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

	const entries = buildPresetStyles( {
		option,
		containers: getWidgetPartContainers( rootId, getPresetPartNames( preset ) ),
		breakpoint,
	} );

	if ( ! entries.length ) {
		return;
	}

	undoableApplyElementStyles()( { entries, subtitle: preset.label } );
}
