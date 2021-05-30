<?php
namespace Elementor\Modules\Optimizer;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Module extends BaseModule {

	/**
	 * Page Optimizer
	 *
	 * @access private
	 *
	 * @var Page_Optimizer
	 */
	private $optimizer;

	/**
	 * Optimized Cache Manager.
	 *
	 * @access private
	 *
	 * @var Page_Loader
	 */
	private $page_loader;

	/**
	 * Page Analyzer.
	 *
	 * @access private
	 *
	 * @var Analyzer
	 */
	private $analyzer;

	/**
	 * Module constructor.
	 *
	 * @since 2.3.0
	 * @access public
	 */
	public function __construct() {
		parent::__construct();
		$this->init_optimizer();
	}

	public function get_name() {
		return 'optimizer';
	}

	private function init_optimizer() {
		if ( $this->is_analyzer_active() ) {
			add_action( 'elementor/frontend/before_enqueue_scripts', function() {
				$nonce = wp_create_nonce( 'save_analyzer_data_report' );
				echo '<script>const nonce ="' . $nonce . '"; const post_id ="' . get_the_ID() . '";</script>';
			} );

			$this->analyzer = new Analyzer();
			return;
		}

		$this->page_loader = new Page_Loader( get_the_ID() );
	}

	public static function is_active() {
		return Plugin::$instance->experiments->is_feature_active( 'elementor_optimizer' );
	}

	private function is_analyzer_active() {
		$is_user_admin = ( current_user_can( 'editor' ) || current_user_can( 'administrator' ) );

		return $is_user_admin && isset( $_REQUEST['analyzer'] );
	}
}
