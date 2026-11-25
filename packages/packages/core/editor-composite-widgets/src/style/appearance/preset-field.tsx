import * as React from 'react';
import { ControlFormLabel } from '@elementor/editor-controls';
import { type ElementID } from '@elementor/editor-elements';
import { useActiveBreakpoint } from '@elementor/editor-responsive';
import { Grid, Stack, type Theme, Typography } from '@elementor/ui';

import { type CompositeWidgetPreset } from '../../types';
import { applyPreset } from './apply-preset';
import { getPresetControlType, type PresetControlType } from './get-preset-control-type';
import { CUSTOM_LABEL, type PresetControlProps, PresetSelect, PresetToggle } from './preset-controls';
import { DESKTOP_BREAKPOINT } from './resolve-breakpoint-value';
import { usePresetMatch } from './use-preset-match';

type PresetControlConfig = {
	Control: React.ComponentType< PresetControlProps >;
	direction: 'row' | 'column';
	showsCustomInLabel: boolean;
};

const PRESET_CONTROLS: Record< PresetControlType, PresetControlConfig > = {
	'inline-toggle': { Control: PresetToggle, direction: 'row', showsCustomInLabel: true },
	'full-width-toggle': { Control: PresetToggle, direction: 'column', showsCustomInLabel: true },
	select: { Control: PresetSelect, direction: 'row', showsCustomInLabel: false },
};

type Props = {
	rootId: ElementID;
	preset: CompositeWidgetPreset;
};

export function PresetField( { rootId, preset }: Props ) {
	const matchedOptionId = usePresetMatch( rootId, preset );
	const breakpoint = useActiveBreakpoint() ?? DESKTOP_BREAKPOINT;
	const { Control, direction, showsCustomInLabel } = PRESET_CONTROLS[ getPresetControlType( preset ) ];

	const label = <PresetLabel label={ preset.label } isCustom={ showsCustomInLabel && matchedOptionId === null } />;
	const control = (
		<Control
			preset={ preset }
			value={ matchedOptionId }
			onChange={ ( optionId ) => applyPreset( { rootId, preset, optionId, breakpoint } ) }
		/>
	);

	if ( direction === 'column' ) {
		return (
			<Stack gap={ 0.75 } aria-label={ `${ preset.label } control` }>
				{ label }
				{ control }
			</Stack>
		);
	}

	return (
		<Grid container gap={ 2 } alignItems="center" flexWrap="nowrap" aria-label={ `${ preset.label } control` }>
			<Grid item xs={ 6 }>
				{ label }
			</Grid>
			<Grid item xs={ 6 } sx={ ( theme: Theme ) => ( { width: `calc(50% - ${ theme.spacing( 2 ) })` } ) }>
				{ control }
			</Grid>
		</Grid>
	);
}

function PresetLabel( { label, isCustom }: { label: string; isCustom: boolean } ) {
	return (
		<Stack direction="row" alignItems="center" gap={ 0.5 }>
			<ControlFormLabel>{ label }</ControlFormLabel>
			{ isCustom && (
				<Typography variant="caption" color="text.tertiary">
					{ CUSTOM_LABEL }
				</Typography>
			) }
		</Stack>
	);
}
