import * as React from 'react';
import { type EqualUnequalItems, EqualUnequalSizesControl } from '@elementor/editor-controls';
import { borderWidthPropTypeUtil } from '@elementor/editor-props';
import { SideAllIcon, SideBottomIcon, SideLeftIcon, SideRightIcon, SideTopIcon } from '@elementor/icons';
import { withDirection } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { StylesField } from '../../../controls-registry/styles-field';
import { useDirection } from '../../../hooks/use-direction';

const BORDER_WIDTH_LABEL = __( 'Border width', 'elementor' );

const InlineStartIcon = withDirection( SideRightIcon );
const InlineEndIcon = withDirection( SideLeftIcon );

const getEdges = ( isSiteRtl: boolean ): EqualUnequalItems => [
	{
		label: __( 'Top', 'elementor' ),
		icon: <SideTopIcon fontSize={ 'tiny' } />,
		bind: 'block-start',
	},
	{
		label: isSiteRtl ? __( 'Left', 'elementor' ) : __( 'Right', 'elementor' ),
		icon: <InlineStartIcon fontSize={ 'tiny' } />,
		bind: 'inline-end',
	},
	{
		label: __( 'Bottom', 'elementor' ),
		icon: <SideBottomIcon fontSize={ 'tiny' } />,
		bind: 'block-end',
	},
	{
		label: isSiteRtl ? __( 'Right', 'elementor' ) : __( 'Left', 'elementor' ),
		icon: <InlineEndIcon fontSize={ 'tiny' } />,
		bind: 'inline-start',
	},
];

export const BorderWidthField = () => {
	const { isSiteRtl } = useDirection();

	return (
		<StylesField bind={ 'border-width' } propDisplayName={ BORDER_WIDTH_LABEL }>
			<EqualUnequalSizesControl
				items={ getEdges( isSiteRtl ) }
				label={ BORDER_WIDTH_LABEL }
				icon={ <SideAllIcon fontSize={ 'tiny' } /> }
				tooltipLabel={ __( 'Adjust borders', 'elementor' ) }
				multiSizePropTypeUtil={ borderWidthPropTypeUtil }
			/>
		</StylesField>
	);
};
