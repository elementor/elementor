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
import { AlertTriangleIcon } from '@elementor/icons';
import { __ } from '@wordpress/i18n';

import { TextNode, AdvantagesList, AdvantagesListItem } from './opt-in-content';
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
	title: __( 'The road to Editor V4', 'elementor' ),
	chip: __( 'Alpha', 'elementor' ),

	welcomeText: __( 'Welcome to a new era of web creation with Editor V4. It’s faster, more flexible, and built with a fresh approach to structure & styling.', 'elementor' ),

	advantagesHeader: __( 'Here’s what’s inside the alpha version:', 'elementor' ),
	advantages: [
		__( 'Unparalleled performance - Cleaner code & a lighter CSS footprint.', 'elementor' ),
		__( 'Professional tools at your fingertips - classes and states.', 'elementor' ),
		__( 'Consistent styling experience - A unified Style tab for all elements.', 'elementor' ),
		__( 'Fully responsive design - Customize any style property per screen.', 'elementor' ),
	],
	andMore: __( 'And much more!', 'elementor' ),
	readMore: __( 'Learn more', 'elementor' ),

	warning: __( 'Editor V4 is still in alpha and should not be used on live sites yet.', 'elementor' ),

	feedback: __( 'We’d love your feedback!', 'elementor' ),
	overToGithub: __( 'Head over to Github', 'elementor' ),
	tellUsWhy: __( 'Tell us why', 'elementor' ),

	image: __( 'Editor V4', 'elementor' ),

	buttons: {
		tryOut: __( 'Try out the new experience', 'elementor' ),
		optIn: __( 'Activate the new experience', 'elementor' ),
		optOut: __( 'Deactivate V4', 'elementor' ),
	},

	messages: {
		optInSuccess: __( 'Welcome! You’ve got the newest version of the editor.', 'elementor' ),
		optOut: __( 'You’ve deactivated the new Editor. Have feedback?', 'elementor' ),
		error: __( 'Ouch, there was a glitch. Try activating V4 again soon.', 'elementor' ),
	},
};

const optInLinks = {
	feedbackUrl: 'https://go.elementor.com/wp-dash-opt-in-v4-feedback/',
	readMoreUrl: 'https://go.elementor.com/wp-dash-opt-in-v4-help-center/',
	tryOutUrl: DOMPurify.sanitize( decodeHtmlUrl( elementorSettingsEditor4OptIn?.urls?.start_building ) ) || '#',
};

const optInImages = {
	square: {
		src: 'https://assets.elementor.com/v4-promotion/v1/images/v4_opt_in_500.png',
		sx: {
			width: '100%',
			maxHeight: '507px',
			maxWidth: 'sm',
			height: 'auto',
			mx: 'auto',
			borderRadius: 2,
		},
	},
	landscape: {
		src: 'https://assets.elementor.com/v4-promotion/v1/images/v4_opt_in_260.png',
		sx: {
			width: '100%',
			height: 'auto',
			maxHeight: '260px',
			mx: 'auto',
			maxWidth: 'sm',
			borderRadius: 2,
		},
	},
};

export const OptIn = ( { state } ) => {
	const [ showTerms, setShowTerms ] = useState( false );
	const [ optInMessage, setOptInMessage ] = useState( '' );
	const [ optOutMessage, setOptOutMessage ] = useState( '' );
	const [ errorMessage, setErrorMessage ] = useState( '' );

	useEffect( () => {
		const optInMsg = sessionStorage.getItem( OPT_IN_MSG );
		const optOutMsg = sessionStorage.getItem( OPT_OUT_MSG );

		if ( optInMsg ) {
			setTimeout( () => {
				setOptInMessage( optInMsg );
			}, 100 );
			sessionStorage.removeItem( OPT_IN_MSG );
		}

		if ( optOutMsg ) {
			setTimeout( () => {
				setOptOutMessage( optOutMsg );
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
		<Container maxWidth="xl" sx={ {
			marginBlockStart: 2.5,
			display: 'flex',
			flexBasis: '100%',
			gap: 3,
			flexDirection: { xs: 'column-reverse', md: 'row' },
		} }>
			<Stack sx={ { flex: 1, maxWidth: { md: '507px', sm: '600px' }, gap: 2.5, mx: 'auto' } }>
				<Stack direction="row" alignItems="center" gap={ 1 }>
					<TextNode variant="h4" width="fit-content">{ i18n.title }</TextNode>
					<Chip size="small" color="secondary" variant="filled" label={ i18n.chip } />
				</Stack>

				<Stack direction="column" gap={ 3 }>
					<Box>
						<TextNode>{ i18n.welcomeText }</TextNode>
					</Box>

					<Box>
						<TextNode variant="subtitle1" sx={ { mb: 1.5 } }>{ i18n.advantagesHeader }</TextNode>
						<AdvantagesList>
							{ i18n.advantages.map( ( entry, i ) => (
								<AdvantagesListItem key={ i }>{ entry }</AdvantagesListItem>
							) ) }
							<AdvantagesListItem key={ i18n.advantages.length }>
								{ i18n.andMore } <Link color="text.primary" href={ optInLinks.readMoreUrl } target="_blank">{ i18n.readMore }</Link>
							</AdvantagesListItem>
						</AdvantagesList>
					</Box>
				</Stack>

				<Stack direction="row" alignItems="self-start" gap={ 0.5 } sx={ { mb: 2.5 } }>
					<AlertTriangleIcon color="action" />
					<Box>
						<TextNode>{ i18n.warning }</TextNode>
					</Box>
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
							onClick={ () => window.location.href = optInLinks.tryOutUrl }
							size="large"
							color="primary"
							variant="contained"
							sx={ { flexGrow: 1 } }
						>
							{ i18n.buttons.tryOut }
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

				<TextNode>{ i18n.feedback } <Link underline="hover" href={ optInLinks.feedbackUrl } target="_blank">{ i18n.overToGithub }</Link></TextNode>
			</Stack>

			<Stack sx={ { flex: 1, px: 0, maxWidth: { md: '507px', sm: '600px' }, mx: 'auto' } }>
				{ optInImages.square.src ? (
					<Image
						src={ optInImages.square.src }
						alt={ i18n.image }
						sx={ {
							...optInImages.square.sx,
							display: { xs: 'none', md: 'block' },
						} } />
				) : (
					<ImageSquarePlaceholder sx={ {
						...optInImages.square.sx,
						display: { xs: 'none', md: 'block' },
					} } />
				) }

				{ optInImages.landscape.src ? (
					<Image
						src={ optInImages.landscape.src }
						alt={ i18n.image }
						sx={ {
							...optInImages.landscape.sx,
							display: { xs: 'block', md: 'none' },
						} } />
				) : (
					<ImageLandscapePlaceholder sx={ {
						...optInImages.landscape.sx,
						display: { xs: 'block', md: 'none' },
					} } />
				) }
			</Stack>

			{ showTerms && (
				<Terms onClose={ handlePopoverClose } onSubmit={ isEnrolled ? maybeOptOut : maybeOptIn } isEnrolled={ isEnrolled } />
			) }

			{ optInMessage && (
				<Message onClose={ () => setOptInMessage( '' ) } >{ optInMessage }</Message>
			) }

			{ optOutMessage && (
				<Message
					onClose={ () => setOptOutMessage( '' ) }
					action={
						<Link
							href={ optInLinks.feedbackUrl }
							target="_blank"
							color="inherit"
							sx={ { cursor: 'pointer', textDecoration: 'none', pl: 3 } }
						>
							{ i18n.tellUsWhy }
						</Link>
					}
				>
					{ optOutMessage }
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
