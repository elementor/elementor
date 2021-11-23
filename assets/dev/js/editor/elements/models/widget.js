import ElementModel from './element';

export default class Container extends ElementModel {
	isValidChild() {
		// By default widget cannot contain any element.
        return false;
	}
}
