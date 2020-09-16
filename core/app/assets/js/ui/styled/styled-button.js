export const StyledButton = styled.div`
	display: inline-flex;
	color: green;
	background-color: ${ _$.themeColors( 'success' ) };
	font-size: 13px;
	font-weight: $button-font-weight;
	line-height: 1;
	cursor: pointer;

	&:active {
		background-color: yellow;
	}

	&:hover {
		background-color: aqua;
	}
`;
