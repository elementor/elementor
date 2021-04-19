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
		return $this->get_kits_data( $force_api_request )
			->map( function ( $kit ) {
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
		$item = $this->get_kits_data()
			->find( function ( $kit ) use ( $id ) {
				return $kit['_id'] === $id;
			} );

		if ( ! $item ) {
			return null;
		}

		$manifest = $this->api_client->get_manifest( $id );

		return $this->transform_kit_api_response( $item, $manifest );
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
		return $this->get_taxonomies_data( $force_api_request )
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
	 * @param $id
	 *
	 * @return mixed
	 * @throws Exceptions\Api_Response_Exception
	 * @throws Exceptions\Api_Wp_Error_Exception
	 */
	public function get_download_link( $id ) {
//		$response = $this->api_client->download_link( $id );

//		return [
//			'download_link' => $response['download_link']
//		];

		return [
			'download_link' => 'https://storage.googleapis.com/kits-library-dev/wss/1.0.1.zip?X-Goog-Algorithm=GOOG4-RSA-SHA256&X-Goog-Credential=kits-to-bucket%40elementor-website.iam.gserviceaccount.com%2F20210419%2Fauto%2Fstorage%2Fgoog4_request&X-Goog-Date=20210419T104844Z&X-Goog-Expires=900&X-Goog-SignedHeaders=host&X-Goog-Signature=6d4182d74c9652b0f29198d0000a850c209dad7df7f9d435a57950c25d29f16e1977584e406b13aa00c7c28d6e482b81b6082231046800ca7a8ebb5d7f53fc5539229922415de3245241d287029f56bd98aef41486357ea0808a658c7e95c67aecb262d17dff237aeba0467431456aa94b9f467407d827dad0ab7ecedb2a21632ac9fa6956629ae9bc73825169e3ee5cd41235981989875a7086d00cbf4779dff65bcf8fc1f1a36daad31fc4f40492ba5ccc23d0c8f7d34e3abc0fdd513ecde7e1dec7b80aa9ebbba0e623e2c84c12c7df2d9a1ccea9a03055e593c5b4546ceebf43d1f69e508e68af4688d95a2043a39352eb33cc04a86854dd792c4b8a4bd'
		];
	}

	/**
	 * @param bool $force_api_request
	 *
	 * @return Collection
	 * @throws Exceptions\Api_Response_Exception
	 * @throws Exceptions\Api_Wp_Error_Exception
	 */
	private function get_kits_data( $force_api_request = false ) {
		$data = get_transient( static::KITS_CACHE_KEY );

		if ( ! $data || $force_api_request ) {
			$data = $this->api_client->get_all();

			set_transient( static::KITS_CACHE_KEY, $data, static::KITS_CACHE_TTL_HOURS * HOUR_IN_SECONDS );
		}

		return new Collection( $data );
	}

	/**
	 * @param false $force_api_request
	 *
	 * @return Collection
	 * @throws Exceptions\Api_Response_Exception
	 * @throws Exceptions\Api_Wp_Error_Exception
	 */
	private function get_taxonomies_data( $force_api_request = false ) {
		$data = get_transient( static::KITS_TAXONOMIES_CACHE_KEY );

		if ( ! $data || $force_api_request ) {
			$data = $this->api_client->get_taxonomies();

			set_transient( static::KITS_TAXONOMIES_CACHE_KEY, $data, static::KITS_TAXONOMIES_CACHE_TTL_HOURS * HOUR_IN_SECONDS );
		}

		return new Collection( $data );
	}

	/**
	 * @param      $kit
	 * @param null|array $manifest
	 *
	 * @return array
	 */
	private function transform_kit_api_response( $kit, $manifest = null ) {
		$taxonomies = array_reduce( static::TAXONOMIES_KEYS, function ( $current, $key ) use ( $kit ) {
			return array_merge( $current, $kit[ $key ] );
		}, [] );

		return array_merge(
			[
				'id' => $kit['_id'],
				'title' => $kit['title'],
				'thumbnail_url' => $kit['thumbnail'],
				'access_level' => $kit['access_level'],
				'keywords' => $kit['keywords'],
				'taxonomies' => $taxonomies,
			],
			$manifest ? $this->transform_manifest_api_response( $manifest ) : []
		);
	}

	/**
	 * @param $manifest
	 *
	 * @return array
	 */
	private function transform_manifest_api_response( $manifest ) {
		$content = ( new Collection( $manifest['templates'] ) )
			->union(
				array_reduce( $manifest['content'], function ( $carry, $content ) {
					return $carry + $content;
				}, [] )
			)
			->map( function ( $manifest_item, $key ) {
				return [
					'id' => $key,
					'title' => $manifest_item['title'],
					'doc_type' => $manifest_item['doc_type'],
					'thumbnail_url' => $manifest_item['thumbnail'],
					'preview_url' => isset( $manifest_item['url'] ) ? $manifest_item['url'] : null,
				];
			} );

		return [
			'description' => $manifest['description'],
			'preview_url' => isset( $manifest['site'] ) ? $manifest['site'] : '',
			'documents' => $content->values(),
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
