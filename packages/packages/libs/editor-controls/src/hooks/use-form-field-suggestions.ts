import { getContainer, getSelectedElements, getWidgetsCache, type V1Element } from '@elementor/editor-elements';
import { stringPropTypeUtil, type PropsSchema } from '@elementor/editor-props';
import { __privateUseListenTo as useListenTo, commandEndEvent, v1ReadyEvent } from '@elementor/editor-v1-adapters';

export type Suggestion = {
	label: string;
	value: string;
};

const FORM_FIELD_WIDGET_TYPES = [
	'e-form-input',
	'e-form-textarea',
	'e-form-checkbox',
	'e-form-radio-button',
	'e-form-select',
	'e-form-date-picker',
	'e-form-time-picker',
] as const;

const FORM_ELEMENT_TYPE = 'e-form';
const CSS_ID_PROP_KEY = '_cssid';

type Options = {
	inputType?: string;
};

function extractStringPropValue( value: unknown ): string | undefined {
	const extracted = stringPropTypeUtil.extract( value );

	if ( extracted ) {
		return extracted;
	}

	return typeof value === 'string' && value ? value : undefined;
}

function getSettingWithDefault( child: V1Element, widgetType: string, key: string ): unknown {
	const fromJson = child.settings.toJSON?.()?.[ key ];

	if ( null != fromJson ) {
		return fromJson;
	}

	const fromGet = child.settings.get( key );

	if ( null != fromGet ) {
		return fromGet;
	}

	const schema = getWidgetsCache()?.[ widgetType ]?.atomic_props_schema as PropsSchema | undefined;

	return schema?.[ key ]?.default ?? null;
}

function getFieldCssId( child: V1Element, widgetType: string ): string | null {
	return extractStringPropValue( getSettingWithDefault( child, widgetType, CSS_ID_PROP_KEY ) ) ?? null;
}

function getFormContainer( elementId: string ): V1Element | null {
	let container = getContainer( elementId );

	while ( container ) {
		if ( container.model.get( 'elType' ) === FORM_ELEMENT_TYPE ) {
			return container;
		}

		container = container.parent ?? null;
	}

	return null;
}

export function useFormFieldSuggestions( options?: Options ): Suggestion[] {
	return useListenTo(
		[
			v1ReadyEvent(),
			commandEndEvent( 'document/elements/create' ),
			commandEndEvent( 'document/elements/delete' ),
			commandEndEvent( 'document/elements/set-settings' ),
		],
		() => {
			const selectedElements = getSelectedElements();
			const selectedElement = selectedElements[ 0 ];

			if ( ! selectedElement ) {
				return [];
			}

			const formContainer = getFormContainer( selectedElement.id );

			if ( ! formContainer?.children ) {
				return [];
			}

			const suggestions: Suggestion[] = [];
			const seenCssIds = new Set< string >();

			formContainer.children.forEachRecursive?.( ( child ) => {
				const widgetType = child.model.get( 'widgetType' ) as string | undefined;

				if ( ! widgetType || ! FORM_FIELD_WIDGET_TYPES.includes( widgetType as ( typeof FORM_FIELD_WIDGET_TYPES )[ number ] ) ) {
					return;
				}

				if ( options?.inputType ) {
					const typeValue = extractStringPropValue( getSettingWithDefault( child, widgetType, 'type' ) );

					if ( typeValue !== options.inputType ) {
						return;
					}
				}

				const cssId = getFieldCssId( child, widgetType );

				if ( ! cssId || seenCssIds.has( cssId ) ) {
					return;
				}

				seenCssIds.add( cssId );
				suggestions.push( { label: cssId, value: cssId } );
			} );

			return suggestions;
		},
		[]
	);
}
