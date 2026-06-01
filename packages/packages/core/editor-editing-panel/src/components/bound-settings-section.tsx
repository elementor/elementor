import * as React from 'react';
import { usePropContext } from '@elementor/editor-controls';
import { type ControlItem, type Element } from '@elementor/editor-elements';
import { type Props, type PropsSchema } from '@elementor/editor-props';

import { SettingsField } from '../controls-registry/settings-field';
import { getObjectSettingsWithDefaults } from '../utils/prop-dependency-utils';
import { NestedSettingsControl } from './nested-settings-control';
import { renderSectionItems } from './render-section-items';
import { Section } from './section';
import { TransformableObjectBridge } from './transformable-object-bridge';

type BoundSettingsSectionProps = {
	bind: string;
	label: string;
	id?: string | null;
	items?: ControlItem[];
	element: Element;
	defaultExpanded?: boolean;
};

export const BoundSettingsSection = ( {
	bind,
	label,
	id,
	items,
	element,
	defaultExpanded,
}: BoundSettingsSectionProps ) => {
	return (
		<SettingsField bind={ bind } propDisplayName={ label }>
			<TransformableObjectBridge>
				<BoundSectionContent
					label={ label }
					id={ id }
					items={ items }
					element={ element }
					defaultExpanded={ defaultExpanded }
				/>
			</TransformableObjectBridge>
		</SettingsField>
	);
};

type BoundSectionContentProps = {
	label: string;
	id?: string | null;
	items?: ControlItem[];
	element: Element;
	defaultExpanded?: boolean;
};

const BoundSectionContent = ( { label, id, items, element, defaultExpanded }: BoundSectionContentProps ) => {
	const { propType, value } = usePropContext();
	const shape = ( propType.shape ?? {} ) as PropsSchema;
	const settings = getObjectSettingsWithDefaults( shape, value as Props );

	const sectionItems = renderSectionItems( {
		items,
		renderItem: ( item ) => {
			if ( item.type !== 'control' ) {
				return null;
			}

			return (
				<NestedSettingsControl
					key={ item.value.bind + '.' + element.id }
					control={ item }
					shape={ shape }
					settings={ settings }
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
