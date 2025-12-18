import { useMemo } from 'react';
import { type Control, type ControlItem, getElementType } from '@elementor/editor-elements';

export function useControlsByWidgetType( types: string[] ): Record< string, Record< string, Control > > {
	return useMemo( () => {
		const controlsByType = Object.fromEntries(
			types
				.map( ( type ) => {
					const elementType = getElementType( type );

					if ( ! elementType ) {
						return false;
					}

					const controls = iterateControls( elementType.controls );

					return [ elementType.key, controls ];
				} )
				.filter( Boolean ) as [ string, Control[] ][]
		);

		return Object.entries( controlsByType ).reduce(
			( typeToBindToControl, [ widgetType, controls ] ) => ( {
				...typeToBindToControl,
				[ widgetType ]: getControlsByBind( controls ),
			} ),
			{}
		);
	}, [ types ] );
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
