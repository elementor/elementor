## Functions

<dl>
<dt><a href="#requireContainer">requireContainer(args)</a></dt>
<dd><p>Function requireContainer().</p>
<p>Validate <code>arg.container</code> &amp; <code>arg.containers</code>.</p>
</dd>
<dt><a href="#initialize">initialize(args)</a></dt>
<dd><p>Function initialize().</p>
<p>Initialize command, called after construction.</p>
</dd>
<dt><a href="#validateArgs">validateArgs(args)</a></dt>
<dd><p>Function validateArgs().</p>
<p>Validate command arguments.</p>
</dd>
<dt><a href="#isDataChanged">isDataChanged()</a> ⇒ <code>boolean</code></dt>
<dd><p>Function isDataChanged().</p>
<p>Whether the editor needs to set change flag on/off.</p>
</dd>
<dt><a href="#apply">apply(args)</a> ⇒ <code>*</code></dt>
<dd><p>Function apply().</p>
<p>Do the actual command.</p>
</dd>
<dt><a href="#run">run()</a> ⇒ <code>*</code></dt>
<dd><p>Function run().</p>
<p>Run command with history &amp; hooks.</p>
</dd>
<dt><a href="#onBeforeRun">onBeforeRun(args)</a></dt>
<dd><p>Function onBeforeRun.</p>
<p>Called before run().</p>
</dd>
<dt><a href="#onAfterRun">onAfterRun(args, result)</a></dt>
<dd><p>Function onAfterRun.</p>
<p>Called after run().</p>
</dd>
<dt><a href="#onBeforeApply">onBeforeApply(args)</a></dt>
<dd><p>Function onBeforeApply.</p>
<p>Called before apply().</p>
</dd>
<dt><a href="#onAfterApply">onAfterApply(args, result)</a></dt>
<dd><p>Function onAfterApply.</p>
<p>Called after apply().</p>
</dd>
<dt><a href="#onCatchApply">onCatchApply(e)</a></dt>
<dd><p>Function onCatchApply.</p>
<p>Called after apply() failed.</p>
</dd>
</dl>

<a name="requireContainer"></a>

## requireContainer(args)
Function requireContainer().

Validate `arg.container` & `arg.containers`.

**Kind**: global function  
**Throws**:

- <code>Error</code> 


| Param | Type |
| --- | --- |
| args | <code>Object</code> | 

<a name="initialize"></a>

## initialize(args)
Function initialize().

Initialize command, called after construction.

**Kind**: global function  

| Param | Type |
| --- | --- |
| args | <code>Object</code> | 

<a name="validateArgs"></a>

## validateArgs(args)
Function validateArgs().

Validate command arguments.

**Kind**: global function  

| Param | Type |
| --- | --- |
| args | <code>Object</code> | 

<a name="isDataChanged"></a>

## isDataChanged() ⇒ <code>boolean</code>
Function isDataChanged().

Whether the editor needs to set change flag on/off.

**Kind**: global function  
<a name="apply"></a>

## apply(args) ⇒ <code>\*</code>
Function apply().

Do the actual command.

**Kind**: global function  

| Param | Type |
| --- | --- |
| args | <code>Object</code> | 

<a name="run"></a>

## run() ⇒ <code>\*</code>
Function run().

Run command with history & hooks.

**Kind**: global function  
<a name="onBeforeRun"></a>

## onBeforeRun(args)
Function onBeforeRun.

Called before run().

**Kind**: global function  

| Param | Type |
| --- | --- |
| args | <code>Object</code> | 

<a name="onAfterRun"></a>

## onAfterRun(args, result)
Function onAfterRun.

Called after run().

**Kind**: global function  

| Param | Type |
| --- | --- |
| args | <code>Object</code> | 
| result | <code>\*</code> | 

<a name="onBeforeApply"></a>

## onBeforeApply(args)
Function onBeforeApply.

Called before apply().

**Kind**: global function  

| Param | Type |
| --- | --- |
| args | <code>Object</code> | 

<a name="onAfterApply"></a>

## onAfterApply(args, result)
Function onAfterApply.

Called after apply().

**Kind**: global function  

| Param | Type |
| --- | --- |
| args | <code>Object</code> | 
| result | <code>\*</code> | 

<a name="onCatchApply"></a>

## onCatchApply(e)
Function onCatchApply.

Called after apply() failed.

**Kind**: global function  

| Param | Type |
| --- | --- |
| e | <code>Error</code> | 

### [Back to index](readme.md) 
