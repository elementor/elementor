<?php
namespace Elementor\Modules\Usage;

use Elementor\Modules\Usage\Collection\DocumentSettingsUsage;

class Global_Settings_Page_Usage {
	/**
	 * @var \Elementor\Modules\Usage\Collection\DocumentSettingsUsage
	 */
	private $collection;

	public function __construct() {
		$this->set_collection( new DocumentSettingsUsage( [] ) );
	}

	/**
	 * Create new collection from 'get_option' of global document settings usage.
	 *
	 * @return $this
	 */
	public function create_from_global() {
		$this->collection = new DocumentSettingsUsage( get_option( Module::DOCUMENT_OPTION_NAME, [] ) );

		return $this;
	}

	/**
	 * Save, saves the current collection using `update_option`.
	 *
	 * @return $this
	 */
	public function save_global() {
		update_option( Module::DOCUMENT_OPTION_NAME, $this->collection->all(), false );

		return $this;
	}

	public function add( $document ) {
		$document_settings_usage_collection = $this->create_from_global()->get_collection();
		$document_settings_usage_collection->add( $document );

		$this->set_collection( $document_settings_usage_collection );
		$this->save_global();

		return $this;
	}

	public function remove( $document ) {
		$document_settings_usage_collection = $this->create_from_global()->get_collection();
		$document_settings_usage_collection->remove( $document );

		$this->set_collection( $document_settings_usage_collection );
		$this->save_global();

		return $this;
	}

	public function get_collection() {
		return $this->collection;
	}

	public function set_collection( $collection ) {
		$this->collection = $collection;
	}

}
