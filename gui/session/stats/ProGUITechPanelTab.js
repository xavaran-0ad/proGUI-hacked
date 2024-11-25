class ProGUITechPanelTab {
	constructor(tab, index, parent) {
		const mode = ProGUITechPanel.Modes[index] ?? null;
		this.tab = tab;
		this.index = index;

		this.techTier = Engine.GetGUIObjectByName(`${tab.name}_Count`);
		const name = Engine.GetGUIObjectByName(`${tab.name}_Name`);
		this.bg = Engine.GetGUIObjectByName(`${tab.name}_Background`);
		this.bgState = Engine.GetGUIObjectByName(`${tab.name}_BackgroundState`);
		this.bgState.z = 20;
		this.bgState.sprite = `stretched:color:dimmedWhite:textureAsMask:session/phosphor/pause.png`;
		const toggledIcon = "stretched:session/icons/bkg/portrait_" + Engine.ConfigDB_GetValue("user", "boongui.rightPanel.color") + ".dds";
		this.bg.sprite = toggledIcon;
		this.techTier.caption = "III";
		this.techTier.font = "mono-10";
		this.techTier.hidden = true;

		this.isChecked = Engine.GetGUIObjectByName(`${tab.name}`).checked;
		if (mode) {
			name.caption = mode.type;
			tab.hidden = false;
			tab.size = ProGUIGetColSize(index, 33);
			const icon = Engine.GetGUIObjectByName(`${tab.name}_Icon`);

			icon.sprite = `stretched:session/portraits/technologies/${mode.icon}.png`;
			icon.size = "2 3 100%-2 100%-4"

			tab.tooltip = colorizeHotkey(`${mode.title} %(hotkey)s`);
			tab.onPress = () => {
				parent.toggleMode(index);
				if (!this.isChecked) {
					this.techTier.caption = "III";
					this.techTier.hidden = true;
				}
			};
			tab.onMouseWheelUp = () => {
				this.increaseReserve(index);
			};
			tab.onMouseWheelDown = () => {
				this.decreaseReserve(index);
			};
			this.isChecked = true;
			this.shouldBeHidden = false;
		}
		else {
			this.shouldBeHidden = true;
		}
		tab.hidden = true;

	}
	normalizeReserve() {
		if (this.techTier.caption.length > 3)
			this.techTier.caption = "III";
		else if (this.techTier.caption.length < 1) {
			this.techTier.caption = "";
			if (this.isChecked === true)
				this.update(this.index);
			this.techTier.hidden = true;
		}
	}
	increaseReserve() {
		this.techTier.caption = this.techTier.caption + "I";
		this.techTier.hidden = false;
		if (this.isChecked === false)
			this.update(this.index);
		this.normalizeReserve();
	}
	decreaseReserve() {
		this.techTier.caption = this.techTier.caption.slice(0, -1);
		this.techTier.hidden = false;
		this.normalizeReserve();
	}

	update(toToggleIndex) {

		if (toToggleIndex === this.index) {

			this.isChecked = !this.isChecked;
		}
		if (this.isChecked === true) {
			const toggledIcon = "stretched:session/icons/bkg/portrait_" + Engine.ConfigDB_GetValue("user", "boongui.rightPanel.color") + ".dds";
			this.bg.sprite = toggledIcon;
			if (Engine.ConfigDB_GetValue("user", `boongui.controlPanel.1`) != "false")
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
