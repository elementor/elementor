<?php
namespace Elementor\Modules\NestedAccordion;

use Elementor\Core\Experiments\Manager;
use Elementor\Plugin;
use Elementor\Modules\NestedElements\Module as NestedElementsModule;
use Elementor\Core\Base\Module as BaseModule;


if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Module extends BaseModule {

	const EXPERIMENT_NAME = 'nested-accordion';

	public static function is_active() {
		return Plugin::$instance->experiments->is_feature_active( static::EXPERIMENT_NAME );
	}

	public function get_name() {
		return static::EXPERIMENT_NAME;
	}

	public function get_widgets() {
		return [
			'Nested_Accordion',
		];
	}

	/**
	 * Add to the experiments
	 *
	 * @return array
	 */
	public static function get_experimental_data() {
		return [
			'name' => static::EXPERIMENT_NAME,
			'title' => esc_html__( 'Nested Accordion', 'elementor' ),
			'description' => sprintf(
			/* translators: 1: Link opening tag, 2: Link closing tag. */
				esc_html__( 'Create a rich user experience by layering widgets together inside “Nested” Accordion, etc. %1$sLearn More%2$s', 'elementor' ),
				'<a href="https://go.elementor.com/widget-nested-accordion" target="_blank">',
				'</a>'
			),
			'hidden' => true,
			'release_status' => Manager::RELEASE_STATUS_ALPHA,
			'default' => Manager::STATE_INACTIVE,
			'dependencies' => [
				'nested-elements',
			],
		];
	}

	public function __construct() {
		parent::__construct();

		add_action( 'elementor/editor/before_enqueue_scripts', function () {
			wp_enqueue_script( $this->get_name(), $this->get_js_assets_url( $this->get_name() ), [
				'nested-elements',
			], ELEMENTOR_VERSION, true );
		} );
	}
}
