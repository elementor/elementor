import { injectIntoTop } from '@elementor/editor';
import { getCurrentDocumentId } from '@elementor/editor-elements';
import { injectTab } from '@elementor/editor-elements-panel';
import { type NumberPropValue } from '@elementor/editor-props';
import { addInitialDocumentStyles, removeInitialDocumentStyles } from '@elementor/editor-styles-repository';
import { __privateListenTo as listenTo, commandStartEvent, registerDataHook } from '@elementor/editor-v1-adapters';
import { __ } from '@wordpress/i18n';

import { ComponentsTab } from './components/components-tab';
import { CreateComponentForm } from './components/create-component-form/create-component-form';

export function init() {
	injectTab( {
		id: 'components',
		label: __( 'Components', 'elementor' ),
		component: ComponentsTab,
	} );

	injectIntoTop( {
		id: 'create-component-popup',
		component: CreateComponentForm,
	} );

	registerDataHook( 'after', 'editor/documents/attach-preview', async () => {
		const elements = elementor.documents.currentDocument.config.elements as Element[];

		const componentIds = new Set( getComponentIds( elements ) );

		await addInitialDocumentStyles( Array.from( componentIds ) );
	} );

	type Element = {
		elements?: Element[];
		widgetType?: string;
		elType?: string;
		settings?: {
			component_id?: NumberPropValue;
		};
	};

	const getComponentIds = ( elements: Element[] ) => {
		return elements.flatMap( ( element ) => {
			const ids: number[] = [];

			const type = element.widgetType || element.elType;

			if ( type === 'e-component' && element.settings?.component_id && element.settings?.component_id?.value ) {
				ids.push( element.settings.component_id.value );
			}

			if ( element.elements ) {
				ids.push( ...getComponentIds( element.elements ) );
			}

			return ids;
		} );
	};

	listenTo( commandStartEvent( 'editor/documents/attach-preview' ), () => {
		const id = getCurrentDocumentId();

		if ( id ) {
			removeInitialDocumentStyles( id );
		}
	} );
}
