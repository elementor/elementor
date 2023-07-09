<?php

namespace Elementor\ElementsV2;

use Elementor\ElementsV2\Widgets\Button;
use Elementor\ElementsV2\Widgets\Container;
use Elementor\ElementsV2\Widgets\Heading;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Provider {
	const ELEMENTS = [
		'heading' => Heading::class,
		'container' => Container::class,
		'button' => Button::class,
	];

	public static function get( $name ) {
		$current_document = Plugin::$instance->documents->get_current();

		$is_editor = Plugin::$instance->editor->is_edit_mode();
		$is_saving = $current_document && $current_document->is_saving();

		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$is_active = isset( $_GET['no-controls'] ) && '1' === $_GET['no-controls'];

		if (
			$is_active &&
			! $is_editor &&
			! $is_saving &&
			$name &&
			isset( self::ELEMENTS[ $name ] )
		) {
			$classname = self::ELEMENTS[ $name ];

			return new $classname( [] );
		}

		return null;
	}
}
