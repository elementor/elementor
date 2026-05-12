import { type V1ElementConfig } from '@elementor/editor-elements';

type TemplateNode = Record< string, unknown >;

export class RequiredChildrenEnforcer {
	private readonly elementType: string;
	private readonly requiredChildren: TemplateNode[];

	constructor( elementType: string, widgetsCache: Record< string, V1ElementConfig > ) {
		this.elementType = elementType;
		this.requiredChildren = this.getRequiredChildrenFromDefaults( widgetsCache[ elementType ] );
	}

	enforce( xml: Document ) {
		if ( this.requiredChildren.length === 0 ) {
			return;
		}

		for ( const rootNode of Array.from( xml.children ) ) {
			this.normalizeRequiredChildrenInNode( rootNode );
		}
	}

private normalizeRequiredChildrenInNode( node: Element ): void {
	this.appendMissingRequiredChildren( node );

	for ( const childNode of Array.from( node.children ) ) {
		this.normalizeRequiredChildrenInNode( childNode );
	}
}

private appendMissingRequiredChildren( node: Element ): void {
	if ( node.tagName !== this.elementType || ! this.requiredChildren.length ) {
		return;
	}

	const existingChildTypes = new Set(
		Array.from( node.children ).map( ( child ) => child.tagName )
	);

	for ( const requiredChild of this.requiredChildren ) {
		const childType = this.getTemplateNodeTagName( requiredChild );

		if ( ! childType || existingChildTypes.has( childType ) ) {
			continue;
		}

		node.appendChild(
			this.createXmlNodeFromTemplate( requiredChild, node.ownerDocument )
		);

		existingChildTypes.add( childType );
	}
}

	private getTemplateNodeTagName( template: TemplateNode ): string {
		const elementType = template.elType;
		if ( elementType === 'widget' ) {
			return typeof template.widgetType === 'string' ? template.widgetType : '';
		}

		return typeof elementType === 'string' ? elementType : '';
	}

	private getRequiredChildrenFromDefaults( elementConfig: V1ElementConfig | undefined ): TemplateNode[] {
		const defaultChildren = elementConfig?.default_children;

		if ( ! Array.isArray( defaultChildren ) ) {
			return [];
		}

		return defaultChildren.filter(
			( child ) => ( child as { meta?: { required?: boolean } } )?.meta?.required
		) as TemplateNode[];
	}

	private createXmlNodeFromTemplate( template: TemplateNode, doc: Document ): Element {
		const tagName = this.getTemplateNodeTagName( template );
		if ( ! tagName ) {
			throw new Error( 'Failed to create required child node: Invalid template element type.' );
		}

		const node = doc.createElement( tagName );
		const templateChildren = Array.isArray( template.elements ) ? template.elements : [];
		for ( const child of templateChildren ) {
			node.appendChild( this.createXmlNodeFromTemplate( child as TemplateNode, doc ) );
		}

		return node;
	}
}
