import * as React from 'react';
import { Error404TemplateIcon } from '@elementor/icons';
import { Box, Link, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

export default function ErrorState() {
	return (
		<Box
			sx={ {
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'center',
				alignItems: 'center',
				pt: '40px',
				gap: '16px',
			} }
		>
			<Error404TemplateIcon />
			<Box
				sx={ {
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'center',
					alignItems: 'center',
					gap: '8px',
				} }
			>
				<Typography variant="body1" color="text.primary">
					{ __( 'We couldn’t display your pages.', 'elementor' ) }
				</Typography>
				<Box>
					<Typography variant="body2" color="text.primary" sx={ { textAlign: 'center' } }>
						{ __( 'It’s probably a temporary issue.', 'elementor' ) }
					</Typography>
					<Typography variant="body2" color="text.primary" sx={ { textAlign: 'center' } }>
						{ __( 'If the problem persists,', 'elementor' ) }{ ' ' }
						<Link target="_blank" href="https://go.elementor.com/wp-editor-support-open-ticket/">
							Notify support
						</Link>
					</Typography>
				</Box>
			</Box>
		</Box>
	);
}
