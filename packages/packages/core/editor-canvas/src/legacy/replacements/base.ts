import { type PropValue } from '@elementor/editor-props';

export type ReplacementSettings = {
	getSetting: ( key: string ) => unknown;
	setSetting: ( key: string, value: PropValue ) => void;
	type: string;
	id: string;
	element: HTMLElement;
	refreshView: () => void;
};

export default class ReplacementBase {
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

	render(): void {}

	_beforeRender(): void {}

	_afterRender(): void {}

	shouldRenderReplacement(): boolean {
		return true;
	}
}
