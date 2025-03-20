import { useState } from 'react';
import {
	Container,
	Button,
	Box,
	Stack,
	Image,
	Chip,
	Link,
} from '@elementor/ui';
import { AlertTriangleFilledIcon } from '@elementor/icons';
import { __ } from '@wordpress/i18n';

import { TextNode, ContentList, ContentListItem } from './opt-in-content';
import { ImageSquarePlaceholder, ImageLandscapePlaceholder } from './opt-in-img-placeholders';
import { Message } from './opt-in-message';
import { triggerOptIn, triggerOptOut } from './opt-in-api';

export const OptIn = ( props ) => {
	const i18n = {
		title: __( 'The Road to Editor V4', 'elementor' ),
		chip: __( 'Alpha', 'elementor' ),

		welcomeText: __( 'Welcome to Editor V4, a new era of web creation with Elementor. Experience a more streamlined, flexible & powerful Editor with a fresh approach to structure & styling.', 'elementor' ),

		mvpIsHere: __( 'The MVP is already here & it includes:', 'elementor' ),
		advantages: [
			__( 'Unparalleled performance - Cleaner code & a lighter CSS output.', 'elementor' ),
			__( 'Professional design capabilities - CSS & Pseudo Classes.', 'elementor' ),
			__( 'Unified Style tab - Consistent styling for all Editor V4 elements.', 'elementor' ),
			__( 'Fully responsive design - Customize any style property per screen.', 'elementor' ),
		],
		andMore: __( '& much more coming soon!', 'elementor' ),
		readMore: __( 'Read more here', 'elementor' ),

		warning: __( 'Keep in mind: Editor V4 is still in alpha and should not be used on live sites yet.', 'elementor' ),

		helpImprove: __( "We'd love to hear from you.", 'elementor' ),
		feedback: __( 'Send us your feedback', 'elementor' ),

		image: __( 'Editor V4', 'elementor' ),

		buttons: {
			startBuilding: __( 'Start building in V4', 'elementor' ),
			optIn: __( 'Opt-in to V4', 'elementor' ),
			optOut: __( 'Opt-out from V4', 'elementor' ),
		},

		messages: {
			optInSuccess: __( 'You’ve successfully opted in to V4!', 'elementor' ),
			optOut: __( 'You’ve opted out...', 'elementor' ),
			error: __( 'Something went wrong. Please try again or contact support if the issue persists.', 'elementor' ),
		},
	};

	const [ isEnrolled, setIsEnrolled ] = useState( !! props?.state?.features?.editor_v4 );

	const [ successMessage, setSuccessMessage ] = useState( '' );
	const [ notifyMessage, setNotifyMessage ] = useState( '' );
	const [ errorMessage, setErrorMessage ] = useState( '' );

	const imageSrcLandscape = '';
	const imageSrcSquare = '';

	const feedbackUrl = 'https://go.elementor.com/wp-dash-opt-in-v4-feedback/';
	const readMoreUrl = 'https://go.elementor.com/wp-dash-opt-in-v4-help-center/';

	const maybeOptIn = () => {
		triggerOptIn()
			.then( () => {
				setIsEnrolled( true );
				setSuccessMessage( i18n.messages.optInSuccess );
				setTimeout( () => document.location.reload(), 2000 );
			} )
			.catch( () => {
				setIsEnrolled( false );
				setErrorMessage( i18n.messages.error );
			} );

	};

	const maybeOptOut = () => {
		triggerOptOut()
			.then( () => {
				setIsEnrolled( false );
				setNotifyMessage( i18n.messages.optOut );
				setTimeout( () => document.location.reload(), 2000 );
			} )
			.catch( () => {
				setErrorMessage( i18n.messages.error );
			} );
	};

	const maybeStart = () => {};

	return (
		<Container sx={ {
			marginBlockStart: 2.5,
			display: 'flex',
			flexBasis: '100%',
			gap: 3,
			flexDirection: { xs: 'column-reverse', md: 'row' },
		} }>
			<Stack sx={ { flex: 1, maxWidth: 'sm', gap: 2.5, mx: 'auto' } }>
				<Stack direction="row" alignItems="center" gap={ 1 }>
					<TextNode variant="h4" width="fit-content">{ i18n.title }</TextNode>
					<Chip size="small" color="secondary" variant="filled" label={ i18n.chip } />
				</Stack>

				<TextNode>{ i18n.welcomeText }</TextNode>

				<Box>
					<TextNode>{ i18n.mvpIsHere }</TextNode>
					<ContentList>
						{ i18n.advantages.map( ( entry, i ) => (
							<ContentListItem key={ i }>{ entry }</ContentListItem>
						) ) }
						<ContentListItem key="e-0">
							{ i18n.andMore } <Link color="text.primary" href={ readMoreUrl } target="_blank">{ i18n.readMore }</Link>
						</ContentListItem>
					</ContentList>
				</Box>

				<Stack direction="row" alignItems="self-start" gap={ 1 }>
					<AlertTriangleFilledIcon color="action" />
					<TextNode>{ i18n.warning }</TextNode>
				</Stack>

				<Stack direction="column" width="clamp(240px, max(340px, 75%), 340px)" maxWidth="100%" gap={ 2 }>
					{ ( ! isEnrolled ) ? (
						<Button
							onClick={ maybeOptIn }
							size="large"
							color="primary"
							variant="contained"
							sx={ { flexGrow: 1 } }
						>
							{ i18n.buttons.optIn }
						</Button>
					) : (
						<Button
							onClick={ maybeStart }
							size="large"
							color="primary"
							variant="contained"
							sx={ { flexGrow: 1 } }
						>
							{ i18n.buttons.startBuilding }
						</Button>
					) }
					<Button
						onClick={ maybeOptOut }
						size="large"
						color="secondary"
						variant="outlined"
						sx={ {
							flexGrow: 1,
							visibility: isEnrolled ? 'visible' : 'hidden',
						} }
					>
						{ i18n.buttons.optOut }
					</Button>
				</Stack>

				<TextNode>{ i18n.helpImprove } <Link href={ feedbackUrl } target="_blank">{ i18n.feedback }</Link></TextNode>
			</Stack>

			<Stack sx={ { flex: 1, px: { xs: 0, md: 5 } } }>
				{ imageSrcSquare ? (
					<Image
						src={ imageSrcSquare }
						alt={ i18n.image }
						sx={ {
							display: { xs: 'none', md: 'block' },
							width: '100%',
							maxHeight: '500px',
						} } />
				) : (
					<ImageSquarePlaceholder sx={ {
						display: { xs: 'none', md: 'block' },
						maxWidth: 'sm',
						width: '100%',
						maxHeight: '500px',
						height: 'auto',
						mx: 'auto',
					} } />
				) }

				{ imageSrcLandscape ? (
					<Image
						src={ imageSrcLandscape }
						alt={ i18n.image }
						sx={ {
							display: { xs: 'block', md: 'none' },
							mx: 'auto',
							width: '100%',
							maxWidth: 'sm',
							maxHeight: '260px',
						} } />
				) : (
					<ImageLandscapePlaceholder sx={ {
						display: { xs: 'block', md: 'none' },
						width: '100%',
						height: 'auto',
						maxHeight: '260px',
						mx: 'auto',
					} } />
				) }
			</Stack>

			{ successMessage && (
				<Message severity="success" onClose={ () => setSuccessMessage( '' ) }>{ successMessage }</Message>
			) }

			{ notifyMessage && (
				<Message onClose={ () => setNotifyMessage( '' ) }>{ notifyMessage }</Message>
			) }

			{ errorMessage && (
				<Message severity="error" onClose={ () => setErrorMessage( '' ) }>{ errorMessage }</Message>
			) }
		</Container>
	);
};
