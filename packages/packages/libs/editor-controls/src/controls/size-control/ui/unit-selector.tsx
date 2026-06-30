import * as React from 'react';
import { useId } from 'react';
import { MenuListItem } from '@elementor/editor-ui';
import { bindMenu, bindTrigger, Button, Menu, styled, usePopupState } from '@elementor/ui';

export type UnitSelectorProps< T extends string > = {
	options: T[];
	value: T;
	onSelect: ( value: T ) => void;
	isUnitHighlighted: boolean;
	menuItemsAttributes?: { [ key in T ]?: Record< string, unknown > };
	optionLabelOverrides?: { [ key in T ]?: React.ReactNode };
	disabled?: boolean;
};

const menuItemContentStyles = {
	display: 'flex',
	flexDirection: 'column',
	justifyContent: 'center',
};

export const UnitSelector = < T extends string >( {
	value,
	isUnitHighlighted,
	onSelect,
	options,
	disabled,
	menuItemsAttributes = {},
	optionLabelOverrides = {},
}: UnitSelectorProps< T > ) => {
	const popupState = usePopupState( {
		variant: 'popover',
		popupId: useId(),
	} );

	const handleMenuItemClick = ( option: T ) => {
		onSelect( option );

		popupState.close();
	};

	return (
		<>
			<StyledButton
				isHighlighted={ isUnitHighlighted }
				disabled={ disabled }
				size="small"
				{ ...bindTrigger( popupState ) }
			>
				{ optionLabelOverrides[ value ] ?? value }
			</StyledButton>

			<Menu MenuListProps={ { dense: true } } { ...bindMenu( popupState ) }>
				{ options.map( ( option ) => (
					<MenuListItem
						key={ option }
						onClick={ () => handleMenuItemClick( option ) }
						{ ...menuItemsAttributes?.[ option ] }
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
						{ optionLabelOverrides[ option ] ?? option.toUpperCase() }
					</MenuListItem>
				) ) }
			</Menu>
		</>
	);
};

const StyledButton = styled( Button, {
	shouldForwardProp: ( prop ) => prop !== 'isHighlighted',
} )( ( { isHighlighted, theme } ) => ( {
	color: isHighlighted ? theme.palette.text.primary : theme.palette.text.tertiary,
	font: 'inherit',
	minWidth: 'initial',
	textTransform: 'uppercase',
} ) );
