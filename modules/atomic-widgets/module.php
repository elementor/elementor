<?php

namespace Elementor\Modules\AtomicWidgets;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Elements_Manager;
use Elementor\Modules\AtomicWidgets\DynamicTags\Dynamic_Tags_Module;
use Elementor\Modules\AtomicWidgets\Elements\Div_Block\Div_Block;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Heading\Atomic_Heading;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Image\Atomic_Image;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Paragraph\Atomic_Paragraph;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Button\Atomic_Button;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Svg\Atomic_Svg;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Array_Transformer;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Combine_Array_Transformer;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Settings\Image_Src_Transformer;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Settings\Image_Transformer;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Settings\Link_Transformer;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Primitive_Transformer;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Styles\Background_Color_Overlay_Transformer;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Styles\Background_Transformer;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Styles\Edge_Sizes_Transformer;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Styles\Corner_Sizes_Transformer;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Styles\Dimensions_Transformer;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Styles\Layout_Direction_Transformer;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Styles\Shadow_Transformer;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Styles\Size_Transformer;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Styles\Stroke_Transformer;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Styles\Background_Image_Overlay_Transformer;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Styles\Background_Image_Overlay_Size_Scale_Transformer;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Styles\Background_Image_Position_Offset_Transformer;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformers_Registry;
use Elementor\Modules\AtomicWidgets\PropTypes\Background_Color_Overlay_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Background_Image_Overlay_Size_Scale_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Background_Image_Overlay_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Background_Image_Position_Offset_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Background_Overlay_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Background_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Box_Shadow_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Border_Radius_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Border_Width_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Layout_Direction_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Link_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Boolean_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Classes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Color_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Image_Attachment_Id_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Image_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Image_Src_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Dimensions_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Number_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Shadow_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Stroke_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Url_Prop_Type;
use Elementor\Modules\AtomicWidgets\Styles\Atomic_Widget_Base_Styles;
use Elementor\Modules\AtomicWidgets\Styles\Atomic_Widget_Styles;
use Elementor\Modules\AtomicWidgets\Styles\Style_Schema;
use Elementor\Plugin;
use Elementor\Widgets_Manager;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Module extends BaseModule {
	const EXPERIMENT_NAME = 'atomic_widgets';

	const PACKAGES = [
		'editor-canvas',
		'editor-controls', // TODO: Need to be registered and not enqueued.
		'editor-editing-panel',
		'editor-elements', // TODO: Need to be registered and not enqueued.
		'editor-panels',
		'editor-props', // TODO: Need to be registered and not enqueued.
		'editor-styles', // TODO: Need to be registered and not enqueued.
		'editor-styles-repository',
	];

	public function get_name() {
		return 'atomic-widgets';
	}

	public function __construct() {
		parent::__construct();

		if ( Plugin::$instance->experiments->is_feature_active( self::EXPERIMENT_NAME ) ) {
			Dynamic_Tags_Module::instance()->register_hooks();

			( new Atomic_Widget_Styles() )->register_hooks();
			( new Atomic_Widget_Base_Styles() )->register_hooks();

			add_filter( 'elementor/editor/v2/packages', fn( $packages ) => $this->add_packages( $packages ) );
			add_filter( 'elementor/editor/localize_settings', fn( $settings ) => $this->add_styles_schema( $settings ) );
			add_filter( 'elementor/widgets/register', fn( Widgets_Manager $widgets_manager ) => $this->register_widgets( $widgets_manager ) );
			add_action( 'elementor/atomic-widgets/settings/transformers/register', fn ( $transformers ) => $this->register_settings_transformers( $transformers ) );
			add_action( 'elementor/atomic-widgets/styles/transformers/register', fn ( $transformers ) => $this->register_styles_transformers( $transformers ) );
			add_action( 'elementor/elements/elements_registered', fn ( $elements_manager ) => $this->register_elements( $elements_manager ) );
			add_action( 'elementor/editor/after_enqueue_scripts', fn() => $this->enqueue_scripts() );
			add_action( 'elementor/frontend/after_register_styles', fn() => $this->register_styles() );
		}
	}

	public static function get_experimental_data(): array {
		return [
			'name' => self::EXPERIMENT_NAME,
			'title' => esc_html__( 'Atomic Widgets', 'elementor' ),
			'description' => esc_html__( 'Enable atomic widgets.', 'elementor' ),
			'hidden' => true,
			'default' => Experiments_Manager::STATE_INACTIVE,
			'release_status' => Experiments_Manager::RELEASE_STATUS_ALPHA,
		];
	}

	private function add_packages( $packages ) {
		return array_merge( $packages, self::PACKAGES );
	}

	private function add_styles_schema( $settings ) {
		if ( ! isset( $settings['atomic'] ) ) {
			$settings['atomic'] = [];
		}

		$settings['atomic']['styles_schema'] = Style_Schema::get();

		return $settings;
	}

	private function register_widgets( Widgets_Manager $widgets_manager ) {
		$widgets_manager->register( new Atomic_Heading() );
		$widgets_manager->register( new Atomic_Image() );
		$widgets_manager->register( new Atomic_Paragraph() );
		$widgets_manager->register( new Atomic_Svg() );
		$widgets_manager->register( new Atomic_Button() );
	}

	private function register_elements( Elements_Manager $elements_manager ) {
		$elements_manager->register_element_type( new Div_Block() );
	}

	private function register_settings_transformers( Transformers_Registry $transformers ) {
		// Primitives
		$transformers->register( Boolean_Prop_Type::get_key(), new Primitive_Transformer() );
		$transformers->register( Number_Prop_Type::get_key(), new Primitive_Transformer() );
		$transformers->register( String_Prop_Type::get_key(), new Primitive_Transformer() );

		// Other
		$transformers->register( Classes_Prop_Type::get_key(), new Array_Transformer() );
		$transformers->register( Image_Prop_Type::get_key(), new Image_Transformer() );
		$transformers->register( Image_Src_Prop_Type::get_key(), new Image_Src_Transformer() );
		$transformers->register( Image_Attachment_Id_Prop_Type::get_key(), new Primitive_Transformer() );
		$transformers->register( Url_Prop_Type::get_key(), new Primitive_Transformer() );
		$transformers->register( Link_Prop_Type::get_key(), new Link_Transformer() );
	}

	private function register_styles_transformers( Transformers_Registry $transformers ) {
		// Primitives
		$transformers->register( Boolean_Prop_Type::get_key(), new Primitive_Transformer() );
		$transformers->register( Number_Prop_Type::get_key(), new Primitive_Transformer() );
		$transformers->register( String_Prop_Type::get_key(), new Primitive_Transformer() );

		// Other
		$transformers->register( Dimensions_Prop_Type::get_key(), new Dimensions_Transformer() );
		$transformers->register( Size_Prop_Type::get_key(), new Size_Transformer() );
		$transformers->register( Color_Prop_Type::get_key(), new Primitive_Transformer() );
		$transformers->register( Box_Shadow_Prop_Type::get_key(), new Combine_Array_Transformer( ',' ) );
		$transformers->register( Shadow_Prop_Type::get_key(), new Shadow_Transformer() );
		$transformers->register( Border_Radius_Prop_Type::get_key(), new Corner_Sizes_Transformer( fn( $corner ) => 'border-' . $corner . '-radius' ) );
		$transformers->register( Border_Width_Prop_Type::get_key(), new Edge_Sizes_Transformer( fn( $edge ) => 'border-' . $edge . '-width' ) );
		$transformers->register( Stroke_Prop_Type::get_key(), new Stroke_Transformer() );
		$transformers->register( Layout_Direction_Prop_Type::get_key(), new Layout_Direction_Transformer() );

		$transformers->register( Image_Prop_Type::get_key(), new Image_Transformer() );
		$transformers->register( Image_Src_Prop_Type::get_key(), new Image_Src_Transformer() );
		$transformers->register( Image_Attachment_Id_Prop_Type::get_key(), new Primitive_Transformer() );
		$transformers->register( Url_Prop_Type::get_key(), new Primitive_Transformer() );
		$transformers->register( Background_Image_Overlay_Prop_Type::get_key(), new Background_Image_Overlay_Transformer() );
		$transformers->register( Background_Image_Overlay_Size_Scale_Prop_Type::get_key(), new Background_Image_Overlay_Size_Scale_Transformer() );
		$transformers->register( Background_Image_Position_Offset_Prop_Type::get_key(), new Background_Image_Position_Offset_Transformer() );
		$transformers->register( Background_Color_Overlay_Prop_Type::get_key(), new Background_Color_Overlay_Transformer() );
		$transformers->register( Background_Overlay_Prop_Type::get_key(), new Combine_Array_Transformer( ',' ) );
		$transformers->register( Background_Prop_Type::get_key(), new Background_Transformer() );
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

	public function register_styles() {
		wp_register_style(
			'div-block',
			$this->get_css_assets_url( 'div-block', 'assets/css/' ),
			[ 'elementor-frontend' ],
			ELEMENTOR_VERSION
		);
	}
}
