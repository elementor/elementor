<?php

namespace Elementor\Modules\AtomicWidgets\PropTypeMigrations;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Migrations_Loader {
	private static ?self $instance = null;

	private ?array $manifest = null;

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

	public function find_migration_path( string $source_type, string $target_type, ?string $widget_type = null, ?string $prop = null ): ?array {
		$graph = $this->build_migration_graph( $widget_type, $prop );

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

	private function build_migration_graph( ?string $widget_type, ?string $prop ): array {
		$manifest = $this->get_manifest();
		$graph = [];

		foreach ( $manifest['migrations'] as $id => $migration ) {
			if ( $widget_type && isset( $migration['widgetType'] ) && ! in_array( $widget_type, $migration['widgetType'], true ) ) {
				continue;
			}

			if ( $prop && isset( $migration['prop'] ) && $migration['prop'] !== $prop ) {
				continue;
			}

			$from = $migration['fromType'];

			if ( ! isset( $graph[ $from ] ) ) {
				$graph[ $from ] = [];
			}

			$migration['id'] = $id;
			$graph[ $from ][] = $migration;
		}

		return $graph;
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

		if ( ! isset( $manifest['migrations'][ $migration_id ] ) ) {
			return null;
		}

		$migration = $manifest['migrations'][ $migration_id ];

		if ( ! isset( $migration['url'] ) ) {
			return null;
		}

		$file_path = $this->base_path . $migration['url'];

		$contents = $this->read_source( $file_path );

		if ( false === $contents ) {
			return null;
		}

		$operations = json_decode( $contents, true );

		if ( json_last_error() !== JSON_ERROR_NONE ) {
			return null;
		}

		return $operations;
	}


	private function get_manifest(): array {
		if ( null !== $this->manifest ) {
			return $this->manifest;
		}

		$manifest_path = $this->base_path . $this->manifest_file;

		$contents = $this->read_source( $manifest_path );

		if ( false === $contents ) {
			$this->manifest = [ 'migrations' => [] ];
			return $this->manifest;
		}

		$manifest = json_decode( $contents, true );

		if ( json_last_error() !== JSON_ERROR_NONE ) {
			$this->manifest = [ 'migrations' => [] ];
			return $this->manifest;
		}

		$this->manifest = $manifest;

		return $this->manifest;
	}

	private function read_source( string $path ): string|false {
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
