class ProGUIStatsModes {


	constructor(forceRender) {

		this.playerEntities = this.getPlayerEntities();
		this.playersStates = this.getPlayersStates();
		this.userStates = this.playersStates.find(x => x.index === g_ViewedPlayer);
		this.trainableUnits = this.getPlayerTrainableUnits();
		this.toggledModes = new Array();

		Object.defineProperty(ProGUIStatsModes, "Modes", {
			value: [],
			writable: true
		});

		for (let unit of this.trainableUnits) {
			const template = GetTemplateData(unit);
			ProGUIStatsModes.Modes.push(
				{ "type": unit, "icon": template.icon, "title": template.name.generic }
			);
		}

		const PREFIX = "StatsModes";
		this.root = Engine.GetGUIObjectByName(PREFIX);
		this.modeIndex = 0;

		//this.title = Engine.GetGUIObjectByName(`${PREFIX}Title`);
		this.tabButtons = Engine.GetGUIObjectByName(`${PREFIX}TabButtons`);
		this.tabs = this.tabButtons.children.map((tab, index) => new ProGUIStatsModesTab(tab, index, this, true));

		this.rowsContainer = Engine.GetGUIObjectByName(`${PREFIX}Rows`);
		this.rows = this.rowsContainer.children.map((row, index) => new ProGUIStatsModesRow(row, index, index));

		this.tabButtons.size = "100%-47 38 100% 361";

		this.rowsContainer.size = (g_IsObserver || Engine.ConfigDB_GetValue("user", `boongui.controlPanel.0`) == "false") ? "0 39 100% 100%" : "0 39 100%-50 100%";

		this.forceRender = forceRender;

		// initate tabs
		this.tabs.forEach(tab => tab.update(this.modeIndex));
		this.setTopOffset(0);
		g_OverlayCounterManager.registerResizeHandler(this.setTopOffset.bind(this));

	}
	setTopOffset(offset) {
		this.root.size = `100%-199 ${155 + offset} 100% 500`;
	}
	updateMode(modeIndex) {
		this.tabs.forEach(tab => tab.update(modeIndex));
		this.forceRender();
	}
	toggleMode(modeIndex) {
		const mode = ProGUIStatsModes.Modes[modeIndex];
		if (!mode) return;
		const toggledIcon = "stretched:session/icons/bkg/portrait_" + Engine.ConfigDB_GetValue("user", "boongui.rightPanel.color") + ".dds";
		let isModeToggled = (Engine.GetGUIObjectByName(`StatsModesTabButton[${modeIndex}]_Background`).sprite == toggledIcon) ? true : false;
		if (!isModeToggled) {
			this.toggledModes.push({

				"name": mode.type,
				"value": this.tabs[modeIndex].toProduce.caption * 1,
				"count": 0
			});
		}
		else
			this.toggledModes = this.toggledModes.filter(m => m.name != mode.type);
		this.updateMode(modeIndex);
		if (Engine.ConfigDB_GetValue("user", "boongui.trainer.toogleResetToZero") == "true")
			this.decreaseMode(`StatsModesTabButton${modeIndex}`, true);
	}
	isInRange(num) {
		if (num >= 0 && num <= 100)
			return true;
		return false;
	}
	//rebaseModes(modeId){ // Mmmh too lazy to factorise this

