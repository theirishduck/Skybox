SB.Examples.Monster = function(param)
{
	SB.Entity.call(this, param);
	
	this.transform = new SB.Transform();
	this.model = new SB.Model.loadModel('./monster.dae');
	this.model.scale.x = this.model.scale.y = this.model.scale.z = 0.002;
	this.model.rotation.x = -Math.PI/2;
	this.picker = new SB.Picker();
	this.rotator = new SB.Rotator();
	this.dragger = new SB.Dragger();
	this.zoomer = new SB.Zoomer();
	this.mover = new SB.KeyFrame({ loop : false, easeOut : true });
	this.spinner = new SB.KeyFrame({ loop : true, easeOut : false });
	this.timer = new SB.Timer( { duration : 3333 } );
	this.screenTracker = new SB.ScreenTracker( { referencePosition : new THREE.Vector3(0, 3.667, 0) });
	
	this.addComponent(this.transform);
	this.addComponent(this.model);
	this.addComponent(this.picker);
	this.addComponent(this.rotator);
	this.addComponent(this.dragger);
	this.addComponent(this.zoomer);
	this.addComponent(this.spinner);
	this.addComponent(this.mover);
	this.addComponent(this.timer);
	this.addComponent(this.screenTracker);

	this.dragger.subscribe("move", this, this.onDraggerMove);
	this.rotator.subscribe("rotate", this, this.onRotatorRotate);
	this.zoomer.subscribe("scale", this, this.onZoomerScale);
	this.spinner.subscribe("value", this, this.onSpinnerValue);
	this.mover.subscribe("value", this, this.onMoverValue);
	
	this.picker.subscribe("mouseOver", this, this.onMouseOver);
	this.picker.subscribe("mouseOut", this, this.onMouseOut);
	this.picker.subscribe("mouseMove", this, this.onMouseMove);
	this.picker.subscribe("mouseDown", this, this.onMouseDown);
	this.picker.subscribe("mouseUp", this, this.onMouseUp);
	this.picker.subscribe("mouseScroll", this, this.onMouseScroll);
	
	this.timer.subscribe("time", this, this.onTimeChanged);
	this.timer.subscribe("fraction", this, this.onTimeFractionChanged);
	
	this.screenTracker.subscribe("position", this, this.onScreenPositionChanged);
	
	this.dragging = true;
	this.rotating = true;
	this.whichKeyDown = 0;
	this.turnFraction = 0;
	
	this.savedColor = null;
	
	this.monsterID = SB.Examples.Monster.monsterID++;
	this.annotation = new SB.Annotation( { style : "text300" } );
	this.annotation.setHTML("@Monster_" + (this.monsterID + 1));
	this.annotation.show();
}

goog.inherits(SB.Examples.Monster, SB.Entity);

SB.Examples.Monster.prototype.realize = function() 
{
	SB.Entity.prototype.realize.call(this);
	this.screenTracker.start();
}

SB.Examples.Monster.prototype.onMouseOver = function(x, y)
{
}

SB.Examples.Monster.prototype.onMouseOut = function(x, y)
{
}
	        
SB.Examples.Monster.prototype.onMouseMove = function(x, y)
{
	if (this.dragging)
	{
		this.dragger.set(x, y);
	}
	
	if (this.rotating)
	{
		this.rotator.set(x, y);
	}
}

SB.Examples.Monster.prototype.onMouseDown = function(x, y)
{
	this.spinner.stop();
	this.lastrotate = 0;
	this.lastdx = this.lastdy = 0;
	
	if (this.dragging)
	{
		this.dragger.start(x, y);
	}
	
	if (this.rotating)
	{
		this.rotator.start(x, y);
	}
	
}

