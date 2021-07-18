<?php
namespace Elementor\Modules\DefaultValues\Data;

use Elementor\Plugin;
use Elementor\Core\Utils\Collection;
use Elementor\Core\Kits\Documents\Kit;
use Elementor\Modules\DefaultValues\Module;
use Elementor\Core\Kits\Exceptions\Kit_Not_Exists;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Repository {
	const DEFAULT_VALUES_META_KEY = '_elementor_default_values';

	/**
	 * @var static[]
	 */
	private static $instances = [];

	/**
	 * @var Kit
	 */
	private $kit;

	/**
	 * @var Collection|null
	 */
	private $data = null;

	/**
	 * @param Kit|null $kit
	 *
	 * @return static
	 * @throws Kit_Not_Exists
	 */
	public static function instance( Kit $kit = null ) {
		$kit = $kit ? $kit : Plugin::$instance->kits_manager->get_active_kit();

		if ( ! $kit->get_id() ) {
			throw new Kit_Not_Exists();
		}

		if ( ! isset( static::$instances[ $kit->get_id() ] ) ) {
			static::$instances[ $kit->get_id() ] = new static( $kit );
		}

		return static::$instances[ $kit->get_id() ];
	}

	/**
	 * Get all the defaults.
	 *
	 * @return Collection
	 */
	public function all() {
		if ( ! $this->data ) {
			$this->refresh();
		}

		return $this->data;
	}

	/**
	 * Get specific default
	 *
	 * @param $type
	 *
	 * @return array
	 * @throws \Exception
	 */
	public function get( $type ) {
		$data = $this->all();

		return $data->get( $type, [
			'settings' => [],
			'elements' => [],
		] );
	}

	/**
	 * @param       $type
	 * @param array $settings
	 *
	 * @return array
	 * @throws \Exception
	 */
	public function store( $type, array $settings ) {
		$data = $this->all();

		$data[ $type ] = [
			'settings' => $settings,
			'elements' => [],
		];

		return $this->save( $data )->get( $type );
	}

	/**
	 * @param $type
	 *
	 * @return array
	 * @throws \Exception
	 */
	public function delete( $type ) {
		$data = $this->all();

		unset( $data[ $type ] );

		return $this->save( $data )->get( $type );
	}

	/**
	 * Make sure the data is loaded.
	 *
	 * @return $this
	 */
	public function refresh() {
		$this->data = new Collection(
			$this->kit->get_json_meta( static::DEFAULT_VALUES_META_KEY )
		);

		return $this;
	}

	/**
	 * @param Collection $data
	 *
	 * @return $this
	 */
	private function save( Collection $data ) {
		$this->kit->update_meta( static::DEFAULT_VALUES_META_KEY, wp_json_encode( $data->all() ) );

		$this->refresh();

		return $this;
	}

	/**
	 * Repository constructor.
	 *
	 * @param Kit $kit
	 */
	public function __construct( Kit $kit ) {
		$this->kit = $kit;
	}
}
