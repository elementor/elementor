<?php

namespace Elementor\Modules\Announcements\Classes;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Announcement {
	/**
	 * @var array
	 */
	protected array $raw_data;

	public function __construct( array $data ) {
		$this->raw_data = $data;
	}

	/**
	 * @return array
	 */
	protected function get_triggers(): array {
		return $this->raw_data['triggers'] ?? [];
	}

	/**
	 * is_active
	 * @return bool
	 */
	public function is_active(): bool {
		$triggers = $this->get_triggers();

		if ( empty( $triggers ) ) {
			return true;
		}

		foreach ( $triggers as $trigger ) {
			$trigger_object = Utils::get_trigger_object( $trigger );

			if ( ! $trigger_object ) {
				return false;
			}

			if ( ! $trigger_object->is_active() ) {
				return false;
			}
		}

		return true;
	}

	/**
	 * @return array
	 */
	public function get_prepared_data(): array {
		$raw_data = $this->raw_data;
		unset( $raw_data['triggers'] );

		return $raw_data;
	}
}
