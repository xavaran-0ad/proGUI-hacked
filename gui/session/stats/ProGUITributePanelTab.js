class ProGUITributePanelTab {
	constructor(tab, index, parent) {
		const mode = ProGUITributePanel.Modes[index] ?? null;
		this.tab = tab;
		this.index = index;

		this.reserveLevel = Engine.GetGUIObjectByName(`${tab.name}_Count`);
		const name = Engine.GetGUIObjectByName(`${tab.name}_Name`);
		this.bg = Engine.GetGUIObjectByName(`${tab.name}_Background`);
		this.bgState = Engine.GetGUIObjectByName(`${tab.name}_BackgroundState`);
		const toggledIcon = "stretched:session/icons/bkg/portrait_" + Engine.ConfigDB_GetValue("user", "boongui.rightPanel.color") + ".dds";
		this.bg.sprite = toggledIcon;


		this.isChecked = Engine.GetGUIObjectByName(`${tab.name}`).checked;
		if (mode) {
			this.reserveLevel.caption = Math.round(Engine.ConfigDB_GetValue("user", `boongui.autoTribute.tributeShare${mode.type}`)*100)/100;

			name.caption = mode.type;
			tab.hidden = false;
			tab.size = ProGUIGetColSize(index, 33);
			const icon = Engine.GetGUIObjectByName(`${tab.name}_Icon`);

			icon.sprite = `stretched:session/icons/resources/${mode.icon}.png`;

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
			this.isChecked = true;
			this.shouldBeHidden = false;
		}
		else{
			this.shouldBeHidden = true;
		}
		tab.hidden = true;
	}
	normalizeReserve(){
		if(this.reserveLevel.caption * 1 > 1.2)
			this.reserveLevel.caption = 1.2;
		else if(this.reserveLevel.caption * 1 < 0)
			this.reserveLevel.caption = 0;
	}
	increaseReserve(){
		let newValue = (this.reserveLevel.caption * 1 + 0.02);
		this.reserveLevel.caption = Math.round(this.reserveLevel.caption * 100 + 2)/100;
		this.normalizeReserve();
	}
	decreaseReserve(){
		this.reserveLevel.caption = Math.round(this.reserveLevel.caption * 100 - 2)/100;
		this.normalizeReserve();
	}
	update(toToggleIndex) {

		if (toToggleIndex === this.index) {

			this.isChecked = !this.isChecked;
		}
		if (this.isChecked === true) {
			const toggledIcon = "stretched:session/icons/bkg/portrait_" + Engine.ConfigDB_GetValue("user", "boongui.rightPanel.color") + ".dds";
			this.bg.sprite = toggledIcon;

		}
		else if (this.isChecked === false) {
			this.bg.sprite = `stretched:session/icons/bkg/portrait_black.dds`;
		}
	}
	hide(boolean) {
		if (!this.shouldBeHidden)
			this.tab.hidden = boolean;
	}
}
