import { default as ElementModel } from './element';

export default class Widget extends ElementModel {
	isValidChild() {
		// By default widget cannot contain any element.
		return false;
	}
}
