import { injectIntoTop } from '@elementor/editor';
import { ComponentCreateForm } from './components/component-create-form';

export function init() {
    console.log('init editor components' );

	injectIntoTop( {
		id: 'component-create-form',
		component: ComponentCreateForm,
	} );
}