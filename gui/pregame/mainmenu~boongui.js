var boonGUIConfig = {
	"needsToSave": false,
	"needsToReloadHotkeys": false,
	set(key, value) {
		Engine.ConfigDB_CreateValue("user", key, value);
		this.needsToSave = true;
		this.needsToReloadHotkeys = this.needsToReloadHotkeys || key.startsWith("hotkey.");
	},
	get(key) { return Engine.ConfigDB_GetValue("user", key); },
	save() {
		if (this.needsToSave) Engine.ConfigDB_WriteFile("user", "config/user.cfg");
		if (this.needsToReloadHotkeys) Engine.ReloadHotkeys();
	}
};

function proGUI_initCheck() {
	const state = {
		"setUpProGUI": false
	};

	// Check settings
	{
		const settings = Engine.ReadJSONFile("boongui_data/default_config.json");

		const allHotkeys = new Set(Object.keys(Engine.GetHotkeyMap()));
		for (const key in settings) {
			if (key.startsWith("hotkey.")) {
				if (!allHotkeys.has(key.slice("hotkey.".length))) {
					boonGUIConfig.set(key, settings[key]);
				}
			}
			else if (boonGUIConfig.get(key) == "")
				boonGUIConfig.set(key, settings[key]);

			else if ((key == "xres" || key == "yres") && boonGUIConfig.get(key) == "0")
				boonGUIConfig.set(key, settings[key]);
		}
		boonGUIConfig.save();

	}
	// Check for the setUp page
	{
		const key = "progui.mainmenu.setupHelper.seen.1"
		if (boonGUIConfig.get(key) == "false") {
			state.setUpProGUI = true
		}
	}

	boonGUIConfig.save()
	return state;
}

		let state = proGUI_initCheck();
		if (state.setUpProGUI) {
			let message = `
SELECT YOUR OVERLAY


BoonGUI:

Display a varity stats on the right about your team.


ProGUI:

Show idles units and buildings for better eco management.


EcoPanel:

Add a complementary panel that offers new ways to manage your production.



You can always change it later in options under "ProGUI Appearance".
        `;

			messageBox(500, 500, message,
				"ProGUI setup",
				["BoonGUI", "ProGUI", "ProGUI + EcoPanel"],
				[() => {
					boonGUIConfig.set("progui.ProOrBoon", "Boon")
					boonGUIConfig.set("progui.ProOrBoonObs", "Boon")
					boonGUIConfig.set("progui.mainmenu.setupHelper.seen.1", "true")
					boonGUIConfig.save()
				}, () => {
					boonGUIConfig.set("progui.ProOrBoon", "Pro")
					boonGUIConfig.set("progui.ProOrBoonObs", "Pro")
					boonGUIConfig.set("progui.helpers.enable", "false")
					boonGUIConfig.set("progui.mainmenu.setupHelper.seen.1", "true")
					boonGUIConfig.save()
				}, () => {
					boonGUIConfig.set("progui.ProOrBoon", "Pro")
					boonGUIConfig.set("progui.ProOrBoonObs", "Pro")
					boonGUIConfig.set("progui.helpers.enable", "true")
					boonGUIConfig.set("progui.mainmenu.setupHelper.seen.1", "true")
					boonGUIConfig.save()
				},
				]
			);
		}
		if (typeof autociv_patchApplyN === "function") {
			autociv_patchApplyN("init", function (target, that, args) {
		return target.apply(that, args);
	});
}