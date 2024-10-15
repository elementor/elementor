<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Image_Src_Prop_Type extends Object_Prop_Type {
	public static function get_key(): string {
		return 'image-src';
	}

	protected function define_shape(): array {
		return [
			'id' => Image_Attachment_Id_Prop_Type::make(),
			'url' => Url_Prop_Type::make(),
		];
	}

	protected function validate_value( $value ): bool {
		$at_least_one_key = isset( $value['id'] ) || isset( $value['url'] );

		return $at_least_one_key && parent::validate_value( $value );
	}
}
