import * as React from 'react';
import type { ReactNode } from 'react';

import { StyleSectionNameProvider } from '../contexts/style-section-name-context';
import { useDefaultPanelSettings } from '../hooks/use-default-panel-settings';
import { StyleSectionInjectionSlot } from '../section-injections/style-section-injection-slot';
import { Section } from './section';
import { getStylesInheritanceIndicators } from './style-tab-collapsible-content';

type SectionType = {
	component?: () => React.JSX.Element;
	name: string;
	title: string;
	action?: { component: ReactNode; onClick: () => void };
};

type Props = { section: SectionType; fields?: string[]; unmountOnExit?: boolean };

export const StyleTabSection = ( { section, fields = [], unmountOnExit = true }: Props ) => {
	const { component, name, title, action } = section;
	const tabDefaults = useDefaultPanelSettings();
	const SectionComponent = component || ( () => <></> );
	const isExpanded = tabDefaults.defaultSectionsExpanded.style?.includes( name );

	return (
		<Section
			title={ title }
			defaultExpanded={ isExpanded }
			titleEnd={ getStylesInheritanceIndicators( fields ) }
			unmountOnExit={ unmountOnExit }
			action={ action }
		>
			<StyleSectionInjectionSlot sectionName={ name } />
			<StyleSectionNameProvider value={ name }>
				<SectionComponent />
			</StyleSectionNameProvider>
		</Section>
	);
};
