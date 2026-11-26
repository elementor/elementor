import * as React from 'react';
import { ControlFormLabel } from '@elementor/editor-controls';
import { type ElementID } from '@elementor/editor-elements';
import { Grid, Stack, type Theme, Typography } from '@elementor/ui';

import { type CompositeWidgetPreset } from '../../types';
import { getPresetControlType, type PresetControlType } from './get-preset-control-type';
import { PresetProvider, usePreset } from './preset-context';
import { CUSTOM_LABEL, PresetSelect, PresetToggle } from './preset-controls';

type PresetLayout = 'row' | 'column';

type PresetControl = {
	Control: React.ComponentType;
	layout: PresetLayout;
	showsCustomInLabel: boolean;
};

const PRESET_CONTROLS: Record< PresetControlType, PresetControl > = {
	'inline-toggle': { Control: PresetToggle, layout: 'row', showsCustomInLabel: true },
	'full-width-toggle': { Control: PresetToggle, layout: 'column', showsCustomInLabel: true },
	select: { Control: PresetSelect, layout: 'row', showsCustomInLabel: false },
};

export function getPresetControl( preset: CompositeWidgetPreset ): PresetControl {
	return PRESET_CONTROLS[ getPresetControlType( preset ) ];
}

type Props = {
	rootId: ElementID;
	preset: CompositeWidgetPreset;
};

export function PresetField( { rootId, preset }: Props ) {
	return (
		<PresetProvider rootId={ rootId } preset={ preset }>
			<PresetFieldContent />
		</PresetProvider>
	);
}

function PresetFieldContent() {
	const { preset, matchedOptionId } = usePreset();
	const { Control, layout, showsCustomInLabel } = getPresetControl( preset );

	return (
		<PresetFieldLayout
			layout={ layout }
			ariaLabel={ `${ preset.label } control` }
			label={ <PresetLabel label={ preset.label } isCustom={ showsCustomInLabel && matchedOptionId === null } /> }
		>
			<Control />
		</PresetFieldLayout>
	);
}

type PresetFieldLayoutProps = React.PropsWithChildren< {
	layout: PresetLayout;
	label: React.ReactNode;
	ariaLabel: string;
} >;

function PresetFieldLayout( { layout, label, ariaLabel, children }: PresetFieldLayoutProps ) {
	if ( layout === 'column' ) {
		return (
			<Stack gap={ 0.75 } aria-label={ ariaLabel }>
				{ label }
				{ children }
			</Stack>
		);
	}

	return (
		<Grid container gap={ 2 } alignItems="center" flexWrap="nowrap" aria-label={ ariaLabel }>
			<Grid item xs={ 6 }>
				{ label }
			</Grid>
			<Grid item xs={ 6 } sx={ ( theme: Theme ) => ( { width: `calc(50% - ${ theme.spacing( 2 ) })` } ) }>
				{ children }
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
