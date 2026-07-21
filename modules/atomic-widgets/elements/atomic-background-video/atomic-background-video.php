<?php

namespace Elementor\Modules\AtomicWidgets\Elements\Atomic_Background_Video;

use Elementor\Modules\AtomicWidgets\ChildrenDependencies\Child_Dependency;
use Elementor\Modules\AtomicWidgets\Controls\Section;
use Elementor\Modules\AtomicWidgets\Controls\Types\Number_Control;
use Elementor\Modules\AtomicWidgets\Controls\Types\Switch_Control;
use Elementor\Modules\AtomicWidgets\Controls\Types\Text_Control;
use Elementor\Modules\AtomicWidgets\Controls\Types\Toggle_Control;
use Elementor\Modules\AtomicWidgets\Controls\Types\Video_Control;
use Elementor\Modules\AtomicWidgets\DynamicTags\Dynamic_Prop_Type;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Background_Video\Atomic_Background_Video_Content\Atomic_Background_Video_Content;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Background_Video\Atomic_Background_Video_Controls\Atomic_Background_Video_Controls;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Background_Video\Atomic_Background_Video_Pause\Atomic_Background_Video_Pause;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Background_Video\Atomic_Background_Video_Play\Atomic_Background_Video_Play;
use Elementor\Modules\AtomicWidgets\Elements\Base\Atomic_Element_Base;
use Elementor\Modules\AtomicWidgets\Elements\Base\Element_Builder;
use Elementor\Modules\AtomicWidgets\Elements\Base\Has_Element_Template;
use Elementor\Modules\AtomicWidgets\Elements\Loader\Frontend_Assets_Loader;
use Elementor\Modules\AtomicWidgets\PropDependencies\Manager as Dependency_Manager;
use Elementor\Modules\AtomicWidgets\PropTypes\Attributes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Classes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Boolean_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Number_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Video_Src_Prop_Type;
use Elementor\Modules\AtomicWidgets\Styles\Style_Definition;
use Elementor\Modules\AtomicWidgets\Styles\Style_Variant;
use Elementor\Modules\AtomicWidgets\Utils\Element_Position;
use Elementor\Modules\Components\PropTypes\Overridable_Prop_Type;
use Elementor\Plugin;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Atomic_Background_Video extends Atomic_Element_Base {
	use Has_Element_Template;

	const BASE_STYLE_KEY = 'base';
	const ELEMENT_TYPE_CONTENT = 'e-background-video-content';
	const ELEMENT_TYPE_CONTROLS = 'e-background-video-controls';
	const ELEMENT_TYPE_PLAY = 'e-background-video-play';
	const ELEMENT_TYPE_PAUSE = 'e-background-video-pause';

	public static $widget_description = 'Create a section with a looping video background and content layered on top. Structure: e-background-video contains e-background-video-content (for any widgets) and e-background-video-controls (with e-background-video-play and e-background-video-pause buttons).';

	public function __construct( $data = [], $args = null ) {
		parent::__construct( $data, $args );
		$this->meta( 'is_container', true );
	}

	public static function get_type() {
		return 'e-background-video';
	}

	public static function get_element_type(): string {
		return 'e-background-video';
	}

	public function get_title() {
		return esc_html__( 'Background Video', 'elementor' );
	}

	public function get_keywords() {
		return [ 'ato', 'atom', 'atoms', 'atomic', 'video', 'background', 'media' ];
	}

	public function get_icon() {
		return 'eicon-video';
	}

	protected static function define_props_schema(): array {
		return [
			'classes' => Classes_Prop_Type::make()->default( [] ),
			'source' => Video_Src_Prop_Type::make()->alias( 'video', 'src' ),
			'start_time' => Number_Prop_Type::make()
				->default( null )
				->meta( Dynamic_Prop_Type::ignore() )
				->meta( 'suffix', 'SEC' ),
			'end_time' => Number_Prop_Type::make()
				->default( null )
				->meta( 'suffix', 'SEC' )
				->meta( Dynamic_Prop_Type::ignore() ),
			'autoplay' => Boolean_Prop_Type::make()->default( true ),
			'mute' => Boolean_Prop_Type::make()->default( true ),
			'loop' => Boolean_Prop_Type::make()->default( true ),
			'show_controls' => Boolean_Prop_Type::make()->default( true ),
			'state' => String_Prop_Type::make()
				->default( null )
				->enum( [ 'playing', 'paused' ] )
				->meta( Overridable_Prop_Type::ignore() ),
			'attributes' => Attributes_Prop_Type::make()->meta( Overridable_Prop_Type::ignore() ),
		];
	}

	protected function define_atomic_controls(): array {
		return [
			Section::make()
				->set_label( __( 'Content', 'elementor' ) )
				->set_id( 'content' )
				->set_items( [
					Video_Control::bind_to( 'source' )
						->set_label( esc_html__( 'Video', 'elementor' ) ),
					Number_Control::bind_to( 'start_time' )
						->set_label( esc_html__( 'Start Time', 'elementor' ) )
						->set_min( 0 )
						->set_max( 10000 ),
					Number_Control::bind_to( 'end_time' )
						->set_label( esc_html__( 'End Time', 'elementor' ) )
						->set_min( 0 )
						->set_max( 10000 ),
					Switch_Control::bind_to( 'autoplay' )
						->set_label( esc_html__( 'Autoplay', 'elementor' ) ),
					Switch_Control::bind_to( 'mute' )
						->set_label( esc_html__( 'Mute', 'elementor' ) ),
					Switch_Control::bind_to( 'loop' )
						->set_label( esc_html__( 'Loop', 'elementor' ) ),
					Switch_Control::bind_to( 'show_controls' )
						->set_label( esc_html__( 'Show Controls', 'elementor' ) ),
					Toggle_Control::bind_to( 'state' )
						->set_label( esc_html__( 'States', 'elementor' ) )
						->add_options( [
							'playing' => [ 'title' => esc_html__( 'Play', 'elementor' ) ],
							'paused' => [ 'title' => esc_html__( 'Pause', 'elementor' ) ],
						] )
						->set_exclusive( true )
						->set_convert_options( true )
						->set_size( 'tiny' )
						->set_full_width( true )
						->set_meta( [ 'topDivider' => true ] ),
				] ),
			Section::make()
				->set_label( __( 'Settings', 'elementor' ) )
				->set_id( 'settings' )
				->set_items( [
					Text_Control::bind_to( '_cssid' )
						->set_label( __( 'ID', 'elementor' ) )
						->set_meta( [
							'layout' => 'two-columns',
						] ),
				] ),
		];
	}

	protected function define_base_styles(): array {
		return [
			static::BASE_STYLE_KEY => Style_Definition::make()
				->add_variant(
					Style_Variant::make()
						->add_props( [
							'display' => String_Prop_Type::generate( 'flex' ),
							'flex-direction' => String_Prop_Type::generate( 'column' ),
							'position' => String_Prop_Type::generate( 'relative' ),
							'overflow' => String_Prop_Type::generate( 'hidden' ),
							'min-height' => Size_Prop_Type::generate( [
								'size' => 400,
								'unit' => 'px',
							] ),
							'width' => Size_Prop_Type::generate( [
								'size' => 100,
								'unit' => '%',
							] ),
						] )
				),
		];
	}

	protected function define_default_children() {
		return [
			Atomic_Background_Video_Content::generate()
				->editor_settings( [
					'title' => esc_html__( 'Content Area', 'elementor' ),
				] )
				->build(),
		];
	}

	protected function define_children_dependencies(): array {
		return [
			Child_Dependency::for( self::ELEMENT_TYPE_CONTROLS )
				->when(
					Dependency_Manager::make()->where( [
						'operator' => 'ne',
						'path' => [ 'show_controls' ],
						'value' => false,
					] )
				)
				->position( Element_Position::last() )
				->stash( true )
				->default_model(
					Element_Builder::make( self::ELEMENT_TYPE_CONTROLS )
						->is_locked( true )
						->hydrate_default_children( true )
						->children( [
							Element_Builder::make( self::ELEMENT_TYPE_PLAY )
								->hydrate_default_children( true )
								->build(),
							Element_Builder::make( self::ELEMENT_TYPE_PAUSE )
								->hydrate_default_children( true )
								->build(),
						] )
						->build()
				),
		];
	}

	protected function define_allowed_child_types() {
		return [
			self::ELEMENT_TYPE_CONTENT,
			self::ELEMENT_TYPE_CONTROLS,
		];
	}

	public function get_script_depends() {
		$global_depends = parent::get_script_depends();

		if ( Plugin::$instance->preview->is_preview_mode() ) {
			return array_merge( $global_depends, [ 'elementor-background-video-handler', 'elementor-background-video-preview-handler' ] );
		}

		return array_merge( $global_depends, [ 'elementor-background-video-handler' ] );
	}

	public function register_frontend_handlers() {
		$assets_url = ELEMENTOR_ASSETS_URL;
		$min_suffix = ( Utils::is_script_debug() || Utils::is_elementor_tests() ) ? '' : '.min';

		wp_register_script(
			'elementor-background-video-handler',
			"{$assets_url}js/background-video-handler{$min_suffix}.js",
			[ Frontend_Assets_Loader::FRONTEND_HANDLERS_HANDLE, Frontend_Assets_Loader::ALPINEJS_HANDLE ],
			ELEMENTOR_VERSION,
			true
		);

		wp_register_script(
			'elementor-background-video-preview-handler',
			"{$assets_url}js/background-video-preview-handler{$min_suffix}.js",
			[ Frontend_Assets_Loader::FRONTEND_HANDLERS_HANDLE, Frontend_Assets_Loader::ALPINEJS_HANDLE ],
			ELEMENTOR_VERSION,
			true
		);
	}

	protected function build_template_context(): array {
		$settings = $this->get_atomic_settings();
		$video_start_time = $settings['start_time'] ?? null;
		$video_end_time = $settings['end_time'] ?? null;
		$video_timings = '#t=0';

		if ( ! empty( $video_start_time ) ) {
			$video_timings = '#t=' . $video_start_time;
		}

		if ( ! empty( $video_end_time ) && $video_end_time > ( $video_start_time ?? 0 ) ) {
			$video_timings .= ',' . $video_end_time;
		}

		$e_settings = [
			'autoplay' => $settings['autoplay'] ?? true,
			'mute' => $settings['mute'] ?? true,
			'loop' => $settings['loop'] ?? true,
			'state' => $settings['state'] ?? 'playing',
			'start_time' => $video_start_time,
			'end_time' => $video_end_time,
		];

		return array_merge( $this->build_base_template_context(), [
			'video_timings' => $video_timings,
			'e_settings' => $e_settings,
		] );
	}

	protected function get_templates(): array {
		return [
			'elementor/elements/atomic-background-video' => __DIR__ . '/atomic-background-video.html.twig',
		];
	}
}
