<?php

namespace Elementor\Core\Elements\Concerns;

use Elementor\Core\Elements\Atomic_Element;
use Elementor\Modules\AtomicWidgets\Parsers\Props_Parser;
use Elementor\Modules\AtomicWidgets\PropsResolver\Render_Props_Resolver;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;
use Elementor\Modules\AtomicWidgets\TemplateRenderer\Template_Renderer;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * @mixin Atomic_Element
 */
trait Has_Settings {
	public function get_atomic_settings(): array {
		$schema = $this->get_atomic_settings_schema();
		$props = $this->get_settings();

		return Render_Props_Resolver::for_settings()->resolve( $schema, $props );
	}

	public function get_atomic_settings_schema(): array {
		return apply_filters(
			'elementor/atomic-widgets/props-schema',
			$this->define_atomic_settings_schema()
		);
	}

	protected function parse_atomic_settings( array $settings ): array {
		$schema = $this->get_atomic_settings_schema();

		$props_parser = Props_Parser::make( $schema );

		$result = $props_parser->parse( $settings );

		if ( ! $result->is_valid() ) {
			throw new \Exception( esc_html( 'Settings validation failed. ' . $result->errors()->to_string() ) );
		}

		return $result->unwrap();
	}

	protected function validate_schema( array $schema ) {
		$widget_name = static::class;

		foreach ( $schema as $key => $prop ) {
			if ( ! ( $prop instanceof Prop_Type ) ) {
				Utils::safe_throw( "Prop `$key` must be an instance of `Prop_Type` in `{$widget_name}`." );
			}
		}
	}

	/**
	 * @return array<string, Prop_Type>
	 */
	abstract protected function define_atomic_settings_schema(): array;
}
