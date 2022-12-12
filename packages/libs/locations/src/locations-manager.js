export class LocationsManager {
	locations = {};

	register( locationName, component ) {
		if ( ! this.locations[ locationName ] ) {
			this.locations[ locationName ] = [];
		}

		this.locations[ locationName ].push( component );
	}

	get( locationName ) {
		return this.locations[ locationName ];
	}

	getAll() {
		return this.locations;
	}
}
