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

export type SelectOption = {
	label: string;
	value: StringPropValue[ 'value' ];
	disabled?: boolean;
};

type Props = {
	options: SelectOption[];
	onChange?: ( newValue: string | null, previousValue: string | null | undefined ) => void;
	fallbackLabels?: Record< string, string >;
};

const StyledSelect = styled( Select )( () => ( { '.MuiSelect-select.Mui-disabled': { cursor: 'not-allowed' } } ) );

export const HtmlTagControl = createControl( ( { options, onChange, fallbackLabels = {} }: Props ) => {
	const { value, setValue, disabled, placeholder } = useBoundProp( stringPropTypeUtil );
	const handleChange = ( event: SelectChangeEvent< StringPropValue[ 'value' ] > ) => {
		const newValue = event.target.value || null;

		onChange?.( newValue, value );
		setValue( newValue );
	};

	const elementLabel = getElementLabel() ?? 'element';
	const infoTipProps = {
		title: __( 'HTML Tag', 'elementor' ),
		/* translators: %s is the element name. */
		description: __(
			`The tag is locked to 'a' tag because this %s has a link. To pick a different tag, remove the link first.`,
			'elementor'
		).replace( '%s', elementLabel ),
		isEnabled: !! disabled,
	};

	return (
		<ControlActions>
			<ConditionalControlInfotip { ...infoTipProps }>
				<StyledSelect
					sx={ { overflow: 'hidden', cursor: disabled ? 'not-allowed' : undefined } }
					displayEmpty
					size="tiny"
					renderValue={ ( selectedValue: string | null ) => {
						const findOptionByValue = ( searchValue: string | null ) =>
							options.find( ( opt ) => opt.value === searchValue );

						if ( ! selectedValue || selectedValue === '' ) {
							if ( placeholder ) {
								const placeholderOption = findOptionByValue( placeholder );
								const displayText = placeholderOption?.label || placeholder;

								return (
									<Typography component="span" variant="caption" color="text.tertiary">
										{ displayText }
									</Typography>
								);
							}
							return '';
						}
						const option = findOptionByValue( selectedValue );
						return option?.label || fallbackLabels[ selectedValue ] || selectedValue;
					} }
					value={ value ?? '' }
					onChange={ handleChange }
					disabled={ disabled }
					fullWidth
				>
					{ options.map( ( { label, ...props } ) => (
						<MenuListItem key={ props.value } { ...props } value={ props.value ?? '' }>
							{ label }
						</MenuListItem>
					) ) }
				</StyledSelect>
			</ConditionalControlInfotip>
		</ControlActions>
	);
} );
