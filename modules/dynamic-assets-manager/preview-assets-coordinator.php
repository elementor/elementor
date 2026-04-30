<?php

namespace Elementor\Modules\DynamicAssetsManager;

use Elementor\Preview;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class Preview_Assets_Coordinator {

	private static ?Registry $registry = null;

	private static ?Consumer_Context $context = null;

	public static function bootstrap_on_preview_init( Preview $preview ): void {
		if ( ! Plugin::$instance->experiments->is_feature_active( Module::EXPERIMENT_NAME ) ) {
			return;
		}

		self::$registry = new Registry();
		self::$context = Consumer_Context::editor_canvas( (int) $preview->get_post_id() );

		do_action( Hooks::ACTION_REGISTER, self::$registry, self::$context );
	}

	public static function reset(): void {
		self::$registry = null;
		self::$context = null;
	}

	public static function get_registry(): ?Registry {
		return self::$registry;
	}

	public static function get_context(): ?Consumer_Context {
		return self::$context;
	}

	public static function is_preview_bootstrap_ready(): bool {
		return self::$registry instanceof Registry && self::$context instanceof Consumer_Context;
	}
}
