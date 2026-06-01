import * as React from 'react';
import { createControl, PropProvider } from '@elementor/editor-controls';
import { type Props, type PropsSchema } from '@elementor/editor-props';

import { renderSectionItems } from '../components/render-section-items';
import { Section } from '../components/section';
import { ControlLayout, populateChildControlProps } from '../controls-registry/control-layout';
import { controlsRegistry, type ControlType } from '../controls-registry/controls-registry';
import { ObjectPropField } from '../controls-registry/object-prop-field';
import { useTransformableObjectProp } from '../hooks/use-transformable-object-prop';
import { extractDependencyEffect, getObjectSettingsWithDefaults } from '../utils/prop-dependency-utils';

type SerializedItem = {
	type: string;
	bind: string;
	label?: string;
	props?: Record< string, unknown >;
	meta?: {
		layout?: 'full' | 'two-columns' | 'custom';
		topDivider?: boolean;
	};
};

type ObjectSectionControlProps = {
	label: string;
	items: SerializedItem[];
};

export const ObjectSectionControl = createControl( ( { label, items }: ObjectSectionControlProps ) => {
	const { propType, value, setValue } = useTransformableObjectProp();
	const shape = ( propType.shape ?? {} ) as PropsSchema;
	const settings = getObjectSettingsWithDefaults( shape, value );
	const { isDisabled: isNestedFieldDisabled } = extractDependencyEffect( 'template_type', shape, settings );

	return (
		<PropProvider propType={ propType } value={ value } setValue={ setValue } isDisabled={ isNestedFieldDisabled }>
			<Section title={ label }>{ renderObjectSectionItems( { items, shape, settings } ) }</Section>
		</PropProvider>
	);
} );

function renderObjectSectionItems( {
	items,
	shape,
	settings,
}: {
	items: SerializedItem[];
	shape: PropsSchema;
	settings: Props;
} ) {
	return renderSectionItems( {
		items,
		renderItem: ( item ) => (
			<ObjectSectionItem key={ item.bind } item={ item } shape={ shape } settings={ settings } />
		),
	} );
}

type ObjectSectionItemProps = {
	item: SerializedItem;
	shape: PropsSchema;
	settings: Props;
};

const ObjectSectionItem = ( { item, shape, settings }: ObjectSectionItemProps ) => {
	if ( ! controlsRegistry.get( item.type as ControlType ) ) {
		return null;
	}

	const layout = item.meta?.layout ?? controlsRegistry.getLayout( item.type as ControlType );
	const controlProps = populateChildControlProps( item.props ?? {} );

	if ( layout === 'custom' ) {
		controlProps.label = item.label;
	}

	return (
		<ObjectPropField bind={ item.bind } shape={ shape } settings={ settings }>
			<ControlLayout
				control={ { ...item, props: controlProps } }
				layout={ layout }
				controlProps={ controlProps }
			/>
		</ObjectPropField>
	);
};
