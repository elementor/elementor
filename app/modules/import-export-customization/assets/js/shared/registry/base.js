export class BaseRegistry {
	constructor() {
		this.sections = new Map();
	}

	register( section ) {
		if ( ! section.key || ! section.title ) {
			throw new Error( 'Template type must have key and title' );
		}

		const existingSection = this.get( section.key );
		const formattedSection = this.formatSection( {
			...existingSection,
			...section,
		} );

		this.sections.set( section.key, formattedSection );
	}

	formatSection( section ) {
		return {
			key: section.key,
			parentKey: section.parentKey || null,
			title: section.title,
			description: section.description || '',
			isPlaceholder: !! section.isPlaceholder,
			useParentDefault: section.useParentDefault !== false,
			getInitialState: section.getInitialState || null,
			component: section.component || null,
			order: section.order || 10,
			isAvailable: section.isAvailable || ( () => true ),
			...section,
		};
	}
	getAll() {
		const sections = Array.from( this.sections.values() )
			.filter( ( type ) => type.isAvailable() )
			.sort( ( first, second ) => first.order - second.order );

		return sections;
	}

	get( key ) {
		return this.sections.get( key );
	}
}
