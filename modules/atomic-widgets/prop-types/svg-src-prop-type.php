<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Svg_Src_Prop_Type extends Object_Prop_Type {
	public static function get_key(): string {
		return 'svg-src';
	}

	protected function define_shape(): array {
		return [
			'id' => Image_Attachment_Id_Prop_Type::make(),
			'url' => Url_Prop_Type::make(),
		];
	}

	public function default_url( string $url ): self {
		$this->default( [
			'id' => null,
			'url' => Url_Prop_Type::generate( $url ),
		] );

		return $this;
	}

	protected function validate_value( $value ): bool {
		$has_at_least_one_key = count( array_filter( $value ) ) >= 1;

		return $has_at_least_one_key && parent::validate_value( $value );
	}
}
