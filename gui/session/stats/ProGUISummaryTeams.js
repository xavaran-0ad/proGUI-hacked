class ProGUISummaryTeams {

	constructor() {
		const PREFIX = "TeamSummary";
		this.root = Engine.GetGUIObjectByName(PREFIX);
		this.scales = new BoonGUIColorScales();
		const playersStates = GetSimState().players;
		if (Engine.ConfigDB_GetValue("user", "boongui.teamBriefing") == "true" && !Engine.IsAtlasRunning()) {
			this.root.hidden = (g_IsObserver || g_SimState.timeElapsed > 2000) ? true : false;
			if (Engine.ConfigDB_GetValue("user", "boongui.quickStart.enabled") == "true" && !g_IsObserver) {
				this.abortQuickStart = Engine.GetGUIObjectByName(`AbortQuickStart`);
				this.abortQuickStarText = Engine.GetGUIObjectByName(`AbortQuickStartText`);
				this.abortQuickStart.hidden = false;
				this.abortQuickStarText.hidden = false
				let font = "sans-stroke-16";
				let color = "dimmedWhite";
				this.abortQuickStarText.caption = setStringTags("Abort QuickStart", { color, font });
				this.abortQuickStart.onPress = () => {
					this.closeSummary();
					if (g_QuickStart){
						warn("QuickSart Aborted by User");
						g_QuickStart.abort();
					}

				}
			}
			const teams = {};

			playersStates.forEach(player => {
				const { team, civ, name, color } = player;

				if (!teams[team]) {
					teams[team] = { team: team, players: [] };
				}

				// Calculate the ID within the team
				let id = teams[team].players.length + 1;

				// Add player to the team with the calculated ID
				if (name !== "Gaia") {
					teams[team].players.push({
						id: id,
						name: name,
						civ: civ,
						color: color
					});
				}
			});


			// Remove empty teams
			const nonEmptyTeams = Object.values(teams).filter(team => team.players.length > 0);

			if (g_Players[g_ViewedPlayer])
				this.user = g_Players[g_ViewedPlayer]
			else
				this.user = g_Players[1]
			// Find the index of the team containing the specified player
			const teamIndexWithPlayer = nonEmptyTeams.findIndex(team => team.players.some(player => player.name === this.user.name));

			// If the team containing the player is found
			if (teamIndexWithPlayer !== -1) {
				// Remove the team from its current position
				const removedTeam = nonEmptyTeams.splice(teamIndexWithPlayer, 1)[0];

				// Push the team to the first position
				nonEmptyTeams.unshift(removedTeam);

				// Update positions of other teams
				nonEmptyTeams.forEach((team, index) => {
					team.position = index + 1;
				});
			}

			// Reorder players within each team
			nonEmptyTeams.forEach(team => {
				team.players.sort((a, b) => {
					if (a.name === this.user.name) return -1;
					if (b.name === this.user.name) return 1;
					return 0;
				});

				// Reset IDs to follow a sequence without holes
				team.players.forEach((player, index) => {
					player.id = index + 1;
				});
			});



			this.dialogBox = Engine.GetGUIObjectByName(`${PREFIX}`);
			this.dialogBox.size = `50%-${125 * (nonEmptyTeams.length + 2)} 50%-320 50%+${125 * (nonEmptyTeams.length + 2)} 50%+280`;
			this.dialogBox.z = -50;
			nonEmptyTeams.forEach(state => {
				let team = state.team != -1 ? `${state.team + 1}` : 0;
				this.teamBox = Engine.GetGUIObjectByName(`${PREFIX}Team[${team}]`);
				this.teamName = Engine.GetGUIObjectByName(`${PREFIX}Team[${team}]_name`);
				let font = "sans-bold-stroke-18";
				let color = "dimmedWhite";
				this.teamName.caption = setStringTags(`Team ${team}`, { color, font });
				this.teamBox.size = `${state.position * 250 + 6} 40 ${state.position * 250 + 40} 40`;
				this.teamBox.hidden = false;

				state.players.forEach(player => {
					this.playerBox = Engine.GetGUIObjectByName(`${PREFIX}Player[${team}][${player.id}]`);
					this.playerBox.hidden = false;
					if (g_IsObserver || state.players.length > 6)
						this.playerBox.sprite = "stretched:session/bannerStone.png"
					else if (team === 0)
						this.playerBox.sprite = "stretched:session/neutralDiplo.png"
					else if (state.position === 1)
						this.playerBox.sprite = "stretched:session/allyDiplo.png"
					else
						this.playerBox.sprite = "stretched:session/enemyDiplo.png"
					this.playerIcon = Engine.GetGUIObjectByName(`${PREFIX}Player[${team}][${player.id}]_civIcon`);
					this.playerIconBG = Engine.GetGUIObjectByName(`${PREFIX}Player[${team}][${player.id}]_civIconBG`);
					this.playerName = Engine.GetGUIObjectByName(`${PREFIX}Player[${team}][${player.id}]_name`);
					const civ = g_CivData[player.civ];
					this.playerIcon.sprite = "stretched:" + civ.Emblem;
					this.playerIcon.size = `34 ${(player.id - 1) * 50 + 67} 75 ${player.id * 50 + 57}`;
					this.playerIconBG.size = `33 ${(player.id - 1) * 50 + 66} 76 ${player.id * 50 + 58}`;

					let nameTopPad = 66;
					this.playerName.size = `74 ${(player.id - 1) * 50 + nameTopPad} 274 ${player.id * 50 + 59}`;
					this.playerName.text_valign = "center";

					let font = "sans-bold-stroke-18";
					let color = "dimmedWhite";
					this.playerName.caption = setStringTags(g_CivData[player.civ].Name, { color, font });
					font = "sans-bold-stroke-14";
					color = g_DiplomacyColors.getPlayerColor(playersStates.findIndex(w => w.name == player.name), 232);

					if (player.name.split(' ')[0].length > 16)
						this.playerName.caption += '\n' + setStringTags(player.name.split(' ')[0].slice(0, 14) + "...", { color, font });
					else
						this.playerName.caption += '\n' + setStringTags(player.name.split(' ')[0], { color, font });

					font = "sans-stroke-14";
					this.playerName.tooltip = g_CivData[player.civ].Name + "\n" + setStringTags(' █ ' + player.name, { color, font });
					if (g_Players[playersStates.findIndex(w => w.name == player.name)].isMutualAlly[g_ViewedPlayer])
						this.playerName.tooltip += "\n ALLY";
					else if (g_Players[playersStates.findIndex(w => w.name == player.name)].isEnemy[g_ViewedPlayer])
						this.playerName.tooltip += "\n ENEMY";
					this.playerIconBG.sprite_over = "stretched:session/portraits/emblems/states/hover.png";
					this.playerIconBG.onPress = () => openStructTree(g_CivData[player.civ].Code);
					this.playerIconBG.tooltip = g_CivData[player.civ].Name + "\n" + setStringTags(' █ ' + player.name, { color, font }) + "\n View civ details";
				});

			});
			this.confirmationMessage = Engine.GetGUIObjectByName(`CloseTeamSummaryMessage`);
			let font = "sans-stroke-18";
			let color = "dimmedWhite";
			if (!g_IsObserver)
				this.confirmationMessage.caption = setStringTags("Play!", { color, font });
			else
				this.confirmationMessage.caption = setStringTags("OK!", { color, font });
			this.confirmationMessage.text_valign = "center";
			this.confirmationMessage.text_align = "center";
			this.close = Engine.GetGUIObjectByName(`CloseTeamSummary`);
			this.close.onPress = () => {
				this.closeSummary();
			}
		}
	}
	closeSummary() {
		this.root.hidden = true;
		if (g_stats != undefined)
			g_stats.toggle(false);
	}
}
