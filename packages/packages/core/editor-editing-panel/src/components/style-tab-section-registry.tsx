import * as React from 'react';

import { type StyleTabSectionProps } from './style-tab-section';

type ExtraSection = StyleTabSectionProps & { id: string };

const DummyComponent = () => <div>Dummy section content</div>;

class StyleTabSectionsRegistry {
	private readonly sections: ExtraSection[];

	constructor( initialSections: ExtraSection[] = [] ) {
		this.sections = initialSections;
	}

	getAll(): ExtraSection[] {
		return this.sections;
	}

	getById( id: string ): ExtraSection | undefined {
		return this.sections.find( ( section ) => section.id === id );
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

// יצירת singleton
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

// פונקציות עזר (כמו ב־control-registry)
export function registerStyleTabSection( section: ExtraSection ) {
	styleTabSectionsRegistry.register( section );
}

export function getExtraStyleTabSections(): ExtraSection[] {
	return styleTabSectionsRegistry.getAll();
}
