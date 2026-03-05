import * as React from 'react';
import { useCallback } from 'react';
import { notify } from '@elementor/editor-notifications';
import { ThemeProvider } from '@elementor/editor-ui';
import { httpService } from '@elementor/http-client';
import { Box, Button, Chip, CloseButton, Divider, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { usePromoSuppressedMessage } from '../hooks/use-promo-suppressed-message';

const PROMO_IMAGE = 'https://assets.elementor.com/v4-promotion/v1/images/v4_chip_new.png';

export function AtomicElementsPromo() {
	const [ suppressed, toggleSuppressMessage ] = usePromoSuppressedMessage();

	const activateAtomicElements = useCallback( async () => {
		try {
			const response = await httpService().post( 'elementor/v1/operations/opt-in-v4' );
			if ( response.data.success ) {
				window.location.reload();
			}
		} catch {
			notify( {
				type: 'error',
				message: __( 'Failed to activate Atomic elements', 'elementor' ),
				id: 'atomic-elements-promo-error',
			} );
		}
	}, [] );

	if ( suppressed ) {
		return null;
	}

	return (
		<ThemeProvider>
			<Divider />
			<Box
				sx={ {
					bgcolor: 'background.default',
					display: 'flex',
					flexDirection: 'column',
				} }
			>
				<Box
					sx={ {
						display: 'flex',
						alignItems: 'center',
						gap: 1,
						pl: 2.5,
						pr: 1,
						py: 1,
					} }
				>
					<Typography
						variant="subtitle2"
						sx={ { flexGrow: 1, gap: 1, display: 'flex', alignItems: 'center' } }
					>
						{ __( 'Atomic Elements', 'elementor' ) }
						<Chip label={ __( 'New', 'elementor' ) } size="tiny" variant="standard" color="secondary" />
					</Typography>
					<CloseButton slotProps={ { icon: { fontSize: 'small' } } } onClick={ toggleSuppressMessage } />
				</Box>

				<Box
					sx={ {
						maxHeight: 205,
						mx: 2,
						overflow: 'hidden',
					} }
				>
					<Box
						component="img"
						src={ PROMO_IMAGE }
						alt=""
						sx={ {
							width: '100%',
							objectFit: 'cover',
							objectPosition: 'center',
							display: 'block',
						} }
					/>
				</Box>

				<Box sx={ { pl: 2.5, pr: 4, pt: 2 } }>
					<Typography variant="caption" color="text.tertiary">
						{ __(
							'The new generation of high-performance, flexible building blocks designed for precise styling and a unified experience.',
							'elementor'
						) }
					</Typography>
				</Box>

				<Box
					sx={ {
						display: 'flex',
						justifyContent: 'flex-end',
						gap: 1,
						pb: 1.5,
						pl: 2,
						pr: 2.5,
						pt: 1,
					} }
				>
					<Button
						variant="text"
						size="small"
						color="secondary"
						href="https://go.elementor.com/wp-dash-opt-in-v4-help-center/"
						target="_blank"
					>
						{ __( 'Learn more', 'elementor' ) }
					</Button>
					<Button variant="contained" size="small" color="primary" onClick={ activateAtomicElements }>
						{ __( 'Unlock for free', 'elementor' ) }
					</Button>
				</Box>
			</Box>
			<Divider />
		</ThemeProvider>
	);
}
