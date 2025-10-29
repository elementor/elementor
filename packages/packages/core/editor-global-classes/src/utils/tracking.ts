import { getMixpanel } from '@elementor/mixpanel';
type CssClassFilterEvent = {
	action: 'openFilter' | 'applyFilter' | 'removeFilter' | 'clearFilter';
	type: 'empty' | 'onThisPage' | 'unused';
	trigger: 'menu' | 'header';
};

type CssClassCRUDEvent = {
	type: 'create' | 'delete' | 'rename' | 'change_state' | 'reset_state';
	source: 'created' | 'converted';
	trigger: string;
	totalInstances?: number;
};

export type GlobalClassEvent = CssClassFilterEvent | CssClassCRUDEvent;

export const trackGlobalClassEvent = ( { event, classId, ...rest }: any ) => {
	console.log( 'LOG:: event', { event, classId, ...rest } );

	const { dispatchEvent, config } = getMixpanel();
	if ( ! config?.names?.global_classes?.[ event ] ) {
		return;
	}

	const name = config.names.global_classes[ event ];
	dispatchEvent?.( name, {
		classId,
		event,
		...rest,
	} );
};
