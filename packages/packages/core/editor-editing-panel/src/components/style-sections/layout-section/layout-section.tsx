import * as React from 'react';
import { ControlFormLabel } from '@elementor/editor-controls';
import { useParentElement } from '@elementor/editor-elements';
import { type StringPropValue } from '@elementor/editor-props';
import { isExperimentActive } from '@elementor/editor-v1-adapters';
import { __ } from '@wordpress/i18n';

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
import { GridAutoFlowField } from './grid-auto-flow-field';
import { GridJustifyItemsField } from './grid-justify-items-field';
import { GridSizeFields } from './grid-size-field';
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
	const isDisplayGrid = 'grid' === ( display?.value ?? ( displayPlaceholder as StringPropValue )?.value );
	const { element } = useElement();
	const parent = useParentElement( element.id );
	const parentStyle = useComputedStyle( parent?.id || null );
	const parentStyleDirection = parentStyle?.flexDirection ?? 'row';

	return (
		<SectionContent>
			<DisplayField />
			{ isDisplayFlex && <FlexFields /> }
			{ isExperimentActive( 'e_css_grid' ) && isDisplayGrid && <GridFields /> }
			{ 'flex' === parentStyle?.display && <FlexChildFields parentStyleDirection={ parentStyleDirection } /> }
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

const GridFields = () => (
	<>
		<GridSizeFields />
		<GridAutoFlowField />
		<PanelDivider />
		<GapControlField />
		<PanelDivider />
		<GridJustifyItemsField />
		<AlignItemsField />
	</>
);

const FlexChildFields = ( { parentStyleDirection }: { parentStyleDirection: string } ) => (
	<>
		<PanelDivider />
		<ControlFormLabel>{ __( 'Flex child', 'elementor' ) }</ControlFormLabel>
		<AlignSelfChild parentStyleDirection={ parentStyleDirection as FlexDirection } />
		<FlexOrderField />
		<FlexSizeField />
	</>
);

const shouldDisplayFlexFields = ( display: StringPropValue | null, local: StringPropValue ) => {
	const value = display?.value ?? local?.value;

	if ( ! value ) {
		return false;
	}

	return 'flex' === value || 'inline-flex' === value;
};
