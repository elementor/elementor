import * as React from 'react';
import { createControl, PropProvider, type SetValue, useBoundProp } from '@elementor/editor-controls';
import {
	isTransformable,
	type ObjectPropType,
	type ObjectPropValue,
	type Props,
	type PropsSchema,
	type PropType,
	type UnionPropType,
} from '@elementor/editor-props';

import { renderSectionItems } from '../components/render-section-items';
import { Section } from '../components/section';
import { ControlLayout } from '../controls-registry/control-layout';
import { ObjectPropField } from '../controls-registry/object-prop-field';
import { resolveControlPresentation } from '../controls-registry/resolve-control-presentation';
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
	const propContext = useBoundProp< ObjectPropValue, ObjectPropType >();
	const { propType: parentPropType, value, setValue } = propContext;

	const rawValue = isTransformable( value ) ? ( value as ObjectPropValue ) : null;
	const objectPropType = resolveObjectPropType( parentPropType, rawValue?.$$type ?? '' );
	const typeKey = rawValue?.$$type ?? objectPropType.key;
	const shape = ( objectPropType.shape ?? {} ) as PropsSchema;
	const innerValue = ( rawValue?.value ?? {} ) as Props;

	const setInnerValue: SetValue< Props > = ( next, options, meta ) => {
		setValue( { $$type: typeKey, value: next as ObjectPropValue[ 'value' ] }, options, meta );
	};

	const settings = getObjectSettingsWithDefaults( shape, innerValue );
	const { isDisabled: isNestedFieldDisabled } = extractDependencyEffect( 'template_type', shape, settings );

	return (
		<PropProvider
			propType={ objectPropType }
			value={ innerValue }
			setValue={ setInnerValue }
			isDisabled={ isNestedFieldDisabled }
		>
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
	const presentation = resolveControlPresentation( {
		type: item.type,
		label: item.label,
		props: item.props,
		meta: item.meta,
	} );

	if ( ! presentation ) {
		return null;
	}

	const { layout, controlProps } = presentation;

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

function resolveObjectPropType( propType: PropType, typeKey: string ): ObjectPropType {
	if ( propType.kind === 'object' ) {
		return propType;
	}

	if ( propType.kind !== 'union' ) {
		throw new Error( `Object section control requires an object parent prop type, received "${ propType.kind }".` );
	}

	const unionPropType = propType as UnionPropType;
	const resolvedPropType =
		unionPropType.prop_types[ typeKey ] ??
		Object.values( unionPropType.prop_types ).find( ( candidate ) => candidate.kind === 'object' );

	if ( resolvedPropType?.kind !== 'object' ) {
		throw new Error( `Object section control could not resolve an object prop type for "${ typeKey }".` );
	}

	return resolvedPropType;
}
