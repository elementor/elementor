import * as React from 'react';

import { useStyle } from '../contexts/style-context';
import { useCustomCss } from '../hooks/use-custom-css';
import { useDefaultPanelSettings } from '../hooks/use-default-panel-settings';
import { getStylesProviderThemeColor } from '../utils/get-styles-provider-color';
import { Section } from './section';
import { StyleIndicator } from './style-indicator';
import { getStylesInheritanceIndicators } from './style-tab-collapsible-content';

type Section = {
	component: () => React.JSX.Element;
	name: string;
	title: string;
};

type Props = {
	section: Section;
	fields?: string[];
};

export const StyleTabSection = ( { section, fields = [] }: Props ) => {
	const { component, name, title } = section;
	const tabDefaults = useDefaultPanelSettings();
	const SectionComponent = component;
	const isExpanded = tabDefaults.defaultSectionsExpanded.style?.includes( name );
	const { customCss } = useCustomCss();
	const { provider } = useStyle();

	const getCssIndicator = React.useCallback(
		( isOpen: boolean ) => {
			if ( name !== 'Custom CSS' || isOpen ) {
				return null;
			}

			const hasValue = Boolean( customCss?.raw?.trim() );
			return hasValue ? (
				<StyleIndicator getColor={ provider ? getStylesProviderThemeColor( provider.getKey() ) : undefined } />
			) : null;
		},
		[ name, customCss?.raw, provider ]
	);

	const titleEnd = name === 'Custom CSS' ? getCssIndicator : getStylesInheritanceIndicators( fields );

	return (
		<Section title={ title } defaultExpanded={ isExpanded } titleEnd={ titleEnd }>
			<SectionComponent />
		</Section>
	);
};
