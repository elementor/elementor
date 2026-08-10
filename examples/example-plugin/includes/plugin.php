<?php
namespace Elementor_Example_Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class Plugin {

	const VERSION = '1.0.0';

	const MINIMUM_ELEMENTOR_VERSION = '4.3.0';

	const MINIMUM_PHP_VERSION = '7.4';

	private static ?Plugin $instance = null;

	public static function instance(): Plugin {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}

		return self::$instance;
	}

	public function __construct() {
		if ( $this->is_compatible() ) {
			add_action( 'elementor/init', [ $this, 'init' ] );
		}
	}

	public function is_compatible(): bool {
		return did_action( 'elementor/loaded' );
	}

	public function init(): void {
		add_action( 'elementor/elements/categories_registered', [ $this, 'register_widget_categories' ] );
		add_action( 'elementor/widgets/register', [ $this, 'register_widgets' ] );
		add_action( 'elementor/dynamic_tags/register', [ $this, 'register_dynamic_tags' ] );
	}

	public function register_widget_categories( $elements_manager ): void {
		$elements_manager->add_category(
			'elementor-examples',
			[
				'title' => esc_html__( 'Elementor Examples', 'elementor-example-plugin' ),
				'icon' => 'eicon-plug',
			]
		);
	}

	public function register_widgets( $widgets_manager ): void {
		require_once __DIR__ . '/widgets/example-widget.php';

		$widgets_manager->register( new Example_Widget() );
	}

	public function register_dynamic_tags( $dynamic_tags_manager ): void {
		require_once __DIR__ . '/dynamic-tags/example-tag.php';

		$dynamic_tags_manager->register( new Example_Tag() );
	}
}
