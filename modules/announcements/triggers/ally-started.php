<?php

namespace Elementor\Modules\Announcements\Triggers;

use Elementor\Core\Utils\Hints;
use Elementor\Modules\Announcements\Classes\Trigger_Base;
use Elementor\User;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class AllyStarted extends Trigger_Base {
	private const PLUGIN_SLUG = 'pojo-accessibility';
	private const AI_ANNOUNCEMENT_KEY = 'ai-get-started-announcement';

	protected $name = 'ally-announcement';

	public function after_triggered() {
		User::set_introduction_viewed( [ 'introductionKey' => $this->name ] );
	}

	public function is_active(): bool {
		if ( ! current_user_can( 'manage_options' ) ) {
			return false;
		}

		if ( $this->is_ally_active() ) {
			return false;
		}

		if ( ! $this->has_ai_announcement_been_displayed() ) {
			return false;
		}

		if ( $this->has_ally_announcement_been_displayed() ) {
			return false;
		}

		return ! User::get_introduction_meta( $this->name );
	}

	private function is_ally_active(): bool {
		return Hints::is_plugin_active( self::PLUGIN_SLUG );
	}

	private function has_ai_announcement_been_displayed(): bool {
		return User::get_introduction_meta( self::AI_ANNOUNCEMENT_KEY );
	}

	private function has_ally_announcement_been_displayed(): bool {
		return User::get_introduction_meta( $this->name );
	}
}
