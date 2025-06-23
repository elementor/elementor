import * as React from 'react';
import { type RefObject, useRef } from 'react';
import { AspectRatioControl, type ExtendedOption, SizeControl } from '@elementor/editor-controls';
import type { StringPropValue } from '@elementor/editor-props';
import { isExperimentActive } from '@elementor/editor-v1-adapters';
import { Grid, Stack } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { StylesField, type StylesFieldProps } from '../../../controls-registry/styles-field';
import { useStylesField } from '../../../hooks/use-styles-field';
import { ControlLabel } from '../../control-label';
import { PanelDivider } from '../../panel-divider';
import { SectionContent } from '../../section-content';
import { StyleTabCollapsibleContent } from '../../style-tab-collapsible-content';
import { ObjectFitField } from './object-fit-field';
import { ObjectPositionField } from './object-position-field';
import { OverflowField } from './overflow-field';

const EXPERIMENT_ID = 'e_v_3_30';

const CssSizeProps = [
	[
		{
			bind: 'width',
			label: __( 'Width', 'elementor' ),
		},
		{
			bind: 'height',
			label: __( 'Height', 'elementor' ),
		},
	],
	[
		{
			bind: 'min-width',
			label: __( 'Min width', 'elementor' ),
		},
		{
			bind: 'min-height',
			label: __( 'Min height', 'elementor' ),
		},
	],
	[
		{
			bind: 'max-width',
			label: __( 'Max width', 'elementor' ),
		},
		{
			bind: 'max-height',
			label: __( 'Max height', 'elementor' ),
		},
	],
];

const ASPECT_RATIO_LABEL = __( 'Aspect Ratio', 'elementor' );
const OBJECT_FIT_LABEL = __( 'Object fit', 'elementor' );

export const SizeSection = () => {
	const { value: fitValue } = useStylesField< StringPropValue >( 'object-fit', {
		history: { propDisplayName: OBJECT_FIT_LABEL },
	} );

	const isNotFill = fitValue && fitValue?.value !== 'fill';

	const gridRowRefs: RefObject< HTMLDivElement >[] = [ useRef( null ), useRef( null ), useRef( null ) ];
	const isVersion330Active = isExperimentActive( EXPERIMENT_ID );

	return (
		<SectionContent>
			{ CssSizeProps.map( ( row, rowIndex ) => (
				<Grid key={ rowIndex } container gap={ 2 } flexWrap="nowrap" ref={ gridRowRefs[ rowIndex ] }>
					{ row.map( ( props ) => (
						<Grid item xs={ 6 } key={ props.bind }>
							<SizeField { ...props } rowRef={ gridRowRefs[ rowIndex ] } extendedOptions={ [ 'auto' ] } />
						</Grid>
					) ) }
				</Grid>
			) ) }
			<PanelDivider />
			<Stack>
				<OverflowField />
			</Stack>
			{ isVersion330Active && (
				<StyleTabCollapsibleContent fields={ [ 'aspect-ratio', 'object-fit' ] }>
					<Stack gap={ 2 } pt={ 2 }>
						<StylesField bind="aspect-ratio" propDisplayName={ ASPECT_RATIO_LABEL }>
							<AspectRatioControl label={ ASPECT_RATIO_LABEL } />
						</StylesField>
						<PanelDivider />
						<ObjectFitField />
						{ isNotFill && (
							<Grid item xs={ 6 }>
								<ObjectPositionField />
							</Grid>
						) }
					</Stack>
				</StyleTabCollapsibleContent>
			) }
		</SectionContent>
	);
};

type ControlProps = {
	bind: StylesFieldProps[ 'bind' ];
	label: string;
	rowRef: React.RefObject< HTMLDivElement >;
	extendedOptions?: ExtendedOption[];
};

const SizeField = ( { label, bind, rowRef, extendedOptions }: ControlProps ) => {
	return (
		<StylesField bind={ bind } propDisplayName={ label }>
			<Grid container gap={ 0.75 } alignItems="center">
				<Grid item xs={ 12 }>
					<ControlLabel>{ label }</ControlLabel>
				</Grid>
				<Grid item xs={ 12 }>
					<SizeControl extendedOptions={ extendedOptions } anchorRef={ rowRef } />
				</Grid>
			</Grid>
		</StylesField>
	);
};
