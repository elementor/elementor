import * as React from 'react';
import { Box, Button, CloseButton, Image, Stack, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

type Props = {
	imageUrl: string;
	description: string;
	learnMoreUrl: string;
	onInstall?: () => void;
	onClose: () => void;
};

export function AngieGuideCard( { imageUrl, description, learnMoreUrl, onInstall, onClose }: Props ) {
	return (
		<Stack sx={ { width: 296 } } data-testid="e-angie-guide-card">
			<Box sx={ { position: 'relative', p: 1.5 } }>
				<Image
					src={ imageUrl }
					alt={ __( 'Angie', 'elementor' ) }
					sx={ { width: '100%', maxHeight: 200, objectFit: 'cover', objectPosition: 'center top', borderRadius: 1, display: 'block' } }
				/>
				<CloseButton
					sx={ {
						position: 'absolute',
						top: 24,
						insetInlineEnd: 24,
						color: 'common.white',
						filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.6))',
						'&:hover': {
							bgcolor: 'rgba(255,255,255,0.2)',
							color: 'common.white',
						},
					} }
					slotProps={ { icon: { fontSize: 'small' } } }
					onClick={ onClose }
				/>
			</Box>
			<Stack px={ 2 } pt={ 0.5 } pb={ 0.5 }>
				<Typography variant="subtitle2">{ __( 'Generate full pages with AI', 'elementor' ) }</Typography>
			</Stack>
			<Stack px={ 2 } pt={ 0.5 } pb={ 1.5 }>
				<Typography variant="body2" color="secondary">
					{ description }
				</Typography>
			</Stack>
			<Stack direction="row" justifyContent="flex-end" gap={ 1 } pb={ 1.5 } px={ 2 }>
				<Button
					variant="text"
					size="small"
					color="secondary"
					onClick={ () => {
						window.open( learnMoreUrl, '_blank', 'noopener,noreferrer' );
						onClose();
					} }
				>
					{ __( 'Learn More', 'elementor' ) }
				</Button>
				{ onInstall && (
					<Button variant="contained" size="small" color="primary" onClick={ onInstall }>
						{ __( 'Build with Angie', 'elementor' ) }
					</Button>
				) }
			</Stack>
		</Stack>
	);
}
