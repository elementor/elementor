import * as React from 'react';
import { isExperimentActive } from '@elementor/editor-v1-adapters';

import { useDefaultPanelSettings } from '../hooks/use-default-panel-settings';
import { EXPERIMENTAL_FEATURES } from '../sync/experiments-flags';
import { Section } from './section';
import { getStylesInheritanceIndicators } from './style-tab-collapsible-content';

type Section = {
	component: () => React.JSX.Element;
	name: string;
	title: string;
};

type Props = { section: Section; fields?: string[] };

export const StyleTabSection = ( { section, fields = [] }: Props ) => {
	const { component, name, title } = section;
	const tabDefaults = useDefaultPanelSettings();
	const SectionComponent = component;
	const isExpanded = isExperimentActive( EXPERIMENTAL_FEATURES.V_3_30 )
		? tabDefaults.defaultSectionsExpanded.style?.includes( name )
		: false;

	return (
		<Section title={ title } defaultExpanded={ isExpanded } titleEnd={ getStylesInheritanceIndicators( fields ) }>
			<SectionComponent />
		</Section>
	);
};
