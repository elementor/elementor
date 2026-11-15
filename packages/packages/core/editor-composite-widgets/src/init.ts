import { initStructureGuards } from './closed-structure/structure-guards';
import { initExpandWidgetOnDrop } from './sync/expand-widget-on-drop';

export function init() {
	initExpandWidgetOnDrop();
	initStructureGuards();
}
