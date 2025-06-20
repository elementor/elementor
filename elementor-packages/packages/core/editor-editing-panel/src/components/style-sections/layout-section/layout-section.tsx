import * as React from 'react';
import { ControlFormLabel } from '@elementor/editor-controls';
import { useParentElement } from '@elementor/editor-elements';
import { type StringPropValue } from '@elementor/editor-props';
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
import { JustifyContentField } from './justify-content-field';
import { WrapField } from './wrap-field';

export const LayoutSection = () => {
	const { value: display } = useStylesField< StringPropValue >( 'display' );
	const displayPlaceholder = useDisplayPlaceholderValue();
	const isDisplayFlex = shouldDisplayFlexFields( display, displayPlaceholder as StringPropValue );
	const { element } = useElement();
	const parent = useParentElement( element.id );
	const parentStyle = useComputedStyle( parent?.id || null );
	const parentStyleDirection = parentStyle?.flexDirection ?? 'row';

	return (
		<SectionContent>
			<DisplayField />
			{ isDisplayFlex && <FlexFields /> }
			{ 'flex' === parentStyle?.display && <FlexChildFields parentStyleDirection={ parentStyleDirection } /> }
		</SectionContent>
	);
};

const FlexFields = () => {
	const { value: flexWrap } = useStylesField< StringPropValue >( 'flex-wrap' );

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
