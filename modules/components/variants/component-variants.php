<?php

namespace Elementor\Modules\Components\Variants;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Component_Variants {
	/** @var Component_Variant[] */
	public array $variants;

	private function __construct( array $variants_meta ) {
		if ( empty( $variants_meta['variants'] ) ) {
			$this->variants = [];

			return;
		}

		$this->variants = array_map(
			fn( array $variant ) => Component_Variant::make( $variant ),
			$variants_meta['variants']
		);
	}

	public static function make( array $variants_meta ): self {
		return new self( $variants_meta );
	}

	public function to_associative_array(): array {
		return [
			'variants' => array_map(
				fn( Component_Variant $variant ) => $variant->to_associative_array(),
				$this->variants
			),
		];
	}
}
