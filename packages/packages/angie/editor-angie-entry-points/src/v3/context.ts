import type { V3AngieControlContext } from './registry';

type ControlView = {
	options: {
		model: {
			get: ( key: string ) => unknown;
		};
		container?: {
			id?: string;
			type?: string;
			document?: { config: { type: string } };
			args?: { model: { get: ( key: string ) => unknown } };
			settings?: { get: ( key: string ) => unknown };
		};
	};
};

export function getV3ControlContext( view: ControlView, controlType: string ): V3AngieControlContext {
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
