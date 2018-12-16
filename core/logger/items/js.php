<?php

namespace Elementor\Core\Logger\Items;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class JS extends File {

	const FORMAT = 'JS: date [type X times][file::line::column] message [meta]';

	protected $column;

	public function __construct( $args ) {
		parent::__construct( $args );
		$this->column = $args['column'];
		$this->file = $args['url'];
		$this->date = date( 'Y-m-d H:i:s', $args['timestamp'] );
	}

	public function get_name() {
		return 'JS';
	}
}