	//}
	decreaseMode(name, setToZero) {
		let increment = Math.round(parseFloat(Engine.ConfigDB_GetValue("user", "boongui.trainer.increment")));
		let idString = name.replace(/\D/g, '');
		let modeId = Number.parseInt(idString);
		let mode = this.tabs[modeId];

		if (mode.isChecked == false || Engine.ConfigDB_GetValue("user", "boongui.trainer.toogleResetToZero") == "false") {
			// Calculate the new caption for the current mode
			let newCaption = mode.toProduce.caption * 1 - increment;
			while (!this.isInRange(newCaption) && increment >= 1) {
				increment--;
				newCaption = mode.toProduce.caption * 1 - increment;
			}
			// Calculate the total caption of all modes except the current one
			let otherModesCaptionTotal = this.tabs.reduce((total, tab, i) => {
				if (i !== modeId) {
					return total + tab.toProduce.caption * 1;
				}
				return total;
			}, 0);
			if ((Engine.ConfigDB_GetValue("user", "boongui.trainer.toogleResetToZero") == "false" || otherModesCaptionTotal + newCaption < 0) && mode.isChecked == false) {
				// Scale down the captions of other modes proportionally
				let scalingFactor = increment / otherModesCaptionTotal;
				let totalincrement = 0;
				if (otherModesCaptionTotal > 0) {

					for (let i = 0; i < this.tabs.length; i++) {
						if (i !== modeId) {
							let otherMode = this.tabs[i];
							let otherModeCaption = otherMode.toProduce.caption * 1;
							let scaledCaption = Math.ceil(Math.max(otherModeCaption * 1 * (1 + scalingFactor), 0));
							if (this.isInRange(scaledCaption)) {
								totalincrement += otherModeCaption - scaledCaption;
								otherMode.toProduce.caption = scaledCaption;
							}
						}
					}
					if (totalincrement > 0) {
						newCaption = mode.toProduce.caption * 1 + totalincrement;
					}
					mode.toProduce.caption = newCaption;
				}
				if (setToZero)
					mode.toProduce.caption = 0;
				else {
					mode.toProduce.caption = newCaption;
					this.updateMode();
					let totalCaption = this.tabs.reduce((totalCap, tab) => totalCap + tab.toProduce.caption * 1, 0);
					if (totalCaption != 100) {
						let reScalingFactor = 1 / (totalCaption / 100);
						for (let i = 0; i < this.tabs.length; i++) {
							let otherMode = this.tabs[i];
							let otherModeCaption = otherMode.toProduce.caption * 1;
							let scaledCaption = Math.round(otherModeCaption * reScalingFactor);
							if (this.isInRange(scaledCaption))
								otherMode.toProduce.caption = scaledCaption;
						}
					}
				}
			}
			else
				mode.toProduce.caption = mode.toProduce.caption * 1 - increment;
			// Update the caption of the current mode and call the updateMode method
			this.updateMode();
		}
	}
	increaseMode(name) {

		let increment = Math.round(parseFloat(Engine.ConfigDB_GetValue("user", "boongui.trainer.increment"))) * 2;
		let idString = name.replace(/\D/g, '');
		let modeId = Number.parseInt(idString);
		let mode = this.tabs[modeId];
		if (mode.isChecked == false || Engine.ConfigDB_GetValue("user", "boongui.trainer.toogleResetToZero") == "false") {
			// Calculate the new caption for the current mode
			let newCaption = mode.toProduce.caption * 1 + increment
			// Update the caption of the current mode and call the updateMode method

			while (!this.isInRange(newCaption) && increment >= 1) {
				increment--;
				newCaption = mode.toProduce.caption * 1 + increment;
			}

			// Calculate the total caption of all modes except the current one
			let otherModesCaptionTotal = this.tabs.reduce((total, tab, i) => {
				if (i !== modeId) {
					return total + tab.toProduce.caption * 1;
				}
				return total;
			}, 0);
			if ((Engine.ConfigDB_GetValue("user", "boongui.trainer.toogleResetToZero") == "false" || otherModesCaptionTotal + newCaption > 100)) {
				// Scale up the captions of other modes proportionally
				let scalingFactor = (increment) / otherModesCaptionTotal;
				let totalincrement = 0;
				if (otherModesCaptionTotal > 0) {

					for (let i = 0; i < this.tabs.length; i++) {
						if (i !== modeId) {
							let otherMode = this.tabs[i];
							let otherModeCaption = otherMode.toProduce.caption * 1;
							let scaledCaption = Math.floor(otherModeCaption * 1 * (1 - scalingFactor));
							if (this.isInRange(scaledCaption)) {
								totalincrement += otherModeCaption - scaledCaption;
								otherMode.toProduce.caption = scaledCaption;
							}
						}
					}
					if (totalincrement > 0) {
						newCaption = mode.toProduce.caption * 1 + totalincrement;
					}

				}

				mode.toProduce.caption = newCaption;
				this.updateMode();
				let totalCaption = this.tabs.reduce((totalCap, tab) => totalCap + tab.toProduce.caption * 1, 0);
				if (totalCaption != 100) {
					let reScalingFactor = 1 / (totalCaption / 100);
					for (let i = 0; i < this.tabs.length; i++) {
						let otherMode = this.tabs[i];
						let otherModeCaption = otherMode.toProduce.caption * 1;
						let scaledCaption = Math.round(otherModeCaption * reScalingFactor);
						if (this.isInRange(scaledCaption))
							otherMode.toProduce.caption = scaledCaption;
					}
				}
			}
			else
				mode.toProduce.caption = mode.toProduce.caption * 1 + increment;
			// Update the caption of the current mode and call the updateMode method
			this.updateMode();
		}
	}
	update(playersStates) {
		if (g_ViewedPlayer == -1)
			this.rowsContainer.hidden = true;
		else
			this.rowsContainer.hidden = false;

		this.tabButtons.hidden = (Engine.ConfigDB_GetValue("user", "progui.helpers.enable") == "false" || g_IsObserver || (Engine.ConfigDB_GetValue("user", `boongui.controlPanel.0`) == "false" && Engine.ConfigDB_GetValue("user", `boongui.controlPanel.hideTabsWhenOff`) == "true")) ? true : false;
		this.playerEntities = this.getPlayerEntities();
		this.playersStates = this.getPlayersStates();
		this.userStates = this.playersStates.find(x => x.index === g_ViewedPlayer);
		this.trainableUnits = this.getPlayerTrainableUnits();
		this.rowsContainer.size = (Engine.ConfigDB_GetValue("user", "progui.helpers.enable") == "false" || g_IsObserver || (Engine.ConfigDB_GetValue("user", `boongui.controlPanel.0`) == "false" && Engine.ConfigDB_GetValue("user", `boongui.controlPanel.hideTabsWhenOff`) == "true")) ? "0 39 100% 100%" : "0 39 100%-50 100%";
		if (playersStates && ProGUIStatsModes.Modes[this.modeIndex]) {
			this.rows.forEach((row, i) => row.update(playersStates[0], ProGUIStatsModes.Modes[this.modeIndex].type, i));
		}
		for (let unit of this.trainableUnits) {
			const index = ProGUIStatsModes.Modes.findIndex(m => m.type == unit);
			if (index === -1) {
				const template = GetTemplateData(unit);
				ProGUIStatsModes.Modes.push(
					{ "type": unit, "icon": template.icon, "title": template.name.generic }
				);
				let newIndex = ProGUIStatsModes.Modes.length - 1;

				if (!g_IsObserver) {
					this.tabs.push(new ProGUIStatsModesTab(this.tabButtons.children[newIndex], newIndex, this));
					this.refreshTabs();
					//this.tabs = this.tabButtons.children.map((tab, index) => new ProGUIStatsModesTab(tab, index, this));
				}
			} else if (this.tab != undefined) {

				this.tabs[index].update();
			}

		}

	}
	refreshTabs() { // Patch a bug
		let toToggleModes = new Array();
		// Store existing tab properties
		const tabProperties = this.tabs.map(tab => ({ index: tab.index, caption: tab.toProduce.caption, isChecked: tab.isChecked }));

		// Redefine this.tabs
		this.tabs = this.tabButtons.children.map((tab, index) => {
			// Find the matching tab property, if any
			const matchingProperty = tabProperties.find(prop => prop.index === index);
			// Create a new tab instance and set its properties from the matching property, if any
			let newTab = new ProGUIStatsModesTab(tab, index, this, false);
			if (matchingProperty) {
				newTab.toProduce.caption = matchingProperty.caption;
				if (matchingProperty.isChecked && newTab.bg.sprite != "stretched:session/icons/bkg/portrait_" + Engine.ConfigDB_GetValue("user", "boongui.rightPanel.color") + ".dds")
					toToggleModes.push(index);

			}
			return newTab;
		});
		for (let index of toToggleModes) {
			this.toggleMode(index);
		}
	}
	getPlayerEntities() {

		let playerEntities = {
			Trainer: [],
			CivilCentre: [],
			Hero: []
		};

		const interfacePlayerEntities = Engine.GuiInterfaceCall("GetPlayerEntities");
		for (let entityId of interfacePlayerEntities) {
			let state = GetEntityState(entityId);
			const classesList = GetTemplateData(state.template).visibleIdentityClasses;
			if (classesList)
				for (let key in playerEntities) {
					if (hasClass(state, "Foundation"))
						break;
					if (hasClass(state, "Hero"))
						playerEntities["Hero"].push(entityId);

					const type = Engine.ConfigDB_GetValue("user", "boongui.trainer.trainerClasses").split(",");
					if (type.some(c => classesList.includes(c))) {
						playerEntities["Trainer"].push(entityId);
						if (hasClass(state, "CivilCentre"))
							playerEntities["CivilCentre"].push(entityId);
						break;
					}
				}
		}

		return playerEntities;
	}
	getPlayerTrainableUnits() {
		let availableUnits = new Array();
		let trainableUnits = new Array();
		for (let trainerID in this.playerEntities.Trainer) {

			let state = GetEntityState(this.playerEntities.Trainer[trainerID]);
			if (state.trainer && this.userStates) {
				availableUnits = JSON.parse(JSON.stringify(state.trainer.entities));
			}
			for (let availableUnit of availableUnits) {
				const template = availableUnit;
				if (GetTemplateData(template).visibleIdentityClasses.indexOf("Hero") != -1) //&& this.playerEntities.Hero.length > 0)
					continue;
				if (GetTemplateData(template).requiredTechnology) {

					let technologyEnabled = Engine.GuiInterfaceCall("IsTechnologyResearched", {
						"tech": GetTemplateData(availableUnit).requiredTechnology,
						"player": this.userStates.index
					});
					if (!technologyEnabled)
						continue;
				}
				if (trainableUnits.indexOf(availableUnit) === -1)
					trainableUnits.push(availableUnit);
			}
		}
		return trainableUnits;
	}
	getPlayersStates() {
		return Engine.GuiInterfaceCall("boongui_GetOverlay", {
			g_IsObserver, g_ViewedPlayer, g_LastTickTime
		}).players ?? [];
	}
	hide(){
		this.root.hidden = true;
		this.root.size = "-500 -500 0 0";
	}
	display(){
		let offset = 0;
		this.root.hidden = false;
		this.root.size = `100%-199 ${155 + offset} 100% 500`;
	}
}