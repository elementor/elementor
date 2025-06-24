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
		<DirectionProvider rtl={ false }>
			<ThemeProvider colorScheme={ colorScheme }>
				<LocationProvider history={ router.appHistory }>
					<Stack
						direction="column"
						sx={ {
							minHeight: '100vh',
							...sx,
						} }
						{ ...rest }
					>
						{ topBar }
						
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
						
						{ footer }
					</Stack>
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
