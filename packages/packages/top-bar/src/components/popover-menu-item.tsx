import { MenuItem, styled, MenuItemProps, menuItemClasses, svgIconClasses } from '@elementor/ui';

const StyledMenuItem = styled( ( props: MenuItemProps ) => (
	<MenuItem { ...props } />
) )( () => ( {
	color: '#fff',
	fontSize: '12px',
	display: 'flex',
	alignItems: 'center',
	gap: '12px',
	padding: '10px 12px',

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

export default function PopoverMenuItem( props: MenuItemProps ) {
	return <StyledMenuItem { ...props } />;
}
