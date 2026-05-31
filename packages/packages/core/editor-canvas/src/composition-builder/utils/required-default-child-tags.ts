import { type V1ElementConfig } from '@elementor/editor-elements';

export type ChildTemplate = {
	widgetType?: string;
	elType?: string;
	meta?: { required?: boolean };
};
export function getRequiredDefaultChildTemplates( elementConfig: V1ElementConfig | undefined ): ChildTemplate[] {
	const defaultChildren = elementConfig?.default_children as ChildTemplate[];

	if ( ! Array.isArray( defaultChildren ) ) {
		return [];
	}

	return defaultChildren.filter( ( child ) => child?.meta?.required ?? false );
}

export function getRequiredDefaultChildTypes( elementConfig: V1ElementConfig | undefined ): string[] {
	return getRequiredDefaultChildTemplates( elementConfig )
		.map( ( child ) => child.widgetType ?? child.elType ?? '' )
		.filter( ( type ) => Boolean( type ) );
}
