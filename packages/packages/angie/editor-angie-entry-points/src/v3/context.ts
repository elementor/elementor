import type { V3AngieControlContext, V3ControlView } from './types';

export function getV3ControlContext( view: V3ControlView, controlType: string ): V3AngieControlContext {
	const controlName = view.options.model.get( 'name' ) as string | undefined;

	if ( ! view.options.container ) {
		return {
			controlName,
			controlType,
		};
	}

	const { container } = view.options;

	return {
		documentType: container.document?.config.type,
		elementType: container.args?.model.get( 'elType' ) as string | undefined,
		elementId: container.id,
		widgetType: container.args?.model.get( 'widgetType' ) as string | undefined,
		controlName,
		controlType,
		controlValue: container.settings?.get( controlName as string ),
		isRepeaterItem: 'repeater' === container.type,
	};
}
