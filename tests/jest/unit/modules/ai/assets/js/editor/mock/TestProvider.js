import * as React from 'react';
import { createTheme } from '@elementor/ui';
import { StyledEngineProvider } from '@elementor/ui/styles';
import { ThemeProvider } from '@mui/material/styles';
import {} from '@mui/material';

import PropTypes from 'prop-types';

// https://stackoverflow.com/a/77460953	- Thanks.
export default class TestProvider extends React.Component {
	disableTransitions = {
		defaultProps: {
			disablePortal: true,
			hideBackdrop: true,
			TransitionComponent: ( { children } ) => children,
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
			// Disable Transitions when running tests
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

TestProvider.propTypes = {
	children: PropTypes.node.isRequired,
};
