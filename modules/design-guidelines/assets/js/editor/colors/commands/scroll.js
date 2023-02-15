import ColorsHandler from "../handler";
import EditorHelper from "../../utils/editorHelper";

export class Scroll extends $e.modules.document.CommandHistory {

	getHistory( args ) {
		return {
			type: 'add',
			title: 'Scroll to Main',
		};
	}

	apply( args ) {
		console.log( 'Scroll to Main'   );
		const document = elementor.documents.getCurrent();
		new ColorsHandler( new EditorHelper() ).scrollToMain( document );
	}

}
