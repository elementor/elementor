import * as React from 'react';
import { Card, CardActions, CardContent, CardHeader, CardMedia, Infotip, Typography } from '@elementor/ui';

import { CtaButton } from './cta-button';

type PromotionInfotipProps = React.PropsWithChildren< {
	title: string;
	content: string;
	assetUrl: string;
	ctaUrl: string;
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
				/>
			}
		>
			{ children }
		</Infotip>
	);
};

function InfotipCard( { ...props }: PromotionInfotipProps ) {
	const { title, content, assetUrl, ctaUrl } = props;

	return (
		<Card elevation={ 0 } sx={ { maxWidth: 296 } }>
			<CardHeader title={ title } />
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
