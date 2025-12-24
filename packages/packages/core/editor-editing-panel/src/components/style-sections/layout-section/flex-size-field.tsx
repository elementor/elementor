import * as React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
	ControlToggleButtonGroup,
	NumberControl,
	PropKeyProvider,
	PropProvider,
	SizeControl,
	type ToggleButtonGroupItem,
	useBoundProp,
} from '@elementor/editor-controls';
import { flexPropTypeUtil, type FlexPropValue, numberPropTypeUtil, sizePropTypeUtil } from '@elementor/editor-props';
import { ExpandIcon, PencilIcon, ShrinkIcon } from '@elementor/icons';
import { __ } from '@wordpress/i18n';

import { StylesField } from '../../../controls-registry/styles-field';
import { useStylesField } from '../../../hooks/use-styles-field';
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
	return (
		<UiProviders>
			<SectionContent>
				<StylesField bind="flex" propDisplayName={ FLEX_SIZE_LABEL }>
					<FlexSizeFieldContent />
				</StylesField>
			</SectionContent>
		</UiProviders>
	);
};

const FlexSizeFieldContent = () => {
	const { value, setValue, canEdit } = useStylesField< FlexPropValue >( 'flex', {
		history: { propDisplayName: FLEX_SIZE_LABEL },
	} );

	const { placeholder } = useBoundProp();

	const flexValues = extractFlexValues( value );

	const currentGroup = useMemo( () => getActiveGroup( flexValues ), [ flexValues ] );

	const [ activeGroup, setActiveGroup ] = useState( currentGroup );
	const [ customLocked, setCustomLocked ] = useState( false );

	useEffect( () => {
		if ( ! customLocked ) {
			setActiveGroup( currentGroup );
		}
	}, [ currentGroup, customLocked ] );

	useEffect( () => {
		if ( value === null ) {
			setCustomLocked( false );
		}
	}, [ value ] );

	const onChangeGroup = ( group: GroupItem | null = null ) => {
		setActiveGroup( group );
		setCustomLocked( group === 'custom' );

		const newFlexValue = createFlexValueForGroup( group, value );

		setValue( newFlexValue as FlexPropValue );
	};

	const groupPlaceholder = getActiveGroup( extractFlexValues( placeholder as FlexPropValue | null ) );

	const isCustomVisible = 'custom' === activeGroup || 'custom' === groupPlaceholder;

	return (
		<>
			<StylesFieldLayout label={ FLEX_SIZE_LABEL }>
				<ControlToggleButtonGroup
					value={ activeGroup ?? null }
					placeholder={ groupPlaceholder ?? null }
					onChange={ onChangeGroup }
					disabled={ ! canEdit }
					items={ items }
					exclusive={ true }
				/>
			</StylesFieldLayout>
			{ isCustomVisible && <FlexCustomField /> }
		</>
	);
};

function extractFlexValues( source: FlexPropValue | null ) {
	return {
		grow: source?.value?.flexGrow?.value ?? null,
		shrink: source?.value?.flexShrink?.value ?? null,
		basis: source?.value?.flexBasis?.value ?? null,
	};
}

const createFlexValueForGroup = ( group: GroupItem | null, flexValue: FlexPropValue | null ): FlexPropValue | null => {
	if ( ! group ) {
		return null;
	}

	if ( group === 'flex-grow' ) {
		return flexPropTypeUtil.create( {
			flexGrow: numberPropTypeUtil.create( DEFAULT ),
			flexShrink: numberPropTypeUtil.create( 0 ),
			flexBasis: sizePropTypeUtil.create( { unit: 'auto', size: '' } ),
		} );
	}

	if ( group === 'flex-shrink' ) {
		return flexPropTypeUtil.create( {
			flexGrow: numberPropTypeUtil.create( 0 ),
			flexShrink: numberPropTypeUtil.create( DEFAULT ),
			flexBasis: sizePropTypeUtil.create( { unit: 'auto', size: '' } ),
		} );
	}

	if ( group === 'custom' ) {
		if ( flexValue ) {
			return flexValue;
		}
		return flexPropTypeUtil.create( {
			flexGrow: null,
			flexShrink: null,
			flexBasis: null,
		} );
	}

	return null;
};

const FlexCustomField = () => {
	const flexBasisRowRef = useRef< HTMLDivElement >( null );
	const context = useBoundProp( flexPropTypeUtil );

	return (
		<PropProvider { ...context }>
			<>
				<StylesFieldLayout label={ __( 'Grow', 'elementor' ) }>
					<PropKeyProvider bind="flexGrow">
						<NumberControl min={ 0 } shouldForceInt={ true } />
					</PropKeyProvider>
				</StylesFieldLayout>
				<StylesFieldLayout label={ __( 'Shrink', 'elementor' ) }>
					<PropKeyProvider bind="flexShrink">
						<NumberControl min={ 0 } shouldForceInt={ true } />
					</PropKeyProvider>
				</StylesFieldLayout>
				<StylesFieldLayout label={ __( 'Basis', 'elementor' ) } ref={ flexBasisRowRef }>
					<PropKeyProvider bind="flexBasis">
						<SizeControl extendedOptions={ [ 'auto' ] } anchorRef={ flexBasisRowRef } />
					</PropKeyProvider>
				</StylesFieldLayout>
			</>
		</PropProvider>
	);
};

const getActiveGroup = ( {
	grow,
	shrink,
	basis,
}: {
	grow: number | null;
	shrink: number | null;
	basis: { size: number; unit: string } | string | null;
} ): GroupItem | null => {
	if ( null === grow && null === shrink && ! basis ) {
		return null;
	}

	const isAutoBasis = basis === null || ( typeof basis === 'object' && basis.unit === 'auto' );

	if ( basis && ! isAutoBasis ) {
		return 'custom';
	}

	if ( grow === DEFAULT && ( shrink === null || shrink === 0 ) && isAutoBasis ) {
		return 'flex-grow';
	}

	if ( shrink === DEFAULT && ( grow === null || grow === 0 ) && isAutoBasis ) {
		return 'flex-shrink';
	}

	return 'custom';
};
