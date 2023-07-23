<?php
namespace Elementor\Modules\Styleguide;

use Elementor\Core\Base\Module as Base_Module;
use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Plugin;
use Elementor\Modules\Styleguide\Controls\Switcher;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Module extends Base_Module {

	const ASSETS_HANDLE = 'elementor-styleguide';
	const ASSETS_SRC = 'styleguide';

	const EXPERIMENT_NAME = 'e_global_styleguide';

	/**
	 * Initialize the Container-Converter module.
	 *
	 * @return void
	 */
	public function __construct() {
		parent::__construct();
		add_action( 'elementor/editor/after_enqueue_scripts', [ $this, 'enqueue_main_scripts' ] );
		add_action( 'elementor/preview/enqueue_styles', [ $this, 'enqueue_styles' ] );

		add_action( 'elementor/frontend/after_register_scripts', function () {
			$is_preview = Plugin::$instance->preview->is_preview();

			if ( ! $is_preview ) {
				return;
			}

			$this->enqueue_app_initiator( $is_preview );
		} );

		add_action( 'elementor/controls/register', [ $this, 'register_controls' ] );
		add_action( 'elementor/element/after_section_start', [ $this, 'add_styleguide_enable_controls' ], 10, 3 );
	}

	/**
	 * Retrieve the module name.
	 *
	 * @return string
	 */
	public function get_name() {
		return 'styleguide';
	}

	public static function is_active() {
		return Plugin::$instance->experiments->is_feature_active( self::EXPERIMENT_NAME );
	}

	public static function get_experimental_data() {
		return [
			'name' => static::EXPERIMENT_NAME,
			'title' => esc_html__( 'Global Style Guide', 'elementor' ),
			'description' => esc_html__( 'Display a live preview of changes to global colors and fonts in a sleek style guide from the site’s settings. You will be able to toggle between the style guide and the page to see your changes in action.', 'elementor' ),
			'release_status' => Experiments_Manager::RELEASE_STATUS_BETA,
			'new_site' => [
				'default_active' => true,
				'minimum_installation_version' => '3.14',
			],
		];
	}

	/**
	 * Enqueue scripts.
	 *
	 * @return void
	 */
	public function enqueue_main_scripts() {
		wp_enqueue_script(
			static::ASSETS_HANDLE,
			$this->get_js_assets_url( static::ASSETS_SRC ),
			[ 'elementor-editor' ],
			ELEMENTOR_VERSION,
			true
		);

		$kit_id = Plugin::$instance->kits_manager->get_active_id();

		wp_localize_script( static::ASSETS_HANDLE, 'elementorStyleguideConfig', [
			'activeKitId' => $kit_id,
		] );
	}

	public function enqueue_app_initiator( $is_preview = false ) {
		$dependencies = [
			'wp-i18n',
			'react',
			'react-dom',
		];

		if ( ! $is_preview ) {
			$dependencies[] = static::ASSETS_HANDLE;
		}

		wp_enqueue_script(
			static::ASSETS_HANDLE . '-app-initiator',
			$this->get_js_assets_url( static::ASSETS_SRC . '-app-initiator' ),
			$dependencies,
			ELEMENTOR_VERSION,
			true
		);
	}

	public function enqueue_styles() {
		wp_enqueue_style(
			static::ASSETS_HANDLE,
			$this->get_css_assets_url( 'modules/' . static::ASSETS_SRC . '/' . static::ASSETS_SRC ),
			[],
			ELEMENTOR_VERSION
		);
	}

	public function register_controls() {
		$controls_manager = Plugin::$instance->controls_manager;

		$controls_manager->register( new Switcher() );
	}

	/**
	 * Add the Enable Styleguide Preview controls to Global Colors and Global Fonts.
	 *
	 * @param $element
	 * @param string $section_id
	 * @param array $args
	 */
	public function add_styleguide_enable_controls( $element, $section_id, $args ) {
		if ( 'kit' !== $element->get_name() || ! in_array( $section_id, [ 'section_global_colors', 'section_text_style' ] ) ) {
			return;
		}

		$control_name = str_replace( 'global-', '', $args['tab'] ) . '_enable_styleguide_preview';

		$element->add_control(
			$control_name,
			[
				'label' => esc_html__( 'Style Guide Preview', 'elementor' ),
				'type' => Switcher::CONTROL_TYPE,
				'description' => esc_html__( 'Switch between the content area and style guide to preview your changes to global colors.', 'elementor' ),
				'separator' => 'after',
				'label_off' => esc_html__( 'Off', 'elementor' ),
				'label_on' => esc_html__( 'On', 'elementor' ),
				'on_change_command' => true,
			]
		);
	}
}
