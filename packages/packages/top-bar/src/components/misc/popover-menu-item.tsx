import { MenuItem, styled, MenuItemProps, menuItemClasses, svgIconClasses, Button } from '@elementor/ui';

const StyledMenuItem = styled( ( props: MenuItemProps ) => (
	<MenuItem { ...props } />
) )( () => ( {
	padding: 0,

	[ `& .${ svgIconClasses.root }` ]: {
		width: '14px',
		height: '14px',
	},

	[ [
		'&:hover',
		`&.${ menuItemClasses.focusVisible }`,
		`&.${ menuItemClasses.focusVisible }:hover`,
		`&.${ menuItemClasses.selected }`,
		`&.${ menuItemClasses.selected }:hover`,
		`&.${ menuItemClasses.selected }.${ menuItemClasses.focusVisible }`,
	].join( ', ' ) ]: {
		backgroundColor: 'rgba(255, 255, 255, 0.06)',
	},
} ) );

const StyledButton = styled( Button )( () => ( {
	color: '#fff',
	fontSize: '12px',
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'start',
	gap: '12px',
	padding: '8px 16px',
	width: '100%',
	textTransform: 'none',
	fontWeight: 400,

	'&:hover': {
		backgroundColor: 'none',
		color: '#fff',
	},
} ) );

type ExtraProps = {
	href?: string;
	target?: string;
}

export default function PopoverMenuItem( { children, onClick, href, target, ...props }: MenuItemProps & ExtraProps ) {
	return (
		<StyledMenuItem { ...props }>
			<StyledButton
				disableRipple
				onClick={ onClick }
				href={ href }
				target={ target }
			>
				{ children }
			</StyledButton>
		</StyledMenuItem>
	);
}
