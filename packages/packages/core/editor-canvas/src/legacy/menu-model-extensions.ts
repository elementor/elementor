import { type ModelExtensions } from './create-nested-templated-element-type';
import { registerModelExtensions } from './init-legacy-views';
import { type BackboneModel, type ElementModel } from './types';

const MENU_ELEMENT_TYPES = [ 'e-menu', 'e-menu-items', 'e-menu-entry', 'e-menu-item' ];

type ElementsConfig = Record< string, { allowed_child_types?: string[] } | undefined >;

const menuModelExtensions: ModelExtensions = {
	isValidChild( this: BackboneModel< ElementModel >, childModel: BackboneModel< Record< string, unknown > > ) {
		const childType = ( childModel.get( 'widgetType' ) || childModel.get( 'elType' ) ) as string;

		if ( childType === 'section' || childType === 'column' ) {
			return false;
		}

		const elements = ( window as unknown as { elementor?: { config?: { elements?: ElementsConfig } } } ).elementor
			?.config?.elements;
		const allowedTypes = elements?.[ this.get( 'elType' ) as string ]?.allowed_child_types ?? [];

		return ! allowedTypes.length || allowedTypes.includes( childType );
	},
};

export function initMenuModelExtensions() {
	MENU_ELEMENT_TYPES.forEach( ( type ) => registerModelExtensions( type, menuModelExtensions ) );
}
