export class BaseRegistry {
	constructor() {
		this.sections = new Map();
	}

	register( section ) {
		if ( ! section.key ) {
			throw new Error( 'Registry section must have key' );
		}

		const existingSection = this.get( section.key );
		const { children, ...rest } = section;

		let formattedSection;
		if ( existingSection ) {
			formattedSection = { ...existingSection, ...rest };
		} else {
			formattedSection = this.formatSection( rest );
		}

		if ( children ) {
			if ( formattedSection.children ) {
				const existingChildrenMap = new Map(
					formattedSection.children.map( ( child ) => [ child.key, child ] ),
				);

				children.forEach( ( childSection ) => {
					existingChildrenMap.set( childSection.key, { ...existingChildrenMap.get( childSection.key ), ...childSection } );
				} );

				formattedSection.children = Array.from( existingChildrenMap.values() );
			} else {
				formattedSection.children = children.map( ( childSection ) => this.formatSection( childSection ) );
			}
		}

		this.sections.set( rest.key, formattedSection );
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
