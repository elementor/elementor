import * as React from 'react';
import type { ReactNode } from 'react';

import { useElement } from '../contexts/element-context';
import { useDefaultPanelSettings } from '../hooks/use-default-panel-settings';
import { Section } from './section';
import { StyleSectionHeaderSlot } from './style-section-header-location';
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
	const { element } = useElement();
	const tabDefaults = useDefaultPanelSettings();
	const SectionComponent = component || ( () => <></> );
	const isExpanded = tabDefaults.defaultSectionsExpanded.style?.includes( name );

	return (
		<Section
			title={ title }
			defaultExpanded={ isExpanded }
			titleEnd={ getStylesInheritanceIndicators( fields ) }
			titleActions={
				element ? <StyleSectionHeaderSlot elementId={ element.id } sectionName={ name } /> : undefined
			}
			unmountOnExit={ unmountOnExit }
			action={ action }
		>
			<SectionComponent />
		</Section>
	);
};
