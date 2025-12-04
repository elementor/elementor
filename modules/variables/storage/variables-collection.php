<?php

namespace Elementor\Modules\Variables\Storage;

use Elementor\Core\Utils\Collection;
use Elementor\Modules\AtomicWidgets\Utils\Utils;
use Elementor\Modules\Variables\Storage\Entities\Variable;
use Elementor\Modules\Variables\Storage\Exceptions\DuplicatedLabel;
use Elementor\Modules\Variables\Storage\Exceptions\RecordNotFound;
use Elementor\Modules\Variables\Storage\Exceptions\VariablesLimitReached;

/**
 * TODO: a tradeoff when you want to use collection base methods they are
 * performing immutable process ( creating new instances )
 * we will see if we need to extend collection as time goes on
 */
class Variables_Collection extends Collection {
	const FORMAT_VERSION_V1 = 1;
	const FORMAT_VERSION_V2 = 2;
	const TOTAL_VARIABLES_COUNT = 100;

	private int $watermark;

	private int $version;

	private function __construct( array $items = [], ?int $watermark = 0, ?int $version = null ) {
		parent::__construct();

		$this->items = $items;
		$this->watermark = $watermark;
		$this->version = $version ?? self::FORMAT_VERSION_V1;
	}

	public static function hydrate( array $record ): self {
		$variables = [];

		foreach ( $record['data'] ?? [] as $id => $item ) {
			$data = array_merge( [ 'id' => $id ], $item );

			$variables[ $id ] = Variable::from_array( $data );
		}

		$watermark = $record['watermark'];
		$version = $record['version'] ?? null;

		return new self( $variables, $watermark, $version );
	}

	public function serialize( bool $include_deleted_key = false ): array {
		$data = [];

		foreach ( $this->all() as $variable ) {
			$var = $variable->to_array();

			if ( $include_deleted_key && $variable->is_deleted() ) {
				$var['deleted'] = true;
			}

			$data[ $variable->id() ] = $var;
		}

		return [
			'data' => $data,
			'watermark' => $this->watermark,
			'version' => $this->version,
		];
	}


	public function set_version( $version ): void {
		$this->version = $version;
	}


	public static function default(): self {
		return new self(
			[],
			0,
			self::FORMAT_VERSION_V1
		);
	}

	public function watermark(): int {
		return $this->watermark;
	}

	private function reset_watermark() {
		$this->watermark = 0;
	}

	public function increment_watermark() {
		if ( PHP_INT_MAX === $this->watermark ) {
			$this->reset_watermark();
		}

		++$this->watermark;
	}

	public function add_variable( Variable $variable ): void {
		$this->items[ $variable->id() ] = $variable;
	}

	/**
	 * @throws RecordNotFound When a variable is not found.
	 */
	public function find_or_fail( string $id ): Variable {
		$variable = $this->get( $id );

		if ( ! isset( $variable ) ) {
			throw new RecordNotFound( 'Variable not found' );
		}

		return $variable;
	}

	/**
	 * @throws DuplicatedLabel If there is a duplicate label in the database.
	 */
	public function assert_label_is_unique( string $label, ?string $ignore_id = null ): void {
		foreach ( $this->all() as $variable ) {
			if ( $variable->is_deleted() ) {
				continue;
			}

			if ( null !== $ignore_id && $variable->id() === $ignore_id ) {
				continue;
			}

			if ( strcasecmp( $variable->label(), $label ) === 0 ) {
				throw new DuplicatedLabel( esc_html( "Variable label '$label' already exists." ) );
			}
		}
	}

	/**
	 * @throws VariablesLimitReached If variable limit reached.
	 */
	public function assert_limit_not_reached(): void {
		$active_count = 0;

		foreach ( $this->all() as $variable ) {
			if ( ! $variable->is_deleted() ) {
				$active_count++;
			}
		}

		if ( self::TOTAL_VARIABLES_COUNT <= $active_count ) {
			throw new VariablesLimitReached( 'Total variables count limit reached' );
		}
	}

	public function next_id(): string {
		return Utils::generate_id( 'e-gv-', array_keys( $this->all() ) );
	}


	public function get_next_order(): int {
		$highest_order = 0;

		foreach ( $this->all() as $variable ) {
			if ( $variable->is_deleted() ) {
				continue;
			}

			if ( $variable->has_order() && $variable->order() > $highest_order ) {
				$highest_order = $variable->order();
			}
		}

		return $highest_order + 1;
	}
}
