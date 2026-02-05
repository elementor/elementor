import * as React from 'react';
import { useId } from 'react';
import { type SizePropValue } from '@elementor/editor-props';
import { MenuListItem } from '@elementor/editor-ui';
import { bindMenu, bindTrigger, Button, Menu, styled, usePopupState } from '@elementor/ui';

type Props< T = SizePropValue[ 'value' ][ 'unit' ] > = {
	options: T[];
	value: T;
	onClick: ( value: T ) => void;
	showPrimaryColor: boolean;
};

const menuItemContentStyles = {
	display: 'flex',
	flexDirection: 'column',
	justifyContent: 'center',
};

export const UnitSelect = ( { value, showPrimaryColor, onClick, options }: Props ) => {
	const popupState = usePopupState( {
		variant: 'popover',
		popupId: useId(),
	} );

	const handleMenuItemClick = ( index: number ) => {
		onClick( options[ index ] );

		popupState.close();
	};

	return (
		<>
			<StyledButton isPrimaryColor={ showPrimaryColor } size="small" { ...bindTrigger( popupState ) }>
				{ value }
			</StyledButton>

			<Menu MenuListProps={ { dense: true } } { ...bindMenu( popupState ) }>
				{ options.map( ( option, index ) => (
					<MenuListItem
						key={ option }
						onClick={ () => handleMenuItemClick( index ) }
						primaryTypographyProps={ {
							variant: 'caption',
							sx: {
								...menuItemContentStyles,
								lineHeight: '1',
							},
						} }
						menuItemTextProps={ {
							sx: menuItemContentStyles,
						} }
					>
						{ option.toUpperCase() }
					</MenuListItem>
				) ) }
			</Menu>
		</>
	);
};

const StyledButton = styled( Button, {
	shouldForwardProp: ( prop ) => prop !== 'isPrimaryColor',
} )( ( { isPrimaryColor, theme } ) => ( {
	color: isPrimaryColor ? theme.palette.text.primary : theme.palette.text.tertiary,
	font: 'inherit',
	minWidth: 'initial',
	textTransform: 'uppercase',
} ) );
