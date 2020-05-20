import Repeater from '../../../../assets/dev/js/editor/controls/repeater';
import RepeaterRow from './repeater-row';

export default class extends Repeater {
	constructor( ...args ) {
		super( ...args );

		this.childView = RepeaterRow;
	}
}
