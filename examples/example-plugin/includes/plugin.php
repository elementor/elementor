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
		if ( ! $this->is_compatible() ) {
			return;
		}

		$this->register_variable_types();
		add_action( 'elementor/init', [ $this, 'init' ] );
	}

	public function is_compatible(): bool {
		if ( ! did_action( 'elementor/loaded' ) ) {
			return false;
		}

		if ( ! version_compare( ELEMENTOR_VERSION, self::MINIMUM_ELEMENTOR_VERSION, '>=' ) ) {
			return false;
		}

		return version_compare( PHP_VERSION, self::MINIMUM_PHP_VERSION, '>=' );
	}

	private function register_variable_types(): void {
		add_action( 'elementor/variables/register', [ $this, 'register_variables' ] );
	}

	public function init(): void {
		require_once __DIR__ . '/editor/register-editor-package.php';
		require_once __DIR__ . '/prop-types/badge-prop-type.php';
		require_once __DIR__ . '/transformers/badge-transformer.php';
		require_once __DIR__ . '/variables/shadow-variable-prop-type.php';
		require_once __DIR__ . '/variables/shadow-variable-transformer.php';

		Editor\Register_Editor_Package::register();

		add_action( 'elementor/widgets/register', [ $this, 'register_widgets' ] );
		add_action( 'elementor/dynamic_tags/register', [ $this, 'register_dynamic_tags' ] );
		add_action( 'elementor/atomic-widgets/settings/transformers/register', [ $this, 'register_transformers' ], 20 );
		add_action( 'elementor/atomic-widgets/styles/transformers/register', [ $this, 'register_transformers' ], 20 );
		add_filter( 'elementor/atomic-widgets/styles/schema', [ $this, 'register_shadow_variable_style_schema' ] );
	}

	public function register_widgets( $widgets_manager ): void {
		require_once __DIR__ . '/widgets/atomic-greeting-widget.php';

		$widgets_manager->register( new Widgets\Atomic_Greeting_Widget() );
	}

	public function register_dynamic_tags( $dynamic_tags_manager ): void {
		require_once __DIR__ . '/dynamic-tags/site-name-tag.php';

		\Elementor\Plugin::$instance->dynamic_tags->register_group(
			'elementor-example-plugin',
			[
				'title' => esc_html__( 'Elementor Examples', 'elementor-example-plugin' ),
			]
		);

		$dynamic_tags_manager->register( new Dynamic_Tags\Site_Name_Tag() );
	}

	public function register_variables( $registry ): void {
		$registry->register(
			Variables\Shadow_Variable_Prop_Type::get_key(),
			Variables\Shadow_Variable_Prop_Type::make()
		);
	}

	public function register_transformers( $registry ): void {
		$registry->register( 'example-badge', new Transformers\Badge_Transformer() );
		$registry->register(
			Variables\Shadow_Variable_Prop_Type::get_key(),
			new Variables\Shadow_Variable_Transformer()
		);
	}

	public function register_shadow_variable_style_schema( array $schema ): array {
		if ( ! isset( $schema['box-shadow'] ) ) {
			return $schema;
		}

		$schema['box-shadow'] = \Elementor\Modules\AtomicWidgets\PropTypes\Union_Prop_Type::create_from( $schema['box-shadow'] )
			->add_prop_type( Variables\Shadow_Variable_Prop_Type::make() );

		return $schema;
	}
}
