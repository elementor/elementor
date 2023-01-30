<?php
namespace Elementor\Modules\CacheStackControls;

use Elementor\Plugin;
use Elementor\Core\Base\Module as BaseModule;
use Elementor\Core\Experiments\Manager as ExperimentsManager;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Module extends BaseModule {

	public function get_name() {
		return 'cache-stack-controls';
	}

	public function __construct() {
		parent::__construct();

		add_action( 'elementor/core/files/clear_cache', [ $this, 'clear_cache' ] );

		add_action( 'activated_plugin', [ $this, 'clear_cache' ] );
		add_action( 'deactivated_plugin', [ $this, 'clear_cache' ] );
		add_action( 'switch_theme', [ $this, 'clear_cache' ] );
		add_action( 'upgrader_process_complete', [ $this, 'clear_cache' ] );
	}

	public static function get_experimental_data() {
		return [
			'name' => 'e_controls_cache',
			'title' => esc_html__( 'Cache Controls', 'elementor' ),
			'tag' => esc_html__( 'Performance', 'elementor' ),
			'release_status' => ExperimentsManager::RELEASE_STATUS_DEV,
			'generator_tag' => true,
		];
	}

	public function clear_cache() {
		update_option( '_e_controls_stack_cache', md5( uniqid() ) );
	}
}
