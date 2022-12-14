export class LocationsManager {
	locations : Record<string, React.FC[]> = {};

	register( locationName : string, component : React.FC ) {
		if ( ! this.locations[ locationName ] ) {
			this.locations[ locationName ] = [];
		}

		this.locations[ locationName ].push( component );
	}

	get( locationName : string ) {
		return this.locations[ locationName ];
	}

	getAll() {
		return this.locations;
	}
}
