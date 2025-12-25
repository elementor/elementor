import * as React from 'react';
import {
	Button,
	Card,
	CardActions,
	CardContent,
	CardHeader,
	CardMedia,
	CloseButton,
	IconButton,
	Infotip,
	Typography,
} from '@elementor/ui';

import { CtaButton } from './cta-button';
import { CloseIcon } from 'lighthouse/flow-report/src/icons';

type PromotionInfotipProps = React.PropsWithChildren< {
	title: string;
	content: string;
	assetUrl: string;
	ctaUrl: string;
	open?: boolean;
	setOpen: ( open: boolean ) => void;
} >;

export const PromotionInfotip = ( { children, ...props }: PromotionInfotipProps ) => {
	return (
		<Infotip
			placement="right"
			{ ...props }
			content={
				<InfotipCard
					title={ props.title }
					content={ props.content }
					assetUrl={ props.assetUrl }
					ctaUrl={ props.ctaUrl }
					setOpen={ props.setOpen }
				/>
			}
			open={ props.open }
		>
			{ children }
		</Infotip>
	);
};

function InfotipCard( { ...props }: PromotionInfotipProps ) {
	const { title, content, assetUrl, ctaUrl, setOpen } = props;

	return (
		<Card elevation={ 0 } sx={ { maxWidth: 296 } }>
			<CardHeader
				title={ title }
				action={
					<CloseButton slotProps={ { icon: { fontSize: 'tiny' } } } onClick={ () => setOpen( false ) } />
				}
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
	);
}
