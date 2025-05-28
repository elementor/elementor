<?php

namespace Elementor\Modules\Variables\Storage;

use Elementor\Core\Kits\Documents\Kit;
use Elementor\Modules\AtomicWidgets\Utils;
use Elementor\Modules\Variables\Storage\Exceptions\RecordNotFound;
use Elementor\Modules\Variables\Storage\Exceptions\VariablesLimitReached;
use Elementor\Modules\Variables\Storage\Exceptions\FatalError;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Repository {
	const TOTAL_VARIABLES_COUNT = 100;

	const FORMAT_VERSION_V1 = 1;
	const VARIABLES_META_KEY = '_elementor_global_variables';

	private Kit $kit;

	public function __construct( Kit $kit ) {
		$this->kit = $kit;
	}

	/**
	 * @throws VariablesLimitReached
	 */
	private function assert_if_variables_limit_reached( array $db_record ) {
		$variables_in_use = 0;

		foreach ( $db_record['data'] as $variable ) {
			if ( isset( $variable['deleted'] ) && $variable['deleted'] ) {
				continue;
			}

			++$variables_in_use;
		}

		if ( self::TOTAL_VARIABLES_COUNT < $variables_in_use ) {
			throw new VariablesLimitReached( 'Total variables count limit reached' );
		}
	}

	public function load(): array {
		$db_record = $this->kit->get_json_meta( static::VARIABLES_META_KEY );

		if ( is_array( $db_record ) && ! empty( $db_record ) ) {
			return $db_record;
		}

		return $this->get_default_meta();
	}

	/**
	 * @throws FatalError
	 */
	public function create( array $variable ) {
		$db_record = $this->load();

		$list_of_variables = $db_record['data'] ?? [];

		$id = $this->new_id_for( $list_of_variables );

		$list_of_variables[ $id ] = $this->extract_from( $variable, [
			'type',
			'label',
			'value',
		] );

		$db_record['data'] = $list_of_variables;

		$this->assert_if_variables_limit_reached( $db_record );

		$watermark = $this->save( $db_record );

		if ( false === $watermark ) {
			throw new FatalError( 'Failed to create variable' );
		}

		return [
			'variable' => array_merge( [ 'id' => $id ], $list_of_variables[ $id ] ),
			'watermark' => $watermark,
		];
	}

	/**
	 * @throws RecordNotFound
	 * @throws FatalError
	 */
	public function update( string $id, array $variable ) {
		$db_record = $this->load();

		$list_of_variables = $db_record['data'] ?? [];

		if ( ! isset( $list_of_variables[ $id ] ) ) {
			throw new RecordNotFound( 'Variable not found' );
		}

		$list_of_variables[ $id ] = array_merge( $list_of_variables[ $id ], $this->extract_from( $variable, [
			'label',
			'value',
		] ) );

		$db_record['data'] = $list_of_variables;

		$watermark = $this->save( $db_record );

		if ( false === $watermark ) {
			throw new FatalError( 'Failed to update variable' );
		}

		return [
			'variable' => array_merge( [ 'id' => $id ], $list_of_variables[ $id ] ),
			'watermark' => $watermark,
		];
	}

	/**
	 * @throws RecordNotFound
	 * @throws FatalError
	 */
	public function delete( string $id ) {
		$db_record = $this->load();

		$list_of_variables = $db_record['data'] ?? [];

		if ( ! isset( $list_of_variables[ $id ] ) ) {
			throw new RecordNotFound( 'Variable not found' );
		}

		$list_of_variables[ $id ]['deleted'] = true;
		$list_of_variables[ $id ]['deleted_at'] = $this->now();

		$db_record['data'] = $list_of_variables;

		$watermark = $this->save( $db_record );

		if ( false === $watermark ) {
			throw new FatalError( 'Failed to delete variable' );
		}

		return [
			'variable' => array_merge( [ 'id' => $id ], $list_of_variables[ $id ] ),
			'watermark' => $watermark,
		];
	}

	/**
	 * @throws RecordNotFound
	 * @throws FatalError
	 */
	public function restore( string $id ) {
		$db_record = $this->load();

		$list_of_variables = $db_record['data'] ?? [];

		if ( ! isset( $list_of_variables[ $id ] ) ) {
			throw new RecordNotFound( 'Variable not found' );
		}

		$list_of_variables[ $id ] = $this->extract_from( $list_of_variables[ $id ], [
			'label',
			'value',
			'type',
		] );

		$db_record['data'] = $list_of_variables;

		$this->assert_if_variables_limit_reached( $db_record );

		$watermark = $this->save( $db_record );

		if ( false === $watermark ) {
			throw new FatalError( 'Failed to restore variable' );
		}

		return [
			'variable' => array_merge( [ 'id' => $id ], $list_of_variables[ $id ] ),
			'watermark' => $watermark,
		];
	}

	private function save( array $db_record ) {
		if ( PHP_INT_MAX === $db_record['watermark'] ) {
			$db_record['watermark'] = 0;
		}

		++$db_record['watermark'];

		if ( $this->kit->update_json_meta( static::VARIABLES_META_KEY, $db_record ) ) {
			return $db_record['watermark'];
		}

		return false;
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
}
