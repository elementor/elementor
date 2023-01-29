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
		backgroundColor: 'transparent',
		color: '#fff',
	},
} ) );

type ExtraProps = {
	href?: string;
	target?: string;
}

export default function PopoverMenuItem( { children, onClick, href, target, disabled, ...props }: MenuItemProps & ExtraProps ) {
	return (
		<StyledMenuItem { ...props } disabled={ disabled }>
			<StyledButton
				disableRipple
				onClick={ onClick }
				href={ href }
				target={ target }
				disabled={ disabled }
			>
				{ children }
			</StyledButton>
		</StyledMenuItem>
	);
}
