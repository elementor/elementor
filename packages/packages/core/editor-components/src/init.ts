import { injectIntoTop } from '@elementor/editor';
import {
	getCurrentDocumentId,
	type V1ElementModelProps,
	type V1ElementSettingsProps,
} from '@elementor/editor-elements';
import { injectTab } from '@elementor/editor-elements-panel';
import { type NumberPropValue } from '@elementor/editor-props';
import { addInitialDocumentStyles, removeInitialDocumentStyles } from '@elementor/editor-styles-repository';
import { __privateListenTo as listenTo, commandStartEvent, registerDataHook } from '@elementor/editor-v1-adapters';
import { __ } from '@wordpress/i18n';

import { Components } from './components/components';
import { CreateComponentForm } from './components/create-component-form/create-component-form';
import { type ExtendedWindow } from './types';

type Element = V1ElementModelProps & {
	elements?: Element[];
	settings?: V1ElementSettingsProps & {
		component_id?: NumberPropValue;
	};
};

export function init() {
	injectTab( {
		id: 'components',
		label: __( 'Components', 'elementor' ),
		component: Components,
	} );

	injectIntoTop( {
		id: 'create-component-popup',
		component: CreateComponentForm,
	} );

	registerDataHook( 'after', 'editor/documents/attach-preview', async () => {
		const extendedWindow = window as unknown as ExtendedWindow;
		const elements = extendedWindow.elementor.documents.currentDocument.config.elements as Element[];

		const componentIds = new Set( getComponentIds( elements ) );

		await addInitialDocumentStyles( Array.from( componentIds ) );
	} );

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
