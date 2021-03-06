
goog.require('SB.Prefabs');

SB.Prefabs.FPSController = function(param)
{
	param = param || {};
	
	var controller = new SB.Entity(param);
	var transform = new SB.Transform;
	controller.addComponent(transform);
	controller.transform.position.set(0, 0, 5);
	var controllerScript = new SB.FPSControllerScript;
	controller.addComponent(controllerScript);

	var dragger = new SB.Dragger();
	var rotator = new SB.Rotator();
	var timer = new SB.Timer( { duration : 3333 } );
	
	controller.addComponent(dragger);
	controller.addComponent(rotator);
	controller.addComponent(timer);

	dragger.subscribe("move", controllerScript, controllerScript.onDraggerMove);
	rotator.subscribe("rotate", controllerScript, controllerScript.onRotatorRotate);
	timer.subscribe("time", controllerScript, controllerScript.onTimeChanged);
	timer.subscribe("fraction", controllerScript, controllerScript.onTimeFractionChanged);	
	
	var viewpoint = new SB.Entity;
	var transform = new SB.Transform;
	var camera = new SB.PerspectiveCamera({active:param.active, fov: param.fov, position:param.cameraPosition});
	viewpoint.addComponent(transform);
	viewpoint.addComponent(camera);
	viewpoint.transform = transform;
	viewpoint.camera = camera;

	controller.addChild(viewpoint);

	var intensity = param.headlight ? 1 : 0;
	
	var headlight = new SB.DirectionalLight({ intensity : intensity });
	controller.addComponent(headlight);
	
	return controller;
}

goog.provide('SB.FPSControllerScript');
goog.require('SB.Component');

SB.FPSControllerScript = function(param)
{
	SB.Component.call(this, param);

	this.directionMatrix = new THREE.Matrix4;
	this.moveDir = new THREE.Vector3;
	this.turnDir = new THREE.Vector3;
	this.lookDir = new THREE.Vector3;
	
	this.lastdy = 0;
	this.dragging = false;
	this.walkSpeed = 1;
	this.turnSpeed = 1;
}

goog.inherits(SB.FPSControllerScript, SB.Component);

SB.FPSControllerScript.prototype.realize = function()
{
	this.dragger = this._entity.getComponent(SB.Dragger);
	this.rotator = this._entity.getComponent(SB.Rotator);
	this.timer = this._entity.getComponent(SB.Timer);
	this.headlight = this._entity.getComponent(SB.DirectionalLight);
	this.viewpoint = this._entity.getChild(0);
	
	SB.Game.instance.mouseDelegate = this;
	SB.Game.instance.keyboardDelegate = this;
}

SB.FPSControllerScript.prototype.move = function(dir)
{
	this.directionMatrix.identity();
	this.directionMatrix.setRotationFromEuler(this._entity.transform.rotation);
	dir = dir.applyMatrix4(this.directionMatrix);
	this._entity.transform.position.add(dir);
}

SB.FPSControllerScript.prototype.turn = function(dir)
{
	this._entity.transform.rotation.add(dir);
}

SB.FPSControllerScript.prototype.mouseLook = function(dir)
{
	this.viewpoint.transform.rotation.add(dir);
}

SB.FPSControllerScript.prototype.setCameraTilt = function(dir)
{
	if (this.viewpoint && this.viewpoint.transform)
	{
		this.viewpoint.transform.rotation.copy(dir);
	}
}

SB.FPSControllerScript.prototype.setCameraTurn = function(dir)
{
	if (this._entity && this._entity.transform)
	{
		this._entity.transform.rotation.copy(dir);
	}
}

SB.FPSControllerScript.prototype.onMouseMove = function(x, y)
{
	this.dragger.set(x, y);
	this.rotator.set(x, y);
}

SB.FPSControllerScript.prototype.onMouseDown = function(x, y)
{
	this.dragger.start(x, y);
	this.rotator.start(x, y);
	this.dragging = true;
}

SB.FPSControllerScript.prototype.onMouseUp = function(x, y)
{
	this.dragger.stop(x, y);
	this.rotator.stop(x, y);
	this.dragging = false;
	this.lastdy = 0;
}

SB.FPSControllerScript.prototype.onMouseScroll = function(delta)
{
	this.moveDir.set(0, 0, -delta);
	this.move(this.moveDir);
}

SB.FPSControllerScript.prototype.onKeyDown = function(keyCode, charCode)
{
	this.whichKeyDown = keyCode;
	
	this.timer.start();
}

SB.FPSControllerScript.prototype.onKeyUp = function(keyCode, charCode)
{
	this.lastdy = 0;
	this.whichKeyDown = 0;
	this.turnFraction = 0;
	
	this.timer.stop();
}

SB.FPSControllerScript.prototype.onKeyPress = function(keyCode, charCode)
{
}


SB.FPSControllerScript.prototype.onRotatorRotate = function(axis, delta)
{
	return; // this don' work yet
	
	delta *= .666;
	
	if (delta != 0)
	{
		// this.controllerScript.transform.rotation.y -= delta;
		this.lookDir.set(0, -delta, 0);
		this.mouseLook(this.lookDir);
	}
}

SB.FPSControllerScript.prototype.onDraggerMove = function(dx, dy)
{
	if (Math.abs(dy) <= 2)
		dy = 0;
	
	dy *= .002;
	
	if (dy)
	{
		this.lastdy = dy;
	}
	else if (this.lastdy && this.dragging)
	{
		dy = this.lastdy;
	}

	if (dy != 0)
	{
		// this.controllerScript.transform.position.z -= dy;
		this.lookDir.set(dy, 0, 0);
		this.mouseLook(this.lookDir);
	}	
}

SB.FPSControllerScript.prototype.onTimeChanged = function(t)
{
	var turnfraction = .0416;
	var movefraction = .1666;
	var turnamount = 0;
	var moveamount = 0;
	var handled = false;
	
	switch (this.whichKeyDown)
	{
    	case SB.Keyboard.KEY_LEFT : 
    		turnamount = +1 * turnfraction * this.turnSpeed;
			handled = true;
    		break;
    	case SB.Keyboard.KEY_UP : 
    		moveamount = -1 * movefraction * this.walkSpeed;
			handled = true;
    		break;
    	case SB.Keyboard.KEY_RIGHT : 
    		turnamount = -1 * turnfraction * this.turnSpeed;
			handled = true;
    		break;
    	case SB.Keyboard.KEY_DOWN : 
    		moveamount = +1 * movefraction * this.walkSpeed;
			handled = true;
    		break;
	}

	if (!handled)
	{
		switch (String.fromCharCode(this.whichKeyDown))
		{
	    	case 'A' :
	    		turnamount = +1 * turnfraction * this.turnSpeed;
	    		handled = true;
	    		break;
	    		
	    	case 'W' :
	    		moveamount = -1 * movefraction * this.walkSpeed;
	    		handled = true;
	    		break;
	    	case 'D' :
	    		turnamount = -1 * turnfraction * this.turnSpeed;
				handled = true;
	    		break;
	    	case 'S' :
	    		moveamount = +1 * movefraction * this.walkSpeed;
				handled = true;
	    		break;
	    		
	    	default : 
	    		break;
		}
	}

	if (moveamount)
	{
		this.moveDir.set(0, 0, moveamount);
		this.move(this.moveDir);
	}
	
	if (turnamount)
	{
		this.turnDir.set(0, turnamount, 0);
		this.turn(this.turnDir);
	}
}

SB.FPSControllerScript.prototype.onTimeFractionChanged = function(fraction)
{
	this.turnFraction = fraction;
}

