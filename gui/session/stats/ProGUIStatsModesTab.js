class ProGUIStatsModesTab {
	constructor(tab, index, parent, doPreset) {
		const mode = ProGUIStatsModes.Modes[index] ?? null;
		this.tab = tab;
		this.index = index;

		this.toProduce = Engine.GetGUIObjectByName(`${tab.name}_Count`);
		this.symbol = Engine.GetGUIObjectByName(`${tab.name}_Symbol`);
		this.name = Engine.GetGUIObjectByName(`${tab.name}_Name`);
		this.toProduce.caption = 0;
		this.bg = Engine.GetGUIObjectByName(`${tab.name}_Background`);
		this.isChecked = Engine.GetGUIObjectByName(`${tab.name}`).checked;
		this.isChecked = false;
		if (doPreset === true)
			if (index == 1 && Engine.ConfigDB_GetValue("user", "boongui.trainer.toogleResetToZero") == "false") {
				this.toProduce.caption = 50;
				this.symbol.caption = "%";
			}
			else if (index == 2 && Engine.ConfigDB_GetValue("user", "boongui.trainer.toogleResetToZero") == "false") {
				this.toProduce.caption = 50;
				this.symbol.caption = "%";
			}
			else
				this.symbol.caption = "%";
		this.bg.sprite = `stretched:session/icons/bkg/portrait_black.dds`;

		if (mode) {
			this.name.caption = mode.type;
			tab.hidden = false;
			tab.size = ProGUIGetRowSize(index, 46);
			const text = Engine.GetGUIObjectByName(`${tab.name}_Text`);
			const icon = Engine.GetGUIObjectByName(`${tab.name}_Icon`);

			icon.sprite = `stretched:session/portraits/${mode.icon}`;

			tab.tooltip = colorizeHotkey(`${mode.title} %(hotkey)s`, `boongui.session.stats.mode.${index + 1}`);
			tab.tooltip += ' Use MOUSEWHEEL to change value, CLICK to toggle'
			tab.onPress = () => {
				parent.toggleMode(index);
			};
			tab.onPressRight = () => {
				if (mode.type == null) return;
				showTemplateDetails(mode.type);
			}
		}
	}

	update(toToggleIndex) {
		if (toToggleIndex === this.index && this.isChecked === false) {
			const toggledIcon = "stretched:session/icons/bkg/portrait_" + Engine.ConfigDB_GetValue("user", "boongui.rightPanel.color") + ".dds";
			this.bg.sprite = toggledIcon;
			this.isChecked = true;
			this.symbol.caption = "∞";
			if (Engine.ConfigDB_GetValue("user", "boongui.trainer.toogleResetToZero") == "false") {
				this.toProduce.font = "sans-bold-stroke-16";
			}
			else {
				this.toProduce.hidden = true;
				this.toProduce.caption = 0;
			}
			this.symbol.font = "sans-bold-stroke-20";
		}
		else if (toToggleIndex === this.index && this.isChecked === true) {
			this.bg.sprite = `stretched:session/icons/bkg/portrait_black.dds`;
			this.isChecked = false;
			this.symbol.caption = "%";
			this.toProduce.hidden = false;
			this.toProduce.font = "sans-bold-stroke-18";
			this.symbol.font = "sans-bold-stroke-16";
		}
		if (Engine.ConfigDB_GetValue("user", "boongui.trainer.toogleResetToZero") == "true" && this.symbol.caption == "∞")
			this.symbol.text_valign = "center";
		else
			this.symbol.text_valign = "bottom";
	}

}
