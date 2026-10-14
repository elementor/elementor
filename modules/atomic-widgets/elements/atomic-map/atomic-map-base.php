<?php
namespace Elementor\Modules\AtomicWidgets\Elements\Atomic_Map;

use Elementor\Modules\AtomicWidgets\Controls\Section;
use Elementor\Modules\AtomicWidgets\Controls\Types\Number_Control;
use Elementor\Modules\AtomicWidgets\Controls\Types\Text_Control;
use Elementor\Modules\AtomicWidgets\Elements\Base\Atomic_Widget_Base;
use Elementor\Modules\AtomicWidgets\Elements\Base\Has_Template;
use Elementor\Modules\AtomicWidgets\Elements\Base\Html_Tag_Computer;
use Elementor\Modules\AtomicWidgets\PropTypes\Attributes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Classes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Number_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\AtomicWidgets\Styles\Style_Definition;
use Elementor\Modules\AtomicWidgets\Styles\Style_Variant;
use Elementor\Modules\Components\PropTypes\Overridable_Prop_Type;
use Elementor\Plugin;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Provider-agnostic map element. Owns the shared data schema (`location`, `zoom`), controls,
 * base styles, iframe markup and accessibility; the provider only builds the embed URL.
 */
abstract class Atomic_Map_Base extends Atomic_Widget_Base {
	use Has_Template {
		get_shared_templates as private get_default_shared_templates;
	}

	const BASE_TEMPLATE_KEY = 'elementor/elements/atomic-map';

	const DEFAULT_ZOOM = 10;

	abstract public static function get_provider_key(): string;

	public static function has_provider(): bool {
		return null !== Map_Providers_Registry::instance()->get( static::get_provider_key() );
	}

	public static function get_provider(): Map_Provider_Base {
		$provider = Map_Providers_Registry::instance()->get( static::get_provider_key() );

		if ( ! $provider ) {
			throw new \RuntimeException( 'Map provider `' . esc_html( static::get_provider_key() ) . '` is not registered.' );
		}

		return $provider;
	}

	protected function get_css_id_control_meta(): array {
		return [
			'layout' => 'two-columns',
			'topDivider' => false,
		];
	}

	public function get_keywords() {
		return array_values( array_unique( array_merge(
			[ 'ato', 'atom', 'atoms', 'atomic', 'map', 'maps', 'location', 'address', 'embed', 'place' ],
			static::get_provider()->get_keywords()
		) ) );
	}

	public static function get_computed_html_tag( array $settings ): string {
		return Html_Tag_Computer::compute( $settings, 'iframe' );
	}

	protected static function define_props_schema(): array {
		return array_merge(
			[
				'classes' => Classes_Prop_Type::make()
					->default( [] ),

				'location' => String_Prop_Type::make()
					->default( __( 'London Eye, London, United Kingdom', 'elementor' ) )
					->description( 'The location to display (address or coordinates).' )
					->alias( 'address' ),

				'zoom' => Number_Prop_Type::make()
					->default( self::DEFAULT_ZOOM )
					->description( 'Map zoom level from 0 (world) to 21 (building).' ),
			],
			static::get_provider()->define_props_schema(),
			[
				'attributes' => Attributes_Prop_Type::make()->meta( Overridable_Prop_Type::ignore() ),
			]
		);
	}

	protected function define_atomic_controls(): array {
		return [
			Section::make()
				->set_label( __( 'Content', 'elementor' ) )
				->set_id( 'content' )
				->set_items( array_merge(
					[
						Text_Control::bind_to( 'location' )
							->set_label( esc_html__( 'Location', 'elementor' ) )
							->set_placeholder( esc_html__( 'Type an address or coordinates', 'elementor' ) ),

						Number_Control::bind_to( 'zoom' )
							->set_label( esc_html__( 'Zoom', 'elementor' ) ),
					],
					static::get_provider()->define_controls()
				) ),
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
		return [
			'base' => Style_Definition::make()
				->add_variant(
					Style_Variant::make()
						->add_prop( 'width', Size_Prop_Type::generate( [
							'size' => 100,
							'unit' => '%',
						] ) )
						->add_prop( 'display', String_Prop_Type::generate( 'block' ) )
						->add_prop( 'border-style', String_Prop_Type::generate( 'none' ) )
				),
		];
	}

	protected function get_shared_templates(): array {
		return array_merge( $this->get_default_shared_templates(), [
			self::BASE_TEMPLATE_KEY => __DIR__ . '/atomic-map.html.twig',
		] );
	}

	protected function get_templates(): array {
		return static::get_provider()->get_templates();
	}

	protected function get_template_extra_context(): array {
		return [
			'provider' => array_merge(
				static::get_provider()->get_template_context(),
				[ 'key' => static::get_provider_key() ]
			),
			// An empty element renders nothing on the frontend, but must stay selectable on the editor canvas.
			'render_editor_placeholder' => Plugin::$instance->editor->is_edit_mode(),
		];
	}

	public function render_markdown(): string {
		$settings = $this->get_atomic_settings();
		$location = Utils::html_to_plain_text( (string) ( $settings['location'] ?? '' ) );

		if ( '' === $location ) {
			return '';
		}

		$label = strtr( $location, [
			'\\' => '\\\\',
			'[' => '\\[',
			']' => '\\]',
		] );

		return '[Map: ' . $label . '](' . esc_url( static::get_provider()->get_external_url( $location ) ) . ')';
	}
}
