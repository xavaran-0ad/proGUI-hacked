class ProGUITributePanel {
    static Modes = [
        { "type": "Food", "icon": "food", "title": "CLICK: Yes/No share food. \nMOUSEWHEEL: change share levels" },
        { "type": "Wood", "icon": "wood", "title": "CLICK: Yes/No share wood. \nMOUSEWHEEL: change share levels" },
        { "type": "Stone", "icon": "stone", "title": "CLICK: Yes/No share stone. \nMOUSEWHEEL: change share levels" },
        { "type": "Metal", "icon": "metal", "title": "CLICK: Yes/No share metal. \nMOUSEWHEEL: change share levels" },
    ];

    constructor(forceRender) {

        const PREFIX = "ControlPanel";
        this.areTabsHidden = true;
        if (!g_IsObserver) {

            this.tabButtons = Engine.GetGUIObjectByName(`${PREFIX}TabButtons[4]`);
            this.tabs = this.tabButtons.children.map((tab, index) => new ProGUITributePanelTab(tab, index, this));
            if(Engine.ConfigDB_GetValue("user", `boongui.controlPanel.showAllMenus`) === "true"){
                this.tabButtons.size = "100%-135 -155 37 -120";
                this.areTabsHidden = true;
                this.tabs.forEach(tab => tab.hide(this.areTabsHidden));
            }              
            else
                this.tabButtons.size = "100%-135 -47 37 -12";

            this.forceRender = forceRender;
            this.isPaused = false;

            // initate selected tab, set with 4 to inverte Phase upgrade button
            this.tabs.forEach(tab => tab.update(-1, this.isPaused));
        }
    }
    toggleMode(modeIndex) {
        if (!g_IsObserver) {
            const mode = ProGUITributePanel.Modes[modeIndex];
            if (!mode) return;
            let isModeToggled = Engine.GetGUIObjectByName(`ControlPanelTabButton[4][${modeIndex}]`).checked;
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