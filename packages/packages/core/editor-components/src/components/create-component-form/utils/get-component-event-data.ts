import { type V1ElementData } from '@elementor/editor-elements';

export type ComponentEventData = {
	nested_elements_count: number;
	nested_components_count: number;
	top_element_type: string;
	location?: string;
	secondary_location?: string;
	trigger?: string;
};

export type ContextMenuEventOptions = Record< string, unknown > & {
	location: string;
	secondaryLocation: string;
	trigger: string;
};

export const getComponentEventData = (
	containerElement: V1ElementData,
	options?: ContextMenuEventOptions
): ComponentEventData => {
	const { elementsCount, componentsCount } = countNestedElements( containerElement );

	return {
		nested_elements_count: elementsCount,
		nested_components_count: componentsCount,
		top_element_type: containerElement.elType,
		location: options?.location,
		secondary_location: options?.secondaryLocation,
		trigger: options?.trigger,
	};
};

function countNestedElements( container: V1ElementData ): { elementsCount: number; componentsCount: number } {
	if ( ! container.elements || container.elements.length === 0 ) {
		return { elementsCount: 0, componentsCount: 0 };
	}

	let elementsCount = container.elements.length;
	let componentsCount = 0;

	for ( const element of container.elements ) {
		if ( element.widgetType === 'e-component' ) {
			componentsCount++;
		}

		const { elementsCount: nestedElementsCount, componentsCount: nestedComponentsCount } =
			countNestedElements( element );
		elementsCount += nestedElementsCount;
		componentsCount += nestedComponentsCount;
	}

	return { elementsCount, componentsCount };
}
