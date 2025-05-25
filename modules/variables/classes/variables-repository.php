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
	const FORMAT_VERSION_V1 = 1;
	const VARIABLES_META_KEY = '_elementor_global_variables';

	private Kit $kit;

	public function __construct( Kit $kit ) {
		$this->kit = $kit;
	}

	public function load(): array {
		$db_record = $this->kit->get_json_meta( static::VARIABLES_META_KEY );

		if ( is_array( $db_record ) && ! empty( $db_record ) ) {
			return $db_record;
		}

		return $this->get_default_meta();
	}

	/**
	 * @throws Exception
	 */
	public function create( array $payload ): string {
		$db_record = $this->load();

		$list_of_variables = $db_record['data'] ?? [];

		$id = $this->new_id_for( $list_of_variables );

		$list_of_variables[ $id ] = $this->extract_from( $payload, [
			'type',
			'label',
			'value',
		] );

		$db_record['data'] = $list_of_variables;

		$result = $this->save( $db_record );

		if ( ! $result ) {
			throw new Exception( 'Failed to create variable' );
		}

		return $id;
	}

	/**
	 * @throws InvalidArgumentException
	 * @throws Exception
	 */
	public function update( string $id, array $payload ) {
		$db_record = $this->load();

		$list_of_variables = $db_record['data'] ?? [];

		if ( ! isset( $list_of_variables[ $id ] ) ) {
			throw new InvalidArgumentException( 'Variable id does not exist' );
		}

		$variable = $this->extract_from( $payload, [
			'label',
			'value',
		] );

		$list_of_variables[ $id ] = array_merge( $list_of_variables[ $id ], $variable );

		$db_record['data'] = $list_of_variables;

		$result = $this->save( $db_record );

		if ( ! $result ) {
			throw new Exception( 'Failed to update variable' );
		}
	}

	/**
	 * @throws InvalidArgumentException
	 * @throws Exception
	 */
	public function delete( string $id ) {
		$db_record = $this->load();

		$list_of_variables = $db_record['data'] ?? [];

		if ( ! isset( $list_of_variables[ $id ] ) ) {
			throw new InvalidArgumentException( 'Variable id does not exist' );
		}

		$list_of_variables[ $id ]['deleted'] = true;
		$list_of_variables[ $id ]['deleted_at'] = $this->now();

		$db_record['data'] = $list_of_variables;

		$result = $this->save( $db_record );

		if ( ! $result ) {
			throw new Exception( 'Failed to delete variable' );
		}
	}

	/**
	 * @throws InvalidArgumentException
	 * @throws Exception
	 */
	public function restore( string $id ) {
		$db_record = $this->load();

		$list_of_variables = $db_record['data'] ?? [];

		if ( ! isset( $list_of_variables[ $id ] ) ) {
			throw new InvalidArgumentException( 'Variable id does not exist' );
		}

		$list_of_variables[ $id ] = $this->extract_from( $list_of_variables[ $id ], [
			'label',
			'value',
			'type',
		] );

		$db_record['data'] = $list_of_variables;

		$result = $this->save( $db_record );

		if ( ! $result ) {
			throw new Exception( 'Failed to restore variable' );
		}
	}

	private function save( array $db_record ) {
		if ( PHP_INT_MAX === $db_record['watermark'] ) {
			$db_record['watermark'] = 0;
		}

		$db_record['watermark']++;

		return (bool) $this->kit->update_json_meta( static::VARIABLES_META_KEY, $db_record );
	}

	private function new_id_for( array $list_of_variables ): string {
		return Utils::generate_id( 'e-gv-', array_keys( $list_of_variables ) );
	}

	private function now(): string {
		return gmdate( 'Y-m-d H:i:s' );
	}

	private function extract_from( array $source, array $fields ): array {
		return array_intersect_key( $source, array_flip( $fields ) );
	}

	private function get_default_meta(): array {
		return [
			'data' => [],
			'watermark' => 0,
			'version' => self::FORMAT_VERSION_V1,
		];
	}

	/**
	 * Find a variable by its ID.
	 *
	 * @param string $id The variable ID to find.
	 * @return array|null The variable data if found, null otherwise.
	 */
	public function find_by_id( string $id ): ?array {
		$db_record = $this->load();
		$list_of_variables = $db_record['data'] ?? [];

		if ( isset( $list_of_variables[ $id ] ) && empty( $list_of_variables[ $id ]['deleted'] ) ) {
			return $list_of_variables[ $id ];
		}

		return null;
	}
}
