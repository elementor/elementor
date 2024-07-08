<?php
namespace Elementor\Modules\AppBar;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Module extends BaseModule {
	const EXPERIMENT_NAME = 'editor_v2'; // Kept as `editor_v2` for backward compatibility.
	const EXPERIMENT_DEFAULT_STATE = Experiments_Manager::STATE_INACTIVE;

	const PACKAGES = [
		'editor-app-bar',
		'editor-documents',
		'editor-panels',
		'editor-responsive',
		'editor-site-navigation',
	];

	const STYLES = [
		'editor-v2-app-bar-overrides',
	];

	public function get_name() {
		return 'app-bar';
	}

	public function __construct() {
		parent::__construct();

		$this->register_experiment();

		if ( Plugin::$instance->experiments->is_feature_active( self::EXPERIMENT_NAME ) ) {
			add_filter( 'elementor/editor/v2/packages', fn( $packages ) => $this->add_packages( $packages ) );
			add_filter( 'elementor/editor/v2/styles', fn( $styles ) => $this->add_styles( $styles ) );
		}
	}

	private function register_experiment() {
		Plugin::$instance->experiments->add_feature( [
			'name' => self::EXPERIMENT_NAME,
			'title' => esc_html__( 'Editor Top Bar', 'elementor' ),
			'description' => sprintf(
				'%1$s <a href="https://go.elementor.com/wp-dash-elementor-top-bar/" target="_blank">%2$s</a>',
				esc_html__( 'Get a sneak peek of the new Editor powered by React. The beautiful design and experimental layout of the Top bar are just some of the exciting tools on their way.', 'elementor' ),
				esc_html__( 'Learn more', 'elementor' )
			),
			'default' => self::EXPERIMENT_DEFAULT_STATE,
			'release_status' => Experiments_Manager::RELEASE_STATUS_BETA,
			'new_site' => [
				'default_active' => true,
				'minimum_installation_version' => '3.23.0',
			],
		] );
	}

	private function add_packages( $packages ) {
		return array_merge( $packages, self::PACKAGES );
	}

	private function add_styles( $styles ) {
		return array_merge( $styles, self::STYLES );
	}
}
