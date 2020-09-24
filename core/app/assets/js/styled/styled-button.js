import styled, { createGlobalStyle } from 'styled-components';
import _$ from 'elementor-styles';
import Theme from './theme';

const defaultTheme = {
	backgroundColor: _$.themeColors( 'info' ),
};

const darkTheme = {
	backgroundColor: _$.themeColors( 'warning' ),
};

const GlobalStyle = createGlobalStyle`
	.eps-button {
		font-size: 40px;
	}
`;

const Button = styled.div`
	display: inline-flex;
	color: white;
	background-color: ${ ( props ) => _$.themeColors( props.color ) };
	line-height: 1;
	cursor: pointer;
	padding: 10px;
`;

Button.displayName = 'rotem123';

export const StyledButton = ( props ) => (
	<Theme default={ defaultTheme } dark={ darkTheme }>
		<GlobalStyle />
		<Button { ...props } className="eps-button">{ props.children }</Button>
	</Theme>
);

StyledButton.propTypes = {
	children: PropTypes.any,
};
