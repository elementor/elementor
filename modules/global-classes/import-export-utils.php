<?php

namespace Elementor\Modules\GlobalClasses;

use ElementorDeps\JsonMachine\Items;
use ElementorDeps\JsonMachine\JsonDecoder\ExtJsonDecoder;
use Elementor\Modules\AtomicWidgets\Parsers\Style_Parser;
use Elementor\Modules\AtomicWidgets\Styles\Style_Schema;
use Elementor\Modules\GlobalClasses\Global_Classes_Repository;
use Elementor\Modules\AtomicWidgets\Utils\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Import_Export_Utils {

	const CHUNK_SIZE = 100;

	/**
	 * @param string $file_path
	 * @param array  $options {
	 *     @type string $conflict_resolution 'skip' | 'replace' (default: 'skip')
	 * }
	 *
	 * @return array
	 */
	public static function import_classes( string $file_path, array $options = [ 'conflict_resolution' => 'skip' ] ): array {
		if ( ! file_exists( $file_path ) ) {
			return [
                'imported' => [],
                'failed' => [],
                'conflicts' => [],
            ];
		}

		$conflict_resolution = $options['conflict_resolution'] ?? 'skip';
		$repository = Global_Classes_Repository::make();
		$existing = $repository->all()->get();
		$existing_items = $existing['items'] ?? [];
		$existing_order = $existing['order'] ?? [];
		$existing_label_to_id = self::build_label_to_id_map( $existing_items );

		$file_order = self::read_order_from_file( $file_path );
		$chunks = array_chunk( $file_order, self::CHUNK_SIZE );
		$style_parser = Style_Parser::make( Style_Schema::get() );

		$imported = [];
        $failed = [];
        $conflicts = [];


		foreach ( $chunks as $chunk ) {
			$batch = self::read_items_batch( $file_path, $chunk, $style_parser );

			foreach ( $chunk as $item_id ) {
				if ( ! isset( $batch[ $item_id ] ) ) {
					continue;
				}

				$item = $batch[ $item_id ];

                $sanitized_item = self::sanitize_item( $item_id, $item, $style_parser );

                if ( isset( $sanitized_item['error'] ) ) {
                    $failed[] = [
                        'id' => $item_id,
                        'reason' => $sanitized_item['error'],
                    ];
                    continue;
                }

				$label_lower = strtolower( $sanitized_item['label'] ?? '' );
				$has_conflict = isset( $existing_label_to_id[ $label_lower ] );

				if ( $has_conflict && 'skip' === $conflict_resolution ) {
                    $existing_item = $existing_items[ $existing_label_to_id[ $label_lower ] ];
                    $conflicts[] = [
                        'conflict_type' => 'duplicated_label',
                        'conflict_resolution' => 'skip_imported_item',
                        'import_data' => [
                            'id' => $item_id,
                            'label' => $sanitized_item['label'],
                        ],
                        'existing_data' => [
                            'id' => $existing_item['id'],
                            'label' => $existing_item['label'],
                        ],
                    ];

					continue;
				}

				if ( $has_conflict && 'replace' === $conflict_resolution ) {
					$existing_id = $existing_label_to_id[ $label_lower ];
					$sanitized_item['id'] = $existing_id;
					$existing_items[ $existing_id ] = $sanitized_item;


                    $conflicts[] = [
                        'conflict_type' => 'duplicated_label',
                        'conflict_resolution' => 'replace_existing_item_props',
                        'import_data' => [
                            'id' => $item_id,
                            'label' => $sanitized_item['label'],
                        ],
                        'existing_data' => [
                            'id' => $existing_id,
                            'label' => $existing_items[ $existing_id ]['label'],
                        ],
                    ];

                    $imported[] = [ 'id' => $existing_id, 'label' => $sanitized_item['label'] ];

					continue;
				}

                $imported_item_id = $sanitized_item['id'];
                $new_id = $imported_item_id;
                $is_id_exists = isset( $existing_items[ $imported_item_id ] );

                if ( $is_id_exists ) {
                    $new_id = self::generate_unique_id( $existing_order );
                    $conflicts[] = [
                        'conflict_type' => 'duplicated_id',
                        'conflict_resolution' => 'generate_new_id',
                        'import_data' => [
                            'id' => $imported_item_id,
                            'label' => $sanitized_item['label'],
                        ],
                        'existing_data' => [
                            'id' => $imported_item_id,
                            'label' => $existing_items[ $imported_item_id ]['label'],
                        ],
                        'new_data' => [
                            'id' => $new_id,
                            'label' => $sanitized_item['label'],
                        ],
                    ];
                }

                $sanitized_item['id'] = $new_id;
				$existing_items[ $new_id ] = $sanitized_item;
				$existing_order[] = $new_id;
				$imported[] = [ 'id' => $new_id, 'label' => $sanitized_item['label'] ];
			}

            $repository->put( $existing_items, $existing_order );
			unset( $batch );
		}

		return [
            'imported' => $imported,
            'failed' => $failed,
            'conflicts' => $conflicts,
		];
	}

	private static function read_items_batch( string $file_path, array $chunk, Style_Parser $style_parser ): array {
		$chunk_keys = array_flip( $chunk );
		$batch = [];

		$items_stream = Items::fromFile( $file_path, [
			'pointer' => '/items',
			'decoder' => new ExtJsonDecoder( true ),
		] );

		foreach ( $items_stream as $item_id => $item ) {
			if ( ! isset( $chunk_keys[ $item_id ] ) ) {
				continue;
			}

			$batch[ $item_id ] = $item;

			if ( count( $batch ) === count( $chunk_keys ) ) {
				break;
			}
		}

		return $batch;
	}

	private static function read_order_from_file( string $file_path ): array {
		$order = [];

		foreach ( Items::fromFile( $file_path, [ 'pointer' => '/order' ] ) as $id ) {
			if ( is_string( $id ) ) {
				$order[] = $id;
			}
		}

		return $order;
	}

	private static function build_label_to_id_map( array $items ): array {
		$map = [];

		foreach ( $items as $id => $item ) {
			if ( isset( $item['label'] ) ) {
				$map[ strtolower( $item['label'] ) ] = $id;
			}
		}

		return $map;
	}

    private static function generate_unique_id( array $existing_ids ): string {
        return Utils::generate_id( 'g-', $existing_ids );
    }

    private static function sanitize_item( string $item_id, array $item, Style_Parser $style_parser ) {
        $item_result = $style_parser->parse( $item );

        if ( ! $item_result->is_valid() ) {
            return [
                'error' => $item_result->errors()->all()
            ];
        }

        $sanitized_item = $item_result->unwrap();

        if ( $item_id !== $sanitized_item['id'] ) {
            return  [
                'error' => 'ID mismatch',
            ];
        }

        return $sanitized_item;
    }
}
