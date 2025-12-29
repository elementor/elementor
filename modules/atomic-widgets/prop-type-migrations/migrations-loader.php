<?php

namespace Elementor\Modules\AtomicWidgets\PropTypeMigrations;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Migrations_Loader {
	private static ?self $instance = null;

	private ?array $manifest = null;

	private string $migrations_path;

	private function __construct() {
		$this->migrations_path = ELEMENTOR_PATH . 'migrations/';
	}

	public static function instance(): self {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}

		return self::$instance;
	}

	public function find_migration_path( string $source_type, string $target_type, ?string $widget_type = null, ?string $prop = null, ?string $manifest_path = null ): ?array {
		$graph = $this->build_migration_graph( $widget_type, $prop, $manifest_path );

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

	private function build_migration_graph( ?string $widget_type, ?string $prop, ?string $manifest_path ): array {
		$manifest = $this->get_manifest( $manifest_path );
		$graph = [];

		foreach ( $manifest['migrations'] as $migration ) {
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

	public function load_operations( string $migration_id, ?string $migrations_dir = null ): ?array {
		$dir = $migrations_dir ?? $this->migrations_path;
		$file_path = $dir . $migration_id . '.json';

		if ( ! file_exists( $file_path ) ) {
			return null;
		}

		$contents = file_get_contents( $file_path );

		if ( false === $contents ) {
			return null;
		}

		$operations = json_decode( $contents, true );

		if ( json_last_error() !== JSON_ERROR_NONE ) {
			return null;
		}

		return $operations;
	}


	private function get_manifest( ?string $manifest_path = null ): array {
		if ( null === $manifest_path && null !== $this->manifest ) {
			return $this->manifest;
		}

		$path = $manifest_path ?? ( $this->migrations_path . 'manifest.json' );

		if ( ! file_exists( $path ) ) {
			$this->manifest = [ 'migrations' => [] ];
			return $this->manifest;
		}

		$contents = file_get_contents( $path );

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
}
