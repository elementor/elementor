<?php
namespace Elementor\Modules\KitElementsDefaults\Utils;

use Elementor\Element_Base;
use Elementor\Elements_Manager;
use Elementor\Core\Base\Document;
use Elementor\Core\Utils\Collection;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Settings_Sanitizer {

	const SPECIAL_SETTINGS = [
		'__dynamic__',
		'__globals__',
	];

	/**
	 * @var Elements_Manager
	 */
	private $elements_manager;

	/**
	 * @var array
	 */
	private $widget_types;

	/**
	 * @var Element_Base | null
	 */
	private $pending_element = null;

	/**
	 * @var array | null
	 */
	private $pending_settings = null;

	/**
	 * @param Elements_Manager $elements_manager
	 * @param array $widget_types
	 */
	public function __construct( Elements_Manager $elements_manager, $widget_types = [] ) {
		$this->elements_manager = $elements_manager;
		$this->widget_types = $widget_types;
	}

	/**
	 * @param $type
	 * @param $settings
	 *
	 * @return $this
	 */
	public function for( $type, $settings ) {
		$this->pending_element = $this->create_element( $type );
		$this->pending_settings = $settings;

		return $this;
	}

	/**
	 * @return $this
	 */
	public function reset() {
		$this->pending_element = null;
		$this->pending_settings = null;

		return $this;
	}

	/**
	 * @return bool
	 */
	public function is_pending() {
		return $this->pending_element && $this->pending_settings;
	}

	/**
	 * @return $this
	 */
	public function remove_unsupported_keys() {
		if ( ! $this->is_pending() ) {
			return $this;
		}

		$controls = $this->pending_element->get_controls();

		$this->pending_settings = ( new Collection( $this->pending_settings ) )
			->only( array_merge( array_keys( $controls ), static::SPECIAL_SETTINGS ) )
			->map( function ( $value, $key ) use ( $controls ) {
				if ( ! in_array( $key, static::SPECIAL_SETTINGS, true ) ) {
					return $value;
				}

				return array_intersect_key( $value, $controls );
			} )
			->all();

		return $this;
	}

	/**
	 * @param Document $document
	 *
	 * @return $this
	 */
	public function prepare_for_export( Document $document ) {
		if ( ! $this->is_pending() ) {
			return $this;
		}

		$this->pending_settings = $document
			->process_element_import_export( $this->pending_element, 'on_export' );

		return $this;
	}

	/**
	 * @param Document $document
	 *
	 * @return $this
	 */
	public function prepare_for_import( Document $document ) {
		if ( ! $this->is_pending() ) {
			return $this;
		}

		$this->pending_settings = $document
			->process_element_import_export( $this->pending_element, 'on_import' );

		return $this;
	}

	/**
	 * @return array
	 */
	public function get() {
		if ( ! $this->is_pending() ) {
			return [];
		}

		$settings = $this->pending_settings;

		$this->reset();

		return $settings;
	}

	/**
	 * @param string $type
	 * @param array $settings
	 *
	 * @return Element_Base|null
	 */
	private function create_element( $type ) {
		$is_widget = in_array( $type, $this->widget_types, true );

		$args = $is_widget
			? [
				'elType' => 'widget',
				'widgetType' => $type,
				'id' => '0',
			] : [
				'elType' => $type,
				'id' => '0',
			];

		return $this->elements_manager->create_element_instance( $args );
	}
}
