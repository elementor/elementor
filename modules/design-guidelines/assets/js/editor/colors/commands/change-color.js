import ColorsHandler from "../handler";
import EditorHelper from "../../utils/editorHelper";

export class ChangeColor extends $e.modules.document.CommandHistory {

	getHistory( args ) {
		return {
			type: 'add',
			title: 'Color Changed',
		};
	}

	apply( args ) {
		const component = ChangeColor.getComponent();
		component.handler.changeColor( args.color );
	}
}
