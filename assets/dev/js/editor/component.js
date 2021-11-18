import ComponentBase from 'elementor-api/modules/component-base';
import ContainerHelper from 'elementor-editor-utils/container-helper';
import EditorDocumentsComponent from './components/documents/component';

export default class Component extends ComponentBase {
	__construct( args = {} ) {
		super.__construct( args );

		$e.components.register( new EditorDocumentsComponent() );
	}

	getNamespace() {
		return 'editor';
	}

	defaultUtils() {
		return {
			container: ContainerHelper,
		};
	}
}
