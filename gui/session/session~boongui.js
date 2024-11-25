//Init QuickStart
var g_QuickStart;
var g_EcoHelp;
var g_stockfish;
var g_GUI = Engine.ConfigDB_GetValue("user", `progui.ProOrBoon`);
// PROXY init()

// Wrapper for the "init" function
function init_Wrapper_QuickStart(target, args) {
	// Run original function
	target(...args);

	// Run additional code
	g_EcoHelp = new EcoHelp();
	if (g_InitAttributes?.settings?.Nomad)
		return;

	g_QuickStart = new QuickStart();

}

// Handler for the "init" function
const init_Handler_QuickStart = {
	apply: function (target, thisArg, args) {
		return init_Wrapper_QuickStart(target, args);
	}
};

// Proxy the "init" function
init = new Proxy(init, init_Handler_QuickStart);


let g_stats;

// keep in sync with GuiInterface~boongui.js
// difference to 0AD's g_WorkerTypes is the exclusion of mercenaries and CitizenSoldier rather than Citizen
var g_boonGUI_WorkerTypes = ["FemaleCitizen", "Trader", "FishingBoat", "CitizenSoldier+!Mercenary"];
if (typeof autociv_patchApplyN === "function") {
	autociv_patchApplyN("init", function (target, that, args) {
		const result = target.apply(that, args);
		switch (g_GUI) {
			case "Boon":
				g_stats = new BoonGUIStats(g_PlayerViewControl);
				break;
			case "Pro":
				g_stats = new ProGUIStats(g_PlayerViewControl);
				break;
			default:
				g_stats = new ProGUIStats(g_PlayerViewControl);
				g_stats.hide();
				break;
		}
		g_stockfish = new stockfish();
		return result;
	});
}

function endHome() {
	// Before ending the game
	const replayDirectory = Engine.GetCurrentReplayDirectory();
	const simData = Engine.GuiInterfaceCall("GetReplayMetadata");
	const playerID = Engine.GetPlayerID();

	Engine.EndGame();

	// After the replay file was closed in EndGame
	// Done here to keep EndGame small
	if (!g_IsReplay)
		Engine.AddReplayToCache(replayDirectory);
	// We have ''g_IsController'' if you are the host, ''g_IsObserver'' if you are just watching and ''g_IsNetworked'' if you are connected via multiplayer. This function is just for when you are connected via multiplayer to exit the XmppClient properly and return to the main page.
	if (g_IsNetworked && Engine.HasXmppClient()) {
		Engine.SendUnregisterGame();
		Engine.SwitchGuiPage("page_lobby.xml");
	}
	else {
		Engine.SwitchGuiPage("page_pregame.xml");
	}
}

/**
 * Called every frame.
 */
