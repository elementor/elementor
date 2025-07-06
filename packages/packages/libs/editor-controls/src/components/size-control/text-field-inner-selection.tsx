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
	TextField,
	type TextFieldProps,
	usePopupState,
} from '@elementor/ui';

type TextFieldInnerSelectionProps = {
	placeholder?: string;
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
};

export const SelectionEndAdornment = < T extends string >( {
	options,
	alternativeOptionLabels = {} as Record< T, React.ReactNode >,
	onClick,
	value,
	menuItemsAttributes = {},
	disabled,
}: SelectionEndAdornmentProps< T > ) => {
	const popupState = usePopupState( {
		variant: 'popover',
		popupId: useId(),
	} );

	const handleMenuItemClick = ( index: number ) => {
		onClick( options[ index ] );
		popupState.close();
	};

	return (
		<InputAdornment position="end">
			<Button
				size="small"
				color="secondary"
				disabled={ disabled }
				sx={ { font: 'inherit', minWidth: 'initial', textTransform: 'uppercase' } }
				{ ...bindTrigger( popupState ) }
			>
				{ alternativeOptionLabels[ value ] ?? value }
			</Button>

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
