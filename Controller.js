// Written by J�rgen Mo�graber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under GPLv3 - http://www.gnu.org/licenses/gpl.html

function Controller ()
{
	var output = new MidiOutput ();
	var input = new MidiInput ();

	this.model = new Model ();
    this.model.getTrackBank ().addTrackSelectionListener (doObject (this, function (index, isSelected)
    {
        if (isSelected && this.push.isActiveMode (MODE_MASTER))
            this.push.setPendingMode (MODE_TRACK);
        if (this.push.isActiveView (VIEW_PLAY))
            this.push.getActiveView ().updateNoteMapping ();
    }));
    this.model.getMasterTrack ().addTrackSelectionListener (doObject (this, function (isSelected)
    {
		this.push.setPendingMode (isSelected ? MODE_MASTER : this.push.getPreviousMode ());
    }));
    
	this.push = new Push (output, input);
    this.push.setDefaultMode (MODE_TRACK);

	this.push.addMode (MODE_VOLUME, new VolumeMode (this.model));
	this.push.addMode (MODE_PAN, new PanMode (this.model));
	var modeSend = new SendMode (this.model);
	this.push.addMode (MODE_SEND1, modeSend);
	this.push.addMode (MODE_SEND2, modeSend);
	this.push.addMode (MODE_SEND3, modeSend);
	this.push.addMode (MODE_SEND4, modeSend);
	this.push.addMode (MODE_SEND5, modeSend);
	this.push.addMode (MODE_SEND6, modeSend);
	this.push.addMode (MODE_MASTER, new MasterMode (this.model));
	this.push.addMode (MODE_TRACK, new TrackMode (this.model));
	this.push.addMode (MODE_FRAME, new FrameMode (this.model));
	this.push.addMode (MODE_SCALES, new ScalesMode (this.model));
	this.push.addMode (MODE_SCALE_LAYOUT, new ScaleLayoutMode (this.model));
	this.push.addMode (MODE_ACCENT, new AccentMode (this.model));
	this.push.addMode (MODE_FIXED, new FixedMode (this.model));
	this.push.addMode (MODE_GROOVE, new GrooveMode (this.model));

	this.push.addMode (MODE_PARAM_PAGE_SELECT, new ParamPageSelectMode (this.model));
	this.push.addMode (MODE_BANK_DEVICE, new DeviceMode (this.model));
	this.push.addMode (MODE_BANK_COMMON, new ParamPageMode (this.model, MODE_BANK_COMMON, 'Common'));
	this.push.addMode (MODE_BANK_ENVELOPE, new ParamPageMode (this.model, MODE_BANK_ENVELOPE, 'Envelope'));
	this.push.addMode (MODE_BANK_MODULATE, new ParamPageMode (this.model, MODE_BANK_MODULATE, 'Modulate'));
	this.push.addMode (MODE_BANK_USER, new ParamPageMode (this.model, MODE_BANK_USER, 'User'));
	this.push.addMode (MODE_BANK_MACRO, new ParamPageMode (this.model, MODE_BANK_MACRO, 'Macro'));
	this.push.addMode (MODE_PRESET, new PresetMode (this.model));
    
    this.push.addModeListener (doObject (this, function (oldMode, newMode)
    {
        this.updateMode (-1);
        this.updateMode (newMode);
    }));
    
	this.push.addView (VIEW_PLAY, new PlayView (this.model));
	this.push.addView (VIEW_SESSION, new SessionView (this.model));
	this.push.addView (VIEW_SEQUENCER, new SequencerView (this.model));
	this.push.addView (VIEW_DRUM, new DrumView (this.model));
    
	this.push.setActiveView (VIEW_PLAY);
	this.push.setActiveMode (MODE_TRACK);
}

Controller.prototype.shutdown = function ()
{
	this.push.turnOff ();
};

Controller.prototype.flush = function ()
{
	this.push.flush ();
    
    var t = this.model.getTransport ();
    this.push.setButton (PUSH_BUTTON_CLICK, t.isClickOn ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_ON);
    this.push.setButton (PUSH_BUTTON_PLAY, t.isPlaying ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_ON);
    this.push.setButton (PUSH_BUTTON_RECORD, t.isRecording ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_ON);
    
	// Send, Mute, Automation
	var track = this.model.getTrackBank ().getSelectedTrack ();
	if (track == null)
	{
		this.push.setButton (PUSH_BUTTON_MUTE, PUSH_BUTTON_STATE_OFF);
		this.push.setButton (PUSH_BUTTON_SOLO, PUSH_BUTTON_STATE_OFF);
		this.push.setButton (PUSH_BUTTON_AUTOMATION, PUSH_BUTTON_STATE_OFF);
	}
	else
	{
		this.push.setButton (PUSH_BUTTON_MUTE, track.mute ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_ON);
		this.push.setButton (PUSH_BUTTON_SOLO, track.solo ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_ON);
		this.push.setButton (PUSH_BUTTON_AUTOMATION, track.autowrite ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_ON);
	}
};

Controller.prototype.updateMode = function (mode)
{
	var isMaster       = mode == MODE_MASTER;
	var isTrack        = mode == MODE_TRACK;
	var isVolume       = mode == MODE_VOLUME;
	var isPan          = mode == MODE_PAN;
	var isScales       = mode == MODE_SCALES;
	var isFixed        = mode == MODE_FIXED;
	var isPreset       = mode == MODE_PRESET;
	var isFrame        = mode == MODE_FRAME;
	var isGroove       = mode == MODE_GROOVE;

	var isBankDevice   = mode == MODE_BANK_DEVICE;
	var isBankCommon   = mode == MODE_BANK_COMMON;
	var isBankEnvelope = mode == MODE_BANK_ENVELOPE;
	var isBankUser     = mode == MODE_BANK_USER;
	var isBankMacro    = mode == MODE_BANK_MACRO;

	this.model.updateIndication (mode);

	this.push.setButton (PUSH_BUTTON_MASTER, isMaster || isFrame ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_ON);
	this.push.setButton (PUSH_BUTTON_TRACK, isTrack ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_ON);
	this.push.setButton (PUSH_BUTTON_VOLUME, isVolume ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_ON);
	this.push.setButton (PUSH_BUTTON_PAN_SEND, mode >= MODE_PAN && mode <= MODE_SEND6 ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_ON);
	this.push.setButton (PUSH_BUTTON_DEVICE, isBankDevice || isBankMacro ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_ON);
	this.push.setButton (PUSH_BUTTON_SCALES, isScales ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_ON);
	this.push.setButton (PUSH_BUTTON_FIXED_LENGTH, isFixed ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_ON);
	this.push.setButton (PUSH_BUTTON_BROWSE, isPreset ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_ON);
};