import { type V1ElementConfig } from '@elementor/editor-elements';

export type DefaultChildTemplate = Record< string, unknown >;

export function resolveDefaultChildTemplateTagName( template: DefaultChildTemplate ): string {
	const elementType = template.elType;

	if ( elementType === 'widget' ) {
		return typeof template.widgetType === 'string' ? template.widgetType : '';
	}

	return typeof elementType === 'string' ? elementType : '';
}

export function getRequiredDefaultChildTemplates( elementConfig: V1ElementConfig | undefined ): DefaultChildTemplate[] {
	const defaultChildren = elementConfig?.default_children;

	if ( ! Array.isArray( defaultChildren ) ) {
		return [];
	}

	return defaultChildren.filter(
		( child ): child is DefaultChildTemplate => !! ( child as { meta?: { required?: boolean } } )?.meta?.required
	);
}

export function getRequiredDefaultChildTagNames( elementConfig: V1ElementConfig | undefined ): string[] {
	return getRequiredDefaultChildTemplates( elementConfig )
		.map( resolveDefaultChildTemplateTagName )
		.filter( ( tag ) => Boolean( tag ) );
}
