import { type ComponentType, createElement } from 'react';
import { type ElementID } from '@elementor/editor-elements';
import { createLocation, type InjectArgs } from '@elementor/locations';

export type StyleSectionHeaderProps = {
	elementId: ElementID;
	sectionName: string;
};

const { Slot: StyleSectionHeaderSlot, inject: injectStyleSectionHeader } = createLocation< StyleSectionHeaderProps >();

type StyleSectionHeaderInjectArgs = Pick< InjectArgs< StyleSectionHeaderProps >, 'id' | 'component' > & {
	sections?: string[];
	options?: InjectArgs< StyleSectionHeaderProps >[ 'options' ];
};

export const injectIntoStyleSectionHeader = ( { id, component, sections, options }: StyleSectionHeaderInjectArgs ) => {
	const filteredComponent: ComponentType< StyleSectionHeaderProps > = ( props ) => {
		if ( sections && ! sections.includes( props.sectionName ) ) {
			return null;
		}

		return createElement( component, props );
	};

	injectStyleSectionHeader( { id, component: filteredComponent, options } );
};

export { StyleSectionHeaderSlot };
