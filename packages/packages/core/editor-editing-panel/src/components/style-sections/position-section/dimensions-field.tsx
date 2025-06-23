import * as React from 'react';
import { useRef } from 'react';
import { SizeControl } from '@elementor/editor-controls';
import { SideBottomIcon, SideLeftIcon, SideRightIcon, SideTopIcon } from '@elementor/icons';
import { Grid, Stack, withDirection } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { StylesField } from '../../../controls-registry/styles-field';
import { useDirection } from '../../../hooks/use-direction';
import { UiProviders } from '../../../styles-inheritance/components/ui-providers';
import { ControlLabel } from '../../control-label';
import { RotatedIcon } from '../layout-section/utils/rotated-icon';

type Side = 'inset-inline-start' | 'inset-inline-end' | 'inset-block-start' | 'inset-block-end';

const InlineStartIcon = withDirection( SideLeftIcon );
const InlineEndIcon = withDirection( SideRightIcon );

const sideIcons = {
	'inset-block-start': <SideTopIcon fontSize={ 'tiny' } />,
	'inset-block-end': <SideBottomIcon fontSize={ 'tiny' } />,
	'inset-inline-start': <RotatedIcon icon={ InlineStartIcon } size="tiny" />,
	'inset-inline-end': <RotatedIcon icon={ InlineEndIcon } size="tiny" />,
};

const getInlineStartLabel = ( isSiteRtl: boolean ) =>
	isSiteRtl ? __( 'Right', 'elementor' ) : __( 'Left', 'elementor' );

const getInlineEndLabel = ( isSiteRtl: boolean ) =>
	isSiteRtl ? __( 'Left', 'elementor' ) : __( 'Right', 'elementor' );

export const DimensionsField = () => {
	const { isSiteRtl } = useDirection();
	const rowRefs = [ useRef< HTMLDivElement >( null ), useRef< HTMLDivElement >( null ) ];

	return (
		<UiProviders>
			<Stack direction="row" gap={ 2 } flexWrap="nowrap" ref={ rowRefs[ 0 ] }>
				<DimensionField side="inset-block-start" label={ __( 'Top', 'elementor' ) } rowRef={ rowRefs[ 0 ] } />
				<DimensionField
					side="inset-inline-end"
					label={ getInlineEndLabel( isSiteRtl ) }
					rowRef={ rowRefs[ 0 ] }
				/>
			</Stack>
			<Stack direction="row" gap={ 2 } flexWrap="nowrap" ref={ rowRefs[ 1 ] }>
				<DimensionField side="inset-block-end" label={ __( 'Bottom', 'elementor' ) } rowRef={ rowRefs[ 1 ] } />
				<DimensionField
					side="inset-inline-start"
					label={ getInlineStartLabel( isSiteRtl ) }
					rowRef={ rowRefs[ 1 ] }
				/>
			</Stack>
		</UiProviders>
	);
};

const DimensionField = ( {
	side,
	label,
	rowRef,
}: {
	side: Side;
	label: string;
	rowRef: React.RefObject< HTMLDivElement >;
} ) => (
	<StylesField bind={ side } propDisplayName={ label }>
		<Grid container gap={ 0.75 } alignItems="center">
			<Grid item xs={ 12 }>
				<ControlLabel>{ label }</ControlLabel>
			</Grid>
			<Grid item xs={ 12 }>
				<SizeControl startIcon={ sideIcons[ side ] } extendedOptions={ [ 'auto' ] } anchorRef={ rowRef } />
			</Grid>
		</Grid>
	</StylesField>
);
