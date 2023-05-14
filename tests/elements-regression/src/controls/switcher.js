const { ControlBase } = require( './control-base' );

class Switcher extends ControlBase {
	getSelector() {
		return `.elementor-control-${ this.config.name }`;
	}

	async getValue() {
		const checkbox = await this.elementLocator.locator( `label input[type="checkbox"]` );
		return await checkbox.isChecked() ? 'yes' : 'no';
	}

	async setValue( newValue ) {
		if ( await this.getValue() !== newValue ) {
			await this.elementLocator.locator( 'label.elementor-switch' ).click();
		}
	}

	async getTestValues( initialValue ) {
		return ( 'yes' === initialValue ) ? [ 'no' ] : [ 'yes' ];
	}
}

module.exports = {
	Switcher,
};
