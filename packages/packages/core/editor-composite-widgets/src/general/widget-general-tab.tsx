import * as React from 'react';
import { Section, SectionsList, SettingsTab, useElement } from '@elementor/editor-editing-panel';
import { type ElementID } from '@elementor/editor-elements';

import { type CompositeWidgetDefinition } from '../types';
import { getSectionFields, getSections } from './general-fields';
import { useWidgetDefinition } from './use-widget-definition';
import { useWidgetPartElements } from './use-widget-part-elements';
import { WidgetGeneralField } from './widget-general-field';

export function WidgetGeneralTab() {
	const { element } = useElement();
	const definition = useWidgetDefinition( element.id );

	if ( ! definition ) {
		return null;
	}

	return <WidgetGeneral rootId={ element.id } definition={ definition } />;
}

type WidgetGeneralProps = {
	rootId: ElementID;
	definition: CompositeWidgetDefinition;
};

function WidgetGeneral( { rootId, definition }: WidgetGeneralProps ) {
	const partElements = useWidgetPartElements( rootId, definition );

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