SB.Examples.Monster.prototype.onMouseUp = function(x, y)
{
	if (this.dragging)
	{
		this.dragger.stop(x, y);
	}
	
	if (this.rotating)
	{
		this.rotator.stop(x, y);
	}
	
	if (this.lastdx || this.lastdy)
	{
		// set up a key frame starting at current rotatin and going around
		// bigger drag means faster spin
		var dx = this.lastdx;
		var dy  = this.lastdy;
		this.mover.setValue([0, 1],
				[{x: this.transform.position.x, y: this.transform.position.y },
				 {x: this.transform.position.x + dx * 10, 
					y: this.transform.position.y + dy * 10}
				 ]);
		this.mover.duration = SB.Examples.Monster.moveTime;
		this.mover.start();
	}
	
	if (this.lastrotate)
	{
		// set up a key frame starting at current rotatin and going around
		// bigger drag means faster spin
		var dy1 = this.lastrotate > 0 ? Math.PI : -Math.PI;
		var dy2  = dy1 * 2;
		this.spinner.setValue([0, .5, 1],
				[{y: this.transform.rotation.y },
				 {y: this.transform.rotation.y + dy1},
				 {y: this.transform.rotation.y + dy2},
				 ]);
		this.spinner.duration = SB.Examples.Monster.spinTime / Math.abs(this.lastrotate);
		this.spinner.start();
		                                   
	}

	if (!this.lastdx && !this.lastdy)
	{
		this.model.animate(!this.model.animating);
	}
}

SB.Examples.Monster.prototype.onMouseScroll = function(delta)
{
	var zoomFactor = SB.Examples.Monster.zoomFactor;
	
	this.zoomer.zoom(delta > 0 ? zoomFactor : 1 / zoomFactor);
}	        

SB.Examples.Monster.prototype.onDraggerMove  = function(dx, dy)
{
	dx *= .01;
	dy *= .01;
	
	this.transform.position.x += dx;
	this.transform.position.y += dy;
	
	if (dx)
		this.lastdx = dx;
	if (dy)
		this.lastdy = dy;
}

SB.Examples.Monster.prototype.onRotatorRotate  = function(axis, delta)
{
	this.transform.rotation[axis] += delta;
	if (delta != 0)
		this.lastrotate = delta;
}

SB.Examples.Monster.prototype.onZoomerScale  = function(x, y, z)
{
	this.transform.scale.x = x;
	this.transform.scale.y = y;
	this.transform.scale.z = z;
}

SB.Examples.Monster.prototype.onSpinnerValue  = function(value)
{
	this.transform.rotation.y = value.y;
}

SB.Examples.Monster.prototype.onMoverValue = function(value)
{
	this.transform.position.x = value.x;
	this.transform.position.y = value.y;
}

SB.Examples.Monster.prototype.onTimeChanged = function(t)
{
	switch (this.whichKeyDown)
	{
    	case SB.Keyboard.KEY_LEFT : 
			this.turn(+1);
    		break;
    	case SB.Keyboard.KEY_UP : 
			this.move(-1);
    		break;
    	case SB.Keyboard.KEY_RIGHT : 
    		this.turn(-1);
    		break;
    	case SB.Keyboard.KEY_DOWN : 
    			this.move(+1);
    		break;
	}
}

SB.Examples.Monster.prototype.onTimeFractionChanged = function(fraction)
{
	this.turnFraction = fraction;
}

SB.Examples.Monster.prototype.onKeyDown = function(keyCode, charCode)
{
	this.whichKeyDown = keyCode;
}

SB.Examples.Monster.prototype.onKeyUp = function(keyCode, charCode)
{
	this.whichKeyDown = 0;
	this.turnFraction = 0;
}

SB.Examples.Monster.prototype.setActive = function(active)
{
	this.model.animate(active);
	this.active = active;
	if (this.active)
	{
		this.timer.start();
	}
	else
	{
		this.timer.stop();
	}
}

SB.Examples.Monster.prototype.move = function(direction)
{
	var delta = direction * .1666;
	var dir = new THREE.Vector3(0, 0, delta);
	var matrix = new THREE.Matrix4();
	matrix.setRotationY(this.transform.rotation.y - Math.PI / 2);
	dir = matrix.multiplyVector3(dir);
	this.transform.position.addSelf(dir);
}

SB.Examples.Monster.prototype.turn = function(direction)
{
	var delta = direction * .0333;
	this.transform.rotation.y += delta;
//	var delta = direction * this.turnFraction * (Math.PI * 2); // .0333;
//	this.transform.rotation.y = delta; // += delta;
}

SB.Examples.Monster.prototype.onScreenPositionChanged = function(pos)
{
	this.annotation.setPosition(pos);
}

SB.Examples.Monster.highlightColor = 0xcc00cc;
SB.Examples.Monster.zoomFactor = 1.1666;
SB.Examples.Monster.spinTime = 1000;
SB.Examples.Monster.moveTime = 1000;
SB.Examples.Monster.monsterID = 0;
