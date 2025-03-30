import { useState, useEffect } from 'react';
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
import DOMPurify from 'dompurify';
import { Terms } from './opt-in-terms';

const decodeHtmlUrl = ( html ) => {
	const textarea = document.createElement( 'textarea' );
	textarea.innerHTML = html;
	return textarea.value;
};

const OPT_IN_MSG = 'e-editor-v4-opt-in-message';
const OPT_OUT_MSG = 'e-editor-v4-opt-out-message';

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

	helpImprove: __( 'Please help up improve', 'elementor' ),
	feedback: __( 'Leave a feedback', 'elementor' ),
	tellUsWhy: __( 'Tell us why', 'elementor' ),

	image: __( 'Editor V4', 'elementor' ),

	buttons: {
		startBuilding: __( 'Start building in V4', 'elementor' ),
		optIn: __( 'Opt-in to V4', 'elementor' ),
		optOut: __( 'Opt-out from V4', 'elementor' ),
	},

	messages: {
		optInSuccess: __( 'Welcome aboard! You’re ready to start using the newest version of the editor.', 'elementor' ),
		optOut: __( 'You’ve deactivated the new Editor. Have feedback?', 'elementor' ),
		error: __( 'Something went wrong. Please try again or contact support if the issue persists.', 'elementor' ),
	},
};

const optInLinks = {
	feedbackUrl: 'https://go.elementor.com/wp-dash-opt-in-v4-feedback/',
	readMoreUrl: 'https://go.elementor.com/wp-dash-opt-in-v4-help-center/',
	startBuildingUrl: DOMPurify.sanitize( decodeHtmlUrl( elementorSettingsEditor4OptIn?.urls?.start_building ) ) || '#',
};

const optInImages = {
	squareSrc: '',
	landscapeSrc: '',
};

export const OptIn = ( { state } ) => {
	const [ showTerms, setShowTerms ] = useState( false );
	const [ successMessage, setSuccessMessage ] = useState( '' );
	const [ notifyMessage, setNotifyMessage ] = useState( '' );
	const [ errorMessage, setErrorMessage ] = useState( '' );

	useEffect( () => {
		const optInMessage = sessionStorage.getItem( OPT_IN_MSG );
		if ( optInMessage ) {
			setTimeout( () => {
				setSuccessMessage( optInMessage );
			}, 100 );
			sessionStorage.removeItem( OPT_IN_MSG );
		}

		const optOutMessage = sessionStorage.getItem( OPT_OUT_MSG );
		if ( optOutMessage ) {
			setTimeout( () => {
				setNotifyMessage( optOutMessage );
			}, 100 );
			sessionStorage.removeItem( OPT_OUT_MSG );
		}
	}, [] );

	const maybeOptIn = () => {
		triggerOptIn()
			.then( () => {
				sessionStorage.setItem( OPT_IN_MSG, i18n.messages.optInSuccess );
				window.location.reload();
			} )
			.catch( () => {
				setErrorMessage( i18n.messages.error );
			} );
	};

	const maybeOptOut = () => {
		triggerOptOut()
			.then( () => {
				sessionStorage.setItem( OPT_OUT_MSG, i18n.messages.optOut );
				window.location.reload();
			} )
			.catch( () => {
				setErrorMessage( i18n.messages.error );
			} );
	};

	const handlePopoverClose = () => {
		setShowTerms( false );
	};

	const isEnrolled = !! state?.features?.editor_v4;

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
							{ i18n.andMore } <Link color="text.primary" href={ optInLinks.readMoreUrl } target="_blank">{ i18n.readMore }</Link>
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
							onClick={ () => {
								setShowTerms( true );
							} }
							size="large"
							color="primary"
							variant="contained"
							sx={ { flexGrow: 1 } }
						>
							{ i18n.buttons.optIn }
						</Button>
					) : (
						<Button
							onClick={ () => window.location.href = optInLinks.startBuildingUrl }
							size="large"
							color="primary"
							variant="contained"
							sx={ { flexGrow: 1 } }
						>
							{ i18n.buttons.startBuilding }
						</Button>
					) }
					<Button
						onClick={ () => {
							setShowTerms( true );
						} }
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

				<TextNode>{ i18n.helpImprove } <Link underline="hover" href={ optInLinks.feedbackUrl } target="_blank">{ i18n.feedback }</Link></TextNode>
			</Stack>

			<Stack sx={ { flex: 1, px: 0 } }>
				{ optInImages.squareSrc ? (
					<Image
						src={ optInImages.squareSrc }
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

				{ optInImages.landscapeSrc ? (
					<Image
						src={ optInImages.landscapeSrc }
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

			{ showTerms && (
				<Terms onClose={ handlePopoverClose } onSubmit={ isEnrolled ? maybeOptOut : maybeOptIn } isEnrolled={ isEnrolled } />
			) }

			{ successMessage && (
				<Message severity="success" onClose={ () => setSuccessMessage( '' ) }>{ successMessage }</Message>
			) }

			{ notifyMessage && (
				<Message onClose={ () => setNotifyMessage( '' ) }>
					{ notifyMessage }
					<Link href={ optInLinks.feedbackUrl } target="_blank" color="inherit" sx={ { cursor: 'pointer' } }>{ i18n.tellUsWhy }</Link>
				</Message>
			) }

			{ errorMessage && (
				<Message severity="error" onClose={ () => setErrorMessage( '' ) }>{ errorMessage }</Message>
			) }
		</Container>
	);
};

OptIn.propTypes = {
	state: PropTypes.shape( {
		features: PropTypes.shape( {
			editor_v4: PropTypes.bool,
		} ),
	} ).isRequired,
};
