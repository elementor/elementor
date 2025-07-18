import { ThemeProvider, DirectionProvider, Box } from '@elementor/ui';
import PropTypes from 'prop-types';

export default function BaseLayout( props ) {
	const {
		children,
		topBar,
		footer,
		sx = {},
		...rest
	} = props;

	const uiTheme = elementorAppConfig[ 'import-export-customization' ]?.uiTheme || 'auto';
	const isDarkMode = 'dark' === uiTheme || ( 'auto' === uiTheme && window.matchMedia && window.matchMedia( `(prefers-color-scheme: dark)` ).matches );

	const colorScheme = isDarkMode ? 'dark' : 'light';
	const isRTL = elementorCommon?.config?.isRTL || false;

	return (
		<DirectionProvider rtl={ isRTL }>
			<ThemeProvider colorScheme={ colorScheme }>
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
