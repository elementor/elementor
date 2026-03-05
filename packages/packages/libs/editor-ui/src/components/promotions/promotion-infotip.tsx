import * as React from 'react';
import type { ReactNode, RefObject } from 'react';
import {
	Box,
	Button,
	Card,
	CardActions,
	CardContent,
	CardHeader,
	CardMedia,
	ClickAwayListener,
	CloseButton,
	Infotip,
	type InfotipProps,
	type SxProps,
	Typography,
} from '@elementor/ui';

import { useCanvasClickHandler } from '../../hooks';
import { CtaButton } from '../cta-button';

type BaseInfotipCardProps = {
	title: string;
	content: string;
	assetUrl: string;
	onClose: ( e: MouseEvent ) => void;
	headerAction?: ReactNode;
	mediaSx?: SxProps;
	mediaOverlay?: ReactNode;
};

type WithCtaUrl = BaseInfotipCardProps & {
	ctaUrl: string;
	onAction?: never;
	ctaText?: never;
	ctaColor?: never;
};

type WithOnAction = BaseInfotipCardProps & {
	ctaUrl?: never;
	onAction: () => void;
	ctaText: string;
	ctaColor?: 'primary' | 'secondary' | 'inherit';
};

type InfotipCardProps = WithCtaUrl | WithOnAction;

type PromotionInfotipProps = React.PropsWithChildren<
	InfotipCardProps & {
		open?: boolean;
		anchorRef?: RefObject< HTMLElement | null >;
	}
>;

export const PromotionInfotip = ( { children, open, onClose, anchorRef, ...cardProps }: PromotionInfotipProps ) => {
	useCanvasClickHandler( !! open, onClose );

	const anchorEl = anchorRef?.current;

	const slotProps: InfotipProps[ 'slotProps' ] = anchorEl
		? {
				popper: {
					anchorEl,
					modifiers: [
						{
							name: 'offset',
							options: {
								offset: [ 0, 8 ],
							},
						},
					],
				},
		  }
		: undefined;

	return (
		<Infotip
			placement="right"
			content={ <InfotipCard onClose={ onClose } { ...cardProps } /> }
			open={ open }
			slotProps={ slotProps }
		>
			{ children }
		</Infotip>
	);
};

function InfotipCard( props: InfotipCardProps ) {
	const { title, content, assetUrl, onClose, headerAction, mediaSx, mediaOverlay } = props;

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
					action={
						<>
							{ headerAction }
							<CloseButton slotProps={ { icon: { fontSize: 'tiny' } } } onClick={ onClose } />
						</>
					}
				/>
				<Box sx={ { position: 'relative' } }>
					<CardMedia
						component="img"
						image={ assetUrl }
						alt=""
						sx={ { width: '100%', aspectRatio: '16 / 9', ...mediaSx } }
					/>
					{ mediaOverlay }
				</Box>
				<CardContent>
					<Typography variant="body2" color="text.secondary">
						{ content }
					</Typography>
				</CardContent>
				<CardActions sx={ { justifyContent: 'flex-end' } }>
					<ActionButton { ...props } />
				</CardActions>
			</Card>
		</ClickAwayListener>
	);
}

function ActionButton( props: InfotipCardProps ) {
	if ( 'onAction' in props && props.onAction ) {
		return (
			<Button variant="contained" color={ props.ctaColor ?? 'primary' } size="small" onClick={ props.onAction }>
				{ props.ctaText }
			</Button>
		);
	}

	return <CtaButton href={ props.ctaUrl } />;
}
