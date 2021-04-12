<?php
namespace Elementor\Core\App\Modules\KitLibrary\Data;

use Elementor\Core\Utils\Collection;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Repository {
	const TAXONOMIES_KEYS = [ 'tags', 'categories', 'features', 'types' ];

	const KITS_CACHE_KEY = 'elementor_remote_kits';
	const KITS_TAXONOMIES_CACHE_KEY = 'elementor_remote_kits_taxonomies';

	const KITS_CACHE_TTL_HOURS = 12;
	const KITS_TAXONOMIES_CACHE_TTL_HOURS = 12;

	/**
	 * @var Api_Client
	 */
	protected $api_client;

	/**
	 * Get all kits.
	 *
	 * @param false $force_api_request
	 *
	 * @return Collection
	 * @throws Exceptions\Api_Response_Exception
	 * @throws Exceptions\Api_Wp_Error_Exception
	 */
	public function get_all( $force_api_request = false ) {
		$data = $this->get_kits_data( $force_api_request );

		return ( new Collection( $data ) )->map( function ( $kit ) {
			return $this->transform_kit_api_response( $kit );
		} );
	}

	/**
	 * Get specific kit.
	 *
	 * @param $id
	 *
	 * @return array|null
	 * @throws Exceptions\Api_Response_Exception
	 * @throws Exceptions\Api_Wp_Error_Exception
	 */
	public function find( $id ) {
		$data = $this->get_kits_data();

		$item = ( new Collection( $data ) )->find( function ( $kit ) use ( $id ) {
			return $kit['_id'] === $id;
		} );

		if ( ! $item ) {
			return null;
		}

		return $this->transform_kit_api_response( $item );
	}

	/**
	 * Get all the available taxonomies
	 *
	 * @param false $force_api_request
	 *
	 * @return mixed|null
	 * @throws Exceptions\Api_Response_Exception
	 * @throws Exceptions\Api_Wp_Error_Exception
	 */
	public function get_taxonomies( $force_api_request = false ) {
		$data = $this->get_taxonomies_data( $force_api_request );

		return ( new Collection( $data ) )
			->only( static::TAXONOMIES_KEYS )
			->map( function ( $values ) {
				return array_unique( $values );
			} )
			->reduce( function ( Collection $carry, $taxonomies, $type ) {
				return $carry->merge( array_map( function ( $text ) use ( $type ) {
					return [
						'text' => $text,
						'type' => $type,
					];
				}, $taxonomies ) );
			}, new Collection( [] ) );
	}

	/**
	 * @param false $force_api_request
	 *
	 * @return array|mixed
	 * @throws Exceptions\Api_Response_Exception
	 * @throws Exceptions\Api_Wp_Error_Exception
	 */
	private function get_kits_data( $force_api_request = false ) {
		$data = get_transient( static::KITS_CACHE_KEY );

		if ( ! $data || $force_api_request ) {
			$data = $this->api_client->get_all();

			set_transient( static::KITS_CACHE_KEY, $data, static::KITS_CACHE_TTL_HOURS * HOUR_IN_SECONDS );
		}

		return $data;
	}

	/**
	 * @param false $force_api_request
	 *
	 * @return array|mixed
	 * @throws Exceptions\Api_Response_Exception
	 * @throws Exceptions\Api_Wp_Error_Exception
	 */
	private function get_taxonomies_data( $force_api_request = false ) {
		$data = get_transient( static::KITS_TAXONOMIES_CACHE_KEY );

		if ( ! $data || $force_api_request ) {
			$data = $this->api_client->get_taxonomies();

			set_transient( static::KITS_TAXONOMIES_CACHE_KEY, $data, static::KITS_TAXONOMIES_CACHE_TTL_HOURS * HOUR_IN_SECONDS );
		}

		return $data;
	}

	/**
	 * @param $kit
	 *
	 * @return array
	 */
	private function transform_kit_api_response( $kit ) {
		$taxonomies = array_reduce( static::TAXONOMIES_KEYS, function ( $current, $key ) use ( $kit ) {
			return array_merge( $current, $kit[ $key ] );
		}, [] );

		return [
			'id' => $kit['_id'],
			'title' => $kit['title'],
			'thumbnail_url' => $kit['thumbnail'],
			'access_level' => $kit['access_level'],
			'keywords' => $kit['keywords'],
			'taxonomies' => $taxonomies,
		];
	}

	/**
	 * Repository constructor.
	 *
	 * @param Api_Client $api_client
	 */
	public function __construct( Api_Client $api_client ) {
		$this->api_client = $api_client;
	}
}
