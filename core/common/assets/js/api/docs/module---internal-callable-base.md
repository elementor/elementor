## Functions

<dl>
<dt><a href="#initialize">initialize()</a></dt>
<dd><p>Function initialize().</p>
<p>Called after creation of the base, used for initialize extras.
Without expending constructor.</p>
</dd>
<dt><a href="#register">register()</a></dt>
<dd><p>Function register().</p>
<p>Used to register the callback.</p>
</dd>
<dt><a href="#getType">getType()</a> ⇒ <code>string</code></dt>
<dd><p>Function getType().</p>
<p>Get type eg: ( hook, event, etc ... ).</p>
</dd>
<dt><a href="#getCommand">getCommand()</a> ⇒ <code>string</code></dt>
<dd><p>Function getCommand().</p>
<p>Returns the full command path for callback binding.</p>
<p>Supports array of strings ( commands ).</p>
</dd>
<dt><a href="#getId">getId()</a> ⇒ <code>string</code></dt>
<dd><p>Function getId().</p>
<p>Returns command id for the hook (should be unique).</p>
</dd>
<dt><a href="#getConditions">getConditions(args)</a> ⇒ <code>boolean</code></dt>
<dd><p>Function getConditions().</p>
<p>Condition for running the callback, if true, call to apply().</p>
</dd>
<dt><a href="#apply">apply(args)</a> ⇒ <code>boolean</code></dt>
<dd><p>Function apply().</p>
<p>Apply the callback, ( The actual affect of the callback ).</p>
</dd>
<dt><a href="#run">run(...args)</a> ⇒ <code>boolean</code></dt>
<dd><p>Function run().</p>
<p>Run the callback.</p>
</dd>
<dt><a href="#bindContainerType">bindContainerType()</a> ⇒ <code>string</code></dt>
<dd><p>Function bindContainerType().</p>
<p>Bind eElement type to callback.</p>
<p>Used to gain performance.</p>
</dd>
</dl>

<a name="initialize"></a>

## initialize()
Function initialize().

Called after creation of the base, used for initialize extras.
Without expending constructor.

**Kind**: global function  
<a name="register"></a>

## register()
Function register().

Used to register the callback.

**Kind**: global function  
**Throws**:

- <code>Error</code> 

<a name="getType"></a>

## getType() ⇒ <code>string</code>
Function getType().

Get type eg: ( hook, event, etc ... ).

**Kind**: global function  
**Throws**:

- <code>Error</code> 

<a name="getCommand"></a>

## getCommand() ⇒ <code>string</code>
Function getCommand().

Returns the full command path for callback binding.

Supports array of strings ( commands ).

**Kind**: global function  
**Throws**:

- <code>Error</code> 

<a name="getId"></a>

## getId() ⇒ <code>string</code>
Function getId().

Returns command id for the hook (should be unique).

**Kind**: global function  
**Throws**:

- <code>Error</code> 

<a name="getConditions"></a>

## getConditions(args) ⇒ <code>boolean</code>
Function getConditions().

Condition for running the callback, if true, call to apply().

**Kind**: global function  
**Throws**:

- <code>Error</code> 


| Param | Type |
| --- | --- |
| args | <code>Object</code> | 

<a name="apply"></a>

## apply(args) ⇒ <code>boolean</code>
Function apply().

Apply the callback, ( The actual affect of the callback ).

**Kind**: global function  

| Param | Type |
| --- | --- |
| args | <code>Object</code> | 

<a name="run"></a>

## run(...args) ⇒ <code>boolean</code>
Function run().

Run the callback.

**Kind**: global function  

| Param | Type |
| --- | --- |
| ...args | <code>\*</code> | 

<a name="bindContainerType"></a>

## bindContainerType() ⇒ <code>string</code>
Function bindContainerType().

Bind eElement type to callback.

Used to gain performance.

**Kind**: global function  
**Returns**: <code>string</code> - type  
### [Back](api/ecommands.md) 
