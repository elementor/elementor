import { ControlHeaderAppPromotion } from '../components/control-header-app-promotion';
import { injectIntoControlHeader } from '../components/control-header-location';

export const CONTROL_HEADER_APP_PROMOTION_ID = 'control-header-app-promotion';

export const hasExternalControlHeaderInjections = ( injections: { id: string }[] ) =>
	injections.some( ( injection ) => injection.id !== CONTROL_HEADER_APP_PROMOTION_ID );

export const initControlHeader = () => {
	injectIntoControlHeader( {
		id: CONTROL_HEADER_APP_PROMOTION_ID,
		component: ControlHeaderAppPromotion,
		options: { priority: 5 },
	} );
};
