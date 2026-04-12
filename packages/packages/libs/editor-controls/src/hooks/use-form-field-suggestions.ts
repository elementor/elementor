import { getContainer, getSelectedElements } from '@elementor/editor-elements';
import { __privateUseListenTo as useListenTo, commandEndEvent, v1ReadyEvent } from '@elementor/editor-v1-adapters';

export type Suggestion = {
	label: string;
	value: string;
};

const FORM_FIELD_WIDGET_TYPES = [ 'e-form-input', 'e-form-textarea', 'e-form-checkbox' ];

export function useFormFieldSuggestions(): Suggestion[] {
	return useListenTo(
		[
			v1ReadyEvent(),
			commandEndEvent( 'document/elements/create' ),
			commandEndEvent( 'document/elements/delete' ),
			commandEndEvent( 'document/elements/set-settings' ),
		],
		() => {
			const selectedElements = getSelectedElements();
			const formElement = selectedElements[ 0 ];

			if ( ! formElement ) {
				return [];
			}

			const container = getContainer( formElement.id );

			if ( ! container?.children ) {
				return [];
			}

			const suggestions: Suggestion[] = [];

			container.children.forEachRecursive?.( ( child ) => {
				const widgetType = child.model.get( 'widgetType' ) as string | undefined;

				if ( ! widgetType || ! FORM_FIELD_WIDGET_TYPES.includes( widgetType ) ) {
					return;
				}

				const cssIdProp = child.settings.get( '_cssid' ) as { value?: string } | string | undefined;
				const fieldId = typeof cssIdProp === 'object' && cssIdProp?.value ? cssIdProp.value : cssIdProp;

				if ( fieldId && typeof fieldId === 'string' ) {
					suggestions.push( { label: fieldId, value: fieldId } );
				}
			} );

			return suggestions;
		},
		[]
	);
}
