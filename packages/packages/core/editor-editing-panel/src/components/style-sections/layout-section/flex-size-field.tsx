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
import { flexPropTypeUtil, type FlexPropValue, numberPropTypeUtil } from '@elementor/editor-props';
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
	const { value, setValue, canEdit } = useStylesField< FlexPropValue >( 'flex', {
		history: { propDisplayName: FLEX_SIZE_LABEL },
	} );

	const flexValue = value as FlexPropValue | null;
	const grow = flexValue?.value?.flexGrow?.value || null;
	const shrink = flexValue?.value?.flexShrink?.value || null;
	const basis = flexValue?.value?.flexBasis?.value || null;

	const currentGroup = useMemo( () => getActiveGroup( { grow, shrink, basis } ), [ grow, shrink, basis ] );
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

		const newFlexValue = createFlexValueForGroup( group, flexValue );

		setValue( newFlexValue as FlexPropValue );
	};

	return (
		<UiProviders>
			<SectionContent>
				<StylesField bind="flex" propDisplayName={ FLEX_SIZE_LABEL }>
					<StylesFieldLayout label={ FLEX_SIZE_LABEL }>
						<ControlToggleButtonGroup
							value={ activeGroup }
							onChange={ onChangeGroup }
							disabled={ ! canEdit }
							items={ items }
							exclusive={ true }
						/>
					</StylesFieldLayout>
					{ 'custom' === activeGroup && <FlexCustomField /> }
				</StylesField>
			</SectionContent>
		</UiProviders>
	);
};

const createFlexValueForGroup = ( group: GroupItem | null, flexValue: FlexPropValue | null ): FlexPropValue | null => {
	if ( ! group ) {
		return null;
	}

	if ( group === 'flex-grow' ) {
		return flexPropTypeUtil.create( {
			flexGrow: numberPropTypeUtil.create( DEFAULT ),
			flexShrink: null,
			flexBasis: null,
		} );
	}

	if ( group === 'flex-shrink' ) {
		return flexPropTypeUtil.create( {
			flexGrow: null,
			flexShrink: numberPropTypeUtil.create( DEFAULT ),
			flexBasis: null,
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
