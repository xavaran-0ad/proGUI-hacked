class ProGUIStatsModesRowItem {
	constructor(item, index, rowSize, rowIndex) {
		this.rowIndex = rowIndex;
		const PREFIX = item.name;
		this.root = Engine.GetGUIObjectByName(PREFIX);
		this.root.size = ProGUIGetColSize(index, 80 * rowSize, true);

		this.icon = Engine.GetGUIObjectByName(`${PREFIX}Icon`);
		this.count = Engine.GetGUIObjectByName(`${PREFIX}Count`);
		this.sleep = Engine.GetGUIObjectByName(`${PREFIX}Sleep`);
		this.progress = Engine.GetGUIObjectByName(`${PREFIX}Progress`);

		this.progressLeft = this.progress.size.left;
		this.progressWidth = this.progress.size.right - this.progress.size.left;
		this.root.onPress = this.onPress.bind(this);
		this.root.onDoublePress = this.onDoublePress.bind(this);
		this.root.onPressRight = this.onPressRight.bind(this);
		this.item = null;
		this.state = null;
		this.playerEntities = this.getPlayerEntities();
	}

	/**
	 * @private
	 * @param {boolean} move
	 */
	press(move) {
		if (this.item == null || this.item.entity.length <= 0) return;
		if (!Engine.HotkeyIsPressed("selection.add"))
			g_Selection.reset();

		const entities = [...new Set(this.item.entity.map(e => getEntityOrHolder(e)))];
		g_Selection.addList(entities);

		if (move) {
			const entState = GetEntityState(entities[0]);
			if (entState)
				Engine.CameraMoveTo(entState.position.x, entState.position.z);
		}
	}

	onDoublePress() {
		this.press(true);
	}

	onPress() {
		this.press(false);
	}

	onPressRight() {
		if (this.item == null || this.state == null) return;
		showTemplateDetails(this.item.template, this.state.civ);
	}
	getPlayerEntities() {
		let playerEntities = {
			CivilCentre: [],
		};

		const interfacePlayerEntities = Engine.GuiInterfaceCall("GetPlayerEntities");
		for (let entityId of interfacePlayerEntities) {
			let state = GetEntityState(entityId);
			for (let key in playerEntities) {
				if (hasClass(state, key)) {
					playerEntities[key].push(entityId);
					break;
				}
			}
		}

		return playerEntities;
	}
	update(item, state, sizeRow, rowIndex) {
		this.item = item;
		this.state = state;
		this.root.hidden = !item;
		if (!item) return;
		this.icon.hidden = false;

		let template;
		switch (item.templateType) {
			case "technology":
				template = GetTechnologyData(item.template, state.civ);
				break;
			case "unit":
				template = GetTemplateData(item.template);
				break;
			case "resource":
				template = GetTemplateData(item.template);
				break;
			default:
				this.root.hidden = true;
				return;
		}

		this.size = "3 3 " + Math.floor(77 * sizeRow) + " " + Math.floor(77 * sizeRow);
		this.icon.size = "3 3 " + Math.floor(76 * sizeRow) + " " + Math.floor(76 * sizeRow);
		this.count.size = "3 3 " + Math.floor(74 * sizeRow) + " " + Math.floor(75 * sizeRow);
		this.sleep.size = "3 3 " + Math.floor(74 * sizeRow) + " " + Math.floor(75 * sizeRow);
		this.progress.size = "3 " + Math.floor(66 * sizeRow) + " " + Math.floor(76 * sizeRow) + " " + Math.floor(76 * sizeRow);

		const size = this.progress.size;
		size.left = this.progressLeft + this.progressWidth * (item.progress / item.entity.length);
		this.progress.sprite = `backcolor: ${state.playerColor}`;

		this.progress.size = size;
		this.progress.hidden = item.mode !== "production";
		this.count.caption = item.count; // > 1 ? item.count : "";

		if (rowIndex === 0 || rowIndex === 1) {
			this.count.textcolor = "255 5 5";
			this.sleep.textcolor = "215 215 215";
			if (rowIndex === 0)
				this.sleep.caption = "zZ";
			else
				this.sleep.caption = "!";

		}
		else if (rowIndex === 2)
			this.count.textcolor = "130 255 5";
		else
			this.count.textcolor = "50 200 255";
		this.icon.sprite = "stretched:session/portraits/" + template.icon;


		this.root.tooltip = setStringTags(`${state.nick}\n`, { "color": state.playerColor, "font": "sans-stroke-18" });
		this.root.tooltip += [
			getEntityNamesFormatted(template),
			getVisibleEntityClassesFormatted(template),
			getEntityTooltip(template),
			showTemplateViewerOnRightClickTooltip()
		].filter(tip => tip).join("\n");
	}
}
