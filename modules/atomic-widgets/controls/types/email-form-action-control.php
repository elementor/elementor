<?php

namespace Elementor\Modules\AtomicWidgets\Controls\Types;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Email_Form_Action_Control extends Chips_Control {
	public function get_type(): string {
		return 'email';
	}

	public static function get_default_recipient_email(): string {
		return sanitize_email( (string) get_option( 'admin_email', '' ) );
	}

	public function get_props(): array {
		return array_merge( parent::get_props(), [
			'toPlaceholder' => self::get_default_recipient_email(),
		] );
	}
}
