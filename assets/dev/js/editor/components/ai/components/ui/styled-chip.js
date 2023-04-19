import { Chip, styled } from '@elementor/ui';

const StyledChip = styled( Chip )( () => ( {
	'& .MuiChip-label': {
		lineHeight: 1.5,
	},
	'& .MuiSvgIcon-root.MuiChip-icon': {
		fontSize: '1.25rem',
	},
} ) );

export default StyledChip;
