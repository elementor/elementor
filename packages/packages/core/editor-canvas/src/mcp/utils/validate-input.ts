import { getWidgetsCache } from '@elementor/editor-elements';
import { type PropsSchema, type PropValue, Schema } from '@elementor/editor-props';
import { getStylesSchema } from '@elementor/editor-styles';

let _widgetsSchema: Record< string, PropsSchema > | null = null;

type ValidationResult = {
	valid: boolean;
	errors?: string[];
};

export const validateInput = {
	get widgetsSchema(): Record< string, PropsSchema > {
		if ( ! _widgetsSchema ) {
			const schema: Record< string, PropsSchema > = {};
			const cache = getWidgetsCache();
			if ( ! cache ) {
				return {};
			}
			Object.entries( cache ).forEach( ( [ widgetType, widgetData ] ) => {
				if ( widgetData.atomic_props_schema ) {
					schema[ widgetType ] = structuredClone( widgetData.atomic_props_schema );
				}
			} );
			_widgetsSchema = schema;
		}
		return _widgetsSchema;
	},

	validateProps(
		schema: PropsSchema | undefined | null,
		values: Record< string, unknown >,
		ignore: string[] = []
	): ValidationResult {
		if ( ! schema ) {
			throw new Error( 'No schema provided for validation.' );
		}
		const errors: string[] = [];
		let hasInvalidKey = false;
		Object.entries( values ).forEach( ( [ propName, propValue ] ) => {
			if ( ignore.includes( propName ) ) {
				return;
			}
			const propSchema = schema[ propName ];
			if ( ! propSchema ) {
				errors.push( `Property "${ propName }" is not defined in the schema.` );
				hasInvalidKey = true;
			} else if ( ! Schema.isPropKeyConfigurable( propName ) ) {
				errors.push( `Property "${ propName }" is not configurable.` );
			} else {
				const { valid, errorMessages } = Schema.validatePropValue( propSchema, propValue as PropValue );
				if ( ! valid ) {
					errors.push( `Invalid property "${ propName }": ${ errorMessages }` );
				}
			}
		} );
		if ( hasInvalidKey ) {
			errors.push( 'Available properties: ' + Object.keys( schema ).join( ', ' ) );
		}
		return {
			errors,
			valid: errors.length === 0,
		};
	},

	validateStyles( values: Record< string, unknown > ): ValidationResult {
		const styleSchema = getStylesSchema();
		const customCssValue = values.custom_css;
		const hasPro = !!( window as unknown as { elementorPro?: object } ).elementorPro;
		
		if ( customCssValue && ! hasPro ) {
			return {
				valid: false,
				errors: [ 'custom_css is only available for Elementor PRO users. Use style schema PropValues instead.' ],
			};
		}
		
		const result = this.validateProps( styleSchema, values, [ 'custom_css' ] );
		const appendInvalidCustomCssErr = () => {
			result.valid = false;
			result.errors = result.errors || [];
			result.errors.push( 'Invalid property "custom_css". Expected a string value.' );
		};
		if ( customCssValue && typeof customCssValue === 'object' ) {
			if ( typeof ( customCssValue as Record< string, unknown > ).value !== 'string' ) {
				appendInvalidCustomCssErr();
			}
		} else if (
			typeof customCssValue !== 'string' &&
			typeof customCssValue !== 'undefined' &&
			customCssValue !== null
		) {
			appendInvalidCustomCssErr();
		}
		return result;
	},

	validatePropSchema(
		widgetType: string,
		values: Record< string, unknown >,
		ignore: string[] = []
	): ValidationResult {
		const schema = this.widgetsSchema[ widgetType ];
		if ( ! schema ) {
			return { valid: false, errors: [ `No schema found for widget type "${ widgetType }".` ] };
		}
		return this.validateProps( schema, values, ignore );
	},
};
