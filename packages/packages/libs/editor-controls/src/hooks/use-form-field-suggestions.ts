import { getContainer, getSelectedElements } from '@elementor/editor-elements';
import { isTransformable } from '@elementor/editor-props';
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
];

type Options = {
	inputType?: string;
};

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

				if ( options?.inputType ) {
					const typeProp = child.settings.get( 'type' );
					const typeValue = isTransformable( typeProp ) ? typeProp.value : typeProp;

					if ( typeValue !== options.inputType ) {
						return;
					}
				}

				const cssIdProp = child.settings.get( '_cssid' );
				const fieldId = isTransformable( cssIdProp ) ? cssIdProp.value : cssIdProp;

				if ( fieldId && typeof fieldId === 'string' ) {
					suggestions.push( { label: fieldId, value: fieldId } );
				}
			} );

			return suggestions;
		},
		[]
	);
}
