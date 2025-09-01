import * as React from 'react';

import { type StyleTabSectionProps } from './style-tab-section';

export type ExtraSection = StyleTabSectionProps & { id: string };
class StyleTabSectionsRegistry {
	private readonly sections: ExtraSection[];

	constructor( initialSections: ExtraSection[] = [] ) {
		this.sections = initialSections;
	}

	getAll(): ExtraSection[] {
		return this.sections;
	}

	register( section: ExtraSection ) {
		if ( this.sections.find( ( s ) => s.id === section.id ) ) {
			throw new Error( `StyleTabSection with id "${ section.id }" already registered.` );
		}
		this.sections.push( section );
	}

	unregister( id: string ) {
		const index = this.sections.findIndex( ( section ) => section.id === id );
		if ( index === -1 ) {
			throw new Error( `StyleTabSection with id "${ id }" not registered.` );
		}
		this.sections.splice( index, 1 );
	}
}

// create singleton
const DummyComponent = () => <div>Dummy section content</div>;

export const styleTabSectionsRegistry = new StyleTabSectionsRegistry( [
	{
		id: 'dummy-section',
		section: {
			component: DummyComponent,
			name: 'dummy',
			title: 'Dummy Section',
		},
		fields: [ 'color', 'background' ],
		unmountOnExit: false,
	},
] );

export function getExtraStyleTabSections(): ExtraSection[] {
	return styleTabSectionsRegistry.getAll();
}
