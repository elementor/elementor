import UiStateBase from 'elementor-api/core/states/ui-state-base';

export const DIRECTION_ROW = 'row';
export const DIRECTION_ROW_REVERSE = 'row-reverse';
export const DIRECTION_COLUMN = 'column';
export const DIRECTION_COLUMN_REVERSE = 'column-reverse';

export class DirectionMode extends UiStateBase {
	getId() {
		return 'direction-mode';
	}

	getOptions() {
		return {
			[ DIRECTION_ROW ]: '',
			[ DIRECTION_ROW_REVERSE ]: '',
			[ DIRECTION_COLUMN ]: '',
			[ DIRECTION_COLUMN_REVERSE ]: '',
		};
	}

	getScopes() {
		return [
			window.document.body,
			elementor.$previewContents[ 0 ].body,
		];
	}
}
