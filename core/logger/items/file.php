<?php

namespace Elementor\Core\Logger\Items;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class File extends Base {

	const FORMAT = 'date [type X times][file::line] message [meta]';

	protected $file;
	protected $line;

	public function __construct( $args ) {
		parent::__construct( $args );

		$this->file = empty( $args['file'] ) ? '' : $args['file'];
		$this->line = $args['line'];
	}

	public function get_name() {
		return 'File';
	}
}
