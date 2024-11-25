class ProGUIControlPanel {
    static Modes = [
        { "type": "Training", "icon": "users-three", "title": "On/Off Training \nRIGHT-CLICK for settings" },
        { "type": "Military", "icon": "sword", "title": "On/Off Military Researchs \nRIGHT-CLICK for settings" },
        { "type": "Eco", "icon": "axe", "title": "On/Off Eco Researchs \nRIGHT-CLICK for settings" },
        { "type": "Tribute", "icon": "exchange", "title": "On/Off Tribute Allies" },

        { "type": "Food", "icon": "food", "title": "Market price" },
        { "type": "Wood", "icon": "wood", "title": "Market price" },
        { "type": "Stone", "icon": "stone", "title": "Market price" },
        { "type": "Metal", "icon": "metal", "title": "Market price" },

        { "type": "Phase", "icon": "upgrade", "title": "PAUSE all until next phase" }
    ];

    constructor(forceRender) {

        const PREFIX = "ControlPanel";

        if (!g_IsObserver) {

            this.tabButtons = Engine.GetGUIObjectByName(`${PREFIX}TabButtons[0]`);
            this.tabs = this.tabButtons.children.map((tab, index) => new ProGUIControlPanelTab(tab, index, this));
            if (Engine.ConfigDB_GetValue("user", "boongui.barter.isEnabled") == "true")
                this.tabButtons.size = "100%-300 0 37 37";
            else
                this.tabButtons.size = "100%-135 0 37 37";

            this.forceRender = forceRender;
            this.isPaused = false;

            // initate selected tab, set with 4 to inverte Phase upgrade button
            this.tabs.forEach(tab => tab.update(-1, this.isPaused));
        }
    }
    toggleMode(modeIndex, endPause) {
        if (!g_IsObserver) {
            const mode = ProGUIControlPanel.Modes[modeIndex];
            if (!mode) return;
            let isModeToggled = Engine.GetGUIObjectByName(`ControlPanelTabButton[0][${modeIndex}]`).checked;
            if (!isModeToggled) {
                if (mode.type == "Phase") {
                    this.isPaused = false;
                }
            }
            else {
                if (mode.type == "Phase") {
                    this.isPaused = true;
                }
            }
            if (endPause == true) {
                this.isPaused = false;
                Engine.GetGUIObjectByName(`ControlPanelTabButton[0][8]`).checked = false;
            }
            this.tabs.forEach(tab => tab.update(modeIndex, this.isPaused));
            this.forceRender();
        }
    }
}