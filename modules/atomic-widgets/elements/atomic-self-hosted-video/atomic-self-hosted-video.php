<?php

namespace Elementor\Modules\AtomicWidgets\Elements\Atomic_Self_Hosted_Video;

use Elementor\Modules\AtomicWidgets\Controls\Section;
use Elementor\Modules\AtomicWidgets\Controls\Types\Image_Control;
use Elementor\Modules\AtomicWidgets\Controls\Types\Number_Control;
use Elementor\Modules\AtomicWidgets\Controls\Types\Select_Control;
use Elementor\Modules\AtomicWidgets\Controls\Types\Switch_Control;
use Elementor\Modules\AtomicWidgets\Controls\Types\Text_Control;
use Elementor\Modules\AtomicWidgets\Controls\Types\Video_Control;
use Elementor\Modules\AtomicWidgets\Elements\Base\Atomic_Widget_Base;
use Elementor\Modules\AtomicWidgets\Elements\Base\Has_Template;
use Elementor\Modules\AtomicWidgets\PropDependencies\Manager as Dependency_Manager;
use Elementor\Modules\AtomicWidgets\PropTypes\Attributes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Classes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Image_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Boolean_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Number_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Video_Src_Prop_Type;
use Elementor\Modules\AtomicWidgets\Styles\Style_Definition;
use Elementor\Modules\AtomicWidgets\Styles\Style_Variant;
use Elementor\Modules\AtomicWidgets\Utils\Image\Placeholder_Image;
use Elementor\Modules\Components\PropTypes\Overridable_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Atomic_Self_Hosted_Video extends Atomic_Widget_Base {
	use Has_Template;

	const ASPECT_RATIOS = [
		'auto' => 'Auto',
		'16/9' => '16:9',
		'4/3' => '4:3',
		'21/9' => '21:9',
		'1/1' => '1:1',
		'9/16' => '9:16',
		'3/2' => '3:2',
	];

	const PRELOAD_OPTIONS = [
		'auto' => 'Auto',
		'metadata' => 'Metadata',
		'none' => 'None (Lazy Load)',
	];

	protected function get_css_id_control_meta(): array {
		return [
			'layout' => 'two-columns',
			'topDivider' => false,
		];
	}

	public static function get_element_type(): string {
		return 'e-self-hosted-video';
	}

	public function get_title() {
		return esc_html__( 'Video', 'elementor' );
	}

	public function get_keywords() {
		return [ 'ato', 'atom', 'atoms', 'atomic', 'video', 'player', 'media', 'hosted' ];
	}

	public function get_icon() {
		return 'eicon-video';
	}

	protected static function define_props_schema(): array {
		$playsinline_dependencies = Dependency_Manager::make()
			->where( [
				'operator' => 'eq',
				'path' => [ 'autoplay' ],
				'value' => true,
			] )
			->get();

		$poster_dependencies = Dependency_Manager::make()
			->where( [
				'operator' => 'eq',
				'path' => [ 'poster_enabled' ],
				'value' => true,
			] )
			->get();

		$allow_download_dependencies = Dependency_Manager::make()
			->where( [
				'operator' => 'eq',
				'path' => [ 'controls' ],
				'value' => true,
			])
			->get();

		return [
			'classes' => Classes_Prop_Type::make()
				->default( [] ),

			'source' => Video_Src_Prop_Type::make(),

			'aspect_ratio' => String_Prop_Type::make()
				->default( '16/9' )
				->enum( array_keys( self::ASPECT_RATIOS ) ),

			'autoplay' => Boolean_Prop_Type::make()->default( false ),
			'playsinline' => Boolean_Prop_Type::make()
				->default( false )
				->set_dependencies( $playsinline_dependencies ),
			'mute' => Boolean_Prop_Type::make()->default( false ),
			'loop' => Boolean_Prop_Type::make()->default( false ),
			'controls' => Boolean_Prop_Type::make()->default( true ),
			'preload' => String_Prop_Type::make()
				->default( 'metadata' )
				->enum( array_keys( self::PRELOAD_OPTIONS ) ),
			'download' => Boolean_Prop_Type::make()->default( true )
				->set_dependencies( $allow_download_dependencies ),

			'start_time' => Number_Prop_Type::make()->default( null ),
			'end_time' => Number_Prop_Type::make()->default( null ),

			'poster_enabled' => Boolean_Prop_Type::make()->default( false ),
			'poster' => Image_Prop_Type::make()
				->default_size( 'medium_large' )
				->default_url( Placeholder_Image::get_placeholder_image() )
				->set_dependencies( $poster_dependencies ),

			'attributes' => Attributes_Prop_Type::make()->meta( Overridable_Prop_Type::ignore() ),
		];
	}

	protected function define_atomic_controls(): array {
		return [
			Section::make()
				->set_label( __( 'Content', 'elementor' ) )
				->set_items( [
					Video_Control::bind_to( 'source' )
						->set_label( esc_html__( 'Video', 'elementor' ) ),
				] ),
			Section::make()
				->set_label( __( 'Playback', 'elementor' ) )
				->set_items( [
					Switch_Control::bind_to( 'autoplay' )->set_label( esc_html__( 'Autoplay', 'elementor' ) ),
					Switch_Control::bind_to( 'playsinline' )
						->set_label( esc_html__( 'Play Inline (Mobile)', 'elementor' ) )
						->set_meta( [ 'hideWhenDisabled' => true ] ),
					Switch_Control::bind_to( 'mute' )->set_label( esc_html__( 'Mute', 'elementor' ) ),
					Switch_Control::bind_to( 'loop' )->set_label( esc_html__( 'Loop', 'elementor' ) ),
					Switch_Control::bind_to( 'controls' )->set_label( esc_html__( 'Player Controls', 'elementor' ) ),
					Switch_Control::bind_to( 'download' )->set_label( esc_html__( 'Allow Download', 'elementor' ) )
						->set_meta( [ 'hideWhenDisabled' => true ] ),
					Select_Control::bind_to( 'preload' )
						->set_label( esc_html__( 'Preload', 'elementor' ) )
						->set_options( self::format_options( self::PRELOAD_OPTIONS ) ),
					Number_Control::bind_to( 'start_time' )
						->set_label( esc_html__( 'Start Time (seconds)', 'elementor' ) )
						->set_meta( [
							'topDivider' => true,
							'layout' => 'two-columns',
						] ),

					Number_Control::bind_to( 'end_time' )
						->set_label( esc_html__( 'End Time (seconds)', 'elementor' ) ),
				] ),
			Section::make()
				->set_label( __( 'Display', 'elementor' ) )
				->set_items( [
					Select_Control::bind_to( 'aspect_ratio' )
						->set_label( esc_html__( 'Aspect Ratio', 'elementor' ) )
						->set_options( self::format_options( self::ASPECT_RATIOS ) ),
					Switch_Control::bind_to( 'poster_enabled' )
						->set_label( esc_html__( 'Poster Image', 'elementor' ) )
						->set_meta( [ 'hideWhenDisabled' => true ] )
						->set_meta( [ 'topDivider' => true ] ),
					Image_Control::bind_to( 'poster' )
						->set_label( esc_html__( 'Image', 'elementor' ) ),
				] ),
			Section::make()
				->set_label( __( 'Settings', 'elementor' ) )
				->set_id( 'settings' )
				->set_items( $this->get_settings_controls() ),
		];
	}

	protected function get_settings_controls(): array {
		return [
			Text_Control::bind_to( '_cssid' )
				->set_label( __( 'ID', 'elementor' ) )
				->set_meta( $this->get_css_id_control_meta() ),
		];
	}

	protected function define_base_styles(): array {
		$max_width = Size_Prop_Type::generate( [
			'unit' => 'vw',
			'size' => 100,
		] );
		$width = Size_Prop_Type::generate( [
			'unit' => '%',
			'size' => 100,
		]);
		return [
			'base' => Style_Definition::make()
				->add_variant(
					Style_Variant::make()
						->add_prop( 'max-width', $max_width )
						->add_prop( 'width', $width )
						->add_prop( 'display', String_Prop_Type::generate( 'inline-block' ) )
				),
		];
	}

	protected function get_templates(): array {
		return [
			'elementor/elements/atomic-self-hosted-video' => __DIR__ . '/atomic-self-hosted-video.html.twig',
		];
	}

	private static function format_options( array $options ): array {
		return array_map(
			fn( $value, $key ) => [
				'value' => $key,
				'label' => $value,
			],
			$options,
			array_keys( $options )
		);
	}
}
