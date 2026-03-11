import * as React from 'react';
import { CirclePlusIcon } from '@elementor/icons';
import {
	Card,
	CardActionArea,
	CardContent,
	CardMedia,
	CloseButton,
	Dialog,
	Stack,
	styled,
	Typography,
	useTheme,
} from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useStarter } from '../hooks/use-starter';
import { getAssetUrl } from '../utils';

const StyledCard = styled( Card )( ( { theme } ) => ( {
	width: theme.spacing( 30 ),
	borderRadius: theme.spacing( 1 ),
	boxShadow: 'none',
	transition: 'box-shadow 0.2s',
	border: `1px solid ${ theme.palette.divider }`,
	paddingBlockEnd: theme.spacing( 3 ),
	'&:hover': { boxShadow: `0 3px 14px 2px ${ theme.palette.divider }` },
} ) );

const StyledCardMedia = styled( CardMedia )( ( { theme } ) => ( {
	height: theme.spacing( 14 ),
	objectFit: 'cover',
	backgroundColor: '#d5dadf',
} ) );

const StyledBlankCardThumbnail = styled( 'div' )( ( { theme } ) => ( {
	height: theme.spacing( 14 ),
	backgroundColor: '#d5dadf',
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	color: theme.palette.common.white,
} ) );

const StyledCardContent = styled( CardContent )( ( { theme } ) => ( {
	textAlign: 'center',
	paddingBlockStart: theme.spacing( 2 ),
	paddingInline: 0,
	paddingBlockEnd: 0,
	gap: theme.spacing( 1 ),
	display: 'flex',
	flexDirection: 'column',
} ) );

export default function StarterOverlay() {
	const theme = useTheme();

	const { config, isDismissing, portalContainer, dismiss, openAiPlanner, openTemplatesLibrary, onExited } =
		useStarter();

	if ( ! config || ! portalContainer ) {
		return null;
	}

	return (
		<Dialog
			open={ ! isDismissing }
			onClose={ dismiss }
			container={ portalContainer }
			TransitionProps={ { onExited } }
			maxWidth={ theme.spacing( 104 ) }
			BackdropProps={ {
				sx: { backgroundColor: 'rgba(0, 0, 0, 0.6)' },
			} }
			PaperProps={ {
				elevation: 0,
				sx: {
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					gap: theme.spacing( 3 ),
					p: 4,
				},
			} }
		>
			<CloseButton
				onClick={ dismiss }
				aria-label={ __( 'Close', 'elementor' ) }
				sx={ {
					position: 'absolute',
					insetBlockStart: theme.spacing( 2 ),
					insetInlineEnd: theme.spacing( 2 ),
				} }
			/>

			<Typography
				variant="h5"
				sx={ {
					fontFamily: 'Poppins, sans-serif',
					fontWeight: 500,
					color: 'text.primary',
				} }
			>
				{ __( 'How do you want to start?', 'elementor' ) }
			</Typography>

			<Stack direction="row" spacing={ 3 } justifyContent="center">
				<StyledCard>
					<CardActionArea
						onClick={ openAiPlanner }
						sx={ {
							'&:hover .MuiCardActionArea-focusHighlight': { opacity: 0 },
						} }
					>
						<StyledCardMedia
							component="img"
							image={ getAssetUrl( 'ai-site-planner.png' ) }
							alt={ __( 'AI Site Planner', 'elementor' ) }
						/>
						<StyledCardContent>
							<Typography variant="subtitle1" color="text.primary">
								{ __( 'AI Site Planner', 'elementor' ) }
							</Typography>
							<Typography variant="body2" color="text.secondary">
								{ __( 'Generate your wireframe with AI', 'elementor' ) }
							</Typography>
						</StyledCardContent>
					</CardActionArea>
				</StyledCard>

				<StyledCard>
					<CardActionArea
						onClick={ openTemplatesLibrary }
						sx={ {
							'&:hover .MuiCardActionArea-focusHighlight': { opacity: 0 },
						} }
					>
						<StyledCardMedia
							component="img"
							image={ getAssetUrl( 'website-templates.png' ) }
							alt={ __( 'Website templates', 'elementor' ) }
						/>
						<StyledCardContent>
							<Typography variant="subtitle1" color="text.primary">
								{ __( 'Website templates', 'elementor' ) }
							</Typography>
							<Typography variant="body2" color="text.secondary">
								{ __( 'Start with a ready-made design', 'elementor' ) }
							</Typography>
						</StyledCardContent>
					</CardActionArea>
				</StyledCard>

				<StyledCard>
					<CardActionArea
						onClick={ dismiss }
						sx={ {
							'&:hover .MuiCardActionArea-focusHighlight': { opacity: 0 },
						} }
					>
						<StyledBlankCardThumbnail>
							<CirclePlusIcon sx={ { fontSize: theme.spacing( 5 ) } } />
						</StyledBlankCardThumbnail>
						<StyledCardContent>
							<Typography variant="subtitle1" color="text.primary">
								{ __( 'Blank site', 'elementor' ) }
							</Typography>
							<Typography variant="body2" color="text.secondary">
								{ __( 'Start from scratch', 'elementor' ) }
							</Typography>
						</StyledCardContent>
					</CardActionArea>
				</StyledCard>
			</Stack>
		</Dialog>
	);
}
