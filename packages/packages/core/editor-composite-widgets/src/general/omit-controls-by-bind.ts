import { type ControlItem } from '@elementor/editor-elements';

export function omitControlsByBind( controls: ControlItem[], binds: string[] ): ControlItem[] {
	return controls.flatMap( ( control ): ControlItem[] => {
		if ( control.type === 'control' && binds.includes( control.value.bind ) ) {
			return [];
		}

		if ( control.type === 'section' ) {
			return [
				{ ...control, value: { ...control.value, items: omitControlsByBind( control.value.items, binds ) } },
			];
		}

		return [ control ];
	} );
}
