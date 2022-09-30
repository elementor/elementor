export default class MockDataBase {
	constructor( addMockCallback ) {
		addMockCallback( this.getType(), this.getCommand(), () => Promise.resolve( this.getMockData() ) );
	}

	getType() {}
	getCommand() {}
	getMockData() {}
}
