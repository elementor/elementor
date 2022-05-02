<?php
namespace Elementor\Modules\Usage\GlobalUsage;

use Elementor\Core\Base\Document;

abstract class Base_Global_Usage {
	/**
	 * @var \Elementor\Modules\Usage\Collection\BaseUsage
	 */
	private $collection;

	public function __construct() {
		$collection_class = $this->get_collection_class();
		$this->set_collection( new $collection_class( [] ) );
	}

	abstract public function get_collection_class();

	abstract public function get_option_name();

	/**
	 * Create new collection from 'get_option' of global document settings usage.
	 *
	 * @return $this
	 */
	public function create_from_global() {
		$collection_class = $this->get_collection_class();
		$this->collection = new $collection_class( get_option( $this->get_option_name(), [] ) );

		return $this;
	}

	/**
	 * Save, saves the current collection using `update_option`.
	 *
	 * @return $this
	 */
	public function save_global() {
		update_option( $this->get_option_name(), $this->collection->all(), false );

		return $this;
	}

	/**
	 * Adds current document usage, to global usage.
	 *
	 * @param Document $document
	 *
	 * @return $this
	 */
	public function add( Document $document ) {
		$collection = $this->create_from_global()->get_collection();
		$collection->add( $document );

		$this->set_collection( $collection );
		$this->save_global();

		return $this;
	}

	/**
	 * Removes current document usage, from global usage.
	 *
	 * @param Document $document
	 *
	 * @return $this
	 */
	public function remove( Document $document ) {
		$collection = $this->create_from_global()->get_collection();
		$collection->remove( $document );

		$this->set_collection( $collection );
		$this->save_global();

		return $this;
	}

	/**
	 * Get current collection.
	 *
	 * @return \Elementor\Modules\Usage\Collection\BaseUsage
	 */
	public function get_collection() {
		return $this->collection;
	}

	/**
	 * Set current collection.
	 *
	 * @param \Elementor\Modules\Usage\Collection\BaseUsage $collection
	 */
	public function set_collection( $collection ) {
		$this->collection = $collection;
	}
}
