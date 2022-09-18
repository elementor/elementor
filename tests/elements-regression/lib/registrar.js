class Registrar {
	constructor() {
		this.items = {};
	}

	registerAll( items ) {
		items.forEach( ( ItemClass ) => this.register( ItemClass ) );

		return this;
	}

	register( ItemClass ) {
		this.items[ ItemClass.getType() ] = ItemClass;

		return this;
	}

	unregister( itemType ) {
		this.items = Object.fromEntries( Object
			.entries( this.items )
			.filter( ( [ type ] ) => type !== itemType ),
		);

		return this;
	}

	get( controlType ) {
		return this.items[ controlType ] || this.items.default;
	}

	getAll() {
		return this.items;
	}
}

module.exports = {
	Registrar,
};
