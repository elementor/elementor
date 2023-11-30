import { Alert, Box, Button, Stack, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import LockIcon from '../../../icons/lock-icon';

export const ProWidgetsNotice = () => {
	const [ isViewed, setIsViewed ] = useState( false );

	if ( isViewed ) {
		return null;
	}

	return (
		<Box
			sx={ {
				pt: 2,
				px: 2,
				pb: 0,
			} }
		>
			<Alert
				severity="info"
				variant="filled"
				color="accent"
				onClose={ () => setIsViewed( true ) }
				icon={ <LockIcon /> }
				sx={ {
					'& .MuiAlert-message': {
						width: '100%',
					},
				} }
			>
				<Stack
					flexDirection="row"
					alignItems="baseline"
					justifyContent="space-between"
				>
					<Typography
						variant="body2"
						component="span"
						sx={ {
							paddingInlineEnd: 0.5,
						} }
					>
						<Typography
							variant="body2"
							component="span"
							sx={ {
								paddingInlineEnd: 1,
							} }
						>
							{ __( 'Upgrade your plan for best results.', 'elementor' ) }
						</Typography>

						{ __( 'You won’t be able to use layouts with Elementor Pro widgets until you do.', 'elementor' ) }
					</Typography>
					<Button
						variant="outlined"
						size="small"
						href="https://go.elementor.com/upgrade-pro/"
						target="_blank"
						sx={ {
							color: 'accent.contrastText',
							borderColor: 'accent.contrastText',
							'&:hover': {
								borderColor: 'accent.contrastText',
							},
						} }
					>
						{ __( 'Go Pro', 'elementor' ) }
					</Button>
				</Stack>

			</Alert>
		</Box>
	);
};
