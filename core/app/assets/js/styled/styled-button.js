import styled from 'styled-components';
import _$ from 'elementor-styles';
import Theme from './theme';

const defaultTheme = {
	backgroundColor: _$.themeColors( 'info' ),
};

const darkTheme = {
	backgroundColor: _$.themeColors( 'warning' ),
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

export const StyledButton = ( props ) => (
	<Theme default={ defaultTheme } dark={ darkTheme }>
		<Button>{ props.children }</Button>
	</Theme>
);

StyledButton.propTypes = {
	children: PropTypes.any,
};
