import * as React from 'react';
import { type PropsWithChildren } from 'react';
import {
	Box,
	Button,
	Card,
	CardActions,
	CardContent,
	CardHeader,
	CardMedia,
	Chip,
	ClickAwayListener,
	CloseButton,
	Infotip,
	Typography,
} from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { type PromotionProps } from './types';

type PromotionCardProps = {
	title: string;
	content: string;
	image?: string;
	ctaLabel: string;
	onCtaClick: () => void;
	onClose: () => void;
};

type PromotionModalProps = PropsWithChildren<
	PromotionProps & {
		onClose: () => void;
		isOpen: boolean;
	}
>;

export function PromotionModal( { children, isOpen, onClose, onClick, ...cardProps }: PromotionModalProps ) {
	return (
		<Infotip
			placement="bottom"
			arrow={ false }
			content={ <PromotionCard onClose={ onClose } onCtaClick={ onClick } { ...cardProps } /> }
			open={ isOpen }
		>
			<Box component="span" sx={ { display: 'contents' } }>
				{ children }
			</Box>
		</Infotip>
	);
}

function PromotionCard( { title, content, image, ctaLabel, onCtaClick, onClose }: PromotionCardProps ) {
	const handleCtaClick = () => {
		onCtaClick();
	};

	return (
		<ClickAwayListener
			disableReactTree={ true }
			mouseEvent="onMouseDown"
			touchEvent="onTouchStart"
			onClickAway={ onClose }
		>
			<Card elevation={ 0 } sx={ { maxWidth: 296 } }>
				<CardHeader
					title={
						<Box sx={ { display: 'flex', alignItems: 'center', gap: 1 } }>
							<Typography variant="subtitle1">{ title }</Typography>
							<Chip label={ __( 'New', 'elementor' ) } size="small" color="info" variant="standard" />
						</Box>
					}
					action={ <CloseButton slotProps={ { icon: { fontSize: 'tiny' } } } onClick={ onClose } /> }
				/>
				{ image && (
					<CardMedia component="img" image={ image } alt="" sx={ { width: '100%', aspectRatio: '16 / 9' } } />
				) }
				<CardContent>
					<Typography variant="body2" color="text.secondary">
						{ content }
					</Typography>
				</CardContent>
				<CardActions sx={ { justifyContent: 'flex-end' } }>
					<Button variant="contained" color="primary" onClick={ handleCtaClick }>
						{ ctaLabel }
					</Button>
				</CardActions>
			</Card>
		</ClickAwayListener>
	);
}
