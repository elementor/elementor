import * as React from 'react';
import { ControlFormLabel } from '@elementor/editor-controls';
import { useParentElement } from '@elementor/editor-elements';
import { type StringPropValue } from '@elementor/editor-props';
import { isExperimentActive } from '@elementor/editor-v1-adapters';
import { __ } from '@wordpress/i18n';

import { ATOMIC_GRID_CONTROL_EXPERIMENT } from '../../../experiments';
import { useElement } from '../../../contexts/element-context';
import { useComputedStyle } from '../../../hooks/use-computed-style';
import { useStylesField } from '../../../hooks/use-styles-field';
import { PanelDivider } from '../../panel-divider';
import { SectionContent } from '../../section-content';
import { AlignContentField } from './align-content-field';
import { AlignItemsField } from './align-items-field';
import { AlignSelfChild } from './align-self-child-field';
import { DisplayField, useDisplayPlaceholderValue } from './display-field';
import { type FlexDirection, FlexDirectionField } from './flex-direction-field';
import { FlexOrderField } from './flex-order-field';
import { FlexSizeField } from './flex-size-field';
import { GapControlField } from './gap-control-field';
import { GridControlField } from './grid-control-field';
import { JustifyContentField } from './justify-content-field';
import { WrapField } from './wrap-field';

const DISPLAY_LABEL = __( 'Display', 'elementor' );
const FLEX_WRAP_LABEL = __( 'Flex wrap', 'elementor' );

export const LayoutSection = () => {
	const { value: display } = useStylesField< StringPropValue >( 'display', {
		history: { propDisplayName: DISPLAY_LABEL },
	} );
	const displayPlaceholder = useDisplayPlaceholderValue();
	const isDisplayFlex = shouldDisplayFlexFields( display, displayPlaceholder as StringPropValue );
	const isDisplayGrid =
		isExperimentActive( ATOMIC_GRID_CONTROL_EXPERIMENT ) &&
		shouldDisplayGridFields( display, displayPlaceholder as StringPropValue );
	const { element } = useElement();
	const parent = useParentElement( element.id );
	const parentStyle = useComputedStyle( parent?.id || null );
	const parentStyleDirection = parentStyle?.flexDirection ?? 'row';
	const parentDisplay = parentStyle?.display ?? '';
	const isParentFlex = 'flex' === parentDisplay || 'inline-flex' === parentDisplay;
	const isParentGrid = 'grid' === parentDisplay || 'inline-grid' === parentDisplay;

	return (
		<SectionContent>
			<DisplayField />
			{ isDisplayFlex && <FlexFields /> }
			{ isDisplayGrid && <GridFields /> }
			{ ( isParentFlex || isParentGrid ) && (
				<ContainerChildFields
					isGridParent={ isParentGrid && ! isParentFlex }
					parentStyleDirection={ parentStyleDirection as FlexDirection }
				/>
			) }
		</SectionContent>
	);
};

const FlexFields = () => {
	const { value: flexWrap } = useStylesField< StringPropValue >( 'flex-wrap', {
		history: { propDisplayName: FLEX_WRAP_LABEL },
	} );

	return (
		<>
			<FlexDirectionField />
			<JustifyContentField />
			<AlignItemsField />
			<PanelDivider />
			<GapControlField />
			<WrapField />
			{ [ 'wrap', 'wrap-reverse' ].includes( flexWrap?.value as string ) && <AlignContentField /> }
		</>
	);
};

const ContainerChildFields = ( {
	isGridParent,
	parentStyleDirection,
}: {
	isGridParent: boolean;
	parentStyleDirection: FlexDirection;
} ) => (
	<>
		<PanelDivider />
		<ControlFormLabel>
			{ isGridParent ? __( 'Grid item', 'elementor' ) : __( 'Flex child', 'elementor' ) }
		</ControlFormLabel>
		<AlignSelfChild
			parentStyleDirection={ isGridParent ? 'row' : parentStyleDirection }
		/>
		<FlexOrderField />
		{ ! isGridParent && <FlexSizeField /> }
	</>
);

const GridFields = () => (
	<>
		<PanelDivider />
		<GridControlField />
	</>
);

const shouldDisplayFlexFields = ( display: StringPropValue | null, local: StringPropValue ) => {
	const value = display?.value ?? local?.value;

	if ( ! value ) {
		return false;
	}

	return 'flex' === value || 'inline-flex' === value;
};

const shouldDisplayGridFields = ( display: StringPropValue | null, local: StringPropValue ) => {
	const value = display?.value ?? local?.value;

	if ( ! value ) {
		return false;
	}

	return 'grid' === value || 'inline-grid' === value;
};
