import * as React from 'react';
import { Section, SectionsList, SettingsTab, useElement } from '@elementor/editor-editing-panel';
import { type V1Element } from '@elementor/editor-elements';

import { type CompositeWidgetDefinition } from '../types';
import { getSectionFields, getSections } from './general-fields';
import { useWidgetPartElements } from './use-widget-part-elements';
import { useWidgetRoot } from './use-widget-root';
import { WidgetGeneralField } from './widget-general-field';

export function WidgetGeneralTab() {
	const { element } = useElement();
	const widgetRoot = useWidgetRoot( element.id );

	if ( ! widgetRoot ) {
		return null;
	}

	return <WidgetGeneral root={ widgetRoot.root } definition={ widgetRoot.definition } />;
}

type WidgetGeneralProps = {
	root: V1Element;
	definition: CompositeWidgetDefinition;
};

function WidgetGeneral( { root, definition }: WidgetGeneralProps ) {
	const partElements = useWidgetPartElements( root, definition );

	return (
		<>
			<SectionsList>
				{ getSections( definition ).map( ( section, sectionIndex ) => (
					<Section key={ sectionIndex } title={ section.section } defaultExpanded>
						{ getSectionFields( section ).map( ( field, fieldIndex ) => (
							<WidgetGeneralField
								key={ fieldIndex }
								field={ field }
								partElement={ partElements[ field.target.part ] ?? null }
							/>
						) ) }
					</Section>
				) ) }
			</SectionsList>
			<SettingsTab />
		</>
	);
}
