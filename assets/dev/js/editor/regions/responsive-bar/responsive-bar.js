import View from './view';

export default class extends Marionette.Region {
	constructor( options ) {
		super( options );

		this.show( new View() );
	}
}
