import { injectIntoResponsive } from '../../locations';
import BreakpointsSwitcher from './components/breakpoints-switcher';

export function init() {
	injectIntoResponsive( {
		id: 'responsive-breakpoints-switcher',
		component: BreakpointsSwitcher,
		options: {
			priority: 20, // After document indication.
		},
	} );
}
