/**
 * @fileoverview General-purpose key frame animation
 * @author Tony Parisi
 */
goog.provide('SB.Interpolator');
goog.require('SB.PubSub');

//Interpolator class
//Construction/initialization
SB.Interpolator = function(param) 
{
	SB.PubSub.call(param);
	    		
	param = param || {};
	
	this.keys = param.keys || [];
	this.values = param.values || [];
	this.target = param.target ? param.target : null;
	this.running = false;
}

goog.inherits(SB.Interpolator, SB.PubSub);
	
SB.Interpolator.prototype.realize = function()
{
	if (this.keys && this.values)
	{
		this.setValue(this.keys, this.values);
	}	    		
}

SB.Interpolator.prototype.setValue = function(keys, values)
{
	this.keys = [];
	this.values = [];
	if (keys && keys.length && values && values.length)
	{
		this.copyKeys(keys, this.keys);
		this.copyValues(values, this.values);
	}
}

//Copying helper functions
SB.Interpolator.prototype.copyKeys = function(from, to)
{
	var i = 0, len = from.length;
	for (i = 0; i < len; i++)
	{
		to[i] = from[i];
	}
}

SB.Interpolator.prototype.copyValues = function(from, to)
{
	var i = 0, len = from.length;
	for (i = 0; i < len; i++)
	{
		var val = {};
		this.copyValue(from[i], val);
		to[i] = val;
	}
}

SB.Interpolator.prototype.copyValue = function(from, to)
{
	for ( var property in from ) {
		
		if ( from[ property ] === null ) {		
		continue;		
		}

		to[ property ] = from[ property ];
	}
}

//Interpolation and tweening methods
SB.Interpolator.prototype.interp = function(fract)
{
	var value;
	var i, len = this.keys.length;
	if (fract == this.keys[0])
	{
		value = this.values[0];
	}
	else if (fract >= this.keys[len - 1])
	{
		value = this.values[len - 1];
	}

	for (i = 0; i < len - 1; i++)
	{
		var key1 = this.keys[i];
		var key2 = this.keys[i + 1];

		if (fract >= key1 && fract <= key2)
		{
			var val1 = this.values[i];
			var val2 = this.values[i + 1];
			value = this.tween(val1, val2, (fract - key1) / (key2 - key1));
		}
	}
	
	if (this.target)
	{
		this.copyValue(value, this.target);
	}
	else
	{
		this.publish("value", value);
	}
}

SB.Interpolator.prototype.tween = function(from, to, fract)
{
	var value = {};
	for ( var property in from ) {
		
		if ( from[ property ] === null ) {		
		continue;		
		}

		var range = to[property] - from[property];
		var delta = range * fract;
		value[ property ] = from[ property ] + delta;
	}
	
	return value;
}
