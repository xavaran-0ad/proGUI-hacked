class ProGUITechPanel {
    static Modes = [
        { "type": "Melee", "icon": "sword", "title": "Yes/No upgrade melee weapons" },
        { "type": "Ranged", "icon": "arrow", "title": "Yes/No upgrade ranged weapons" },
        { "type": "Hack Resistance", "icon": "armor_leather", "title": "Yes/No upgrade body armor" },
        { "type": "Pierce Resistance", "icon": "shields_generic_wood", "title": "Yes/No upgrade shields" },
    ];

    constructor(forceRender) {

        this.areTabsHidden = true;
        const PREFIX = "ControlPanel";
        if (!g_IsObserver) {

            this.tabButtons = Engine.GetGUIObjectByName(`${PREFIX}TabButtons[2]`);
            this.tabs = this.tabButtons.children.map((tab, index) => new ProGUITechPanelTab(tab, index, this));
            if (Engine.ConfigDB_GetValue("user", `boongui.controlPanel.showAllMenus`) === "true") {
                this.tabButtons.size = "100%-133 -83 37 -48";
                this.areTabsHidden = false;
                this.tabs.forEach(tab => tab.hide(this.areTabsHidden));
            }
            else
                this.tabButtons.size = "100%-133 -47 37 -12";

            this.forceRender = forceRender;
            this.isPaused = false;

            // initate selected tab, set with 4 to inverte Phase upgrade button
            this.tabs.forEach(tab => tab.update(-1, this.isPaused));
        }
    }
    toggleMode(modeIndex) {
        if (!g_IsObserver) {
            const mode = ProGUITechPanel.Modes[modeIndex];
            if (!mode) return;
            let isModeToggled = Engine.GetGUIObjectByName(`ControlPanelTabButton[2][${modeIndex}]`).checked;
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