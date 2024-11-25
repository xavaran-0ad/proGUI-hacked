class ProGUIReservePanel {
    static Modes = [
        { "type": "Food", "icon": "food", "title": "CLICK: Yes/No food reserve. \nMOUSEWHEEL: change reserve levels" },
        { "type": "Wood", "icon": "wood", "title": "CLICK: Yes/No food reserve. \nMOUSEWHEEL: change reserve levels" },
        { "type": "Stone", "icon": "stone", "title": "CLICK: Yes/No stone reserve. \nMOUSEWHEEL: change reserve levels" },
        { "type": "Metal", "icon": "metal", "title": "CLICK: Yes/No metal reserve. \nMOUSEWHEEL: change reserve levels" },
        { "type": "Population", "icon": "population", "title": "MOUSEWHEEL: change max batch size \nCLICK: Nothing." },
        { "type": "Corral", "icon": "population", "title": "MOUSEWHEEL: change max batch size \nCLICK: On/Off Corral. \nRIGHT CLICK: Change unit." }
    ];

    constructor(forceRender) {

        const PREFIX = "ControlPanel";
        this.areTabsHidden = true;
        if (!g_IsObserver) {

            this.tabButtons = Engine.GetGUIObjectByName(`${PREFIX}TabButtons[1]`);
            this.tabs = this.tabButtons.children.map((tab, index) => new ProGUIReservePanelTab(tab, index, this));
            if (Engine.ConfigDB_GetValue("user", `boongui.controlPanel.showAllMenus`) === "true") {

                this.areTabsHidden = false;
                this.tabs.forEach(tab => tab.hide(this.areTabsHidden));
            }
            if (Engine.ConfigDB_GetValue("user", "boongui.trainer.enableCorral") != "true")
                this.tabButtons.size = "100%-166 -47 37 -12";
            else
                this.tabButtons.size = "100%-200 -47 37 -12";

            this.forceRender = forceRender;
            this.isPaused = false;

            // initate selected tab, set with 4 to inverte Phase upgrade button
            this.tabs.forEach(tab => tab.update(-1, this.isPaused));
        }
    }
    toggleMode(modeIndex) {
        if (!g_IsObserver) {
            const mode = ProGUIReservePanel.Modes[modeIndex];
            if (!mode) return;
            let isModeToggled = Engine.GetGUIObjectByName(`ControlPanelTabButton[1][${modeIndex}]`).checked;
            this.tabs.forEach(tab => tab.update(modeIndex, this.isPaused));
            this.forceRender();
        }
    }
    hideShowTabs(forceHide) {
        if (forceHide == true) {
            this.areTabsHidden = true;
        }
        else
            this.areTabsHidden = !this.areTabsHidden;
        this.tabs.forEach(tab => tab.hide(this.areTabsHidden));
    }
}