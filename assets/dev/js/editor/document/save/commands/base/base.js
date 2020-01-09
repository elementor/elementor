import ComponentBase from 'elementor-api/modules/component-base';

export default class Base extends ComponentBase {
	initialize( args ) {
		super.initialize( args );

		const { document = elementor.documents.getCurrent() } = args;

		this.document = document;
	}
}
