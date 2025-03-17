import React from 'react';
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
		title: __( 'The road to Editor V4', 'elementor' ),
		chip: __( 'Alpha', 'elementor' ),
		welcomeText: __( 'Welcome to Elementor v4, an evolution in web creation. Experience a more streamlined, flexible, and powerful editor with a fresh approach to structure and styling.', 'elementor' ),
		advantages: [
			__( 'A new way to build with atomic components', 'elementor' ),
			__( 'A unified styling system for consistency', 'elementor' ),
			__( 'More flexibility with local and global styles', 'elementor' ),
			__( 'Enhanced class management for scalable designs', 'elementor' ),
		],
		warning: __( 'V4 is still in alpha and should not be used on live sites yet', 'elementor' ),
		andMore: __( 'and much more', 'elementor' ),
		readMore: __( 'Read here', 'elementor' ),
		optInButton: __( 'Opt-in to V4', 'elementor' ),
		optOutButton: __( 'Opt-out from V4', 'elementor' ),
		image: __( 'Editor V4', 'elementor' ),
	};

	const readMoreUrl = 'https://go.elementor.com/wp-dash-opt-in-v4-help-center/';

	return (
		<React.Fragment>
			<Container maxWidth="lg">
				<Stack direction="column-reverse">
					<Container maxWidth="md">
						<Stack direction="column" gap={ 2.5 }>
							<Box display="flex" alignItems="center" gap={ 1 }>
								<Typography variant="h4">{ i18n.title }</Typography>
								<Chip size="small" color="secondary" variant="filled" label={ i18n.chip } />
							</Box>
							<Typography variant="body1">{ i18n.welcomeText }</Typography>
							<Box component="ul">
								{ i18n.advantages.map(
									( desc, i ) => <BoxItem component="li" key={ i }>{ desc }</BoxItem>
								) }
								<BoxItem component="li" key="e-0">
									{ i18n.andMore } <Link href={ readMoreUrl } target="_blank">{ i18n.readMore }</Link>
								</BoxItem>
							</Box>
							<Stack direction="row" gap={ 1 }>
								<Typography><AlertTriangleFilledIcon /> { i18n.warning }</Typography>
							</Stack>
							<Stack direction="column" maxWidth="xs" gap={ 1 }>
								<Button size="large" color="primary" variant="contained" sx={ { flexGrow: 1 } }>{ i18n.optInButton }</Button>
								<Button size="large" color="secondary" variant="outlined" sx={ { flexGrow: 1 } }>{ i18n.optOutButton }</Button>
							</Stack>
						</Stack>
					</Container>
					<Container maxWidth="md">
						<Image alt={ i18n.image } />
					</Container>
				</Stack>
			</Container>
		</React.Fragment>
	);
};

const BoxItem = styled( Typography )( ( { theme } ) => ( {
	listStyle: 'disc',
	marginInlineStart: theme.spacing( 4 ),
} ) );

App.propTypes = {
	isRTL: PropTypes.bool,
};

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
