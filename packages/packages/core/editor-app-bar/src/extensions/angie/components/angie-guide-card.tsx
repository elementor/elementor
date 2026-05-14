import * as React from 'react';
import { Button, Chip, ClickAwayListener, CloseButton, Image, Stack, Typography } from '@elementor/ui';
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
		<ClickAwayListener onClickAway={ onClose }>
			<Stack sx={ { width: 296 } } data-testid="e-angie-guide-card">
				<Stack direction="row" alignItems="center" gap={ 1 } py={ 1 } px={ 2 }>
					<Typography variant="subtitle2">{ __( 'Meet Angie', 'elementor' ) }</Typography>
					<Chip label={ __( 'New', 'elementor' ) } size="small" color="info" variant="standard" />
					<CloseButton
						edge="end"
						sx={ { ml: 'auto' } }
						slotProps={ { icon: { fontSize: 'small' } } }
						onClick={ onClose }
					/>
				</Stack>
				<Image src={ imageUrl } alt={ __( 'Angie', 'elementor' ) } sx={ { height: 150, width: '100%' } } />
				<Stack px={ 2 } pt={ 1.5 } pb={ 1 }>
					<Typography variant="body2" color="secondary">
						{ description }
					</Typography>
				</Stack>
				<Stack direction="row" justifyContent="flex-end" gap={ 1 } pt={ 1 } pb={ 1.5 } px={ 2 }>
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
						<Button variant="contained" size="small" color="accent" onClick={ onInstall }>
							{ __( 'Try for free', 'elementor' ) }
						</Button>
					) }
				</Stack>
			</Stack>
		</ClickAwayListener>
	);
}
