class ProGUIStatsModesRow {
	constructor(row, index, rowIndex) {
		const PREFIX = row.name;
		this.rowIndex = rowIndex;
		this.root = Engine.GetGUIObjectByName(PREFIX);
		this.rowSize = this.getRowSize(rowIndex);
		let offset = 0;
		this.idlesCount = 0;
		this.idlesCountBuildings = 0;

		if (index === 1)
			offset = 40 * this.getRowSize(0);
		if (index > 1)
			offset = 40 * this.getRowSize(1) + 40 * this.getRowSize(0);

		this.root.size = ProGUIGetRowSize(index, 40, offset);
		this.indicator = Engine.GetGUIObjectByName(`${PREFIX}Indicator`);
		this.indicatorColor = Engine.GetGUIObjectByName(`${PREFIX}IndicatorColor`);
		this.indicatorTeamColor = Engine.GetGUIObjectByName(`${PREFIX}IndicatorTeamColor`);
		this.toggleStatus = Engine.GetGUIObjectByName(`${PREFIX}Text`);
		this.itemsContainer = Engine.GetGUIObjectByName(`${PREFIX}Items`);

		this.indicator.size = "100%-20 1 100% " + 79 * this.rowSize;
		this.indicatorColor.size = "3 5 100%-6 " + 73 * this.rowSize;
		this.indicatorTeamColor.size = "8 0 100% " + 78 * this.rowSize;
		this.itemsContainer.size = "0 1 100%-20 " + 79 * this.rowSize;

		this.items = this.itemsContainer.children.map((item, indexNumber) => new ProGUIStatsModesRowItem(item, indexNumber, this.rowSize, this.rowIndex));
		this.isDisabled = false;
		this.indicator.onPress = () => {
			this.isDisabled = !this.isDisabled;
		}
	}
	getRowSize(rowIndex) {
		let rowSize = 0.5;
		if (rowIndex === 0)
			rowSize = Engine.ConfigDB_GetValue("user", "boongui.controlPanel.rowSize.1");
		if (rowIndex === 1)
			rowSize = Engine.ConfigDB_GetValue("user", "boongui.controlPanel.rowSize.2");
		return rowSize;
	}
	/**
	 * @private
	 */
	createTooltip(state) {
		let tooltip = "";
		const civ = g_CivData[state.civ];
		const Emblem = civ.Emblem.replace(BoonGUIStatsTopPanelRow.Regex_Emblem, "$1");

		tooltip = "";
		const font = state.nick.length >= 17 ? "sans-stroke-16" : "sans-stroke-18";
		tooltip += setStringTags(`${state.nick}\n`, { "color": state.playerColor, font });
		if (state.team != -1) {
			tooltip += setStringTags(`Team ${state.team + 1}\n`, { "color": state.teamColor });
		}
		tooltip += `[icon="${Emblem}" displace="2 5"] \n`;
		tooltip += `${civ.Name}`;
		const caption = Engine.IsAtlasRunning() ? "" : `${translateAISettings(g_InitAttributes.settings.PlayerData[state.index])}`;
		if (caption) {
			tooltip += setStringTags(`\n${caption}`, { "color": "210 210 210", "font": "sans-stroke-14" });
		}
		return tooltip;
	}

	update(state, mode, items) {

		this.root.hidden = !state;
		this.state = state;
		if (!state) return;
		this.indicator.tooltip = this.createTooltip(state);
		this.indicatorColor.sprite = `backcolor: ${state.playerColor}`;
		this.indicatorTeamColor.sprite = `backcolor: ${state.teamColor} 170`;
		this.indicatorTeamColor.hidden = state.team == -1;

		this.indicator.tooltip = this.createTooltip(state);
		this.toggleStatus.caption = (this.isDisabled) ? "[color=\"220 190 190\"]+[/color]" : "";

		if (this.isDisabled)
			items = [];
		else if (this.rowIndex === 0) {
			var items = state.queue.filter(d => d.mode === "idle");
			if (items.length > this.idlesCount && Engine.ConfigDB_GetValue("user", "boongui.playSoundWhenIdles") == "true" && g_ViewedPlayer > 0){	
				Engine.PlayUISound("audio/interface/ui/prrroh.ogg", false);
			}
			this.idlesCount = items.length;
		}
		else if (this.rowIndex === 1)
		{
			var items = state.queue.filter(d => d.mode === "military_buildings_idle");
			if (items.length > this.idlesCountBuildings && Engine.ConfigDB_GetValue("user", "boongui.playSoundWhenIdlesBuildings") == "true" && g_ViewedPlayer > 0){	
				Engine.PlayUISound("audio/interface/ui/drumpapappa.ogg", false);
			}
			this.idlesCountBuildings = items.length;
		}
		else if (this.rowIndex === 2)
			var items = state.queue.filter(d => d.mode === "production");
		else if (this.rowIndex === 3)
			var items = state.queue.filter(d => d.mode === "units");

		this.items.forEach((item, idx) => {
			item.update(items[idx], state, this.rowSize, this.rowIndex);
		});
	}
}