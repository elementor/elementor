import ComponentBase from 'elementor-api/modules/component-base';
import EditorDocumentsComponent from './components/documents/component';

export default class Component extends ComponentBase {
	__construct( args = {} ) {
		super.__construct( args );

		$e.components.register( new EditorDocumentsComponent() );
	}

	getNamespace() {
		return 'editor';
	}
}
