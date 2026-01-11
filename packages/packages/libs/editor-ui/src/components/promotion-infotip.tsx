import * as React from 'react';
import { useEffect } from 'react';
import { getCanvasIframeDocument } from '@elementor/editor-v1-adapters';
import {
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

import { CtaButton } from './cta-button';

type InfotipCardProps = {
	title: string;
	content: string;
	assetUrl: string;
	ctaUrl: string;
	onClose: () => void;
};

type PromotionInfotipProps = React.PropsWithChildren<
	InfotipCardProps & {
		open?: boolean;
	}
>;

export const PromotionInfotip = ( { children, open, onClose, ...cardProps }: PromotionInfotipProps ) => {
	useEffect( () => {
		const canvasDocument = open ? getCanvasIframeDocument() : null;

		if ( ! canvasDocument ) {
			return;
		}

		canvasDocument.addEventListener( 'mousedown', onClose );

		return () => canvasDocument.removeEventListener( 'mousedown', onClose );
	}, [ open, onClose ] );

	return (
		<Infotip placement="right" content={ <InfotipCard onClose={ onClose } { ...cardProps } /> } open={ open }>
			{ children }
		</Infotip>
	);
};

function InfotipCard( { title, content, assetUrl, ctaUrl, onClose }: InfotipCardProps ) {
	return (
		<ClickAwayListener
			disableReactTree={ true }
			mouseEvent="onMouseDown"
			touchEvent="onTouchStart"
			onClickAway={ onClose }
		>
			<Card elevation={ 0 } sx={ { maxWidth: 296 } }>
				<CardHeader
					title={ title }
					action={ <CloseButton slotProps={ { icon: { fontSize: 'tiny' } } } onClick={ onClose } /> }
				/>
				<CardMedia component="img" image={ assetUrl } alt="" sx={ { width: '100%', aspectRatio: '16 / 9' } } />
				<CardContent>
					<Typography variant="body2" color="text.secondary">
						{ content }
					</Typography>
				</CardContent>
				<CardActions sx={ { justifyContent: 'flex-start' } }>
					<CtaButton href={ ctaUrl } />
				</CardActions>
			</Card>
		</ClickAwayListener>
	);
}
