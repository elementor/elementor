import * as React from 'react';
import { Box, Link, Stack, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { FlippedColorSwatchIcon } from './flipped-color-swatch-icon';

type CssClassNotFoundedProps = {
	searchValue: string;
	onClear: () => void;
};

export const CssClassNotFound = ( { onClear, searchValue }: CssClassNotFoundedProps ) => (
	<Stack
		color={ 'text.secondary' }
		pt={ 5 }
		alignItems="center"
		gap={ 1 }
		overflow={ 'hidden' }
		maxWidth={ '170px' }
		justifySelf={ 'center' }
	>
		<FlippedColorSwatchIcon color={ 'inherit' } fontSize="large" />
		<Box>
			<Typography align="center" variant="subtitle2" color="inherit">
				{ __( 'Sorry, nothing matched', 'elementor' ) }
			</Typography>
			<Typography
				variant="subtitle2"
				color="inherit"
				sx={ {
					display: 'flex',
					width: '100%',
					justifyContent: 'center',
				} }
			>
				<span>&ldquo;</span>
				<span
					style={ {
						maxWidth: '80%',
						overflow: 'hidden',
						textOverflow: 'ellipsis',
					} }
				>
					{ searchValue }
				</span>
				<span>&rdquo;.</span>
			</Typography>
		</Box>
		<Typography align="center" variant="caption" color="inherit">
			{ __( 'Try something else.', 'elementor' ) }
			<Link color="secondary" variant="caption" component="button" onClick={ onClear }>
				{ __( 'Clear & try again', 'elementor' ) }
			</Link>
		</Typography>
	</Stack>
);
