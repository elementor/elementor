<?php
namespace Elementor\Modules\EditorAppBar;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Module extends BaseModule {
	const EXPERIMENT_NAME = 'editor_v2'; // Kept as `editor_v2` for backward compatibility.

	const PACKAGES = [
		'editor-app-bar',
		'editor-documents',
		'editor-panels',
		'editor-site-navigation',
	];

	const STYLES = [
		'editor-v2-app-bar-overrides',
	];

	public function get_name() {
		return 'editor-app-bar';
	}

	public function __construct() {
		parent::__construct();

		if ( Plugin::$instance->experiments->is_feature_active( self::EXPERIMENT_NAME ) ) {
			add_filter( 'elementor/editor/v2/packages', fn( $packages ) => $this->add_packages( $packages ) );
			add_filter( 'elementor/editor/v2/styles', fn( $styles ) => $this->add_styles( $styles ) );
			add_filter( 'elementor/editor/templates', fn( $templates ) => $this->remove_templates( $templates ) );

			add_action( 'elementor/editor/v2/scripts/enqueue', fn() => $this->dequeue_scripts() );
			add_action( 'elementor/editor/v2/styles/enqueue', fn() => $this->dequeue_styles() );
		}
	}

	public static function get_experimental_data(): array {
		return [
			'name' => self::EXPERIMENT_NAME,
			'title' => esc_html__( 'Editor Top Bar', 'elementor' ),
			'description' => sprintf(
				'%1$s <a href="https://go.elementor.com/wp-dash-elementor-top-bar/" target="_blank">%2$s</a>',
				esc_html__( 'Get a sneak peek of the new Editor powered by React. The beautiful design and experimental layout of the Top bar are just some of the exciting tools on their way.', 'elementor' ),
				esc_html__( 'Learn more', 'elementor' )
			),
			'default' => Experiments_Manager::STATE_ACTIVE,
			'release_status' => Experiments_Manager::RELEASE_STATUS_STABLE,
		];
	}

	private function add_packages( $packages ) {
		return array_merge( $packages, self::PACKAGES );
	}

	private function add_styles( $styles ) {
		return array_merge( $styles, self::STYLES );
	}

	private function remove_templates( $templates ) {
		return array_diff( $templates, [ 'responsive-bar' ] );
	}

	private function dequeue_scripts() {
		wp_dequeue_script( 'elementor-responsive-bar' );
	}

	private function dequeue_styles() {
		wp_dequeue_style( 'elementor-responsive-bar' );
	}
}
