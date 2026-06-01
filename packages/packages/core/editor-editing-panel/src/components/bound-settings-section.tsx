import * as React from 'react';
import { usePropContext } from '@elementor/editor-controls';
import { type Control, type ControlItem } from '@elementor/editor-elements';
import { type Props, type PropsSchema, type PropValue } from '@elementor/editor-props';

import { useElement } from '../contexts/element-context';
import { SettingsField } from '../controls-registry/settings-field';
import { getObjectSettingsWithDefaults, resolveObjectPropType } from '../utils/prop-dependency-utils';
import { renderSectionItems } from './render-section-items';
import { Section } from './section';
import { SettingsControl } from './settings-control';
import { TransformableObjectBridge } from './transformable-object-bridge';

type BoundSettingsSectionProps = {
	bind: string;
	label: string;
	items?: ControlItem[];
	defaultExpanded?: boolean;
};

export const BoundSettingsSection = ( { bind, label, items, defaultExpanded }: BoundSettingsSectionProps ) => {
	return (
		<SettingsField bind={ bind } propDisplayName={ label }>
			<TransformableObjectBridge>
				<BoundSectionBody label={ label } items={ items } defaultExpanded={ defaultExpanded } />
			</TransformableObjectBridge>
		</SettingsField>
	);
};

type BoundSectionBodyProps = {
	label: string;
	items?: ControlItem[];
	defaultExpanded?: boolean;
};

const BoundSectionBody = ( { label, items, defaultExpanded }: BoundSectionBodyProps ) => {
	const { element } = useElement();
	const { propType, value } = usePropContext();
	const objectPropType = resolveObjectPropType( propType, value as PropValue );

	if ( ! objectPropType ) {
		return null;
	}

	const shape = ( objectPropType.shape ?? {} ) as PropsSchema;
	const settings = getObjectSettingsWithDefaults( shape, value as Props );

	const sectionItems = renderSectionItems( {
		items,
		renderItem: ( item ) => {
			if ( item.type !== 'control' ) {
				return null;
			}

			return (
				<SettingsControl
					key={ item.value.bind + '.' + element.id }
					control={ item as Control }
					dependencyScope={ { shape, settings } }
				/>
			);
		},
	} );

	if ( ! sectionItems.length ) {
		return null;
	}

	return (
		<Section title={ label } defaultExpanded={ defaultExpanded }>
			{ sectionItems }
		</Section>
	);
};
