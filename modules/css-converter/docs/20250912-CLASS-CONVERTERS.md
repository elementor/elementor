Class Converter

Please study this project:
plugins/elementor/modules/css-converter

Study, report, research, compare, analyse, evaluate.
Ask as many questions as possible.
All reporting should be done in this document.
This document will become a PRD.


Previously:
We have focused on converting CSS Variables to Editor Variables.

Next:
Now we would like to continue with the next step: converting CSS to Elementor V4 Global Classes [plugins/elementor/modules/global-classes].
Study this the global classes module.

Example:
e.g.
.myClass {
        background-color: #eeeeee;
        font-size: 12px;
        --my-variable: 3;
        line-height: var(--my-variable);
}

Goal:
We can import this into the Global Classes.

Check:
Study this folder as well: /css-converter.
This might contains some notes and code relevant for the class converter.
Only if relevant.
Close to our /modules/css-converter if relevant.

Scenarios:
- List as many scenarios as possible
- Think of aspects like:
-- Breakpoints
-- Importing classes with the same name (with same or different content)
-- CSS variables (in :root and outside :root)
- Think of as many challenges as possible