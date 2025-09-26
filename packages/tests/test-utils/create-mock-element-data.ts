import {
	V1ElementData,
	type V1ElementSettingsProps,
} from '@elementor/editor-elements';
import { StyleDefinition, StyleDefinitionID } from '@elementor/editor-styles';

type MockElementDataProps = {
	elType?: string;
	widgetType?: string;
	id?: string;
	settings?: Partial< V1ElementSettingsProps >;
	styles?: Record< StyleDefinitionID, StyleDefinition >;
	elements?: V1ElementData[];
};
export function createMockElementData( {
	id = '1',
	widgetType = 'element',
	settings = {},
	styles = {},
	elements = [],
}: MockElementDataProps ): V1ElementData {
	return {
		elType: elements.length > 0 ? 'container' : 'widget',
		widgetType,
		id,
		settings,
		styles,
		elements
	};
}