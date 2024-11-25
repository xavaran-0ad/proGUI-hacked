/**
 * This class is concerned with managing the different elements of the minimap panel.
 */
class MiniMapPanel {
	constructor(playerViewControl, diplomacyColors, idleWorkerClasses) {
		this.diplomacyColorsButton = new MiniMapDiplomacyColorsButton(diplomacyColors);
		this.diplomacyColorsButtonGUI = Engine.GetGUIObjectByName("diplomacyColorsButton");
		this.scoreButton = new MiniMapScoreButton();
		this.scoreButtonGUI = Engine.GetGUIObjectByName("scoreButton");
		this.flareButton = new MiniMapFlareButton(playerViewControl);
		this.flareButtonGUI = Engine.GetGUIObjectByName("flareButton");
		this.miniMapBarStats = new MiniMapBarStats();
		this.miniMap = new MiniMap();
		this.minimapPanel = Engine.GetGUIObjectByName("minimapPanel");
		this.minimapBG = Engine.GetGUIObjectByName("minimapBG");
		this.minimapCircle = Engine.GetGUIObjectByName("minimapCircle");
		this.minimapMap = Engine.GetGUIObjectByName("minimap");
		this.hoverPanel = Engine.GetGUIObjectByName("hoverPanel");
		this.powerBar = Engine.GetGUIObjectByName("powerBar");
		this.powerPanel = Engine.GetGUIObjectByName("powerPanel");
		this.powerGlow = Engine.GetGUIObjectByName("miniMapBarStatsGlow");
		// StatsOverlay has no size defined, it serves to get the screen size, maybe there is a better way.
		this.stats = Engine.GetGUIObjectByName("Stats");
		this.miniMapSize();
		this.minimapPanel.onWindowResized = this.miniMapSize.bind(this);
	}

	flare(target, playerID) {
		return this.miniMap.flare(target, playerID);
	}

	isMouseOverMiniMap() {
		return this.miniMap.isMouseOverMiniMap();
	}

	miniMapSize() {
		if(Engine.ConfigDB_GetValue("user", "boongui.minimap.ShowStatsBars") == "false"){
			this.powerBar.hidden = true;
			this.powerPanel.hidden = true;
			this.stats.hidden = true;
			this.powerGlow.hidden = true;
			this.powerGlow.ghost = true;
			this.hoverPanel.sprite = "minimapHoverPanel";
			this.minimapBG.size = "3 3 100% 100%";
			this.minimapMap.size = "2 2 100% 100%";
			this.minimapCircle.size = "0 0 100%+1 100%";
			this.diplomacyColorsButtonGUI.size="72% 40%-1 86% 94%";
			this.scoreButtonGUI.size="2%-1 6% 16%-1 60%+1";
			this.flareButtonGUI.size="14% 40%-1 28% 94%";
			const dimensionsMiniPanel = "0 100%-276 250 100%-26";
			const dimensionsHoverPanel = "0 100%-63 251 100%";
			const screenSizeWidth = this.stats.getComputedSize().right;
			// arbitrarily set to 1600, just felt right
			if (screenSizeWidth >= 1600)
			{
				this.minimapPanel.size = "0 100%-332 300 100%-32";
				this.hoverPanel.size = "0 100%-76 301 100%";
			}
			else
			{
				this.minimapPanel.size = dimensionsMiniPanel;
				this.hoverPanel.size = dimensionsHoverPanel;
			}
	
		}
		else{
		const dimensionsMiniPanel = "0 100%-276 246 100%-26";
		const dimensionsHoverPanel = "-4 100%-60 251 100%+4";
		const screenSizeWidth = this.stats.getComputedSize().right;
			this.minimapPanel.size = dimensionsMiniPanel;
			this.hoverPanel.size = dimensionsHoverPanel;
			this.powerBar.size = "286 100%-860 15 100%";	
		}

		// Check for good dimensions, width&height should be the same or close together.
		// const testSizes = ["idleWorkerButton", "minimapPanel"];
		// for (let i = 0; i < testSizes.length; i++)
		// {
		// 	const objects = Engine.GetGUIObjectByName(testSizes[i]).getComputedSize();
		// 	const width = objects.right - objects.left;
		// 	const height = objects.bottom - objects.top;
		// 	warn(uneval(`${testSizes[i]}` + "width" + width));
		// 	warn(uneval(`${testSizes[i]}` + "height" + height));
		// }
	}
}
