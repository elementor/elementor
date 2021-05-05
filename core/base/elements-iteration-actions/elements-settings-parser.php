<?php
namespace Elementor\Core\Base\Elements_Iteration_Actions;

use Elementor\Element_Base;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Elements_Settings_Parser extends Base {

	const PARSED_ELEMENTS_META_KEY = '_elementor_parsed_elements';

	/**
	 * @var array $parsed_elements_data
	 */
	private $parsed_elements_data = [];

	/**
	 * Is Action Needed
	 *
	 * This method is called during runtime only (as opposed to during a save process). If true is returned, the
	 * action will run on elements during runtime. If false is returned, the action will not run during runtime.
	 *
	 * @since 3.3.0
	 *
	 * @return bool
	 */
	public function is_action_needed() {
		if ( ! metadata_exists( 'post', $this->document->get_id(), '_elementor_parsed_elements' ) ) {
			return true;
		}

		return false;
	}

	/**
	 * Element Action
	 *
	 * This method is called on each element in the document after a document has been saved.
	 *
	 * @since 3.3.0
	 *
	 * @param Element_Base $element
	 */
	public function element_action( Element_Base $element ) {
		$controls = $element->get_controls();
		$prefix_class_settings = [];
		$frontend_available_keys = [];

		foreach ( $controls as $control ) {
			if ( isset( $control['prefix_class'] ) ) {
				$prefix_class_settings[ $control['name'] ] = $control['prefix_class'];
			}

			if ( ! empty( $control['frontend_available'] ) ) {
				$frontend_available_keys[] = $control['name'];
			}
		}

		$this->parsed_elements_data[ $element->get_id() ] = [
			'frontend_available_keys' => $frontend_available_keys,
			'prefix_class_settings' => $prefix_class_settings,
			'settings' => $element->get_active_settings(),
		];
	}

	/**
	 * After Elements Iteration
	 *
	 * This method is called after the iteration on the document elements finishes.
	 *
	 * @since 3.3.0
	 */
	public function after_elements_iteration() {
		// Saving the parsed elements data.
		$this->document->update_meta( self::PARSED_ELEMENTS_META_KEY, $this->parsed_elements_data );
	}
}
