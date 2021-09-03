import styled from 'styled-components';
//import Theme from 'theme';

const defaultTheme = {
	backgroundColor: 'blue',
};

const darkTheme = {
	backgroundColor: 'green',
};

const Button = styled.div`
	display: inline-flex;
	color: white;
	background-color: ${ ( props ) => props.theme.backgroundColor };
	line-height: 1;
	cursor: pointer;
	padding: 10px;
`;

export const StyledButton = ( props ) => (
	<Button { ...props } className="eps-button">{ props.children }</Button>
);

// export const StyledButton = ( props ) => (
// 	<Theme default={ defaultTheme } dark={ darkTheme }>
// 		<Button { ...props } className="eps-button">{ props.children }</Button>
// 	</Theme>
// );
