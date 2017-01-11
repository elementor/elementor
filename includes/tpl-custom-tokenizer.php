<?php

namespace Elementor;

class HandlebarsCustomTokenizer extends \Handlebars\Tokenizer
{
  protected function reset()
  {
    parent::reset();
    $this->otag = '<%';
    $this->ctag = '%>';
  }
}