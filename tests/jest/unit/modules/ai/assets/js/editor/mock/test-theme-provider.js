import * as React from 'react';
import { createTheme } from '@elementor/ui';
import { StyledEngineProvider } from '@elementor/ui/styles';
import { ThemeProvider } from '@mui/material/styles';

import PropTypes from 'prop-types';

// Disable Transitions when running tests
// https://stackoverflow.com/a/77460953	- Thanks.
export default class TestThemeProvider extends React.Component {
	disableTransitions = {
		defaultProps: {
			disablePortal: true,
			hideBackdrop: true,
		},
	};

	render() {
		const theme = createTheme( {
			palette: {
				primary: {
					main: '#f0abfc',
					light: '#f3bafd',
					dark: '#eb8efb',
					contrastText: '#0c0d0e',
					__unstableAccessibleMain: '#f0abfc',
					__unstableAccessibleLight: '#f3bafd',
				},
				global: {
					main: '#5eead4',
					light: '#99f6e4',
					dark: '#2adfcd',
					contrastText: '#0c0d0e',
					__unstableAccessibleMain: '#5eead4',
					__unstableAccessibleLight: '#99f6e4',
				},
				promotion: {
					main: '#93003f',
					light: '#b51243',
					dark: '#7e013b',
					contrastText: '#ffffff',
				},
			},
			components: {
				MuiDialog: this.disableTransitions,
				MuiModal: this.disableTransitions,
			},
		} );
		return (
			<StyledEngineProvider injectFirst>
				<ThemeProvider theme={ theme }>
					<div data-testid="root">
						{ this.props.children }
					</div>
				</ThemeProvider>
			</StyledEngineProvider>
		);
	}
}

TestThemeProvider.propTypes = {
	children: PropTypes.node.isRequired,
};
