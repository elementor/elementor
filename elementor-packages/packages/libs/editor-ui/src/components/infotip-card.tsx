import * as React from 'react';
import { type ReactNode } from 'react';
import { Box, Button, Card, CardActions, CardContent, SvgIcon, Typography } from '@elementor/ui';

type InfoTipCardProps = {
	content: ReactNode;
	svgIcon: ReactNode;
	learnMoreButton?: {
		label: string;
		href: string;
	};
	ctaButton?: {
		label: string;
		onClick: () => void;
	};
};

export const InfoTipCard = ( { content, svgIcon, learnMoreButton, ctaButton }: InfoTipCardProps ) => {
	return (
		<Card elevation={ 0 } sx={ { width: 320 } }>
			<CardContent sx={ { pb: 0 } }>
				<Box display="flex" alignItems="start">
					<SvgIcon fontSize="tiny" sx={ { mr: 0.5 } }>
						{ svgIcon }
					</SvgIcon>
					<Typography variant="body2">{ content }</Typography>
				</Box>
			</CardContent>

			{ ( ctaButton || learnMoreButton ) && (
				<CardActions>
					{ learnMoreButton && (
						<Button size="small" color="warning" href={ learnMoreButton.href } target="_blank">
							{ learnMoreButton.label }
						</Button>
					) }
					{ ctaButton && (
						<Button size="small" color="warning" variant="contained" onClick={ ctaButton.onClick }>
							{ ctaButton.label }
						</Button>
					) }
				</CardActions>
			) }
		</Card>
	);
};
