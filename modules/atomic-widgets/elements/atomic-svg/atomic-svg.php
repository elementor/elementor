<?php
namespace Elementor\Modules\AtomicWidgets\Elements\Atomic_Svg;

use Elementor\Core\Utils\Svg\Svg_Sanitizer;
use Elementor\Modules\AtomicWidgets\Controls\Section;
use Elementor\Modules\AtomicWidgets\Controls\Types\Link_Control;
use Elementor\Modules\AtomicWidgets\Controls\Types\Svg_Control;
use Elementor\Modules\AtomicWidgets\Controls\Types\Text_Control;
use Elementor\Modules\AtomicWidgets\Elements\Base\Atomic_Widget_Base;
use Elementor\Modules\AtomicWidgets\Elements\Base\Has_Template;
use Elementor\Modules\AtomicWidgets\PropTypes\Attributes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Classes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Image_Src_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Link_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\AtomicWidgets\Styles\Style_Definition;
use Elementor\Modules\AtomicWidgets\Styles\Style_Variant;
use Elementor\Modules\Components\PropTypes\Overridable_Prop_Type;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Atomic_Svg extends Atomic_Widget_Base {
	use Has_Template;

	const BASE_STYLE_KEY = 'base';
	const DEFAULT_SVG = 'images/default-svg.svg';
	const DEFAULT_SVG_PATH = ELEMENTOR_ASSETS_PATH . self::DEFAULT_SVG;
	const DEFAULT_SVG_URL = ELEMENTOR_ASSETS_URL . self::DEFAULT_SVG;

	public static $widget_description = 'Display an SVG image with customizable styles and link options.';

	public static function get_element_type(): string {
		return 'e-svg';
	}

	public function get_title() {
		return esc_html__( 'SVG', 'elementor' );
	}

	public function get_keywords() {
		return [ 'ato', 'atom', 'atoms', 'atomic' ];
	}

	public function get_icon() {
		return 'eicon-svg';
	}

	protected static function define_props_schema(): array {
		return [
			'classes' => Classes_Prop_Type::make()->default( [] ),
			'svg' => Image_Src_Prop_Type::make()
				->default_url( static::DEFAULT_SVG_URL )
				->meta( 'is_svg', true ),
			'link' => Link_Prop_Type::make(),
			'attributes' => Attributes_Prop_Type::make()->meta( Overridable_Prop_Type::ignore() ),
		];
	}

	protected function define_atomic_controls(): array {
		return [
			Section::make()
				->set_label( esc_html__( 'Content', 'elementor' ) )
				->set_items( [
					Svg_Control::bind_to( 'svg' )
						->set_label( __( 'SVG', 'elementor' ) ),
				] ),
			Section::make()
				->set_label( __( 'Settings', 'elementor' ) )
				->set_id( 'settings' )
				->set_items( $this->get_settings_controls() ),
		];
	}

	protected function get_settings_controls(): array {
		return [
			Link_Control::bind_to( 'link' )
				->set_placeholder( __( 'Type or paste your URL', 'elementor' ) )
				->set_label( __( 'Link', 'elementor' ) ),
			Text_Control::bind_to( '_cssid' )
				->set_label( __( 'ID', 'elementor' ) )
				->set_meta( $this->get_css_id_control_meta() ),
		];
	}

	protected function define_base_styles(): array {
		$display_value = String_Prop_Type::generate( 'inline-block' );

		$size = Size_Prop_Type::generate( [
			'size' => 65,
			'unit' => 'px',
		] );

		return [
			self::BASE_STYLE_KEY => Style_Definition::make()
				->add_variant(
					Style_Variant::make()
						->add_prop( 'display', $display_value )
						->add_prop( 'width', $size )
						->add_prop( 'height', $size )
				),
		];
	}

	protected function build_template_context(): array {
		$context = $this->build_base_template_context();
		$context['svg_html'] = $this->get_processed_svg_html( $context['settings'] );

		return $context;
	}

	protected function get_templates(): array {
		return [
			'elementor/elements/atomic-svg' => __DIR__ . '/atomic-svg.html.twig',
		];
	}

	private function get_processed_svg_html( array $settings ): string {
		$svg = $this->get_svg_content( $settings );

		if ( ! $svg ) {
			return '';
		}

		$svg = new \WP_HTML_Tag_Processor( $svg );

		if ( ! $svg->next_tag( 'svg' ) ) {
			return '';
		}

		$svg->set_attribute( 'fill', 'currentColor' );
		$svg->set_attribute( 'data-interaction-id', $this->get_interaction_id() );

		$this->add_svg_style( $svg, 'width: 100%; height: 100%; overflow: unset;' );

		return ( new Svg_Sanitizer() )->sanitize( $svg->get_updated_html() );
	}

	private function get_svg_content( $settings ) {
		$svg_data = $settings['svg'] ?? null;

		if ( ! $svg_data ) {
			return $this->get_default_svg_content();
		}

		if ( is_string( $svg_data ) ) {
			return $this->fetch_svg_from_url( $svg_data );
		}

		if ( isset( $svg_data['id'] ) ) {
			$content = Utils::file_get_contents(
				get_attached_file( $svg_data['id'] )
			);

			if ( $content ) {
				return $content;
			}
		}

		if ( isset( $svg_data['url'] ) && static::DEFAULT_SVG_URL !== $svg_data['url'] ) {
			return $this->fetch_svg_from_url( $svg_data['url'] );
		}

		return $this->get_default_svg_content();
	}

	private function fetch_svg_from_url( string $url ) {
		if ( empty( $url ) || static::DEFAULT_SVG_URL === $url ) {
			return $this->get_default_svg_content();
		}

		$content = wp_safe_remote_get( $url );

		if ( ! is_wp_error( $content ) ) {
			return $content['body'];
		}

		return $this->get_default_svg_content();
	}

	private function get_default_svg_content() {
		$content = Utils::file_get_contents( static::DEFAULT_SVG_PATH );

		return $content ? $content : null;
	}

	private function add_svg_style( &$svg, $new_style ) {
		$svg_style = $svg->get_attribute( 'style' );
		$svg_style = trim( (string) $svg_style );

		if ( empty( $svg_style ) ) {
			$svg_style = $new_style;
		} else {
			$svg_style = rtrim( $svg_style, ';' ) . '; ' . $new_style;
		}

		$svg->set_attribute( 'style', $svg_style );
	}
}
