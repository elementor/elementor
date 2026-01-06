<?php

namespace Elementor\Modules\AtomicWidgets\PropTypeMigrations;

use Elementor\Modules\AtomicWidgets\Logger\Logger;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Migrations_Loader {
	private static ?self $instance = null;

	private ?array $manifest = null;

	private ?string $manifest_hash = null;

	private string $base_path;

	private string $manifest_file;

	private function __construct( string $base_path, string $manifest_file = 'manifest.json' ) {
		$this->base_path = rtrim( $base_path, '/' ) . '/';
		$this->manifest_file = $manifest_file;
	}

	public static function make( string $base_path, string $manifest_file = 'manifest.json' ): self {
		if ( null === self::$instance ) {
			self::$instance = new self( $base_path, $manifest_file );
		}

		return self::$instance;
	}

	public static function destroy(): void {
		self::$instance = null;
	}

	public function find_migration_path( string $source_type, string $target_type ): ?array {
		$graph = $this->build_migration_graph();

		$path = $this->find_shortest_path( $graph, $source_type, $target_type );

		if ( $path ) {
			return [
				'migrations' => $path,
				'direction' => 'up',
			];
		}

		$path = $this->find_shortest_path( $graph, $target_type, $source_type );

		if ( $path ) {
			return [
				'migrations' => array_reverse( $path ),
				'direction' => 'down',
			];
		}

		return null;
	}

	public function find_widget_key_migration( string $orphaned_key, array $missing_keys, string $widget_type ): ?string {
		$graph = $this->build_widget_key_graph( $widget_type );
		$valid_targets = [];

		foreach ( $missing_keys as $missing_key ) {
			if ( $this->key_path_exists( $graph, $orphaned_key, $missing_key ) ||
				$this->key_path_exists( $graph, $missing_key, $orphaned_key ) ) {
				$valid_targets[] = $missing_key;
			}
		}

		if ( count( $valid_targets ) === 1 ) {
			return $valid_targets[0];
		}

		return null;
	}

	private function build_migration_graph(): array {
		$manifest = $this->get_manifest();
		$graph = [];

		$prop_types = $manifest['propTypes'] ?? [];

		foreach ( $prop_types as $id => $migration ) {
			$from = $migration['fromType'];

			if ( ! isset( $graph[ $from ] ) ) {
				$graph[ $from ] = [];
			}

			$migration['id'] = $id;
			$graph[ $from ][] = $migration;
		}

		return $graph;
	}

	private function build_widget_key_graph( string $widget_type ): array {
		$manifest = $this->get_manifest();
		$graph = [];

		$widget_keys = $manifest['widgetKeys'] ?? [];

		if ( ! isset( $widget_keys[ $widget_type ] ) ) {
			return $graph;
		}

		foreach ( $widget_keys[ $widget_type ] as $mapping ) {
			$from = $mapping['from'];
			$to = $mapping['to'];

			if ( ! isset( $graph[ $from ] ) ) {
				$graph[ $from ] = [];
			}

			$graph[ $from ][] = $to;
		}

		return $graph;
	}

	private function key_path_exists( array $graph, string $start, string $end ): bool {
		if ( $start === $end ) {
			return false;
		}

		if ( ! isset( $graph[ $start ] ) ) {
			return false;
		}

		if ( in_array( $end, $graph[ $start ], true ) ) {
			return true;
		}

		$visited = [ $start => true ];
		$queue = [ $start ];

		while ( ! empty( $queue ) ) {
			$current = array_shift( $queue );

			if ( ! isset( $graph[ $current ] ) ) {
				continue;
			}

			foreach ( $graph[ $current ] as $next ) {
				if ( isset( $visited[ $next ] ) ) {
					continue;
				}

				if ( $next === $end ) {
					return true;
				}

				$visited[ $next ] = true;
				$queue[] = $next;
			}
		}

		return false;
	}

	private function find_shortest_path( array $graph, string $start, string $end ): ?array {
		if ( $start === $end ) {
			return [];
		}

		$queue = [ [ $start, [] ] ];
		$visited = [ $start => true ];

		while ( ! empty( $queue ) ) {
			list( $current, $path ) = array_shift( $queue );

			if ( ! isset( $graph[ $current ] ) ) {
				continue;
			}

			foreach ( $graph[ $current ] as $migration ) {
				$next = $migration['toType'];

				if ( isset( $visited[ $next ] ) ) {
					continue;
				}

				$new_path = array_merge( $path, [ $migration ] );

				if ( $next === $end ) {
					return $new_path;
				}

				$visited[ $next ] = true;
				$queue[] = [ $next, $new_path ];
			}
		}

		return null;
	}

	public function load_operations( string $migration_id ): ?array {
		$manifest = $this->get_manifest();

		$prop_types = $manifest['propTypes'] ?? [];

		if ( ! isset( $prop_types[ $migration_id ] ) ) {
			return null;
		}

		$migration = $prop_types[ $migration_id ];

		if ( ! isset( $migration['path'] ) ) {
			return null;
		}

		$file_path = $this->base_path . $migration['path'];

		$contents = $this->read_source( $file_path );

		if ( false === $contents ) {
			Logger::warning( 'Migration operation file not found', [
				'migration_id' => $migration_id,
				'path' => $file_path,
			] );

			return null;
		}

		$operations = json_decode( $contents, true );

		if ( json_last_error() !== JSON_ERROR_NONE ) {
			Logger::warning( 'Invalid migration operation JSON', [
				'migration_id' => $migration_id,
				'path' => $file_path,
				'error' => json_last_error_msg(),
			] );

			return null;
		}

		return $operations;
	}

	public function get_manifest_hash(): string {
		if ( null !== $this->manifest_hash ) {
			return $this->manifest_hash;
		}

		$manifest = $this->get_manifest();

		if ( empty( $manifest ) ) {
			$this->manifest_hash = '';
			return $this->manifest_hash;
		}

		$this->manifest_hash = md5( wp_json_encode( $manifest ) );

		return $this->manifest_hash;
	}

	private function get_manifest(): array {
		if ( null !== $this->manifest ) {
			return $this->manifest;
		}

		$manifest_path = $this->base_path . $this->manifest_file;

		$contents = $this->read_source( $manifest_path );

		if ( false === $contents ) {
			Logger::warning( 'Migrations manifest not found', [
				'path' => $manifest_path,
			] );

			$this->manifest = [
				'widgetKeys' => [],
				'propTypes' => [],
			];
			return $this->manifest;
		}

		$manifest = json_decode( $contents, true );

		if ( json_last_error() !== JSON_ERROR_NONE ) {
			Logger::warning( 'Invalid migrations manifest JSON', [
				'path' => $manifest_path,
				'error' => json_last_error_msg(),
			] );

			$this->manifest = [
				'widgetKeys' => [],
				'propTypes' => [],
			];
			return $this->manifest;
		}

		$this->manifest = $manifest;

		return $this->manifest;
	}

	private function read_source( string $path ) {
		if ( $this->is_url( $path ) ) {
			$response = wp_remote_get( $path, [ 'timeout' => 10 ] );

			if ( is_wp_error( $response ) ) {
				return false;
			}

			return wp_remote_retrieve_body( $response );
		}

		if ( ! file_exists( $path ) ) {
			return false;
		}

		return file_get_contents( $path );
	}

	private function is_url( string $path ): bool {
		return str_starts_with( $path, 'http://' ) || str_starts_with( $path, 'https://' );
	}
}
