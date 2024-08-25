<?php

namespace Elementor\Modules\AtomicWidgets;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Modules\AtomicWidgets\PropTypes\Boolean_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Classes_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Image_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Number_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Prop_Types_Registry;
use Elementor\Modules\AtomicWidgets\PropTypes\String_Type;
use Elementor\Modules\AtomicWidgets\Widgets\Atomic_Heading;
use Elementor\Modules\AtomicWidgets\Widgets\Atomic_Image;
use Elementor\Plugin;
use Elementor\Widgets_Manager;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Module extends BaseModule {
	const EXPERIMENT_NAME = 'atomic_widgets';

	const PACKAGES = [
		'editor-documents', // TODO: NEED to be removed once the editor will not be dependent on the documents package.
		'editor-panels',
		'editor-editing-panel',
		'editor-style',
	];

	public Prop_Types_Registry $prop_types;

	public function get_name() {
		return 'atomic-widgets';
	}

	public function __construct() {
		parent::__construct();

		$this->prop_types = new Prop_Types_Registry();

		$this->register_experiment();

		if ( Plugin::$instance->experiments->is_feature_active( self::EXPERIMENT_NAME ) ) {
			$this->register_prop_types();

			( new Compatibility() )->register_hooks();

			add_filter( 'elementor/editor/v2/packages', fn( $packages ) => $this->add_packages( $packages ) );
			add_filter( 'elementor/widgets/register', fn( Widgets_Manager $widgets_manager ) => $this->register_widgets( $widgets_manager ) );
			add_filter( 'elementor/editor/localize_settings', fn( array $settings ) => $this->add_prop_types_config( $settings ) );
			add_action( 'elementor/editor/after_enqueue_scripts', fn() => $this->enqueue_scripts() );
		}
	}

	private function register_experiment() {
		Plugin::$instance->experiments->add_feature( [
			'name' => self::EXPERIMENT_NAME,
			'title' => esc_html__( 'Atomic Widgets', 'elementor' ),
			'description' => esc_html__( 'Enable atomic widgets.', 'elementor' ),
			'hidden' => true,
			'default' => Experiments_Manager::STATE_INACTIVE,
			'release_status' => Experiments_Manager::RELEASE_STATUS_ALPHA,
		] );
	}

	private function add_packages( $packages ) {
		return array_merge( $packages, self::PACKAGES );
	}

	private function register_widgets( Widgets_Manager $widgets_manager ) {
		$widgets_manager->register( new Atomic_Heading() );
		$widgets_manager->register( new Atomic_Image() );
	}

	private function register_prop_types() {
		// Primitive types.
		$this->prop_types->register( new String_Type() );
		$this->prop_types->register( new Number_Type() );
		$this->prop_types->register( new Boolean_Type() );

		// Transformable types.
		$this->prop_types->register( new Image_Type() );
		$this->prop_types->register( new Classes_Type() );

		do_action(
			'elementor/atomic-widgets/prop-types/register',
			$this->prop_types
		);
	}

	private function add_prop_types_config( array $settings ): array {
		$settings['atomicPropTypes'] = $this->prop_types->get_all();

		return $settings;
	}

	/**
	 * Enqueue the module scripts.
	 *
	 * @return void
	 */
	private function enqueue_scripts() {
		wp_enqueue_script(
			'elementor-atomic-widgets-editor',
			$this->get_js_assets_url( 'atomic-widgets-editor' ),
			[ 'elementor-editor' ],
			ELEMENTOR_VERSION,
			true
		);
	}
}
