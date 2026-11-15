import * as React from 'react';
import { ElementProvider, Section, SectionsList, SettingsTab, useElement } from '@elementor/editor-editing-panel';
import { getContainer, getContainerPart, getContainerWidgetMarker } from '@elementor/editor-elements';

import { getCompositeWidgetDefinition } from '../sync/get-composite-widget-definition';
import {
	type CompositeWidgetDefinition,
	type CompositeWidgetField,
	type CompositeWidgetFieldGroup,
	type CompositeWidgetGeneralEntry,
	type CompositeWidgetGeneralSection,
} from '../types';
import { omitControlsByBind } from './omit-controls-by-bind';
import { WidgetGeneralField } from './widget-general-field';

export function WidgetGeneralTab() {
	const { element } = useElement();
	const root = getContainer( element.id );
	const marker = getContainerWidgetMarker( root );
	const definition = marker ? getCompositeWidgetDefinition( marker.id ) : null;

	if ( ! root || ! definition ) {
		return null;
	}

	const sections = getSections( definition );
	const rootPart = getContainerPart( root );
	const exposedRootProps = sections
		.flatMap( getSectionFields )
		.filter( ( field ) => field.target.part === rootPart )
		.map( ( field ) => field.target.prop );

	return (
		<>
			<SectionsList>
				{ sections.map( ( section, sectionIndex ) => (
					<Section key={ sectionIndex } title={ section.section } defaultExpanded>
						{ getSectionFields( section ).map( ( field, fieldIndex ) => (
							<WidgetGeneralField key={ fieldIndex } root={ root } field={ field } />
						) ) }
					</Section>
				) ) }
			</SectionsList>
			<RootSettings exposedProps={ exposedRootProps } />
		</>
	);
}

function RootSettings( { exposedProps }: { exposedProps: string[] } ) {
	const { element, elementType, settings } = useElement();
	const controls = omitControlsByBind( elementType.controls, exposedProps );

	return (
		<ElementProvider element={ element } elementType={ { ...elementType, controls } } settings={ settings }>
			<SettingsTab />
		</ElementProvider>
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
