<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Video_Src_Prop_Type extends Object_Prop_Type {
	public static function get_key(): string {
		return 'video-src';
	}

	protected function define_shape(): array {
		return [
			'id' => Video_Attachment_Id_Prop_Type::make()->description( 'The ID of the video attachment in the WordPress media library' ),
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
		$only_one_key = count( array_filter( $value ) ) === 1;

		return $only_one_key && parent::validate_value( $value );
	}
}
