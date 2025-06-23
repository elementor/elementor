import { LocationProvider } from '@reach/router';
import router from '@elementor/router';
import { ThemeProvider, DirectionProvider } from '@elementor/ui';
import Stack from '@elementor/ui/Stack';
import Box from '@elementor/ui/Box';
import PropTypes from 'prop-types';

import TopBar from './top-bar';
import Footer from './footer';

export default function BaseLayout( props ) {
	const {
		children,
		topBarProps = {},
		footerProps = {},
		showTopBar = true,
		showFooter = false,
		sx = {},
		...rest
	} = props;

	return (
		<DirectionProvider rtl={ false }>
			<ThemeProvider colorScheme={ window.elementor?.getPreferences?.( 'ui_theme' ) || 'auto' }>
				<LocationProvider history={ router.appHistory }>
					<Stack
						direction="column"
						sx={ {
							minHeight: '100vh',
							...sx,
						} }
						{ ...rest }
					>
						{ showTopBar && (
							<TopBar { ...topBarProps } />
						) }
						
						<Box
							component="main"
							sx={ {
								flex: 1,
								display: 'flex',
								flexDirection: 'column',
								overflow: 'auto',
							} }
						>
							{ children }
						</Box>
						
						{ showFooter && (
							<Footer { ...footerProps } />
						) }
					</Stack>
				</LocationProvider>
			</ThemeProvider>
		</DirectionProvider>
	);
}

BaseLayout.propTypes = {
	children: PropTypes.node.isRequired,
	topBarProps: PropTypes.object,
	footerProps: PropTypes.object,
	showTopBar: PropTypes.bool,
	showFooter: PropTypes.bool,
	sx: PropTypes.object,
};
