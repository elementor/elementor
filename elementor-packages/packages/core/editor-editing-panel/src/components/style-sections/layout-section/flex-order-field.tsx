import * as React from 'react';
import { useState } from 'react';
import { ControlToggleButtonGroup, NumberControl, type ToggleButtonGroupItem } from '@elementor/editor-controls';
import { type NumberPropValue } from '@elementor/editor-props';
import { ArrowDownSmallIcon, ArrowUpSmallIcon, PencilIcon } from '@elementor/icons';
import { Grid } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { StylesField } from '../../../controls-registry/styles-field';
import { useStylesField } from '../../../hooks/use-styles-field';
import { UiProviders } from '../../../styles-inheritance/components/ui-providers';
import { ControlLabel } from '../../control-label';
import { SectionContent } from '../../section-content';
import { StylesFieldLayout } from '../../styles-field-layout';

type GroupControlItemOption = 'first' | 'last' | 'custom';

const ORDER_LABEL = __( 'Order', 'elementor' );

export const FIRST_DEFAULT_VALUE = -99999;
export const LAST_DEFAULT_VALUE = 99999;
const FIRST = 'first';
const LAST = 'last';
const CUSTOM = 'custom';

const orderValueMap = {
	[ FIRST ]: FIRST_DEFAULT_VALUE,
	[ LAST ]: LAST_DEFAULT_VALUE,
};

const items: ToggleButtonGroupItem< GroupControlItemOption >[] = [
	{
		value: FIRST,
		label: __( 'First', 'elementor' ),
		renderContent: ( { size } ) => <ArrowUpSmallIcon fontSize={ size } />,
		showTooltip: true,
	},
	{
		value: LAST,
		label: __( 'Last', 'elementor' ),
		renderContent: ( { size } ) => <ArrowDownSmallIcon fontSize={ size } />,
		showTooltip: true,
	},
	{
		value: CUSTOM,
		label: __( 'Custom', 'elementor' ),
		renderContent: ( { size } ) => <PencilIcon fontSize={ size } />,
		showTooltip: true,
	},
];

export const FlexOrderField = () => {
	const { value: order, setValue: setOrder, canEdit } = useStylesField< NumberPropValue | null >( 'order' );

	const [ groupControlValue, setGroupControlValue ] = useState( getGroupControlValue( order?.value || null ) );

	const handleToggleButtonChange = ( group: GroupControlItemOption | null ) => {
		setGroupControlValue( group );

		if ( ! group || group === CUSTOM ) {
			setOrder( null );

			return;
		}

		setOrder( { $$type: 'number', value: orderValueMap[ group ] } );
	};

	return (
		<StylesField bind="order" propDisplayName={ ORDER_LABEL }>
			<UiProviders>
				<StylesFieldLayout label={ ORDER_LABEL }>
					<SectionContent>
						<ControlToggleButtonGroup
							items={ items }
							value={ groupControlValue }
							onChange={ handleToggleButtonChange }
							exclusive={ true }
							disabled={ ! canEdit }
						/>
						{ CUSTOM === groupControlValue && (
							<Grid container gap={ 2 } alignItems="center" flexWrap="nowrap">
								<Grid item xs={ 6 }>
									<ControlLabel>{ __( 'Custom order', 'elementor' ) }</ControlLabel>
								</Grid>
								<Grid item xs={ 6 } sx={ { display: 'flex', justifyContent: 'end' } }>
									<NumberControl
										min={ FIRST_DEFAULT_VALUE + 1 }
										max={ LAST_DEFAULT_VALUE - 1 }
										shouldForceInt={ true }
									/>
								</Grid>
							</Grid>
						) }
					</SectionContent>
				</StylesFieldLayout>
			</UiProviders>
		</StylesField>
	);
};

const getGroupControlValue = ( order: number | null ): GroupControlItemOption | null => {
	if ( LAST_DEFAULT_VALUE === order ) {
		return LAST;
	}

	if ( FIRST_DEFAULT_VALUE === order ) {
		return FIRST;
	}

	return 0 === order || order ? CUSTOM : null;
};
