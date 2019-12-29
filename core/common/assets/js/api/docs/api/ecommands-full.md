## Functions

<dl>
<dt><a href="#getAll">getAll()</a> ⇒ <code>Array.&lt;string&gt;</code></dt>
<dd><p>Function getAll().</p>
<p>Receive all loaded commands.</p>
</dd>
<dt><a href="#register">register(component, command, callback)</a> ⇒ <code>Commands</code></dt>
<dd><p>Function register().</p>
<p>Register new command.</p>
</dd>
<dt><a href="#getComponent">getComponent(command)</a> ⇒ <code>BaseComponent</code></dt>
<dd><p>Function getComponent().</p>
<p>Receive Component of the command.</p>
</dd>
<dt><a href="#is">is(command)</a> ⇒ <code>boolean</code></dt>
<dd><p>Function is().</p>
<p>Checks if current running command is the same parameter command.</p>
</dd>
<dt><a href="#isCurrentFirstTrace">isCurrentFirstTrace(command)</a> ⇒ <code>boolean</code></dt>
<dd><p>Function isCurrentFirstTrace().</p>
<p>Checks if parameter command is the first command in trace that currently running.</p>
</dd>
<dt><a href="#getCurrent">getCurrent(container)</a> ⇒ <code>Object</code> | <code>boolean</code> | <code>*</code></dt>
<dd><p>Function getCurrent().</p>
<p>Receive currently running components and its commands.</p>
</dd>
<dt><a href="#getCurrentArgs">getCurrentArgs(container)</a> ⇒ <code>Object</code> | <code>boolean</code> | <code>*</code></dt>
<dd><p>Function getCurrentArgs().</p>
<p>Receive currently running command args.</p>
</dd>
<dt><a href="#getCurrentFirst">getCurrentFirst()</a> ⇒ <code>string</code></dt>
<dd><p>Function getCurrentFirst().</p>
<p>Receive first command that currently running.</p>
</dd>
<dt><a href="#getCurrentFirstTrace">getCurrentFirstTrace()</a> ⇒ <code>Object</code></dt>
<dd><p>Function getCurrentFirstTrace().</p>
<p>Receive first command in trace that currently running</p>
</dd>
<dt><a href="#beforeRun">beforeRun(command, args)</a> ⇒ <code>boolean</code></dt>
<dd><p>Function beforeRun().</p>
</dd>
<dt><a href="#run">run(command, args)</a> ⇒ <code>boolean</code> | <code>*</code></dt>
<dd><p>Function run().</p>
<p>Runs a command.</p>
</dd>
<dt><a href="#runShortcut">runShortcut(command, event)</a> ⇒ <code>boolean</code> | <code>*</code></dt>
<dd><p>Function runShortcut().</p>
<p>Run shortcut.</p>
<p>It&#39;s separated in order to allow override.</p>
</dd>
<dt><a href="#afterRun">afterRun(command)</a></dt>
<dd><p>Function afterRun().</p>
<p>Method fired before the command runs.</p>
</dd>
<dt><a href="#error">error(message)</a></dt>
<dd><p>Function error().</p>
<p>Throws error.</p>
</dd>
</dl>

<a name="getAll"></a>

## getAll() ⇒ <code>Array.&lt;string&gt;</code>
Function getAll().

Receive all loaded commands.

**Kind**: global function  
**Notice**: List of command available [here](method---ecommands-get-all.md)  
<a name="register"></a>

## register(component, command, callback) ⇒ <code>Commands</code>
Function register().

Register new command.

**Kind**: global function  

| Param | Type |
| --- | --- |
| component | <code>BaseComponent</code> \| <code>string</code> | 
| command | <code>string</code> | 
| callback | <code>function</code> | 

<a name="getComponent"></a>

## getComponent(command) ⇒ <code>BaseComponent</code>
Function getComponent().

Receive Component of the command.

**Kind**: global function  

| Param | Type |
| --- | --- |
| command | <code>string</code> | 

<a name="is"></a>

## is(command) ⇒ <code>boolean</code>
Function is().

Checks if current running command is the same parameter command.

**Kind**: global function  

| Param | Type |
| --- | --- |
| command | <code>string</code> | 

<a name="isCurrentFirstTrace"></a>

## isCurrentFirstTrace(command) ⇒ <code>boolean</code>
Function isCurrentFirstTrace().

Checks if parameter command is the first command in trace that currently running.

**Kind**: global function  

| Param | Type |
| --- | --- |
| command | <code>string</code> | 

<a name="getCurrent"></a>

## getCurrent(container) ⇒ <code>Object</code> \| <code>boolean</code> \| <code>\*</code>
Function getCurrent().

Receive currently running components and its commands.

**Kind**: global function  

| Param | Type |
| --- | --- |
| container | <code>string</code> | 

<a name="getCurrentArgs"></a>

## getCurrentArgs(container) ⇒ <code>Object</code> \| <code>boolean</code> \| <code>\*</code>
Function getCurrentArgs().

Receive currently running command args.

**Kind**: global function  

| Param | Type |
| --- | --- |
| container | <code>string</code> | 

<a name="getCurrentFirst"></a>

## getCurrentFirst() ⇒ <code>string</code>
Function getCurrentFirst().

Receive first command that currently running.

**Kind**: global function  
<a name="getCurrentFirstTrace"></a>

## getCurrentFirstTrace() ⇒ <code>Object</code>
Function getCurrentFirstTrace().

Receive first command in trace that currently running

**Kind**: global function  
<a name="beforeRun"></a>

## beforeRun(command, args) ⇒ <code>boolean</code>
Function beforeRun().

**Kind**: global function  
**Returns**: <code>boolean</code> - dependency result  

| Param | Type |
| --- | --- |
| command | <code>string</code> | 
| args |  | 

<a name="run"></a>

## run(command, args) ⇒ <code>boolean</code> \| <code>\*</code>
Function run().

Runs a command.

**Kind**: global function  
**Returns**: <code>boolean</code> \| <code>\*</code> - results  

| Param | Type |
| --- | --- |
| command | <code>string</code> | 
| args | <code>Object</code> | 

<a name="runShortcut"></a>

## runShortcut(command, event) ⇒ <code>boolean</code> \| <code>\*</code>
Function runShortcut().

Run shortcut.

It's separated in order to allow override.

**Kind**: global function  

| Param | Type |
| --- | --- |
| command | <code>string</code> | 
| event | <code>\*</code> | 

<a name="afterRun"></a>

## afterRun(command)
Function afterRun().

Method fired before the command runs.

**Kind**: global function  

| Param | Type |
| --- | --- |
| command | <code>string</code> | 

<a name="error"></a>

## error(message)
Function error().

Throws error.

**Kind**: global function  
**Throw**: <code>Error</code>  

| Param | Type |
| --- | --- |
| message | <code>string</code> | 

### [Back](ecommands.md) 
