import styled, { ThemeProvider } from 'styled-components';
import _$ from 'elementor-styles';

const theme = {
	backgroundColor: _$.themeColors( 'success' ),
};

const darkTheme = {
	backgroundColor: _$.themeColors( 'info' ),
};

const Button = styled.div`
	display: inline-flex;
	color: white;
	background-color: ${ ( props ) => props.theme.backgroundColor };
	font-size: 13px;
	line-height: 1;
	cursor: pointer;
	padding: 10px;
`;

const isDarkMode = false;

export const StyledButton = ( props ) => (
	<ThemeProvider theme={ isDarkMode ? darkTheme : theme }>
		<Button>{ props.children }</Button>
	</ThemeProvider>
);

StyledButton.propTypes = {
	children: PropTypes.any,
};
