import * as React from 'react';
import {
	Card,
	CardActionArea,
	CardContent,
	CardMedia,
	CloseButton,
	Paper,
	Portal,
	Slide,
	Stack,
	type Theme,
	Typography,
} from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useStarter } from '../hooks/use-starter';
import { getAssetUrl } from '../utils';

export default function StarterOverlay() {
	const { config, isDismissing, portalContainer, dismiss, openAiPlanner, openTemplatesLibrary, onExited } =
		useStarter();

	if ( ! config || ! portalContainer ) {
		return null;
	}

	return (
		<Portal container={ portalContainer }>
			<Slide direction="down" in={ ! isDismissing } mountOnEnter unmountOnExit onExited={ onExited }>
				<Paper
					elevation={ 0 }
					sx={ {
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						gap: 3,
						py: 3,
						pb: 4,
						px: 2.5,
						backgroundColor: '#f9f9fb',
					} }
				>
					<CloseButton
						onClick={ dismiss }
						aria-label={ __( 'Close', 'elementor' ) }
						sx={ ( theme: Theme ) => ( {
							position: 'absolute',
							insetBlockStart: theme.spacing( 2 ),
							insetInlineEnd: theme.spacing( 2 ),
						} ) }
					/>

					<Typography
						variant="h5"
						sx={ {
							fontFamily: 'Poppins, sans-serif',
							fontWeight: 500,
							color: 'text.primary',
						} }
					>
						{ __( 'Start building.', 'elementor' ) }
					</Typography>

					<Stack direction="row" spacing={ 3 } justifyContent="center">
						<Card sx={ { width: 280 } }>
							<CardActionArea onClick={ openAiPlanner }>
								<CardMedia
									component="img"
									image={ getAssetUrl( 'ai-site-planner.png' ) }
									alt={ __( 'AI Site Planner', 'elementor' ) }
									sx={ {
										height: 138,
										p: 1.5,
										boxSizing: 'border-box',
										objectFit: 'cover',
										borderRadius: 1,
									} }
								/>
								<CardContent sx={ { textAlign: 'center' } }>
									<Typography variant="subtitle1" color="text.primary">
										{ __( 'AI Site Planner', 'elementor' ) }
									</Typography>
									<Typography variant="body2" color="text.secondary" sx={ { mt: 1 } }>
										{ __( 'Generate your wireframe with AI', 'elementor' ) }
									</Typography>
								</CardContent>
							</CardActionArea>
						</Card>

						<Card sx={ { width: 280 } }>
							<CardActionArea onClick={ openTemplatesLibrary }>
								<CardMedia
									component="img"
									image={ getAssetUrl( 'website-templates.png' ) }
									alt={ __( 'Website templates', 'elementor' ) }
									sx={ {
										height: 138,
										p: 1.5,
										boxSizing: 'border-box',
										objectFit: 'cover',
										borderRadius: 1,
									} }
								/>
								<CardContent sx={ { textAlign: 'center' } }>
									<Typography variant="subtitle1" color="text.primary">
										{ __( 'Website templates', 'elementor' ) }
									</Typography>
									<Typography variant="body2" color="text.secondary" sx={ { mt: 1 } }>
										{ __( 'Start with a ready-made design', 'elementor' ) }
									</Typography>
								</CardContent>
							</CardActionArea>
						</Card>
					</Stack>
				</Paper>
			</Slide>
		</Portal>
	);
}
