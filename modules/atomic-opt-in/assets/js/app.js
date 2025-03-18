import React from 'react';
import { useState } from 'react';
import ReactUtils from 'elementor-utils/react';
import {
	DirectionProvider,
	LocalizationProvider,
	ThemeProvider,
	Container,
	Button,
	Box,
	Stack,
	Typography,
	Image,
	Chip,
	Link,
	styled,
} from '@elementor/ui';
import { AlertTriangleFilledIcon } from '@elementor/icons';
import { __ } from '@wordpress/i18n';

const OptIn = () => {
	const i18n = {
		title: __( 'The Road to Editor V4', 'elementor' ),
		chip: __( 'Alpha', 'elementor' ),
		welcomeText: __( `Welcome to a new era of web creation with Elementor. Editor V4 is faster, more flexible, and built for modern design. Here's what's inside:`, 'elementor' ),
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
		helpImprove: __( `We'd love to hear from you.`, 'elementor' ),
		feedback: __( 'Send us your feedback', 'elementor' ),
		image: __( 'Editor V4', 'elementor' ),

		message: {
			success: __( '', 'elementor' ),
			error: __( 'Something went wrong. Please try again or contact support if the issue persists.', 'elementor' ),
		},
	};

	const [ optIn, setOptIn ] = useState( false );

	const imageSrcLandscape = '';
	const imageSrcSquare = '';

	const feedbackUrl = 'https://go.elementor.com/wp-dash-opt-in-v4-help-center/';
	const readMoreUrl = 'https://go.elementor.com/wp-dash-opt-in-v4-help-center/';

	const maybeOptIn = () => {
		setOptIn( true );
	};

	const maybeOptOut = () => {
		setOptIn( false );
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

				<Box component="ul">
					{ i18n.advantages.map(
						( desc, i ) => <BoxItem component="li" key={ i }>{ desc }</BoxItem>
					) }
					<BoxItem component="li" key="e-0">
						{ i18n.andMore } <Link href={ readMoreUrl } target="_blank">{ i18n.readMore }</Link>
					</BoxItem>
				</Box>

				<Stack direction="row" alignItems="self-start" gap={ 1 }>
					<AlertTriangleFilledIcon />
					<Typography>{ i18n.warning }</Typography>
				</Stack>

				<Stack direction="column" width="clamp(240px, max(340px, 75%), 340px)" maxWidth="100%" gap={ 1 }>
					{ ( ! optIn ) ? ( <Button onClick={ maybeOptIn } size="large" color="primary" variant="contained" sx={ { flexGrow: 1 } }>{ i18n.optInButton }</Button> )
						: ( <>
								<Button onClick={ maybeStart } size="large" color="primary" variant="contained" sx={ { flexGrow: 1 } }>{ i18n.startButton }</Button>
								<Button onClick={ maybeOptOut } size="large" color="secondary" variant="outlined" sx={ { flexGrow: 1 } }>{ i18n.optOutButton }</Button>
					</> ) }
				</Stack>

				<Typography>{ i18n.helpImprove } <Link href={ feedbackUrl }>{ i18n.feedback }</Link></Typography>
			</Stack>

			<Stack sx={ { flex: 1, maxWidth: 'sm', p: { xs: 0, md: 5 } } }>
				<Image alt={ i18n.image + ' 1' } sx={ { display: { xs: 'none', md: 'block' } } } />
				<Image alt={ i18n.image + ' 2' } sx={ { display: { xs: 'block', md: 'none' } } } />
			</Stack>
		</Container>
	);
};

const BoxItem = styled( Typography )( ( { theme } ) => ( {
	listStyle: 'disc',
	marginInlineStart: theme.spacing( 4 ),
} ) );

const App = ( props ) => {
	return (
		<DirectionProvider rtl={ props.isRTL }>
			<LocalizationProvider>
				<ThemeProvider colorScheme={ 'light' }>
					<OptIn />
				</ThemeProvider>
			</LocalizationProvider>
		</DirectionProvider>
	);
};

App.propTypes = {
	isRTL: PropTypes.bool,
};

const init = () => {
	const rootElement = document.querySelector( '#page-editor-v4-opt-in' );

	if ( ! rootElement ) {
		return;
	}

	ReactUtils.render( (
		<App
			isRTL={ !! elementorCommon.config.isRTL }
		/>
	), rootElement );
};

init();
