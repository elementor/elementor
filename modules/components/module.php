<?php
namespace Elementor\Modules\Components;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Modules\Components\Styles\Component_Styles;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Module extends BaseModule {
	const EXPERIMENT_NAME = 'e_components';
	const PACKAGES = [ 'editor-components' ];

	public function get_name() {
		return 'components';
	}

	public function __construct() {
		parent::__construct();

		$this->register_hooks();
	}

	public static function get_experimental_data() {
		return [
			'name' => self::EXPERIMENT_NAME,
			'title' => esc_html__( 'Components', 'elementor' ),
			'description' => esc_html__( 'Enable components.', 'elementor' ),
			'hidden' => true,
			'default' => Experiments_Manager::STATE_INACTIVE,
			'release_status' => Experiments_Manager::RELEASE_STATUS_DEV,
		];
	}

	private function register_hooks() {
		add_filter( 'elementor/editor/v2/packages', fn ( $packages ) => $this->add_packages( $packages ) );

		( new Component_Styles() )->register_hooks();
	}

	private function add_packages( $packages ) {
		return array_merge( $packages, self::PACKAGES );
	}
}
