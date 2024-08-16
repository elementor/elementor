<?php

namespace Elementor\Modules\AtomicWidgets;

use Elementor\Core\Utils\Collection;
use Elementor\Modules\AtomicWidgets\Base\Atomic_Transformer_Base;
use Elementor\Modules\AtomicWidgets\Schema\Atomic_Prop;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Settings_Provider {
	private static Settings_Provider $instance;

	private Collection $transformers;

	private function __construct( Collection $transformers ) {
		$this->transformers = $transformers;
	}

	public static function instance(): Settings_Provider {
		if ( ! isset( self::$instance ) ) {
			self::$instance = new self(
				apply_filters( 'elementor/atomic-widgets/settings/transformers', new Collection() )
			);
		}

		return self::$instance;
	}

	public function transform( array $settings, array $schema ): array {
		$result = [];

		foreach ( $schema as $prop_name => $prop ) {
			if ( ! ( $prop instanceof Atomic_Prop ) ) {
				$result[ $prop_name ] = null;

				continue;
			}

			$value = array_key_exists( $prop_name, $settings )
				? $settings[ $prop_name ]
				: $prop->get_default();

			if ( ! $value || ! $this->is_transformable( $value ) ) {
				$result[ $prop_name ] = $value;

				continue;
			}

			$transformer = $this->transformers->get( $value['$$type'] );

		if ( ! ( $transformer instanceof Atomic_Transformer_Base ) ) {
			return null;
		}

			try {
				$result[ $prop_name ] = $transformer->transform( $value['value'] );
			} catch ( \Exception $e ) {
				$result[ $prop_name ] = null;
			}
		}

		return $result;
	}

	private function is_transformable( $value ): bool {
		return
			! empty( $value['$$type'] )
			&& is_string($value['$$type'])
			&& ! empty( $value['value'] );
	}
}
