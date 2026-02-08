import { MenuList, styled } from '@elementor/ui';

export const VariablesStyledMenuList = styled( MenuList )< { disabled?: boolean } >( ( { theme, disabled } ) => ( {
	'& > li': {
		height: 32,
		width: '100%',
		display: 'flex',
		alignItems: 'center',
	},
	'& > [role="option"]': {
		...theme.typography.caption,
		lineHeight: 'inherit',
		padding: theme.spacing( 0.5, 1, 0.5, 2 ),
		...( ! disabled && {
			'&:hover, &:focus': {
				backgroundColor: theme.palette.action.hover,
			},
			cursor: 'pointer',
		} ),
		'&[aria-selected="true"]': {
			backgroundColor: theme.palette.action.selected,
		},
		textOverflow: 'ellipsis',
		position: 'absolute',
		top: 0,
		left: 0,
		'&:hover .MuiIconButton-root, .MuiIconButton-root:focus': {
			opacity: 1,
		},
	},
	width: '100%',
	position: 'relative',
} ) );
