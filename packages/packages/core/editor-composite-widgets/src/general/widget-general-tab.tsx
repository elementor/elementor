import * as React from 'react';
import { Section, SectionsList, useElement } from '@elementor/editor-editing-panel';
import { getContainer, getContainerWidgetMarker } from '@elementor/editor-elements';

import { getCompositeWidgetDefinition } from '../sync/get-composite-widget-definition';
import {
	type CompositeWidgetDefinition,
	type CompositeWidgetField,
	type CompositeWidgetFieldGroup,
	type CompositeWidgetGeneralEntry,
	type CompositeWidgetGeneralSection,
} from '../types';
import { WidgetGeneralField } from './widget-general-field';

export function WidgetGeneralTab() {
	const { element } = useElement();
	const root = getContainer( element.id );
	const marker = getContainerWidgetMarker( root );
	const definition = marker ? getCompositeWidgetDefinition( marker.id ) : null;

	if ( ! root || ! definition ) {
		return null;
	}

	return (
		<SectionsList>
			{ getSections( definition ).map( ( section, sectionIndex ) => (
				<Section key={ sectionIndex } title={ section.section } defaultExpanded>
					{ getSectionFields( section ).map( ( field, fieldIndex ) => (
						<WidgetGeneralField key={ fieldIndex } root={ root } field={ field } />
					) ) }
				</Section>
			) ) }
		</SectionsList>
	);
}

function getSections( definition: CompositeWidgetDefinition ): CompositeWidgetGeneralSection[] {
	return ( definition.general ?? [] ).filter( isSection );
}

function isSection( entry: CompositeWidgetGeneralEntry ): entry is CompositeWidgetGeneralSection {
	return 'section' in entry;
}

function getSectionFields( section: CompositeWidgetGeneralSection ): CompositeWidgetField[] {
	return section.fields.flatMap( ( field ) => ( isGroup( field ) ? field.fields : [ field ] ) );
}

function isGroup( field: CompositeWidgetField | CompositeWidgetFieldGroup ): field is CompositeWidgetFieldGroup {
	return 'fields' in field;
}
