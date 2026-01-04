import * as React from 'react';
import {
	Button,
	Card,
	CardActions,
	CardContent,
	CardHeader,
	CardMedia,
	ClickAwayListener,
	CloseButton,
	Infotip,
	Typography,
} from '@elementor/ui';
import { __ } from '@wordpress/i18n';

const ANGIE_INSTALL_URL = '/wp-admin/plugin-install.php?tab=plugin-information&plugin=angie';
const PLACEHOLDER_IMAGE_URL = 'https://assets.elementor.com/packages/v1/images/components-angie-promo.svg';

type AngiePromotionCardProps = {
	onClose: () => void;
};

type AngiePromotionModalProps = React.PropsWithChildren< {
	open: boolean;
	onClose: () => void;
} >;

export const AngiePromotionModal = ( { children, open, onClose }: AngiePromotionModalProps ) => {
	return (
		<Infotip placement="right-end" arrow content={ <AngiePromotionCard onClose={ onClose } /> } open={ open }>
			{ children }
		</Infotip>
	);
};

function AngiePromotionCard( { onClose }: AngiePromotionCardProps ) {
	const handleCtaClick = () => {
		window.open( ANGIE_INSTALL_URL, '_blank' );
		onClose();
	};

	return (
		<ClickAwayListener disableReactTree mouseEvent="onMouseDown" touchEvent="onTouchStart" onClickAway={ onClose }>
			<Card elevation={ 0 } sx={ { maxWidth: 296 } }>
				<CardHeader
					title={ __( 'Add new component with AI', 'elementor' ) }
					titleTypographyProps={ { variant: 'subtitle2' } }
					action={ <CloseButton slotProps={ { icon: { fontSize: 'tiny' } } } onClick={ onClose } /> }
				/>
				<CardMedia
					component="img"
					image={ PLACEHOLDER_IMAGE_URL }
					alt=""
					sx={ { width: '100%', aspectRatio: '16 / 9' } }
				/>
				<CardContent>
					<Typography variant="body2" color="text.secondary">
						{ __(
							'Angie our AI assistant can easily create new components and save you the hassle of doing it yourself',
							'elementor'
						) }
					</Typography>
				</CardContent>
				<CardActions sx={ { justifyContent: 'flex-end' } }>
					<Button size="medium" variant="contained" color="accent" onClick={ handleCtaClick }>
						{ __( 'Get Angie', 'elementor' ) }
					</Button>
				</CardActions>
			</Card>
		</ClickAwayListener>
	);
}
