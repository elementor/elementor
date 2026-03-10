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
						py: 7.5,
						px: 2.5,
						backgroundColor: '#F3F3F4',
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
						<Card
							sx={ {
								width: 280,
								borderRadius: 3,
								boxShadow: 'none',
								transition: 'box-shadow 0.2s',
								'&:hover': { boxShadow: '0 3px 14px 2px rgba(0, 0, 0, 0.12)' },
							} }
						>
							<CardActionArea
								onClick={ openAiPlanner }
								sx={ {
									pt: 1.5,
									pb: 3,
									px: 1.5,
									'&:hover .MuiCardActionArea-focusHighlight': { opacity: 0 },
								} }
							>
								<CardMedia
									component="img"
									image={ getAssetUrl( 'ai-site-planner.png' ) }
									alt={ __( 'AI Site Planner', 'elementor' ) }
									sx={ {
										height: 114,
										objectFit: 'cover',
										borderRadius: 2,
										backgroundColor: '#fae4fa',
									} }
								/>
								<CardContent
									sx={ {
										textAlign: 'center',
										pt: 2,
										px: 0,
										pb: 0,
										gap: 1,
										display: 'flex',
										flexDirection: 'column',
									} }
								>
									<Typography variant="subtitle1" color="text.primary">
										{ __( 'AI Site Planner', 'elementor' ) }
									</Typography>
									<Typography variant="body2" color="text.secondary">
										{ __( 'Generate your wireframe with AI', 'elementor' ) }
									</Typography>
								</CardContent>
							</CardActionArea>
						</Card>

						<Card
							sx={ {
								width: 280,
								borderRadius: 3,
								boxShadow: 'none',
								transition: 'box-shadow 0.2s',
								'&:hover': { boxShadow: '0 3px 14px 2px rgba(0, 0, 0, 0.12)' },
							} }
						>
							<CardActionArea
								onClick={ openTemplatesLibrary }
								sx={ {
									pt: 1.5,
									pb: 3,
									px: 1.5,
									'&:hover .MuiCardActionArea-focusHighlight': { opacity: 0 },
								} }
							>
								<CardMedia
									component="img"
									image={ getAssetUrl( 'website-templates.png' ) }
									alt={ __( 'Website templates', 'elementor' ) }
									sx={ {
										height: 114,
										objectFit: 'cover',
										borderRadius: 2,
										backgroundColor: '#fae4fa',
									} }
								/>
								<CardContent
									sx={ {
										textAlign: 'center',
										pt: 2,
										px: 0,
										pb: 0,
										gap: 1,
										display: 'flex',
										flexDirection: 'column',
									} }
								>
									<Typography variant="subtitle1" color="text.primary">
										{ __( 'Website templates', 'elementor' ) }
									</Typography>
									<Typography variant="body2" color="text.secondary">
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
