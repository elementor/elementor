<?php
namespace Elementor\Modules\NestedTabs;

use Elementor\Plugin;
use Elementor\Modules\NestedElements\Module as NestedElementsModule;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Module extends \Elementor\Core\Base\Module {

	public static function is_active() {
		return Plugin::$instance->experiments->is_feature_active( NestedElementsModule::EXPERIMENT_NAME );
	}

	public function get_name() {
		return 'nested-tabs';
	}

	public function __construct() {
		parent::__construct();

		add_action( 'elementor/editor/before_enqueue_scripts', function () {
			wp_enqueue_script( $this->get_name(), $this->get_js_assets_url( $this->get_name() ), [
				'nested-elements',
			], ELEMENTOR_VERSION, true );
		} );

//		add_action( 'wp_head', [ $this, 'register_style' ], -1 );

		add_action('wp_head',[ $this, 'hook_css' ] );

	}

	/**
	 * Register styles.
	 *
	 * @return void
	 */
	public function register_style() {
		wp_register_style(
			$this->get_name(),
			$this->get_css_assets_url( 'frontend', 'assets/css/modules/nested-tabs/' ),
			[],
			ELEMENTOR_VERSION
		);
	}

	public function hook_css()
	{
		?> <!-- Closing the PHP here -->
		<style>
			body {
				background: pink !important;
			}
		</style>
		<link rel="stylesheet" id="<?php echo $this->get_name(); ?>" href="<?php echo $this->get_css_assets_url( 'frontend', 'assets/css/modules/nested-tabs/' ); ?>?ver=<?php echo ELEMENTOR_VERSION; ?>" media="all">
		<?php //Opening the PHP tag again
	}
}
