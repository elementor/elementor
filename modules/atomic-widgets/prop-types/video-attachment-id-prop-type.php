<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Number_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Video_Attachment_Id_Prop_Type extends Number_Prop_Type {
	public static function get_key(): string {
		return 'video-attachment-id';
	}

	protected function validate_value( $value ): bool {
		return is_numeric( $value );
	}

	protected function sanitize_value( $value ): int {
		return (int) $value;
	}
}
