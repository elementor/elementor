import { LocationProvider } from '@reach/router';
import router from '@elementor/router';
import { ThemeProvider, DirectionProvider, Stack, Box } from '@elementor/ui';
import PropTypes from 'prop-types';

export default function BaseLayout( props ) {
	const {
		children,
		topBar,
		footer,
		sx = {},
		...rest
	} = props;

	const isDarkMode = document.body.classList.contains( 'eps-theme-dark' );
	const colorScheme = isDarkMode ? 'dark' : 'light';

	return (
		<DirectionProvider rtl={ elementorCommon.config.isRTL }>
			<ThemeProvider colorScheme={ colorScheme }>
				<LocationProvider history={ router.appHistory }>
					<Box
						sx={ {
							height: '100vh',
							display: 'flex',
							flexDirection: 'column',
							overflow: 'hidden',
							...sx,
						} }
						{ ...rest }
					>
						<Box sx={ { position: 'sticky', top: 0 } }>
							{ topBar }
						</Box>
						
						<Box
							component="main"
							sx={ {
								flex: 1,
								overflow: 'auto',
								display: 'flex',
								flexDirection: 'column',
							} }
						>
							{ children }
						</Box>
						
						<Box sx={ { position: 'sticky', bottom: 0 } }>
							{ footer }
						</Box>
					</Box>
				</LocationProvider>
			</ThemeProvider>
		</DirectionProvider>
	);
}

BaseLayout.propTypes = {
	children: PropTypes.node.isRequired,
	topBar: PropTypes.node,
	footer: PropTypes.node,
	sx: PropTypes.object,
};
