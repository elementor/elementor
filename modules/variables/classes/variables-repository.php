<?php

namespace Elementor\Modules\Variables\Classes;

use Elementor\Core\Kits\Documents\Kit;
use Elementor\Modules\AtomicWidgets\Utils;
use Exception;
use InvalidArgumentException;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Variables_Repository {
	const VARIABLES_META_KEY = '_elementor_global_variables';

	private Kit $kit;

	public function __construct( Kit $kit ) {
		$this->kit = $kit;
	}

	public function all(): array {
		$meta_key = $this->get_meta_key();
		$meta_data = $this->kit->get_json_meta( $meta_key );

		if ( is_array( $meta_data ) && ! empty( $meta_data ) ) {
			return $meta_data;
		}

		return $this->get_default_meta();
	}

	/**
	 * @throws Exception
	 */
	public function create( array $payload ): string {
		$meta_data = $this->all();
		$data = $meta_data['data'];

		$existing_ids = array_keys( $data );

		$id = $this->generate_id( $existing_ids );

		$data[ $id ] = $this->only_from_array( $payload, [ 'type', 'label', 'value' ] );

		$meta_data['data'] = $data;

		$saved = $this->save( $meta_data );

		if ( ! $saved ) {
			throw new Exception( 'Failed to create variable' );
		}

		return $id;
	}

	/**
	 * @throws InvalidArgumentException
	 * @throws Exception
	 */
	public function update( array $payload, string $id ) {
		$meta_data = $this->all();
		$data = $meta_data['data'];

		if ( ! isset( $data[ $id ] ) ) {
			throw new InvalidArgumentException( 'Variable id does not exist' );
		}

		$variable = $this->only_from_array( $payload, [ 'label', 'value' ] );

		$data[ $id ] = array_merge( $data[ $id ], $variable );

		$meta_data['data'] = $data;

		$value = $this->save( $meta_data );

		if ( ! $value ) {
			throw new Exception( 'Failed to update variable' );
		}
	}

	/**
	 * @throws InvalidArgumentException
	 * @throws Exception
	 */
	public function delete( string $id ) {
		$meta_data = $this->all();
		$data = $meta_data['data'];

		if ( ! isset( $data[ $id ] ) ) {
			throw new InvalidArgumentException( 'Variable id does not exist' );
		}

		$data[ $id ]['deleted'] = true;
		$data[ $id ]['deleted_at'] = gmdate( 'Y-m-d H:i:s' );

		$meta_data['data'] = $data;

		$value = $this->save( $meta_data );

		if ( ! $value ) {
			throw new Exception( 'Failed to delete variable' );
		}
	}

	/**
	 * @throws InvalidArgumentException
	 * @throws Exception
	 */
	public function restore( string $id ) {
		$meta_data = $this->all();
		$data = $meta_data['data'];

		if ( ! isset( $data[ $id ] ) ) {
			throw new InvalidArgumentException( 'Variable id does not exist' );
		}

		$data[ $id ] = $this->only_from_array( $data[ $id ], [ 'label', 'value', 'type' ] );

		$meta_data['data'] = $data;

		$value = $this->save( $meta_data );

		if ( ! $value ) {
			throw new Exception( 'Failed to delete variable' );
		}
	}

	private function get_meta_key(): string {
		return self::VARIABLES_META_KEY;
	}

	private function get_default_meta(): array {
		return [
			'data' => [],
			'watermark' => 0,
			'version' => 1,
		];
	}

	private function save( array $data ) {
		if ( PHP_INT_MAX === $data['watermark'] ) {
			$data['watermark'] = 0;
		}

		$data['watermark']++;

		return (bool) $this->kit->update_json_meta( $this->get_meta_key(), $data );
	}

	private function generate_id( array $existing_ids ): string {
		return Utils::generate_id( 'e-', $existing_ids );
	}

	private function only_from_array( array $array, array $keys ): array {
		return array_intersect_key( $array, array_flip( $keys ) );
	}
}
