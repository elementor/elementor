<?php

namespace Elementor\Modules\AtomicWidgets\Base;

use Elementor\Element_Base;
use Elementor\Modules\AtomicWidgets\PropTypes\Concerns\Has_Atomic_Base;
use Elementor\Modules\AtomicWidgets\Styles\Style_Schema;
use Elementor\Modules\AtomicWidgets\Validators\Props_Validator;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;
use Elementor\Modules\AtomicWidgets\Validators\Style_Validator;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

abstract class Atomic_Element_Base extends Element_Base {

	use Has_Atomic_Base;

	protected $version = '0.0';
	protected $styles = [];

	public function __construct( $data = [], $args = null ) {
		parent::__construct( $data, $args );

		$this->version = $data['version'] ?? '0.0';
		$this->styles = $data['styles'] ?? [];
	}

	abstract protected function define_atomic_controls(): array;

	final public function get_initial_config() {
		$config = parent::get_initial_config();

		$config['atomic_controls'] = $this->get_atomic_controls();
		$config['atomic_props_schema'] = static::get_props_schema();
		$config['version'] = $this->version;
		$config['show_in_panel'] = true;
		$config['categories'] = [ 'layout' ];
		$config['hide_on_search'] = false;
		$config['controls'] = [];

		return $config;
	}

	private static function validate_schema( array $schema ) {
		$widget_name = static::class;

		foreach ( $schema as $key => $prop ) {
			if ( ! ( $prop instanceof Prop_Type ) ) {
				Utils::safe_throw( "Prop `$key` must be an instance of `Prop_Type` in `{$widget_name}`." );
			}
		}
	}

	private function sanitize_atomic_styles( array $styles ) {
		foreach ( $styles as $style ) {
			[$is_valid, $sanitized, $errors_bag] = Style_Validator::make( Style_Schema::get() )->validate( $style );

			if ( ! $is_valid ) {
				throw new \Exception( 'Styles validation failed. Invalid keys: ' . join( ', ', $errors_bag ) );
			}

			$styles[ $sanitized['id'] ] = $sanitized;
		}

		return $styles;
	}

	private function sanitize_atomic_settings( array $settings ): array {
		$schema = static::get_props_schema();

		[ , $validated, $errors ] = Props_Validator::make( $schema )->validate( $settings );

		if ( ! empty( $errors ) ) {
			throw new \Exception( 'Settings validation failed. Invalid keys: ' . join( ', ', $errors ) );
		}

		return $validated;
	}

	/**
	 * @return array<string, Prop_Type>
	 */
	abstract protected static function define_props_schema(): array;
}
