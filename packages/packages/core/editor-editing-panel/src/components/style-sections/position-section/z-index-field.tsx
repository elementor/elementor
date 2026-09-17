import * as React from 'react';
import { NumberControl } from '@elementor/editor-controls';
import { InfoCircleFilledIcon } from '@elementor/icons';
import { Alert, AlertTitle, Box, Infotip } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { StylesField } from '../../../controls-registry/styles-field';
import { StylesFieldLayout } from '../../styles-field-layout';

const Z_INDEX_LABEL = __( 'Z-index', 'elementor' );

export const ZIndexField = ( { disabled }: { disabled?: boolean } ) => {
	const StyleField = (
		<StylesField bind="z-index" propDisplayName={ Z_INDEX_LABEL }>
			<StylesFieldLayout label={ Z_INDEX_LABEL }>
				<NumberControl disabled={ disabled } />
			</StylesFieldLayout>
		</StylesField>
	);

	const content = (
		<Alert color="secondary" icon={ <InfoCircleFilledIcon /> } size="small">
			<AlertTitle>{ __( 'Z-index', 'elementor' ) }</AlertTitle>
			<Box component="span">
				{ __(
					'z-index only works on positioned elements. Change position to relative, absolute, or fixed to enable layering.',
					'elementor'
				) }
			</Box>
		</Alert>
	);
	return disabled ? (
		<Infotip
			placement="right"
			content={ content }
			color="secondary"
			slotProps={ { popper: { sx: { width: 300 } } } }
		>
			<Box>{ StyleField }</Box>
		</Infotip>
	) : (
		<>{ StyleField }</>
	);
};
