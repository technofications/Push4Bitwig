// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under GPLv3 - http://www.gnu.org/licenses/gpl.html

function MasterTrackProxy (push)
{
	this.push = push;

	this.masterTrack = host.createMasterTrack (0);

	this.name = null;
	this.vu = null;
	this.mute = null;
	this.solo = null;
	this.recarm = null;
	this.pan = null;
	this.panStr = null;
	this.volume = null;
	this.volumeStr = null;

	this.selected = false;

	// Master Track name
	this.masterTrack.addNameObserver (8, '', doObject (this, function (name)
	{
		this.name = name;
	}));
	// Master Track selection
	this.masterTrack.addIsSelectedObserver (doObject (this, function (isSelected)
	{
		this.selected = isSelected;
		this.push.setPendingMode (isSelected ? MODE_MASTER : this.push.getPreviousMode ());
	}));
	this.masterTrack.addVuMeterObserver (128, -1, true, doObject (this, function (value)
	{
		this.vu = value;
	}));

	// Master Track Mute
	this.masterTrack.getMute ().addValueObserver (doObject (this, function (isMuted)
	{
		this.mute = isMuted;
	}));
	// Master Track Solo
	this.masterTrack.getSolo ().addValueObserver (doObject (this, function (isSoloed)
	{
		this.solo = isSoloed;
	}));
	// Master Track Arm
	this.masterTrack.getArm ().addValueObserver (doObject (this, function (isArmed)
	{
		this.recarm = isArmed;
	}));

	// Master Track Pan value & text
	var p = this.masterTrack.getPan ();
	p.addValueObserver (128, doObject (this, function (value)
	{
		this.pan = value;
	}));
	p.addValueDisplayObserver (8, '', doObject (this, function (text)
	{
		this.panStr = text;
	}));

	// Master Track volume value & text
	var v = this.masterTrack.getVolume ();
	v.addValueObserver (128, doObject (this, function (value)
	{
		this.volume = value;
	}));
	v.addValueDisplayObserver (8, '', doObject (this, function (text)
	{
		this.volumeStr = text;
	}));
}

//--------------------------------------
// Properties
//--------------------------------------

MasterTrackProxy.prototype.isSelected = function () { return this.selected; };
MasterTrackProxy.prototype.getName = function () { return this.name; };
MasterTrackProxy.prototype.getVU = function () { return this.vu; };
MasterTrackProxy.prototype.isMute = function () { return this.mute; };
MasterTrackProxy.prototype.isSolo = function () { return this.solo; };
MasterTrackProxy.prototype.getRecArm = function () { return this.recarm; };
MasterTrackProxy.prototype.getPan = function () { return this.pan; };
MasterTrackProxy.prototype.getPanString = function () { return this.panStr; };
MasterTrackProxy.prototype.getVolume = function () { return this.volume; };
MasterTrackProxy.prototype.getVolumeString = function () { return this.volumeStr; };

MasterTrackProxy.prototype.setVolume = function (value)
{
	this.volume = this.changeValue (value, this.volume);
	this.masterTrack.getVolume ().set (this.volume, 128);
};

MasterTrackProxy.prototype.setPan = function (value)
{
	this.pan = this.changeValue (value, this.pan);
	this.masterTrack.getPan ().set (this.pan, 128);
};

//--------------------------------------
// Actions
//--------------------------------------

MasterTrackProxy.prototype.incVolume = function (value)
{
	this.masterTrack.getVolume ().inc (value <= 61 ? 1 : -1, 128);
};

MasterTrackProxy.prototype.updateIndications = function (isOurMode)
{
	this.masterTrack.getVolume ().setIndication (isOurMode);
	this.masterTrack.getPan ().setIndication (isOurMode);
};

MasterTrackProxy.prototype.select = function ()
{
	this.masterTrack.select ();
};

MasterTrackProxy.prototype.changeValue = function (control, value)
{
	return control <= 61 ? Math.min (value + BaseMode.INC_FRACTION_VALUE, 127) : Math.max (value - BaseMode.INC_FRACTION_VALUE, 0);
};