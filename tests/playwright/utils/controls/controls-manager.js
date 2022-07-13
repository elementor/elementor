class ControlsManager {
	constructor() {
		this.controls = {};
	}

	register( ControlClass ) {
		this.controls[ ControlClass.getType() ] = ControlClass;
	}

	unregister( controlType ) {
		this.controls = Object.fromEntries( Object
			.entries( this.controls )
			.filter( ( [ type ] ) => type !== controlType ),
		);
	}

	get( controlType ) {
		return this.controls[ controlType ];
	}

	getAll() {
		return this.controls;
	}
}

module.exports = {
	ControlsManager,
};
