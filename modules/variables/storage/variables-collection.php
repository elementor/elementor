<?php

namespace Elementor\Modules\Variables\Storage;

use Elementor\Core\Utils\Collection;
use Elementor\Modules\Variables\Storage\Entities\Variable;
use Elementor\Modules\Variables\Storage\Exceptions\DuplicatedLabel;
use Elementor\Modules\Variables\Storage\Exceptions\VariablesLimitReached;
// a tradeoff when you want to use collection base methods are performing immutable
// creating new instance
class Variables_Collection extends Collection {
	const FORMAT_VERSION_V1 = 1;
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

	public function serialize(): array {
		$data = [];

		foreach ( $this->all() as $variable ) {
			$data[ $variable->id() ] = $variable->to_array();
		}

		return [
			'data' => $data,
			'watermark' => $this->watermark,
			'version' => $this->version,
		];
	}

	public static function empty_variables(): self {
		return new self( [], 0, self::FORMAT_VERSION_V1 );
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
	 * @throws DuplicatedLabel
	 */
	public function assert_label_is_unique( string $label, ?string $ignoreId = null ): void {
		// This , ?string $ignoreId = null might be good but i  have to check if its goog at updating

		foreach ( $this->all() as $variable ) {
			if ( $variable->is_deleted() ) {
				continue;
			}

			// Skip the variable being updated
			if ( $ignoreId !== null && $variable->id() === $ignoreId ) {
				continue;
			}

			if ( strcasecmp( $variable->label(), $label ) === 0) {
				throw new DuplicatedLabel( "Variable label '$label' already exists." );
			}
		}
	}

	/**
	 * @throws VariablesLimitReached
	 */
	public function assert_limit_not_reached(): void {
		$activeCount = 0;

		foreach ( $this->all() as $variable ) {
			if ( ! $variable->is_deleted()) {
				$activeCount++;
			}
		}

		if ( self::TOTAL_VARIABLES_COUNT < $activeCount ) {
			throw new VariablesLimitReached( 'Total variables count limit reached' );
		}
	}
}
