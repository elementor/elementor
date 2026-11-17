import {
	type CompositeWidgetDefinition,
	type CompositeWidgetField,
	type CompositeWidgetFieldGroup,
	type CompositeWidgetGeneralEntry,
	type CompositeWidgetGeneralSection,
} from '../types';

export function getSections( definition: CompositeWidgetDefinition ): CompositeWidgetGeneralSection[] {
	return ( definition.general ?? [] ).filter( isSection );
}

export function getSectionFields( section: CompositeWidgetGeneralSection ): CompositeWidgetField[] {
	return section.fields.flatMap( ( field ) => ( isGroup( field ) ? field.fields : [ field ] ) );
}

function isSection( entry: CompositeWidgetGeneralEntry ): entry is CompositeWidgetGeneralSection {
	return 'section' in entry;
}

function isGroup( field: CompositeWidgetField | CompositeWidgetFieldGroup ): field is CompositeWidgetFieldGroup {
	return 'fields' in field;
}
