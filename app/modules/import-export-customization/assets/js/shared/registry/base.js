export class BaseRegistry {
	constructor() {
		this.sections = new Map();
	}

	register( section ) {
		if ( ! section.key ) {
			throw new Error( 'Registry section must have key' );
		}

		const existingSection = this.get( section.key );

		if ( ! existingSection && ! section.title ) {
			throw new Error( 'New registry section must have title' );
		}

		let formattedSection;
		if ( existingSection ) {
			// Merge existing section with new properties
			formattedSection = { ...existingSection, ...section };
		} else {
			formattedSection = this.formatSection( section );
		}

		if ( section.children ) {
			// If existing section has children, merge them with new children
			if ( formattedSection.children ) {
				const existingChildrenMap = new Map(
					formattedSection.children.map( ( child ) => [ child.key, child ] ),
				);

				// Override existing children with new ones and add new children
				section.children.forEach( ( childSection ) => {
					const formattedChild = this.formatSection( childSection );
					existingChildrenMap.set( childSection.key, formattedChild );
				} );

				formattedSection.children = Array.from( existingChildrenMap.values() );
			} else {
				formattedSection.children = section.children.map( ( childSection ) => this.formatSection( childSection ) );
			}
		}
		this.sections.set( section.key, formattedSection );
	}

	formatSection( { children, ...section } ) {
		return {
			key: section.key,
			title: section.title,
			description: section.description || '',
			useParentDefault: section.useParentDefault !== false,
			getInitialState: section.getInitialState || null,
			component: section.component || null,
			order: section.order || 10,
			isAvailable: section.isAvailable || ( () => true ),
			isDisabled: section.isDisabled || ( () => false ),
			...section,
		};
	}
	getAll() {
		return Array.from( this.sections.values() )
			.filter( ( type ) => type.isAvailable() )
			.map( ( type ) => {
				if ( type.children ) {
					return {
						...type,
						children: [ ...type.children ].sort( ( a, b ) => a.order - b.order ),
					};
				}
				return type;
			} )
			.sort( ( a, b ) => a.order - b.order );
	}

	get( key ) {
		return this.sections.get( key );
	}

	getState( data, parentInitialState ) {
		const state = {};

		this.getAll().forEach( ( section ) => {
			if ( section.children ) {
				section.children?.forEach( ( childSection ) => {
					const sectionState = this.getSectionState( childSection, data, parentInitialState );

					Object.assign( state, sectionState );
				} );
			} else {
				Object.assign( state, this.getSectionState( section, data, parentInitialState ) );
			}
		} );

		return state;
	}

	getSectionState() {
		return {};
	}
}
