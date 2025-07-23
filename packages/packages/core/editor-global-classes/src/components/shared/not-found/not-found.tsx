import * as React from 'react';
import { type FC } from 'react';
import { Box, Link, Stack, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

type NotFoundProps = {
	searchValue?: string;
	onClear: () => void;
	mainText: string;
	sceneryText: string;
	icon: React.ReactElement;
};

export const NotFound: FC< NotFoundProps > = ( { onClear, searchValue, mainText, sceneryText, icon } ) => (
	<Stack
		color={ 'text.secondary' }
		pt={ 5 }
		alignItems="center"
		gap={ 1 }
		overflow={ 'hidden' }
		maxWidth={ '170px' }
		justifySelf={ 'center' }
	>
		{ icon }
		<Box>
			<Typography align="center" variant="subtitle2" color="inherit">
				{ mainText }
			</Typography>
			{ searchValue && (
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
			) }
		</Box>
		<Typography align="center" variant="caption" color="inherit">
			{ sceneryText }
			<Link color="secondary" variant="caption" component="button" onClick={ onClear }>
				{ __( 'Clear & try again', 'elementor' ) }
			</Link>
		</Typography>
	</Stack>
);
