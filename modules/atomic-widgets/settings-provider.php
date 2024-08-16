<?php

namespace Elementor\Modules\AtomicWidgets;

use Elementor\Core\Utils\Collection;
use Elementor\Modules\AtomicWidgets\Base\Atomic_Transformer_Base;
use Elementor\Modules\AtomicWidgets\Schema\Atomic_Prop;
use Exception;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Settings_Provider {
	const TRANSFORM_DEPTH_LIMIT = 3;

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
			$result[ $prop_name ] = $prop instanceof Atomic_Prop
				? $this->transform_value( $settings[ $prop_name ] ?? $prop->get_default() )
				: null;
		}

		return $result;
	}

	private function transform_value( $value, int $depth = 0 ) {
		if ( ! $value || ! $this->is_transformable( $value ) ) {
			return $value;
		}

		if ( $depth >= self::TRANSFORM_DEPTH_LIMIT ) {
			return null;
		}

		$transformer = $this->transformers->get( $value['$$type'] );

		if ( ! ( $transformer instanceof Atomic_Transformer_Base ) ) {
			return null;
		}

		try {
			return $this->transform_value(
				$transformer->transform( $value['value'] ),
				$depth + 1
			);
		} catch ( Exception $e ) {
			return null;
		}
	}

	private function is_transformable( $value ): bool {
		return
			! empty( $value['$$type'] )
			&& is_string($value['$$type'])
			&& ! empty( $value['value'] );
	}
}
