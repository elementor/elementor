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
				accent: {
					main: '#E3D026',
					light: '#E9DB5D',
					dark: '#A29415',
					contrastText: '#242105',
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
