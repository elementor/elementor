import PortedPrimaryAction from './components/ported-primary-action';
import { injectIntoTop } from '@elementor/editor';

export default function init() {
	// This is portal, so it injected into the top of the editor, but renders inside the site-settings panel.
	injectIntoTop( {
		name: 'site-settings-primary-action-portal',
		filler: PortedPrimaryAction,
	} );
}
