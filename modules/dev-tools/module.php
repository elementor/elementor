<?php
namespace Elementor\Modules\DevTools;

use Elementor\Core\Base\Module as BaseModule;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Module extends BaseModule {
	/**
	 * @var \Elementor\Modules\DevTools\Deprecation
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
