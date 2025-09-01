import * as React from 'react';

import { useDefaultPanelSettings } from '../hooks/use-default-panel-settings';
import { Section } from './section';
import { getStylesInheritanceIndicators } from './style-tab-collapsible-content';

type Section = {
	component: () => React.JSX.Element;
	name: string;
	title: string;
};

type Props = { section: Section; fields?: string[]; unmountOnExit?: boolean };

export const StyleTabSection = ( { section, fields = [], unmountOnExit = true }: Props ) => {
	const { component, name, title } = section;
	const tabDefaults = useDefaultPanelSettings();
	const SectionComponent = component;
	const isExpanded = tabDefaults.defaultSectionsExpanded.style?.includes( name );

	return (
		<Section
			title={ title }
			defaultExpanded={ isExpanded }
			titleEnd={ getStylesInheritanceIndicators( fields ) }
			unmountOnExit={ unmountOnExit }
		>
			<SectionComponent />
		</Section>
	);
};
