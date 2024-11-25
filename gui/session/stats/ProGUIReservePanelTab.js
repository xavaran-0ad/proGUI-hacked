class ProGUIReservePanelTab {
	constructor(tab, index, parent) {
		const mode = ProGUIReservePanel.Modes[index] ?? null;
		this.tab = tab;
		this.index = index;

		this.reserveLevel = Engine.GetGUIObjectByName(`${tab.name}_Count`);
		const name = Engine.GetGUIObjectByName(`${tab.name}_Name`);
		this.bg = Engine.GetGUIObjectByName(`${tab.name}_Background`);
		this.bgState = Engine.GetGUIObjectByName(`${tab.name}_BackgroundState`);
		const toggledIcon = "stretched:session/icons/bkg/portrait_" + Engine.ConfigDB_GetValue("user", "boongui.rightPanel.color") + ".dds";
		this.bg.sprite = toggledIcon;
		this.corralIcons =  ["goat", "sheep", "pig", "cattle"];
		this.corralIconSelected = 0;


		this.isChecked = Engine.GetGUIObjectByName(`${tab.name}`).checked;
		if (mode) {
			const icon = Engine.GetGUIObjectByName(`${tab.name}_Icon`);
			if (this.index == 4){
				icon.sprite = `stretched:session/icons/resources/${mode.icon}.png`;
				this.reserveLevel.caption = Math.floor(Math.floor(Engine.ConfigDB_GetValue("user", `boongui.trainer.MaxBatchSize`)));
				name.caption = mode.type;
				this.isChecked = true;
			}
			else if (this.index == 5){
				this.reserveLevel.caption = Math.floor(Math.floor(Engine.ConfigDB_GetValue("user", `boongui.trainer.corralBatchSize`)));
				icon.sprite = `stretched:session/icons/${this.corralIcons[this.corralIconSelected]}.png`;
				name.caption = this.corralIcons[this.corralIconSelected];
				tab.onMouseRightPress = () => {
					this.corralIconSelected = (this.corralIconSelected + 1)%4;
					icon.sprite = `stretched:session/icons/${this.corralIcons[this.corralIconSelected]}.png`;
					name.caption = this.corralIcons[this.corralIconSelected];
				};
				if(Engine.ConfigDB_GetValue("user", "boongui.trainer.enableCorral") != "true")
				{
					this.bg.sprite = `stretched:session/icons/bkg/portrait_black.dds`;
					this.isChecked = false;
				}

			}
			else
			{
				this.reserveLevel.caption = Math.floor(Engine.ConfigDB_GetValue("user", `boongui.trainer.${mode.icon}Reserve`));
				icon.sprite = `stretched:session/icons/resources/${mode.icon}.png`;
				name.caption = mode.type;
				this.isChecked = true;
			}
			tab.hidden = false;
			tab.size = ProGUIGetColSize(index, 33);

			tab.tooltip = colorizeHotkey(`${mode.title}`);
			tab.onPress = () => {
				parent.toggleMode(index);
			};
			tab.onMouseWheelUp = () => {
				this.increaseReserve(index);
			};
			tab.onMouseWheelDown = () => {
				this.decreaseReserve(index);
			};

			this.shouldBeHidden = false;
		}
		else {
			this.shouldBeHidden = true;
		}
		tab.hidden = true;

	}
	normalizeReserve() {
		if (this.reserveLevel.caption * 1 > 1000)
			this.reserveLevel.caption = 1000;
		else if (this.reserveLevel.caption * 1 < 0)
			this.reserveLevel.caption = 0;
	}
	increaseReserve() {
		if (this.index == 4 || this.index == 5)
			this.reserveLevel.caption = this.reserveLevel.caption * 1 + 1;
		else
			if (this.reserveLevel.caption < 200)
				this.reserveLevel.caption = this.reserveLevel.caption * 1 + 25;
			else if (this.reserveLevel.caption < 500)
				this.reserveLevel.caption = this.reserveLevel.caption * 1 + 50;
			else
				this.reserveLevel.caption = this.reserveLevel.caption * 1 + 100;
		this.normalizeReserve();
	}
	decreaseReserve() {
		if (this.index == 4 || this.index == 5)
			this.reserveLevel.caption = this.reserveLevel.caption * 1 - 1;
		else
			if (this.reserveLevel.caption < 200)
				this.reserveLevel.caption = this.reserveLevel.caption * 1 - 25;
			else if (this.reserveLevel.caption < 500)
				this.reserveLevel.caption = this.reserveLevel.caption * 1 - 50;
			else
				this.reserveLevel.caption = this.reserveLevel.caption * 1 - 100;
		this.normalizeReserve();
	}
	update(toToggleIndex) {

		if (toToggleIndex === this.index) {

			this.isChecked = !this.isChecked;
		}
		if (this.isChecked === true) {
			const toggledIcon = "stretched:session/icons/bkg/portrait_" + Engine.ConfigDB_GetValue("user", "boongui.rightPanel.color") + ".dds";
			this.bg.sprite = toggledIcon;
			this.bgState.hidden = true;

		}
		else if (this.isChecked === false) {
			this.bg.sprite = `stretched:session/icons/bkg/portrait_black.dds`;
			this.bgState.hidden = false;
		}
	}
	hide(boolean) {
		if (!this.shouldBeHidden)
			this.tab.hidden = boolean;
	}
}
