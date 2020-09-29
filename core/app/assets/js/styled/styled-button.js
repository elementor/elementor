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
	line-height: 1;
	cursor: pointer;
	padding: 10px;

	.rotem {
		color: yellow;
	}
`;

export const StyledButton = ( props ) => (
	<Theme default={ defaultTheme } dark={ darkTheme }>
		<Button { ...props } className="eps-button">{ props.children }</Button>
	</Theme>
);

StyledButton.propTypes = {
	children: PropTypes.any,
};
