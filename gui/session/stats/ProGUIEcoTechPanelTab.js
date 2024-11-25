class ProGUIEcoTechPanelTab {
	constructor(tab, index, parent) {
		const mode = ProGUIEcoTechPanel.Modes[index] ?? null;	
		this.tab = tab;
		this.index = index;

		this.techTier = Engine.GetGUIObjectByName(`${tab.name}_Count`);
		this.orderCount = Engine.GetGUIObjectByName(`${tab.name}_Order`);
		const name = Engine.GetGUIObjectByName(`${tab.name}_Name`);
		this.bg = Engine.GetGUIObjectByName(`${tab.name}_Background`);
		this.bgState = Engine.GetGUIObjectByName(`${tab.name}_BackgroundState`);
		this.bgState.z = 20;
		this.bgState.sprite = `stretched:color:dimmedWhite:textureAsMask:session/phosphor/pause.png`;
		const toggledIcon = "stretched:session/icons/bkg/portrait_" + Engine.ConfigDB_GetValue("user", "boongui.rightPanel.color") + ".dds";
		this.bg.sprite = toggledIcon;
		this.orderCount.caption = 0;
		this.orderCount.hidden = true;
		this.techTier.caption = 100;
		this.techTier.hidden = true;

		this.isChecked = Engine.GetGUIObjectByName(`${tab.name}`).checked;
		if (mode) {
			this.modeIcon = mode.icon;
			name.caption = mode.type;
			tab.hidden = false;
			tab.size = ProGUIGetColSize(index, 33);
			const icon = Engine.GetGUIObjectByName(`${tab.name}_Icon`);

			icon.sprite = `stretched:session/portraits/technologies/${mode.icon}.png`;
			icon.size = "2 3 100%-2 100%-4"

			tab.tooltip = colorizeHotkey(`${mode.title}`);
			tab.onPress = () => {
				parent.toggleMode(index);
			};
			/*tab.onMouseWheelUp = () => {
				this.increaseReserve(index);
			};
			tab.onMouseWheelDown = () => {
				this.decreaseReserve(index);
			};*/
			switch (index * 1) {
				case 0:
					this.isChecked = (Engine.ConfigDB_GetValue("user", "boongui.ecohelp.storeHouseActive") == "true") ? true : false;
					break;
				case 1:
					this.isChecked = (Engine.ConfigDB_GetValue("user", "boongui.ecohelp.farmActive") == "true") ? true : false;
					break;
				case 4:
					this.isChecked = (Engine.ConfigDB_GetValue("user", "boongui.ecohelp.fruitsActive") == "true") ? true : false;
					break;
				default:
					this.isChecked = false;
			}
			this.shouldBeHidden = false;
		}
		else {
			this.shouldBeHidden = true;
		}
		tab.hidden = true;

	}
	/*normalizeReserve() {
		if (this.techTier.caption * 1 > 3)
			this.techTier.caption = 3;
		else if (this.techTier.caption * 1 <= 0) {
			this.techTier.caption = 0;
			this.bg.sprite = `stretched:session/icons/bkg/portrait_black.dds`;
			this.techTier.hidden = true;
		}
	}
	increaseReserve() {
		this.techTier.caption = this.techTier.caption * 1 + 1;
		this.techTier.hidden = false;
		this.normalizeReserve();
	}
	decreaseReserve() {
		this.techTier.caption = this.techTier.caption * 1 - 1;
		this.techTier.hidden = false;
		this.normalizeReserve();
	}*/
	update(toToggleIndex) {

		if (toToggleIndex === this.index) {

			this.isChecked = !this.isChecked;
		}
		if (this.isChecked === true) {
			const toggledIcon = "stretched:session/icons/bkg/portrait_" + Engine.ConfigDB_GetValue("user", "boongui.rightPanel.color") + ".dds";
			this.bg.sprite = toggledIcon;
			if (Engine.ConfigDB_GetValue("user", `boongui.controlPanel.2`) != "false")
			this.bgState.hidden = true;
		}
		else if (this.isChecked === false) {
			this.bg.sprite = `stretched:session/icons/bkg/portrait_black.dds`;
			this.bgState.hidden = false;
		}
		Engine.GetGUIObjectByName(`${this.tab.name}`).checked = this.isChecked;
	}
	hide(boolean) {
		if (!this.shouldBeHidden)
			this.tab.hidden = boolean;
	}
}
