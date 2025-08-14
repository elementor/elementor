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
import { NumberInput } from '../number-input';

type TextFieldInnerSelectionProps = Omit< TextFieldProps, 'value' | 'onChange' > & {
	placeholder?: string;
	value: PropValue;
	onChange: ( value: string | number | null ) => void;
	disabled?: boolean;
	isPopoverOpen?: boolean;
	allowNegativeValue?: boolean;
	validateNumber?: ( value: number | null ) => boolean;
};

export const TextFieldInnerSelection = forwardRef(
	(
		{
			// value,
			onChange,
			placeholder,
			isPopoverOpen,
			validateNumber,
			allowNegativeValue = false,
			...props
		}: TextFieldInnerSelectionProps,
		ref
	) => {
		const { placeholder: boundPropPlaceholder } = useBoundProp( sizePropTypeUtil );

		const getCursorStyle = () => ( {
			input: { cursor: props.InputProps?.readOnly ? 'default !important' : undefined },
		} );

		const textFieldProps: Partial< TextFieldProps > = {
			...props,
			size: 'tiny',
			fullWidth: true,
			sx: getCursorStyle(),
			focused: isPopoverOpen ? true : undefined,
			placeholder: placeholder ?? ( String( boundPropPlaceholder?.size ?? '' ) || undefined ),
		};

		switch ( props.type ) {
			case 'number': {
				return (
					<NumberInput
						{ ...textFieldProps }
						ref={ ref }
						value={ props.value as number | null }
						onChange={ onChange }
						validate={ validateNumber }
						min={ allowNegativeValue ? -Number.MAX_VALUE : 0 }
					/>
				);
			}

			default: {
				const handleChange = ( event: React.ChangeEvent< HTMLInputElement > ) => {
					onChange( event.target.value );
				};

				return <TextField { ...textFieldProps } ref={ ref } onChange={ handleChange } />;
			}
		}
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
