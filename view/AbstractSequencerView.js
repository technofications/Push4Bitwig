// Written by Jürgen Moßgraber - mossgrabers.de
// (c) 2014
// Licensed under GPLv3 - http://www.gnu.org/licenses/gpl.html

function AbstractSequencerView (model, rows, cols)
{
    if (!model) // Called on first prototype creation
        return;
        
    BaseView.call (this, model);

    this.resolutions = [ 1, 2/3, 1/2, 1/3, 1/4, 1/6, 1/8, 1/12 ];
    this.selectedIndex = 4;
    this.scales = this.model.getScales ();

    this.offsetX = 0;
    this.offsetY = 0;

    this.clip = this.model.createCursorClip (cols, rows);
    this.clip.setStepLength (this.resolutions[this.selectedIndex]);
}
AbstractSequencerView.prototype = new BaseView ();

AbstractSequencerView.prototype.onActivate = function ()
{
    BaseView.prototype.onActivate.call (this);

    this.surface.setButton (PUSH_BUTTON_NOTE, PUSH_BUTTON_STATE_HI);
    this.surface.setButton (PUSH_BUTTON_SESSION, PUSH_BUTTON_STATE_ON);
    this.surface.setButton (PUSH_BUTTON_ACCENT, Config.accentActive ? PUSH_BUTTON_STATE_HI : PUSH_BUTTON_STATE_ON);
    this.model.getTrackBank ().setIndication (false);
    this.drawSceneButtons ();
};

AbstractSequencerView.prototype.scrollLeft = function (event)
{
    var newOffset = this.offsetX - this.clip.getStepSize ();
    if (newOffset < 0)
        this.offsetX = 0;
    else
    {
        this.offsetX = newOffset;
        this.clip.scrollStepsPageBackwards ();
    }
};

AbstractSequencerView.prototype.scrollRight = function (event)
{
    this.offsetX = this.offsetX + this.clip.getStepSize ();
    this.clip.scrollStepsPageForward ();
};

AbstractSequencerView.prototype.isInXRange = function (x)
{
    return x >= this.offsetX && x < this.offsetX + this.clip.getStepSize ();
};

AbstractSequencerView.prototype.onScene = function (index)
{
    this.selectedIndex = 7 - index;
    this.clip.setStepLength (this.resolutions[this.selectedIndex]);
    this.drawSceneButtons ();
};

AbstractSequencerView.prototype.drawSceneButtons = function ()
{
    var t = this.model.getTrackBank ().getSelectedTrack ();
    var isKeyboardEnabled = t != null && t.canHoldNotes;
    if (!isKeyboardEnabled)
    {
        for (var i = PUSH_BUTTON_SCENE1; i <= PUSH_BUTTON_SCENE8; i++)
            this.surface.setButton (i, PUSH_BUTTON_STATE_OFF);
        return;
    }

    for (var i = PUSH_BUTTON_SCENE1; i <= PUSH_BUTTON_SCENE8; i++)
        this.surface.setButton (i, i == PUSH_BUTTON_SCENE1 + this.selectedIndex ? PUSH_COLOR_SCENE_YELLOW : PUSH_COLOR_SCENE_GREEN);
};

AbstractSequencerView.prototype.isInXRange = function (x)
{
    return x >= this.offsetX && x < this.offsetX + this.clip.getStepSize ();
};
