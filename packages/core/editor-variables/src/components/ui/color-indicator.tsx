import { styled, UnstableColorIndicator } from '@elementor/ui';

export const ColorIndicator = styled( UnstableColorIndicator )( ( { theme } ) => ( {
	borderRadius: `${ theme.shape.borderRadius / 2 }px`,
	marginRight: theme.spacing( 0.25 ),
} ) );
