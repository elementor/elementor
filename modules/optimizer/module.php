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
	 * @var Cache_Manager
	 */
	private $cache_manager;

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
		$this->init_optimizer();
	}

	public function get_name() {
		return 'optimizer';
	}

	public function init_optimizer() {
		if ( $this->is_analyzer_active() ) {
			$this->analyzer = new Analyzer();
		} else {
			$this->optimizer = new Page_Optimizer();
		}
	}

	public static function is_active() {
		if ( ! Plugin::$instance->experiments->is_feature_active( 'elementor_optimizer' ) ) {
			return false;
		}
		return true;
	}

	public function is_analyzer_active() {
		$is_user_admin = ( current_user_can('editor') || current_user_can('administrator') );

		return $is_user_admin &&
		       isset( $_GET['analyzer'] ) &&
		       ! is_admin();
	}
}
