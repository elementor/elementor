import * as React from 'react';
import { useMemo, useRef, useState } from 'react';
import {
	ControlToggleButtonGroup,
	NumberControl,
	SizeControl,
	type ToggleButtonGroupItem,
} from '@elementor/editor-controls';
import { numberPropTypeUtil, type NumberPropValue, type SizePropValue } from '@elementor/editor-props';
import { ExpandIcon, PencilIcon, ShrinkIcon } from '@elementor/icons';
import { __ } from '@wordpress/i18n';

import { StylesField } from '../../../controls-registry/styles-field';
import { useStylesFields } from '../../../hooks/use-styles-fields';
import { UiProviders } from '../../../styles-inheritance/components/ui-providers';
import { SectionContent } from '../../section-content';
import { StylesFieldLayout } from '../../styles-field-layout';

type GroupItem = 'flex-grow' | 'flex-shrink' | 'custom';

const FLEX_SIZE_LABEL = __( 'Flex Size', 'elementor' );

const DEFAULT = 1;

const items: ToggleButtonGroupItem< GroupItem >[] = [
	{
		value: 'flex-grow',
		label: __( 'Grow', 'elementor' ),
		renderContent: ( { size } ) => <ExpandIcon fontSize={ size } />,
		showTooltip: true,
	},
	{
		value: 'flex-shrink',
		label: __( 'Shrink', 'elementor' ),
		renderContent: ( { size } ) => <ShrinkIcon fontSize={ size } />,
		showTooltip: true,
	},
	{
		value: 'custom',
		label: __( 'Custom', 'elementor' ),
		renderContent: ( { size } ) => <PencilIcon fontSize={ size } />,
		showTooltip: true,
	},
];

export const FlexSizeField = () => {
	const { values, setValues, canEdit } = useStylesFields< {
		'flex-grow': NumberPropValue | null;
		'flex-shrink': NumberPropValue | null;
		'flex-basis': SizePropValue | null;
	} >( [ 'flex-grow', 'flex-shrink', 'flex-basis' ] );

	const grow = values?.[ 'flex-grow' ]?.value || null;
	const shrink = values?.[ 'flex-shrink' ]?.value || null;
	const basis = values?.[ 'flex-basis' ]?.value || null;

	const currentGroup = useMemo( () => getActiveGroup( { grow, shrink, basis } ), [ grow, shrink, basis ] ),
		[ activeGroup, setActiveGroup ] = useState( currentGroup );

	const onChangeGroup = ( group: GroupItem | null = null ) => {
		setActiveGroup( group );

		if ( ! group || group === 'custom' ) {
			setValues( {
				'flex-basis': null,
				'flex-grow': null,
				'flex-shrink': null,
			} );

			return;
		}

		if ( group === 'flex-grow' ) {
			setValues( {
				'flex-basis': null,
				'flex-grow': numberPropTypeUtil.create( DEFAULT ),
				'flex-shrink': null,
			} );

			return;
		}

		setValues( {
			'flex-basis': null,
			'flex-grow': null,
			'flex-shrink': numberPropTypeUtil.create( DEFAULT ),
		} );
	};

	return (
		<UiProviders>
			<SectionContent>
				<StylesField bind={ activeGroup ?? '' } propDisplayName={ FLEX_SIZE_LABEL }>
					<StylesFieldLayout label={ FLEX_SIZE_LABEL }>
						<ControlToggleButtonGroup
							value={ activeGroup }
							onChange={ onChangeGroup }
							disabled={ ! canEdit }
							items={ items }
							exclusive={ true }
						/>
					</StylesFieldLayout>
				</StylesField>
				{ 'custom' === activeGroup && <FlexCustomField /> }
			</SectionContent>
		</UiProviders>
	);
};

const FlexCustomField = () => {
	const flexBasisRowRef = useRef< HTMLDivElement >( null );

	return (
		<>
			<StylesField bind="flex-grow" propDisplayName={ FLEX_SIZE_LABEL }>
				<StylesFieldLayout label={ __( 'Grow', 'elementor' ) }>
					<NumberControl min={ 0 } shouldForceInt={ true } />
				</StylesFieldLayout>
			</StylesField>
			<StylesField bind="flex-shrink" propDisplayName={ FLEX_SIZE_LABEL }>
				<StylesFieldLayout label={ __( 'Shrink', 'elementor' ) }>
					<NumberControl min={ 0 } shouldForceInt={ true } />
				</StylesFieldLayout>
			</StylesField>
			<StylesField bind="flex-basis" propDisplayName={ FLEX_SIZE_LABEL }>
				<StylesFieldLayout label={ __( 'Basis', 'elementor' ) } ref={ flexBasisRowRef }>
					<SizeControl extendedOptions={ [ 'auto' ] } anchorRef={ flexBasisRowRef } />
				</StylesFieldLayout>
			</StylesField>
		</>
	);
};

const getActiveGroup = ( {
	grow,
	shrink,
	basis,
}: {
	grow: NumberPropValue[ 'value' ] | null;
	shrink: NumberPropValue[ 'value' ] | null;
	basis: SizePropValue[ 'value' ] | null;
} ): GroupItem | null => {
	if ( null === grow && null === shrink && ! basis ) {
		return null;
	}

	if ( ( shrink && grow ) || basis ) {
		return 'custom';
	}

	if ( grow === DEFAULT ) {
		return 'flex-grow';
	}

	if ( shrink === DEFAULT ) {
		return 'flex-shrink';
	}

	return 'custom';
};
