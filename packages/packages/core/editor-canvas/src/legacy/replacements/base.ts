import { type ReplacementSettings } from '../types';

export type TriggerMethod = 'render' | 'renderOnChange' | 'onDestroy' | '_beforeRender' | '_afterRender';
export type TriggerTiming = 'before' | 'after' | 'never';

export const TRIGGER_TIMING: Record< string, TriggerTiming > = {
	before: 'before',
	after: 'after',
	never: 'never',
};

export interface ReplacementBaseInterface {
	renderOnChange?: () => void;
	onDestroy?: () => void;
	_beforeRender?: () => void;
	_afterRender?: () => void;
	shouldRenderReplacement: () => boolean;
	render?: () => void;
	originalMethodsToTrigger: () => Partial< Record< TriggerMethod, TriggerTiming > >;
}

export class ReplacementBase implements ReplacementBaseInterface {
	protected getSetting: ReplacementSettings[ 'getSetting' ];
	protected setSetting: ReplacementSettings[ 'setSetting' ];
	protected element: ReplacementSettings[ 'element' ];
	protected type: ReplacementSettings[ 'type' ];
	protected id: ReplacementSettings[ 'id' ];
	protected refreshView: ReplacementSettings[ 'refreshView' ];

	constructor( settings: ReplacementSettings ) {
		this.getSetting = settings.getSetting;
		this.setSetting = settings.setSetting;
		this.element = settings.element;
		this.type = settings.type;
		this.id = settings.id;
		this.refreshView = settings.refreshView;
	}

	static getTypes(): string[] | null {
		return null;
	}

	shouldRenderReplacement(): boolean {
		return true;
	}

	originalMethodsToTrigger() {
		return {
			_beforeRender: TRIGGER_TIMING.before,
			_afterRender: TRIGGER_TIMING.after,
			renderOnChange: TRIGGER_TIMING.never,
			onDestroy: TRIGGER_TIMING.never,
			render: TRIGGER_TIMING.never,
		};
	}
}
