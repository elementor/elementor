import { type V1ElementConfig } from '@elementor/editor-elements';

import { type ChildTemplate, getRequiredDefaultChildTemplates } from './required-default-child-tags';

const REQUIRED_CHILD_SCHEMA_HINT =
	'Use the widget schema resource; under llm_guidance.required_direct_children for V4 widgets.';

export class RequiredChildrenEnforcer {
	private readonly elementType: string;
	private readonly requiredTemplates: ChildTemplate[];

	constructor( elementType: string, widgetsCache: Record< string, V1ElementConfig > ) {
		this.elementType = elementType;
		this.requiredTemplates = getRequiredDefaultChildTemplates( widgetsCache[ elementType ] );
	}

	enforce( xml: Document ) {
		if ( this.requiredTemplates.length === 0 ) {
			return;
		}

		const errors: string[] = [];

		for ( const rootNode of Array.from( xml.children ) ) {
			this.collectMissingRequiredErrors( rootNode, errors );
		}

		if ( errors.length ) {
			throw new Error( `${ errors.join( '\n' ) }\n${ REQUIRED_CHILD_SCHEMA_HINT }` );
		}
	}

	private collectMissingRequiredErrors( node: Element, errors: string[] ) {
		if ( node.tagName === this.elementType ) {
			const existingChildTags = new Set( Array.from( node.children ).map( ( child ) => child.tagName ) );
			const missingTags = this.requiredTemplates
				.map( ( child ) => child.widgetType ?? child.elType ?? '' )
				.filter( ( type ) => type && ! existingChildTags.has( type ) ) as string[];

			if ( missingTags.length ) {
				const configurationId = node.getAttribute( 'configuration-id' );
				const location = configurationId
					? `<${ node.tagName } configuration-id="${ configurationId }">`
					: `<${ node.tagName }>`;

				errors.push(
					`${ location } Missing required direct child element tag(s): ${ missingTags.join( ', ' ) }.`
				);
			}
		}

		for ( const childNode of Array.from( node.children ) ) {
			this.collectMissingRequiredErrors( childNode, errors );
		}
	}
}
