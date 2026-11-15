import type { V3ControlView } from '../types';

type WidgetCacheControl = {
	name?: string;
	section?: string;
	inner_tab?: string;
};

type ContainerWithSettings = NonNullable< V3ControlView[ 'options' ][ 'container' ] > & {
	model?: { get: ( key: string ) => unknown };
};

const HOVER_ANIMATION_AI_TYPE = 'hover_animation';
const SECTION_EFFECTS = 'section_effects';
const TAB_POSITIONING_HOVER = '_tab_positioning_hover';

const isMeaningfulSettingValue = ( value: unknown ): boolean => {
	if ( null === value || undefined === value ) {
		return false;
	}

	if ( '' === value || 'no' === value ) {
		return false;
	}

	return true;
};

export const resolveWidgetTypeFromView = ( view: V3ControlView ): string => {
	const container = view.options.container as ContainerWithSettings | undefined;

	if ( ! container ) {
		return 'container';
	}

	const widgetType = container.model?.get?.( 'widgetType' ) ?? container.args?.model.get( 'widgetType' );

	return ( widgetType as string | undefined ) ?? container.type ?? 'container';
};

export const gatherMotionEffectSettings = (
	view: V3ControlView,
	aiType: string
): Record< string, unknown > => {
	const container = view.options.container as ContainerWithSettings | undefined;

	if ( ! container?.settings?.get ) {
		return {};
	}

	const widgetType = resolveWidgetTypeFromView( view );
	const elementor = ( window as unknown as { elementor?: { widgetsCache?: Record< string, { controls?: Record< string, WidgetCacheControl > } > } } )
		.elementor;
	const controls = Object.values( elementor?.widgetsCache?.[ widgetType ]?.controls ?? {} );

	const isHoverScope = aiType === HOVER_ANIMATION_AI_TYPE;

	return controls
		.filter( ( control ) =>
			isHoverScope ? control.inner_tab === TAB_POSITIONING_HOVER : control.section === SECTION_EFFECTS
		)
		.reduce< Record< string, unknown > >( ( accumulated, control ) => {
			const controlName = control.name;

			if ( ! controlName ) {
				return accumulated;
			}

			return {
				...accumulated,
				[ controlName ]: container.settings?.get( controlName ),
			};
		}, {} );
};

export const summarizeMotionSettings = ( settings: Record< string, unknown > ): string => {
	const entries = Object.entries( settings ).filter( ( [ , value ] ) => isMeaningfulSettingValue( value ) );

	if ( ! entries.length ) {
		return 'No motion settings are currently applied.';
	}

	return entries.map( ( [ key, value ] ) => `${ key }: ${ JSON.stringify( value ) }` ).join( '\n' );
};
