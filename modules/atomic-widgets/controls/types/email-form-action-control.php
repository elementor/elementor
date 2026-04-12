<?php

namespace Elementor\Modules\AtomicWidgets\Controls\Types;

use Elementor\Modules\AtomicWidgets\Controls\Base\Atomic_Control_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Email_Form_Action_Control extends Atomic_Control_Base {
	public function get_type(): string {
		return 'email';
	}

	public static function get_default_recipient_email(): string {
		return sanitize_email( (string) get_option( 'admin_email', '' ) );
	}

	public function get_props(): array {
		return [
			'toPlaceholder' => self::get_default_recipient_email(),
		];
	}
}
