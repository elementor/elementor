import * as React from 'react';
import { type ReactNode } from 'react';
import { Box, Button, Card, CardActions, CardContent, Link, SvgIcon, Typography } from '@elementor/ui';

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
					<Typography variant="body2">
						{ content }
						{ learnMoreButton && (
							<>
								&nbsp;
								<Link color="info.main" href={ learnMoreButton.href } target="_blank">
									{ learnMoreButton.label }
								</Link>
							</>
						) }
					</Typography>
				</Box>
			</CardContent>

			{ ctaButton && (
				<CardActions sx={ { justifyContent: 'flex-start' } }>
					<Button
						size="small"
						color="secondary"
						variant="contained"
						onClick={ ctaButton.onClick }
						sx={ { marginInlineStart: '1rem' } }
					>
						{ ctaButton.label }
					</Button>
				</CardActions>
			) }
		</Card>
	);
};
