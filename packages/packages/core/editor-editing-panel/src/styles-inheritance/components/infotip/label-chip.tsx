import * as React from 'react';
import { ELEMENTS_BASE_STYLES_PROVIDER_KEY } from '@elementor/editor-styles-repository';
import { InfoCircleIcon } from '@elementor/icons';
import { Chip, type Theme, Tooltip } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { getStylesProviderColorName } from '../../../utils/get-styles-provider-color';

type Props = {
	displayLabel: string;
	provider: string;
};

const SIZE = 'tiny';

export const LabelChip = ( { displayLabel, provider }: Props ) => {
	const isBaseStyle = provider === ELEMENTS_BASE_STYLES_PROVIDER_KEY;

	const chipIcon = isBaseStyle ? (
		<Tooltip title={ __( 'Inherited from base styles', 'elementor' ) } placement="top">
			<InfoCircleIcon fontSize={ SIZE } />
		</Tooltip>
	) : undefined;

	return (
		<Chip
			label={ displayLabel }
			size={ SIZE }
			color={ getStylesProviderColorName( provider ) }
			variant="standard"
			state="enabled"
			icon={ chipIcon }
			sx={ ( theme: Theme ) => ( {
				lineHeight: 1,
				flexWrap: 'nowrap',
				alignItems: 'center',
				borderRadius: `${ theme.shape.borderRadius * 0.75 }px`,
				flexDirection: 'row-reverse',
				'.MuiChip-label': {
					overflow: 'hidden',
					textOverflow: 'ellipsis',
					whiteSpace: 'nowrap',
				},
			} ) }
		/>
	);
};
