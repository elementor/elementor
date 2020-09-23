<?php
namespace Elementor\Core\Common\Modules\DevTools;

use Elementor\Core\Base\Module as BaseModule;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Module extends BaseModule {
	/**
	 * @var \Elementor\Core\Common\Modules\DevTools\Deprecation
	 */
	public $deprecation;

	/**
	 * @return \Elementor\Core\Base\Module|\Elementor\Core\Common\Modules\DevTools\Module
	 */
	public static function instance() {
		return ( parent::instance() );
	}

	public function __construct() {
		$this->deprecation = new Deprecation( ELEMENTOR_VERSION );
	}

	public function get_name() {
		return 'devTools';
	}

	protected function get_init_settings() {
		return [
			'deprecation' => [
				'notices' => $this->deprecation->get_notices(),
			],
		];
	}
}
