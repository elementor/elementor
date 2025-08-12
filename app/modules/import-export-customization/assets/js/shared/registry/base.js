export class BaseRegistry {
	constructor() {
		this.sections = new Map();
	}

	register( section ) {
		if ( ! section.key || ! section.title ) {
			throw new Error( 'Template type must have key and title' );
		}

		const formattedSection = {
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

		if ( section.children ) {
			formattedSection.children = section.children?.map( ( childSection ) => ( {
				key: childSection.key,
				title: childSection.title,
				description: childSection.description || '',
				useParentDefault: childSection.useParentDefault !== false,
				getInitialState: childSection.getInitialState || null,
				component: childSection.component || null,
				order: childSection.order || 10,
				...childSection,
			} ) );
		}
		this.sections.set( section.key, formattedSection );
	}

	getAll() {
		return Array.from( this.sections.values() )
			.filter( ( type ) => type.isAvailable() )
			.sort( ( a, b ) => a.order - b.order );
	}

	get( key ) {
		return this.sections.get( key );
	}
}
