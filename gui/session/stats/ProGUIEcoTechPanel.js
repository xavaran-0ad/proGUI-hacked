class ProGUIEcoTechPanel {
    static Modes = [
        { "type": "Wood-Cutter", "icon": "wood_axe", "title": "Yes/No Upgrade Wood-Cutter's axes" },
        { "type": "Farming", "icon": "farming_training", "title": "Yes/No Upgrade Plows" },
        { "type": "Stone-cutter", "icon": "mining_stone", "title": "Yes/No Upgrade Stone-Cutter's tools" },
        { "type": "Metal-mining", "icon": "mining_metal", "title": "Yes/No Upgrade Miner's tools" },
        { "type": "Fruit-gathering", "icon": "gather_basket", "title": "Yes/No Upgrade Gatherer's tools" }
    ];

    constructor(forceRender) {

        this.areTabsHidden = true;
        const PREFIX = "ControlPanel";
        if (!g_IsObserver) {

            this.tabButtons = Engine.GetGUIObjectByName(`${PREFIX}TabButtons[3]`);
            this.tabs = this.tabButtons.children.map((tab, index) => new ProGUIEcoTechPanelTab(tab, index, this));
            if (Engine.ConfigDB_GetValue("user", `boongui.controlPanel.showAllMenus`) === "true") {
                this.tabButtons.size = "100%-166 -119 37 -84";
                this.areTabsHidden = false;
                this.tabs.forEach(tab => tab.hide(this.areTabsHidden));
            }
            else
                this.tabButtons.size = "100%-166 -47 37 -12";

            this.forceRender = forceRender;
            this.isPaused = false;

            // initate selected tab, set with 4 to inverte Phase upgrade button
            this.tabs.forEach(tab => tab.update(-1, this.isPaused));
        }
    }
    toggleMode(modeIndex) {
        if (!g_IsObserver) {
            const mode = ProGUIEcoTechPanel.Modes[modeIndex];
            if (!mode) return;
            let isModeToggled = Engine.GetGUIObjectByName(`ControlPanelTabButton[3][${modeIndex}]`).checked;
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