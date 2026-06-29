import { type Control, type ControlItem, getElementType } from '@elementor/editor-elements';

export function useControlsByWidgetType( type: string ): Record< string, Control > {
	const elementType = getElementType( type );

	if ( ! elementType ) {
		return {};
	}

	const controls = iterateControls( elementType.controls );

	return getControlsByBind( controls );
}

function iterateControls( controls: ControlItem[] ): Control[] {
	return controls
		.map( ( control ) => {
			if ( control.type === 'control' && 'bind' in control.value ) {
				return control;
			}

			if ( control.type === 'section' ) {
				return iterateControls( control.value.items );
			}

			return null;
		} )
		.filter( Boolean )
		.flat() as Control[];
}

function getControlsByBind( controls: Control[] ): Record< string, Control > {
	return controls.reduce(
		( controlsByBind: Record< string, Control >, control ) => ( {
			...controlsByBind,
			[ control.value.bind ]: control,
		} ),
		{}
	);
}
