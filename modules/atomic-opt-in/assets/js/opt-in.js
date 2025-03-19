import { useState } from 'react';
import {
	Container,
	Button,
	Box,
	Stack,
	Typography,
	Image,
	Chip,
	Link,
	Snackbar,
	SvgIcon,
	Alert,
} from '@elementor/ui';
import { AlertTriangleFilledIcon } from '@elementor/icons';
import { __ } from '@wordpress/i18n';

export const OptIn = () => {
	const i18n = {
		title: __( 'The Road to Editor V4', 'elementor' ),
		chip: __( 'Alpha', 'elementor' ),
		welcomeText: __( "Welcome to a new era of web creation with Elementor. Editor V4 is faster, more flexible, and built for modern design. Here's what's inside:", 'elementor' ),
		advantages: [
			__( 'Cleaner code & lighter CSS output for better performance', 'elementor' ),
			__( 'Advanced CSS styling fo classes & states', 'elementor' ),
			__( 'A unified Style tab for seamless design control', 'elementor' ),
			__( 'Fully responsive customization', 'elementor' ),
		],
		warning: __( 'Keep in mind: Editor V4 is still in alpha and should not be used on live sites yet.', 'elementor' ),
		andMore: __( 'and much more', 'elementor' ),
		readMore: __( 'Read here', 'elementor' ),
		startButton: __( 'Start building in V4', 'elementor' ),
		optInButton: __( 'Opt-in to V4', 'elementor' ),
		optOutButton: __( 'Opt-out from V4', 'elementor' ),
		helpImprove: __( "We'd love to hear from you.", 'elementor' ),
		feedback: __( 'Send us your feedback', 'elementor' ),
		image: __( 'Editor V4', 'elementor' ),

		message: {
			success: __( 'You’ve successfully opted in to V4!', 'elementor' ),
			error: __( 'Something went wrong. Please try again or contact support if the issue persists.', 'elementor' ),
		},
	};

	const [ isEnrolled, setIsEnrolled ] = useState( false );

	const [ successMessage, setSuccessMessage ] = useState( '' );
	const [ errorMessage, setErrorMessage ] = useState( '' );

	const imageSrcLandscape = '';
	const imageSrcSquare = '';

	const feedbackUrl = 'https://go.elementor.com/wp-dash-opt-in-v4-feedback/';
	const readMoreUrl = 'https://go.elementor.com/wp-dash-opt-in-v4-help-center/';

	const maybeOptIn = () => {
		setIsEnrolled( true );
		setSuccessMessage( i18n.message.success );
	};

	const maybeOptOut = () => {
		setIsEnrolled( false );
		setErrorMessage( i18n.message.error );
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
					<Typography variant="h4" width="fit-content">{ i18n.title }</Typography>
					<Chip size="small" color="secondary" variant="filled" label={ i18n.chip } />
				</Stack>

				<Typography variant="body1">{ i18n.welcomeText }</Typography>

				<ContentList>
					{ i18n.advantages.map( ( entry, i ) => (
						<ContentListItem key={ i }>{ entry }</ContentListItem>
					) ) }
					<ContentListItem key="e-0">
						{ i18n.andMore } <Link href={ readMoreUrl } target="_blank">{ i18n.readMore }</Link>
					</ContentListItem>
				</ContentList>

				<Stack direction="row" alignItems="self-start" gap={ 1 }>
					<AlertTriangleFilledIcon />
					<Typography>{ i18n.warning }</Typography>
				</Stack>

				<Stack direction="column" width="clamp(240px, max(340px, 75%), 340px)" maxWidth="100%" gap={ 2 }>
					{ ( ! isEnrolled ) ? (
						<Button onClick={ maybeOptIn } size="large" color="primary" variant="contained" sx={ { flexGrow: 1 } }>{ i18n.optInButton }</Button>
					) : (
						<>
							<Button onClick={ maybeStart } size="large" color="primary" variant="contained" sx={ { flexGrow: 1 } }>{ i18n.startButton }</Button>
							<Button onClick={ maybeOptOut } size="large" color="secondary" variant="outlined" sx={ { flexGrow: 1 } }>{ i18n.optOutButton }</Button>
						</>
					) }
				</Stack>

				<Typography>{ i18n.helpImprove } <Link href={ feedbackUrl } target="_blank">{ i18n.feedback }</Link></Typography>
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
				<Snackbar open autoHideDuration={ 2000 } anchorOrigin={ { vertical: 'bottom', horizontal: 'right' } } onClose={ () => setSuccessMessage( '' ) }>
					<Alert variant="filled" severity="success" onClose={ () => setSuccessMessage( '' ) }>{ successMessage }</Alert>
				</Snackbar>
			) }

			{ errorMessage && (
				<Snackbar open autoHideDuration={ 4000 } anchorOrigin={ { vertical: 'bottom', horizontal: 'right' } } onClose={ () => setErrorMessage( '' ) }>
					<Alert variant="filled" severity="error" onClose={ () => setErrorMessage( '' ) }>{ errorMessage }</Alert>
				</Snackbar>
			) }
		</Container>
	);
};

const ContentList = ( { children, ...props } ) => {
	return (
		<Box component="ul" { ...props }>
			{ children }
		</Box>
	);
};

ContentList.propTypes = {
	children: PropTypes.node,
};

const ContentListItem = ( { children, ...props } ) => {
	return (
		<Typography component="li" sx={ { listStyle: 'disc', marginInlineStart: 4 } } { ...props }>
			{ children }
		</Typography>
	);
};

ContentListItem.propTypes = {
	children: PropTypes.node,
};

const ImageLandscapePlaceholder = ( props ) => {
	return (
		<SvgIcon viewBox="0 0 600 260" { ...props }>
			<rect x="0" y="0" width="600" height="260" fill="#d9d9d9" />
		</SvgIcon>
	);
};

const ImageSquarePlaceholder = ( props ) => {
	return (
		<SvgIcon viewBox="0 0 500 500" { ...props }>
			<rect x="0" y="0" width="500" height="500" fill="#d9d9d9" />
		</SvgIcon>
	);
};
