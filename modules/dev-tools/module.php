<?php
namespace Elementor\Modules\DevTools;

use Elementor\Core\Base\Module as BaseModule;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Fix issue with 'Potentially polymorphic call. The code may be inoperable depending on the actual class instance passed as the argument.'.
 * Its tells to the editor that instance() return right module. instead of base module.
 * @method Module instance()
*/
class Module extends BaseModule {
	/**
	 * @var Deprecation
	 */
	public $deprecation;

	public function __construct() {
		$this->deprecation = new Deprecation( ELEMENTOR_VERSION );

		add_filter( 'elementor/editor/localize_settings', [ $this, 'localize_settings' ] );
	}

	public function get_name() {
		return 'dev-tools';
	}

	public function localize_settings( $settings ) {
		$settings = array_replace_recursive( $settings, [
			'dev_tools' => [
				'deprecation' => $this->deprecation->get_settings(),
			],
		] );

		return $settings;
	}
}
