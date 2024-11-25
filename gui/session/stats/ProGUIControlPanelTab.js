class ProGUIControlPanelTab {
	constructor(tab, index, parent) {
		const mode = ProGUIControlPanel.Modes[index] ?? null;
		this.tab = tab;
		this.index = index;

		this.sellPrice = Engine.GetGUIObjectByName(`${tab.name}_Count`);
		this.orderCount = Engine.GetGUIObjectByName(`${tab.name}_Order`);
		const name = Engine.GetGUIObjectByName(`${tab.name}_Name`);
		this.bg = Engine.GetGUIObjectByName(`${tab.name}_Background`);
		this.bgState = Engine.GetGUIObjectByName(`${tab.name}_BackgroundState`);
		const toggledIcon = "stretched:session/icons/bkg/portrait_" + Engine.ConfigDB_GetValue("user", "boongui.rightPanel.color") + ".dds";
		this.bg.sprite = toggledIcon;
		this.orderCount.caption = 0;
		this.orderCount.hidden = true;

		this.isChecked = Engine.GetGUIObjectByName(`${tab.name}`).checked;
		if (mode) {
			name.caption = mode.type;
			tab.hidden = false;
			tab.size = ProGUIGetColSize(index, 33);
			const icon = Engine.GetGUIObjectByName(`${tab.name}_Icon`);

			if (this.index > 3 && this.index != 8) {
				if (Engine.ConfigDB_GetValue("user", "boongui.barter.isEnabled") == "true")
					icon.sprite = `stretched:session/icons/resources/${mode.icon}.png`;
				else
					this.tab.hidden = true;
			}

			else
				icon.sprite = `stretched:color:dimmedWhite:textureAsMask:session/phosphor/${mode.icon}.png`;

			tab.tooltip = colorizeHotkey(`${mode.title} %(hotkey)s`, `boongui.session.controlPanel.${index + 1}`);
			tab.onPress = () => {
				parent.toggleMode(index);
			};
			if (this.index > 3)
				this.isChecked = false;
			else if (Engine.ConfigDB_GetValue("user", "boongui.controlPanel.preactivateHelpers") === "true") {
				this.isChecked = (Engine.ConfigDB_GetValue("user", `boongui.controlPanel.${index}`) === "true") ? true : false;
			}
			else {
				if (Engine.ConfigDB_GetValue("user", `boongui.controlPanel.${index}`) === "true")
					toggleConfigBool(`boongui.controlPanel.${this.index}`);
				this.isChecked = false;
			}
		}
		if (Engine.ConfigDB_GetValue("user", `boongui.controlPanel.showAllMenus`) != "true")
			//Hide other tabs
			tab.onMouseRightPress = () => {
				g_stats.reservePanel.hideShowTabs(true);
				g_stats.techPanel.hideShowTabs(true);
				g_stats.ecoTechPanel.hideShowTabs(true);
				g_stats.tributePanel.hideShowTabs(true);
			};
		//Define settings options for certain tabs
		switch (this.index * 1) {

			case 0: //Trainer Toggle TODO function
				tab.onMouseRightPress = () => {
					g_stats.reservePanel.hideShowTabs();
					if (Engine.ConfigDB_GetValue("user", `boongui.controlPanel.showAllMenus`) != "true") {
						g_stats.techPanel.hideShowTabs(true);
						g_stats.ecoTechPanel.hideShowTabs(true);
						g_stats.tributePanel.hideShowTabs(true);
					}
				};
				break;
			case 1: //Tech Toggle

				tab.onMouseRightPress = () => {
					g_stats.techPanel.hideShowTabs();
					if (Engine.ConfigDB_GetValue("user", `boongui.controlPanel.showAllMenus`) != "true") {
						g_stats.reservePanel.hideShowTabs(true);
						g_stats.ecoTechPanel.hideShowTabs(true);
						g_stats.tributePanel.hideShowTabs(true);
					}
				};
				break;
			case 2: //Eco Tech Toggle

				tab.onMouseRightPress = () => {
					g_stats.ecoTechPanel.hideShowTabs();
					if (Engine.ConfigDB_GetValue("user", `boongui.controlPanel.showAllMenus`) != "true") {
						g_stats.reservePanel.hideShowTabs(true);
						g_stats.techPanel.hideShowTabs(true);
						g_stats.tributePanel.hideShowTabs(true);
					}
				};
				break;
			case 3: //Tribute Toggle

				tab.onMouseRightPress = () => {
					g_stats.tributePanel.hideShowTabs();
					if (Engine.ConfigDB_GetValue("user", `boongui.controlPanel.showAllMenus`) != "true") {
						g_stats.reservePanel.hideShowTabs(true);
						g_stats.techPanel.hideShowTabs(true);
						g_stats.ecoTechPanel.hideShowTabs(true);
					}
				};
				break;
			default:
				tab.onMouseRightPress = () => {
					g_stats.tributePanel.hideShowTabs(true);
					g_stats.reservePanel.hideShowTabs(true);
					g_stats.techPanel.hideShowTabs(true);
					g_stats.ecoTechPanel.hideShowTabs(true);
				};
		}
	}

	update(toToggleIndex, isPaused) {

		if (toToggleIndex === this.index) {

			this.isChecked = !this.isChecked;
			if (this.index <= 3)
				toggleConfigBool(`boongui.controlPanel.${this.index}`);
		}
		if (this.isChecked === true) {
			const toggledIcon = "stretched:session/icons/bkg/portrait_" + Engine.ConfigDB_GetValue("user", "boongui.rightPanel.color") + ".dds";
			this.bg.sprite = toggledIcon;
		}
		else if (this.isChecked === false) {
			this.bg.sprite = `stretched:session/icons/bkg/portrait_black.dds`;
		}


		if ((isPaused && this.index != 8) || this.isChecked === false) {
			this.bgState.sprite = `stretched:color:dimmedWhite:textureAsMask:session/phosphor/pause.png`;
			for (let i = 0; i < 9; i++) {
				const toPauseTabs = Engine.GetGUIObjectByName(`ControlPanelTabButton[${this.index + 1}][${i}]_BackgroundState`);
				if (toPauseTabs != null) {

					toPauseTabs.hidden = false;
					toPauseTabs.sprite = `stretched:color:dimmedWhite:textureAsMask:session/phosphor/pause.png`;
				}
			}
		}
		else if ((this.isChecked === true && !isPaused)){
			this.bgState.sprite = `stretched:color:dimmedWhite:textureAsMask:session/phosphor/play.png`;
			for (let i = 0; i < 9; i++) {
				const toPauseTabs = Engine.GetGUIObjectByName(`ControlPanelTabButton[${this.index + 1}][${i}]_BackgroundState`);
				const toggledIcon = "stretched:session/icons/bkg/portrait_" + Engine.ConfigDB_GetValue("user", "boongui.rightPanel.color") + ".dds";
				if (toPauseTabs != null && Engine.GetGUIObjectByName(`ControlPanelTabButton[${this.index + 1}][${i}]_Background`).sprite == toggledIcon) {
					toPauseTabs.hidden = true;
				}
			}
		}
		if (this.index == 8 && this.isChecked)
			this.bgState.sprite = `stretched:color:dimmedWhite:textureAsMask:session/phosphor/play.png`;
		Engine.GetGUIObjectByName(`${this.tab.name}`).checked = this.isChecked;

	}
}
