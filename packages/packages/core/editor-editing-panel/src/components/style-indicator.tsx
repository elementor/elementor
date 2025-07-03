import { styled, type Theme } from '@elementor/ui';

export const StyleIndicator = styled( 'div', {
	shouldForwardProp: ( prop: string ) => ! [ 'isOverridden', 'getColor' ].includes( prop ),
} )<
	| {
			isOverridden?: boolean;
			getColor?: never;
	  }
	| {
			isOverridden?: boolean;
			getColor?: ( ( theme: Theme ) => string ) | null;
	  }
>`
	width: 5px;
	height: 5px;
	border-radius: 50%;
	background-color: ${ ( { theme, isOverridden, getColor } ) => {
		if ( isOverridden ) {
			return theme.palette.warning.light;
		}

		const providerColor = getColor?.( theme );

		return providerColor ?? theme.palette.text.disabled;
	} };
`;
