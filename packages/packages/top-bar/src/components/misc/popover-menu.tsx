import { Menu, styled, MenuProps, paperClasses, menuClasses } from '@elementor/ui';
import { MenuContextProvider } from '../../contexts/menu-context';

type ExtraProps = {
	spacing?: string | number;
}

const StyledMenu = styled( ( props: MenuProps ) => (
	<Menu elevation={ 0 } { ...props } />
), {
	shouldForwardProp: ( prop ) => 'spacing' !== prop,
} )<ExtraProps>( ( { spacing = '13px' } ) => ( {
	[ `& .${ paperClasses.root }` ]: {
		borderRadius: '6px',
		minWidth: '200px',
		color: 'white',
		backgroundColor: '#232629',
		marginTop: spacing,

		[ `& .${ menuClasses.list }` ]: {
			padding: 0,
		},
	},
} ) );

export default function PopoverMenu( { children, ...props }: MenuProps & ExtraProps ) {
	return (
		<MenuContextProvider type={ 'popover' }>
			<StyledMenu { ...props }>
				{ children }
			</StyledMenu>
		</MenuContextProvider>
	);
}
