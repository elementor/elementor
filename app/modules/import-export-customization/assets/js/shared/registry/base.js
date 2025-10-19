export class BaseRegistry {
	constructor() {
		this.sections = new Map();
	}

	register( section ) {
		if ( ! section.key || ! section.title ) {
			throw new Error( 'Template type must have key and title' );
		}

		const existingSection = this.get( section.key );

		const formattedSection = existingSection || this.formatSection( section );

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
}