function onTick() {

	//Boon
	if (!g_Settings)
		return;
	if (!g_IsObserver && g_GUI != Engine.ConfigDB_GetValue("user", `progui.ProOrBoon`)) {
		g_GUI = Engine.ConfigDB_GetValue("user", `progui.ProOrBoon`);
		g_stats.hide();
		switch (g_GUI) {
			case "Boon":
				g_stats = new BoonGUIStats(g_PlayerViewControl);
				g_stats.display();
				break;
			case "Pro":
				g_stats = new ProGUIStats(g_PlayerViewControl);
				g_stats.display();
				break;
			default:
				g_stats = new ProGUIStats(g_PlayerViewControl);
				g_stats.hide();
				break;
		}
	}
	else if (g_IsObserver && g_GUI != Engine.ConfigDB_GetValue("user", `progui.ProOrBoonObs`)) {
		g_GUI = Engine.ConfigDB_GetValue("user", `progui.ProOrBoonObs`);
		g_stats.hide();
		switch (g_GUI) {
			case "Boon":
				g_stats = new BoonGUIStats(g_PlayerViewControl);
				g_stats.display();
				break;
			case "Pro":
				g_stats = new ProGUIStats(g_PlayerViewControl);
				g_stats.display();
				break;
			default:
				g_stats = new ProGUIStats(g_PlayerViewControl);
				g_stats.hide();
				break;
		}
	}
	else if (!g_stats) { //Needed if init function didn't work
		switch (g_GUI) {
			case "Boon":
				g_stats = new BoonGUIStats(g_PlayerViewControl);
				break;
			case "Pro":
				g_stats = new ProGUIStats(g_PlayerViewControl);
				break;
			default:
				g_stats = new ProGUIStats(g_PlayerViewControl);
				g_stats.hide();
				break;
		}
		g_stockfish = new stockfish();
	}
	const now = Date.now();
	const tickLength = now - g_LastTickTime;
	g_LastTickTime = now;

	handleNetMessages();

	updateCursorAndTooltip();

	if (g_Selection.dirty) {

		g_Selection.dirty = false;
		// When selection changed, get the entityStates of new entities
		GetMultipleEntityStates(g_Selection.filter(entId => !g_EntityStates[entId]));

		for (const handler of g_EntitySelectionChangeHandlers)
			handler();

		updateGUIObjects();

		// Display rally points for selected structures.
		Engine.GuiInterfaceCall("DisplayRallyPoint", { "entities": g_Selection.toList() });
	}
	else {
		if (g_ShowAllStatusBars && now % g_StatusBarUpdate <= tickLength)
			recalculateStatusBarDisplay();

		Engine.GuiInterfaceCall("DisplayRallyPoint", { "entities": g_Selection.toList(), "watch": true });
	}

	updateTimers();
	Engine.GuiInterfaceCall("ClearRenamedEntities");
	const isPlayingCinemaPath = GetSimState().cinemaPlaying && !g_Disconnected;
	if (isPlayingCinemaPath)
		updateCinemaOverlay();

	if (Engine.ConfigDB_GetValue("user", "boongui.quickStart.enabled") == "true" && g_QuickStart != null && !g_QuickStart.isTooLate()) { //if (g_QuickStart) { //
		//QuickStart	
		quickStart();
	}
	else {
		//ProGUI EcoHelp
		if (!g_IsObserver && Engine.ConfigDB_GetValue("user", "progui.helpers.enable") == "true") {
			if (!g_EcoHelp) {
				warn("ProGUI helpers failed to init retrying...");
				try {
					g_EcoHelp = new EcoHelp();

				}
				catch (error) { error("ProGUI helpers failed to init." + error); }
				finally { return }
			}
			g_EcoHelp.tickTasks();
			//StockFish
			if (!g_stockfish && Engine.ConfigDB_GetValue("user", "progui.stockfish.enable") === "true") {
				warn("StockFish helpers failed to init retrying...");
				try {
					g_stockfish = new stockfish();
				}
				catch (error) { error("StockFish helpers failed to init." + error); }
				finally { return }
			}
			if (Engine.ConfigDB_GetValue("user", "progui.stockfish.enable") === "true")
				g_stockfish.tickTasks();
		}
	}
}
function quickStart() {

	if (g_QuickStart.isTooLate() || g_QuickStart.isAborted()) {
		g_QuickStart = null;
		return;
	}

	if (g_QuickStart.isStartComplete()) {
		try {
			g_QuickStart.garrison(); //No init seq. of QuickStart
			g_QuickStart.trainCitizens();
			g_QuickStart.currentState = "BEFORE_UNLOAD";
		}
		catch (error) { g_QuickStart = null }
		finally { return }
	}

	if (g_QuickStart.isGarrisonComplete()) {
		try {
			g_QuickStart.unload();
			g_QuickStart.selectCivicCenter();
			g_QuickStart.currentState = "UNLOADING";
		}
		catch (error) { g_QuickStart = null }
		finally { return }
	}

	if (g_QuickStart.isUnloadComplete()) {
		try {
			g_QuickStart.selectCitizens();
			g_QuickStart.placeFoundation();
			g_QuickStart.setFinalRallyPoint();
			g_QuickStart = null;
		}
		catch (error) { g_QuickStart = null }
		finally { return }
	}
}
