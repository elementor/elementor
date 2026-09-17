import * as React from 'react';
import { getElementLabel } from '@elementor/editor-elements';
import { stringPropTypeUtil, type StringPropValue } from '@elementor/editor-props';
import { MenuListItem } from '@elementor/editor-ui';
import { Select, type SelectChangeEvent, styled, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useBoundProp } from '../bound-prop-context';
import { ConditionalControlInfotip } from '../components/conditional-control-infotip';
import ControlActions from '../control-actions/control-actions';
import { createControl } from '../create-control';
import { type ControlProps } from '../utils/types';

export type SelectOption = {
	label: string;
	value: StringPropValue[ 'value' ];
	disabled?: boolean;
};

type Props = ControlProps< {
	options: SelectOption[];
	onChange?: ( newValue: string | null, previousValue: string | null | undefined ) => void;
	fallbackLabels?: Record< string, string >;
} >;

const StyledSelect = styled( Select )( () => ( { '.MuiSelect-select.Mui-disabled': { cursor: 'not-allowed' } } ) );

export const HtmlTagControl = createControl( ( props: Props ) => {
	const {
		options,
		onChange,
		fallbackLabels = {},
		context: { elementId },
	} = props;

	const { value, setValue, disabled, placeholder } = useBoundProp( stringPropTypeUtil );
	const handleChange = ( event: SelectChangeEvent< StringPropValue[ 'value' ] > ) => {
		const newValue = event.target.value || null;

		onChange?.( newValue, value );
		setValue( newValue );
	};

	const elementLabel = getElementLabel( elementId ) ?? 'element';
	const infoTipProps = {
		title: __( 'HTML Tag', 'elementor' ),
		/* translators: %s is the element name. */
		description: __(
			`The tag is locked to 'a' tag because this %s has a link. To pick a different tag, remove the link first.`,
			'elementor'
		).replace( '%s', elementLabel ),
		isEnabled: !! disabled,
	};

	const renderValue = ( selectedValue: string | null ) => {
		if ( selectedValue ) {
			return findOptionByValue( selectedValue )?.label || fallbackLabels[ selectedValue ] || selectedValue;
		}

		if ( ! placeholder ) {
			return '';
		}

		const placeholderOption = findOptionByValue( placeholder );
		const displayText = placeholderOption?.label || placeholder;

		return (
			<Typography component="span" variant="caption" color="text.tertiary">
				{ displayText }
			</Typography>
		);
	};

	const findOptionByValue = ( searchValue: string | null ) => options.find( ( opt ) => opt.value === searchValue );

	return (
		<ControlActions>
			<ConditionalControlInfotip { ...infoTipProps }>
				<StyledSelect
					sx={ { overflow: 'hidden', cursor: disabled ? 'not-allowed' : undefined } }
					displayEmpty
					size="tiny"
					renderValue={ renderValue }
					value={ value ?? '' }
					onChange={ handleChange }
					disabled={ disabled }
					fullWidth
				>
					{ options.map( ( { label, ...itemProps } ) => (
						<MenuListItem key={ itemProps.value } { ...itemProps } value={ itemProps.value ?? '' }>
							{ label }
						</MenuListItem>
					) ) }
				</StyledSelect>
			</ConditionalControlInfotip>
		</ControlActions>
	);
} );
