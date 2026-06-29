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
	type TextFieldProps,
	usePopupState,
} from '@elementor/ui';

import { useBoundProp } from '../../bound-prop-context';
import { DEFAULT_UNIT } from '../../utils/size-control';
import { NumberInput } from '../number-input';

type TextFieldInnerSelectionProps = {
	placeholder?: string;
	type: string;
	value: PropValue;
	onChange: ( event: React.ChangeEvent< HTMLInputElement > ) => void;
	onBlur?: ( event: React.FocusEvent< HTMLInputElement > ) => void;
	onKeyDown?: ( event: React.KeyboardEvent< HTMLInputElement > ) => void;
	onKeyUp?: ( event: React.KeyboardEvent< HTMLInputElement > ) => void;
	InputProps: TextFieldProps[ 'InputProps' ] & {
		endAdornment: React.JSX.Element;
	};
	inputProps?: TextFieldProps[ 'inputProps' ];
	disabled?: boolean;
	isPopoverOpen?: boolean;
	id?: string;
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
			InputProps,
			inputProps,
			disabled,
			isPopoverOpen,
			id,
		}: TextFieldInnerSelectionProps,
		ref
	) => {
		const { placeholder: boundPropPlaceholder } = useBoundProp( sizePropTypeUtil );

		const getCursorStyle = () => ( {
			input: { cursor: InputProps.readOnly ? 'default !important' : undefined },
		} );

		return (
			<NumberInput
				ref={ ref }
				sx={ getCursorStyle() }
				size="tiny"
				fullWidth
				type={ type }
				value={ value }
				onInput={ onChange }
				onKeyDown={ onKeyDown }
				onKeyUp={ onKeyUp }
				disabled={ disabled }
				onBlur={ onBlur }
				focused={ isPopoverOpen ? true : undefined }
				placeholder={ placeholder ?? ( String( boundPropPlaceholder?.size ?? '' ) || undefined ) }
				InputProps={ InputProps }
				inputProps={ inputProps }
				id={ id }
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
	const itemStyles = {
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'center',
	};
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
						primaryTypographyProps={ {
							variant: 'caption',
							sx: {
								...itemStyles,
								lineHeight: '1',
							},
						} }
						menuItemTextProps={ {
							sx: itemStyles,
						} }
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
