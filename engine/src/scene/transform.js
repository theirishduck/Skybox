/**
 *
 */
goog.provide('SB.Transform');
goog.require('SB.Component');

SB.Transform = function(param)
{
	param = param || {};
	
    SB.Component.call(this);
    
    this.position = new THREE.Vector3();
    this.rotation = new THREE.Vector3();
    this.scale = new THREE.Vector3(1, 1, 1);
    this.orientation = new THREE.Quaternion;
    this.useQuaternion = false;
    this.layer = param.layer;
} ;

goog.inherits(SB.Transform, SB.Component);

SB.Transform.prototype.realize = function()
{
	this.object = new THREE.Object3D();
	this.addToScene();

	SB.Component.prototype.realize.call(this);
}

SB.Transform.prototype.update = function()
{
    this.object.position.x = this.position.x;
    this.object.position.y = this.position.y;
    this.object.position.z = this.position.z;
    this.object.rotation.x = this.rotation.x;
    this.object.rotation.y = this.rotation.y;
    this.object.rotation.z = this.rotation.z;
    this.object.scale.x = this.scale.x;
    this.object.scale.y = this.scale.y;
    this.object.scale.z = this.scale.z;
    if (this.useQuaternion)
    {
    	this.object.quaternion.copy(this.orientation);
    	this.object.useQuaternion = true;
    }
}

SB.Transform.prototype.addToScene = function() {
	var scene = this.layer ? this.layer.scene : SB.Graphics.instance.scene;
	if (this._entity)
	{
		var parent = (this._entity._parent && this._entity._parent.transform) ? this._entity._parent.transform.object : scene;
		if (parent)
		{
		    parent.add(this.object);
		    this.object.data = this; // backpointer for picking and such
		}
		else
		{
			// N.B.: throw something?
		}
	}
	else
	{
		// N.B.: throw something?
	}
}

SB.Transform.prototype.removeFromScene = function() {
	var scene = this.layer ? this.layer.scene : SB.Graphics.instance.scene;
	if (this._entity)
	{
		var parent = (this._entity._parent && this._entity._parent.transform) ? this._entity._parent.transform.object : scene;
		if (parent)
		{
			this.object.data = null;
		    parent.remove(this.object);
		}
		else
		{
			// N.B.: throw something?
		}
	}
	else
	{
		// N.B.: throw something?
	}
}
