import * as React from 'react';
import { forwardRef, useId } from 'react';
import { type PropValue } from '@elementor/editor-props';
import { MenuListItem } from '@elementor/editor-ui';
import {
	bindMenu,
	bindTrigger,
	Button,
	InputAdornment,
	Menu,
	styled,
	TextField,
	type TextFieldProps,
	usePopupState,
} from '@elementor/ui';

type TextFieldInnerSelectionProps = {
	placeholder?: PropValue | string;
	type: string;
	value: PropValue;
	onChange: ( event: React.ChangeEvent< HTMLInputElement > ) => void;
	onBlur?: ( event: React.FocusEvent< HTMLInputElement > ) => void;
	onKeyDown?: ( event: React.KeyboardEvent< HTMLInputElement > ) => void;
	onKeyUp?: ( event: React.KeyboardEvent< HTMLInputElement > ) => void;
	shouldBlockInput?: boolean;
	inputProps: TextFieldProps[ 'InputProps' ] & {
		endAdornment: React.JSX.Element;
	};
	disabled?: boolean;
};

export const TextFieldInnerSelection = forwardRef(
	(
		{
			placeholder,
			type,
			value,
			onChange,
			onBlur,
			onKeyDown,
			onKeyUp,
			shouldBlockInput = false,
			inputProps,
			disabled,
		}: TextFieldInnerSelectionProps,
		ref
	) => {
		return (
			<TextField
				ref={ ref }
				sx={ { input: { cursor: shouldBlockInput ? 'default !important' : undefined } } }
				size="tiny"
				fullWidth
				type={ shouldBlockInput ? undefined : type }
				value={ value }
				onChange={ shouldBlockInput ? undefined : onChange }
				onKeyDown={ shouldBlockInput ? undefined : onKeyDown }
				onKeyUp={ shouldBlockInput ? undefined : onKeyUp }
				disabled={ disabled }
				onBlur={ onBlur }
				placeholder={ placeholder }
				InputProps={ inputProps }
			/>
		);
	}
);

type SelectionEndAdornmentProps< T extends string > = {
	options: T[];
	onClick: ( value: T ) => void;
	value: T;
	alternativeOptionLabels?: { [ key in T ]?: React.ReactNode };
	menuItemsAttributes?: { [ key in T ]?: Record< string, unknown > };
	disabled?: boolean;
	shouldHaveActiveColor: boolean;
	placeholder?: string;
};

export const SelectionEndAdornment = < T extends string >( {
	options,
	alternativeOptionLabels = {} as Record< T, React.ReactNode >,
	onClick,
	value,
	placeholder,
	menuItemsAttributes = {},
	disabled,
	shouldHaveActiveColor,
	placeholder,
}: SelectionEndAdornmentProps< T > ) => {
	const [ showPlaceholder, setShowPlaceholder ] = React.useState( !! placeholder );
	const popupState = usePopupState( {
		variant: 'popover',
		popupId: useId(),
	} );

	const handleMenuItemClick = ( index: number ) => {
		onClick( options[ index ] );
		popupState.close();

		if ( showPlaceholder ) {
			setShowPlaceholder( false );
		}
	};

	return (
		<InputAdornment position="end">
			<StyledButton
				isActive={ shouldHaveActiveColor }
				size="small"
				disabled={ disabled }
				{ ...bindTrigger( popupState ) }
			>
				{ showPlaceholder ? placeholder : alternativeOptionLabels[ value ] ?? value }
			</StyledButton>

			<Menu MenuListProps={ { dense: true } } { ...bindMenu( popupState ) }>
				{ options.map( ( option, index ) => (
					<MenuListItem
						key={ option }
						onClick={ () => handleMenuItemClick( index ) }
						{ ...menuItemsAttributes?.[ option ] }
					>
						{ alternativeOptionLabels[ option ] ?? option.toUpperCase() }
					</MenuListItem>
				) ) }
			</Menu>
		</InputAdornment>
	);
};

const StyledButton = styled( Button, {
	shouldForwardProp: ( prop ) => prop !== 'isActive',
} )( ( { isActive, theme } ) => ( {
	color: isActive ? theme.palette.text.primary : theme.palette.text.tertiary,
	font: 'inherit',
	minWidth: 'initial',
	textTransform: 'uppercase',
} ) );
