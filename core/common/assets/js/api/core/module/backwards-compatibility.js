import ModuleBase from 'elementor-api/core/module/base';

export default class ModuleBackwardsCompatibility extends ModuleBase {
	getModuleName() {
		this.forceMethodImplementation();
	}

	on( eventName, callback ) {
		if ( 'run' === eventName ) {
			elementorCommon.helpers.softDeprecated(
				`$e.${ this.getModuleName() }.on( 'run', ... )`,
				'3.0.0',
				`$e.${ this.getModuleName() }.on( 'run:before', ... )`
			);

			return super.on( 'run:before', callback );
		}

		return super.on( eventName, callback );
	}
}
