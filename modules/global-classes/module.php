<?php

namespace Elementor\Modules\GlobalClasses;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Modules\AtomicWidgets\Module as Atomic_Widgets_Module;
use Elementor\Modules\GlobalClasses\ImportExport\Import_Export;
use Elementor\Modules\GlobalClasses\Usage\Global_Classes_Usage;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Module extends BaseModule {
	const NAME = 'e_classes';

	// TODO: Add global classes package
	const PACKAGES = [
		'editor-global-classes',
	];

	public function get_name() {
		return 'global-classes';
	}

	public function __construct() {
		parent::__construct();

		$is_feature_active = Plugin::$instance->experiments->is_feature_active( self::NAME );
		$is_atomic_widgets_active = Plugin::$instance->experiments->is_feature_active( Atomic_Widgets_Module::EXPERIMENT_NAME );

		// TODO: When the `e_atomic_elements` feature is not hidden, add it as a dependency
		if ( $is_feature_active && $is_atomic_widgets_active ) {
			add_filter( 'elementor/editor/v2/packages', fn( $packages ) => $this->add_packages( $packages ) );

			( new Global_Classes_Usage() )->register_hooks();
			( new Global_Classes_REST_API() )->register_hooks();
			( new Global_Classes_CSS() )->register_hooks();
			( new Global_Classes_Cleanup() )->register_hooks();
			( new Import_Export() )->register_hooks();
		}
	}

	public static function get_experimental_data(): array {
		return [
			'name' => self::NAME,
			'title' => esc_html__( 'Global Classes', 'elementor' ),
			'description' => esc_html__( 'Enable global CSS classes.', 'elementor' ),
			'hidden' => true,
			'default' => Experiments_Manager::STATE_INACTIVE,
			'release_status' => Experiments_Manager::RELEASE_STATUS_ALPHA,
		];
	}

	private function add_packages( $packages ) {
		if ( ! current_user_can( 'manage_options' ) ) {
			return $packages;
		}

		return array_merge( $packages, self::PACKAGES );
	}
}
