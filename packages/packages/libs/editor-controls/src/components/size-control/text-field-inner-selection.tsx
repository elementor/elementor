import * as React from 'react';
import { forwardRef, useId } from 'react';
import { type PropValue, sizePropTypeUtil } from '@elementor/editor-props';
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

import { useBoundProp } from '../../bound-prop-context';
import { DEFAULT_UNIT } from '../../utils/size-control';

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
		const { placeholder: boundPropPlaceholder } = useBoundProp( sizePropTypeUtil );

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
				placeholder={ placeholder ?? ( String( boundPropPlaceholder?.size ?? '' ) || undefined ) }
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

	const { placeholder, showPrimaryColor } = useUnitPlaceholder( value );

	return (
		<InputAdornment position="end">
			<StyledButton
				isPrimaryColor={ showPrimaryColor }
				size="small"
				disabled={ disabled }
				{ ...bindTrigger( popupState ) }
			>
				{ placeholder ?? alternativeOptionLabels[ value ] ?? value }
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

function useUnitPlaceholder( value: string ) {
	const { value: externalValue, placeholder } = useBoundProp( sizePropTypeUtil );
	const size = externalValue?.size;
	const unit = externalValue?.unit;

	const isCustomUnitWithSize = value === 'custom' && Boolean( size );
	const isAutoUnit = value === 'auto';
	const showPrimaryColor = isAutoUnit || isCustomUnitWithSize || Boolean( size );

	if ( ! placeholder ) {
		return {
			placeholder: null,
			showPrimaryColor,
		};
	}

	const isMissingUnit = ! unit;
	const showPlaceholder = isMissingUnit && value === DEFAULT_UNIT;

	return {
		placeholder: showPlaceholder ? placeholder.unit : undefined,
		showPrimaryColor,
	};
}

const StyledButton = styled( Button, {
	shouldForwardProp: ( prop ) => prop !== 'isPrimaryColor',
} )( ( { isPrimaryColor, theme } ) => ( {
	color: isPrimaryColor ? theme.palette.text.primary : theme.palette.text.tertiary,
	font: 'inherit',
	minWidth: 'initial',
	textTransform: 'uppercase',
} ) );
