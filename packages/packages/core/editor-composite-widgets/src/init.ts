import { initStructureGuards } from './closed-structure/structure-guards';
import { initWidgetGeneral } from './general/init-widget-general';
import { initExpandWidgetOnDrop } from './sync/expand-widget-on-drop';

export function init() {
	initExpandWidgetOnDrop();
	initStructureGuards();
	initWidgetGeneral();
}
