<?php

namespace Elementor\Modules\AtomicWidgets;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Elements_Manager;
use Elementor\Modules\AtomicWidgets\DynamicTags\Dynamic_Tags_Module;
use Elementor\Modules\AtomicWidgets\Elements\Div_Block\Div_Block;
use Elementor\Modules\AtomicWidgets\Elements\Flexbox\Flexbox;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Heading\Atomic_Heading;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Image\Atomic_Image;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Paragraph\Atomic_Paragraph;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Button\Atomic_Button;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Svg\Atomic_Svg;
use Elementor\Modules\AtomicWidgets\ImportExport\Atomic_Import_Export;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Array_Transformer;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Combine_Array_Transformer;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Export\Image_Src_Export_Transformer;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Image_Src_Transformer;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Image_Transformer;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Import\Image_Src_Import_Transformer;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Import_Export_Plain_Transformer;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Settings\Link_Transformer;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Plain_Transformer;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Styles\Background_Color_Overlay_Transformer;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Styles\Background_Gradient_Overlay_Transformer;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Styles\Background_Transformer;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Styles\Color_Stop_Transformer;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Styles\Multi_Props_Transformer;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Styles\Shadow_Transformer;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Styles\Size_Transformer;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Styles\Stroke_Transformer;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Styles\Background_Image_Overlay_Transformer;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Styles\Background_Image_Overlay_Size_Scale_Transformer;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Styles\Background_Image_Position_Offset_Transformer;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Styles\Background_Overlay_Transformer;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformers_Registry;
use Elementor\Modules\AtomicWidgets\PropTypes\Background_Color_Overlay_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Background_Gradient_Overlay_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Background_Image_Overlay_Size_Scale_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Background_Image_Overlay_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Background_Image_Position_Offset_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Background_Overlay_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Background_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Box_Shadow_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Border_Radius_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Border_Width_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Color_Stop_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Gradient_Color_Stop_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Layout_Direction_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Link_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Classes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Image_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Image_Src_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Dimensions_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Shadow_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Stroke_Prop_Type;
use Elementor\Modules\AtomicWidgets\Styles\Atomic_Widget_Base_Styles;
use Elementor\Modules\AtomicWidgets\Styles\Atomic_Widget_Styles;
use Elementor\Modules\AtomicWidgets\Styles\Style_Schema;
use Elementor\Plugin;
use Elementor\Widgets_Manager;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Module extends BaseModule {
	const EXPERIMENT_NAME = 'e_atomic_elements';

	const PACKAGES = [
		'editor-canvas',
		'editor-current-user',
		'editor-controls', // TODO: Need to be registered and not enqueued.
		'editor-editing-panel',
		'editor-elements', // TODO: Need to be registered and not enqueued.
		'editor-props', // TODO: Need to be registered and not enqueued.
		'editor-styles', // TODO: Need to be registered and not enqueued.
		'editor-styles-repository',
	];

	public function get_name() {
		return 'atomic-widgets';
	}

	public function __construct() {
		parent::__construct();

		$this->register_feature();

		( new Opt_In() )->init();

		if ( Plugin::$instance->experiments->is_feature_active( self::EXPERIMENT_NAME ) ) {
			Dynamic_Tags_Module::instance()->register_hooks();

			( new Atomic_Widget_Styles() )->register_hooks();
			( new Atomic_Widget_Base_Styles() )->register_hooks();
			( new Atomic_Import_Export() )->register_hooks();

			add_filter( 'elementor/editor/v2/packages', fn( $packages ) => $this->add_packages( $packages ) );
			add_filter( 'elementor/editor/localize_settings', fn( $settings ) => $this->add_styles_schema( $settings ) );
			add_filter( 'elementor/widgets/register', fn( Widgets_Manager $widgets_manager ) => $this->register_widgets( $widgets_manager ) );
			add_filter( 'elementor/usage/elements/element_title', fn( $title, $type ) => $this->get_element_usage_name( $title, $type ), 10, 2 );
			add_action( 'elementor/elements/elements_registered', fn ( $elements_manager ) => $this->register_elements( $elements_manager ) );
			add_action( 'elementor/editor/after_enqueue_scripts', fn() => $this->enqueue_scripts() );

			add_action( 'elementor/atomic-widgets/settings/transformers/register', fn ( $transformers ) => $this->register_settings_transformers( $transformers ) );
			add_action( 'elementor/atomic-widgets/styles/transformers/register', fn ( $transformers ) => $this->register_styles_transformers( $transformers ) );
			add_action( 'elementor/atomic-widgets/import/transformers/register', fn ( $transformers ) => $this->register_import_transformers( $transformers ) );
			add_action( 'elementor/atomic-widgets/export/transformers/register', fn ( $transformers ) => $this->register_export_transformers( $transformers ) );
			add_action( 'elementor/editor/templates/panel/category', fn () => $this->render_panel_category_chip() );
		}
	}

	private function register_feature() {
		Plugin::$instance->experiments->add_feature([
			'name' => self::EXPERIMENT_NAME,
			'title' => esc_html__( 'Atomic Widgets', 'elementor' ),
			'description' => esc_html__( 'Enable atomic widgets.', 'elementor' ),
			'hidden' => true,
			'default' => Experiments_Manager::STATE_INACTIVE,
			'release_status' => Experiments_Manager::RELEASE_STATUS_ALPHA,
		]);
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
		$elements_manager->register_element_type( new Flexbox() );
	}

	private function register_settings_transformers( Transformers_Registry $transformers ) {
		$transformers->register_fallback( new Plain_Transformer() );

		$transformers->register( Classes_Prop_Type::get_key(), new Array_Transformer() );
		$transformers->register( Image_Prop_Type::get_key(), new Image_Transformer() );
		$transformers->register( Image_Src_Prop_Type::get_key(), new Image_Src_Transformer() );
		$transformers->register( Link_Prop_Type::get_key(), new Link_Transformer() );
	}

	private function register_styles_transformers( Transformers_Registry $transformers ) {
		$transformers->register_fallback( new Plain_Transformer() );

		$transformers->register( Size_Prop_Type::get_key(), new Size_Transformer() );
		$transformers->register( Box_Shadow_Prop_Type::get_key(), new Combine_Array_Transformer( ',' ) );
		$transformers->register( Shadow_Prop_Type::get_key(), new Shadow_Transformer() );
		$transformers->register( Stroke_Prop_Type::get_key(), new Stroke_Transformer() );
		$transformers->register( Image_Prop_Type::get_key(), new Image_Transformer() );
		$transformers->register( Image_Src_Prop_Type::get_key(), new Image_Src_Transformer() );
		$transformers->register( Background_Image_Overlay_Prop_Type::get_key(), new Background_Image_Overlay_Transformer() );
		$transformers->register( Background_Image_Overlay_Size_Scale_Prop_Type::get_key(), new Background_Image_Overlay_Size_Scale_Transformer() );
		$transformers->register( Background_Image_Position_Offset_Prop_Type::get_key(), new Background_Image_Position_Offset_Transformer() );
		$transformers->register( Background_Color_Overlay_Prop_Type::get_key(), new Background_Color_Overlay_Transformer() );
		$transformers->register( Background_Overlay_Prop_Type::get_key(), new Background_Overlay_Transformer() );
		$transformers->register( Background_Prop_Type::get_key(), new Background_Transformer() );
		$transformers->register( Background_Gradient_Overlay_Prop_Type::get_key(), new Background_Gradient_Overlay_Transformer() );
		$transformers->register( Color_Stop_Prop_Type::get_key(), new Color_Stop_Transformer() );
		$transformers->register( Gradient_Color_Stop_Prop_Type::get_key(), new Combine_Array_Transformer( ',' ) );
		$transformers->register(
			Border_Radius_Prop_Type::get_key(),
			new Multi_Props_Transformer( [ 'start-start', 'start-end', 'end-start', 'end-end' ], fn( $_, $key ) => "border-{$key}-radius" )
		);
		$transformers->register(
			Border_Width_Prop_Type::get_key(),
			new Multi_Props_Transformer( [ 'block-start', 'block-end', 'inline-start', 'inline-end' ], fn( $_, $key ) => "border-{$key}-width" )
		);
		$transformers->register(
			Layout_Direction_Prop_Type::get_key(),
			new Multi_Props_Transformer( [ 'column', 'row' ], fn( $prop_key, $key ) => "{$key}-{$prop_key}" )
		);
		$transformers->register(
			Dimensions_Prop_Type::get_key(),
			new Multi_Props_Transformer( [ 'block-start', 'block-end', 'inline-start', 'inline-end' ], fn( $prop_key, $key ) => "{$prop_key}-{$key}" )
		);
	}

	public function register_import_transformers( Transformers_Registry $transformers ) {
		$transformers->register_fallback( new Import_Export_Plain_Transformer() );

		$transformers->register( Image_Src_Prop_Type::get_key(), new Image_Src_Import_Transformer() );
	}

	public function register_export_transformers( Transformers_Registry $transformers ) {
		$transformers->register_fallback( new Import_Export_Plain_Transformer() );

		$transformers->register( Image_Src_Prop_Type::get_key(), new Image_Src_Export_Transformer() );
	}

	private function get_element_usage_name( $title, $type ) {
		$element_instance = Plugin::$instance->elements_manager->get_element_types( $type );
		$widget_instance = Plugin::$instance->widgets_manager->get_widget_types( $type );

		if ( Utils::is_atomic( $element_instance ) || Utils::is_atomic( $widget_instance ) ) {
			return $type;
		}

		return $title;
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

	private function render_panel_category_chip() {
		?><# if ( 'v4-elements' === name )  { #>
			<span class="elementor-panel-heading-category-chip">
				<?php echo esc_html__( 'Alpha', 'elementor' ); ?><i class="eicon-info"></i>
				<span class="e-promotion-react-wrapper" data-promotion="v4_chip"></span>
			</span>
		<# } #><?php
	}
}
