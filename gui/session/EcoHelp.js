class EcoHelp {

    constructor() {
        this.modes = new Array;
        this.allyToTribute = new Array;
        this.playerEntities = this.getPlayerEntities();
        this.playersStates = this.getPlayersStates();
        this.hasBeenUpdated = { "stats": false, "pop": false }
        this.timeOfLastOrder = 3000;
        this.timeOfLastTribute = 3000;
        this.lastTrainerOrderedID = 0;
        this.hasMarket = false;
        this.lastPriceUpdate = {
            "food": 0,
            "wood": 0,
            "stone": 0,
            "metal": 0
        };
        this.resource = {
            "counts": {},
            "gatherers": {},
            "rates": {}
        };
        this.userRefRes = {
            "food": 0,
            "wood": 0,
            "stone": 0,
            "metal": 0
        };
        this.modes = this.getModes();
        this.unitsToIgnore = 0;
    }
    getModes() {
        const modes = [];
        const numModes = Engine.GetGUIObjectByName("StatsModesTabButtons").children.length;
        const prefix = "stretched:session/portraits/";
        for (let i = 0; i < numModes; i++) {
            const unitFromTab = Engine.GetGUIObjectByName(`StatsModesTabButton[${i}]_Name`);
            let name = unitFromTab.caption;

            const value = Number.parseFloat(Engine.GetGUIObjectByName(`StatsModesTabButton[${i}]_Count`).caption);
            const toggledIcon = "stretched:session/icons/bkg/portrait_" + Engine.ConfigDB_GetValue("user", "boongui.rightPanel.color") + ".dds";
            const checked = (Engine.GetGUIObjectByName(`StatsModesTabButton[${i}]_Background`).sprite == toggledIcon) ? true : false;
            modes.push({
                name,
                value,
                checked,
                count: 0
            });
        }
        return modes;
    }

    getUnspendableResources() {
        return {

            "food": Math.floor(Engine.ConfigDB_GetValue("user", "boongui.trainer.foodReserve")),
            "wood": Math.floor(Engine.ConfigDB_GetValue("user", "boongui.trainer.woodReserve")),
            "stone": Math.floor(Engine.ConfigDB_GetValue("user", "boongui.trainer.stoneReserve")),
            "metal": Math.floor(Engine.ConfigDB_GetValue("user", "boongui.trainer.metalReserve"))
        }
    }
    getPlayersStates() {
        const playersStates = Engine.GuiInterfaceCall("boongui_GetOverlay", {
            g_IsObserver, g_ViewedPlayer, g_LastTickTime
        }).players ?? [];
        return playersStates;
    }
    updateMarketPrices() {
        let i = 0;
        let prices = GetSimState().players[g_ViewedPlayer].barterPrices;
        for (const resType of g_BoonGUIResTypes) {
            this.sellPrice = Engine.GetGUIObjectByName(`ControlPanelTabButton[0][${4 + i}]_Count`);
            i++;
            if (Number.parseFloat(this.sellPrice.caption) == Math.round(prices.sell[resType]) && g_SimState.timeElapsed > this.lastPriceUpdate[resType] + 600)
                this.sellPrice.textcolor = "255 255 255";
            else if (Number.parseFloat(this.sellPrice.caption) != Math.round(prices.sell[resType])) {
                this.sellPrice.textcolor = (this.sellPrice.caption < prices.sell[resType]) ? "55 255 55" : "255 55 55";
                this.lastPriceUpdate[resType] = g_SimState.timeElapsed;
            }
            this.sellPrice.caption = Math.round(prices.sell[resType]);
            if (this.hasMarket)
                this.sellPrice.hidden = false;
            else
                this.sellPrice.hidden = true;

        }
    }
    updatePlayersStates() {
        this.playersStates = this.getPlayersStates();
        this.userStates = this.playersStates.find(x => x.index === g_ViewedPlayer);
        this.idleTrainers = this.getNumberOfIdleTrainers();
    }

    // This function is responsible for executing a series of tasks during gameplay.
    tickTasks() {
        // Execute these tasks only if the player is not an observer.
        if (!g_IsObserver) {
            // Update the toggledIcon whenever the color changes.
            const toggledIcon = "stretched:session/icons/bkg/portrait_" + Engine.ConfigDB_GetValue("user", "boongui.rightPanel.color") + ".dds";
            // Check if preparing for next phase.
            this.preparingNextPhase = Engine.GetGUIObjectByName(`ControlPanelTabButton[0][8]_Background`).sprite == toggledIcon;

            // Get the states of all players and filter by the currently viewed player.
            this.updatePlayersStates();
            this.updateMarketPrices();
            // If not preparing for next phase, perform these tasks.
            if (this.preparingNextPhase == false) {
                // Update market prices, get modes, and get player entities.
                this.modes = this.getModes();
                this.playerEntities = this.getPlayerEntities();

                // If the control panel tab button icon matches the toggledIcon, train citizens and check for updates.
                if (Engine.GetGUIObjectByName(`ControlPanelTabButton[0][0]_Background`).sprite == toggledIcon && !this.userStates.trainingBlocked) {
                    this.trainCitizens();
                    this.checkIfUpdated();
                }

                // Research technologies and check for updates.
                this.researchTechnologies();
                this.checkIfUpdated();

                // If the control panel tab button icon matches the toggledIcon, help allies tribute and check for updates.
                if (Engine.GetGUIObjectByName(`ControlPanelTabButton[0][3]_Background`).sprite == toggledIcon) {
                    this.helpAlliesTribute();
                    this.checkIfUpdated();
                }
            }
            // If preparing for next phase, perform these tasks.
            else if (this.preparingNextPhase == true) {
                // Get player entities and researcher technologies.
                this.playerEntities = this.getPlayerEntities();
                if (this.playerEntities.CivilCentre[0]) {
                    let playerEntity = this.playerEntities.CivilCentre[0];
                    let state = GetEntityState(playerEntity);
                    let reseachableTechs = state.researcher.technologies;

                    // If a researchable technology is available, make the research and toggle the control panel mode.
                    if (reseachableTechs[0]) {
                        let tech = reseachableTechs[0];
                        if (this.makeResearch(playerEntity, tech, true)) {
                            g_stats.controlPanel.toggleMode(8, true);
                            this.timeOfLastOrder = g_SimState.timeElapsed + 1200;
                            this.hasBeenUpdated = { "stats": false, "pop": false };
                        }
                    }
                }
            }
        }
    }

    // This function checks if an entity has been updated recently by comparing its state to the previous time it was ordered.
    checkIfUpdated() {
        // Get the state of the last trainer that was ordered.
        let state = GetEntityState(this.lastTrainerOrdered);

        // Check if the elapsed game time is greater than the time of the last order.
        if (g_SimState.timeElapsed > this.timeOfLastOrder) {
            // If the last trainer ordered no longer exists, set hasBeenUpdated to true.
            if (!GetEntityState(this.lastTrainerOrdered))
                this.hasBeenUpdated = { "stats": true, "pop": true };
            // Otherwise, check if there are items in the production queue or if enough time has passed since the last order to set hasBeenUpdated to true.
            else if (g_SimState.timeElapsed - this.timeOfLastOrder > 1800)
                this.hasBeenUpdated = { "stats": true, "pop": true };
            else if (g_SimState.timeElapsed - this.timeOfLastOrder > 600)
                this.hasBeenUpdated = { "stats": true, "pop": false };
        }
    }

    // This function returns the number of idle trainers by checking their production queue status
    getNumberOfIdleTrainers() {
        let num = 0;
        try {
            // Loop through all the Trainer entities owned by the player
            for (let trainerID in this.playerEntities.Trainer) {
                // Get the state of each Trainer entity
                let state = GetEntityState(this.playerEntities.Trainer[trainerID]);

                // Check if the production queue of the Trainer entity is empty or if there is only one item in the queue and its progress is greater than 0.9
                if (state?.production?.queue.length === 0 || (state?.production?.queue.length === 1 && state?.production?.queue[0].progress > 0.9)) {
                    let trainableUnitsList = this.getTrainableUnitsFromTrainer(state);

                    for (let trainableUnit of trainableUnitsList) {
                        let matchingMode = this.modes.find(x => x.name == trainableUnit);
                        const toggledIcon = "stretched:session/icons/bkg/portrait_" + Engine.ConfigDB_GetValue("user", "boongui.rightPanel.color") + ".dds";
                        if (hasClass(state, "Corral") && Engine.GetGUIObjectByName(`ControlPanelTabButton[1][5]_Background`).sprite == toggledIcon && this.userStates.classCounts.Animal < 50) {
                            num++;
                            break;
                        }
                        if (matchingMode != undefined) {
                            // If the Trainer is idle and has a unit that's selected for training, increment the count
                            if (matchingMode.checked == true || matchingMode.value != 0) {
                                num++;
                                break;
                            }
                        }
                    }
                }
            }
        } catch (error) {
            // Catch any errors that may occur during execution
            warn('An error occurred while retrieving the number of idle Trainers:', error);
            return -1; // Return -1 to indicate an error occurred
        }
        // Return the number of idle Trainers
        return num;
    }

    setNotToTribute(playerNick) {
        this.allyToTribute = this.allyToTribute.filter(x => x != playerNick);
    }
    setToTribute(playerNick) {
        this.allyToTribute.push(playerNick);
    }
    // This function is for tributing resources to allied players.
    helpAlliesTribute() {

        // Define the image path for the toggled icon based on user config
        const toggledIcon = "stretched:session/icons/bkg/portrait_" + Engine.ConfigDB_GetValue("user", "boongui.rightPanel.color") + ".dds";

        // Check if the user states have been updated and if player states exist
        if (this.userStates && this.timeOfLastTribute + 1200 < g_SimState.timeElapsed) {

            // Loop through each player state
            checkAllies:
            for (let playerStates of this.playersStates) {

                let state = playerStates;
                // Check if the player is in the list of allies to tribute
                if (this.allyToTribute.indexOf(state.name.split(' ')[0]) != -1) {

                    // Loop through each resource type to be shared
                    for (const resType of g_BoonGUIResTypes) {
                        // Get the current amount of the resource for the player being checked and the user
                        let value = state.resourceCounts[resType];
                        let userRes = this.userStates.resourceCounts[resType];
                        let userGatherers = this.userStates.resourceGatherers[resType];
                        let shareratio = 0;

                        // Get the share ratio for the resource based on the toggled icon and resource type
                        if (resType == "food")
                            shareratio = (Engine.GetGUIObjectByName(`ControlPanelTabButton[4][0]_Background`).sprite == toggledIcon) ? Engine.GetGUIObjectByName(`ControlPanelTabButton[4][0]_Count`).caption : 0;
                        else if (resType == "wood")
                            shareratio = (Engine.GetGUIObjectByName(`ControlPanelTabButton[4][1]_Background`).sprite == toggledIcon) ? Engine.GetGUIObjectByName(`ControlPanelTabButton[4][1]_Count`).caption : 0;
                        else if (resType == "stone")
                            shareratio = (Engine.GetGUIObjectByName(`ControlPanelTabButton[4][2]_Background`).sprite == toggledIcon) ? Engine.GetGUIObjectByName(`ControlPanelTabButton[4][2]_Count`).caption : 0;
                        else if (resType == "metal")
                            shareratio = (Engine.GetGUIObjectByName(`ControlPanelTabButton[4][3]_Background`).sprite == toggledIcon) ? Engine.GetGUIObjectByName(`ControlPanelTabButton[4][3]_Count`).caption : 0;

                        // Check if the user resource count has changed
                        if (this.userRefRes[resType] != userRes) {
                            // Check if both the player being checked and the user have resources and gatherers for the resource type
                            if (userRes && userGatherers) {
                                // calcResOptiulate the gatherer ratio of the player being checked to the user
                                let gatherratio = (state.resourceGatherers[resType] + 1) / (userGatherers + 1);
                                // Get the tribute reserve specified in the config
                                const resReserve = Math.floor(Engine.ConfigDB_GetValue("user", "boongui.autoTribute.tributeReserve"));

                                // calcResOptiulate the optimal amount to tribute based on share ratio, player resources and gatherers, and user resources
                                let calcResOpti = Math.min(Math.round((((userRes - resReserve) - value - resReserve * gatherratio) * shareratio)), 500)
                                if (userRes > resReserve + calcResOpti && calcResOpti > 100 && value < 1000 && value < userRes * shareratio) {
                                    // If the optimal amount to tribute is greater than 100, send a tribute command
                                    let playerID = state.index;
                                    this.userRefRes[resType] = userRes;
                                    Engine.PostNetworkCommand({
                                        "type": "tribute",
                                        "player": playerID,
                                        "amounts": {
                                            [resType]: calcResOpti
                                        }
                                    });
                                    this.timeOfLastTribute = g_SimState.timeElapsed;
                                    this.userStates.resourceCounts[resType] -= calcResOpti;
                                    return;
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    getRemainingUnitsToTrain(template) {
        const matchingMode = this.modes.find(x => x.name === template);
        if (matchingMode) {
            if (matchingMode.checked)
                return this.userStates.popLimit * 1;
            let currentRatio = (Engine.ConfigDB_GetValue("user", "boongui.trainer.strictCompo") == "true") ? matchingMode.count / (this.userStates.maxPop - this.unitsToIgnore) : matchingMode.count / (GetSimState().players[g_ViewedPlayer].popCount - this.unitsToIgnore);
            if (currentRatio > matchingMode.value / 100) {
                if (matchingMode.value >= 1) {
                    let shouldOverTrain = (Engine.ConfigDB_GetValue("user", "boongui.trainer.strictCompo") == "true") ? 0 : (1 - (currentRatio - matchingMode.value / 100));
                    return shouldOverTrain;
                }

                else
                    return 0;
            }
            return this.userStates.popLimit * (matchingMode.value / 100) - matchingMode.count;
        } else {
            return 0;
        }
    }
    getTrainableUnitsCorrals(template) {
        let unitCost = GetTemplateData(template).cost;
        let trainableUnits = Engine.GetGUIObjectByName(`ControlPanelTabButton[1][5]_Count`).caption;
        let i = 0;
        for (const resType of g_BoonGUIResTypes) {
            let unspendatbleResources = 0;
            let spendableRes = this.userStates.resourceCounts[resType] - unspendatbleResources;
            if (spendableRes < 0)
                spendableRes = 0;
            if (trainableUnits > spendableRes / unitCost[resType]) {
                trainableUnits = Math.floor(spendableRes / unitCost[resType]);
            }
            i++;
        }
        if (this.userStates.classCounts.Animal * 1 + trainableUnits * 1 > 50) { //HARDCODED animal limit !
            trainableUnits = 50 - this.userStates.classCounts.Animal;
        }
        if (trainableUnits > 1 && this.idleTrainers > 1)
            trainableUnits = Math.max(Math.floor(trainableUnits / this.idleTrainers), 1);
        return trainableUnits;
    }
    getTrainableUnits(template) {
        let unitCost = GetTemplateData(template).cost;
        let trainableUnits = Math.floor(this.userStates.popLimit - this.userStates.popCount / unitCost.population);
        if (template.includes("war_dog")) { //Dogs in a26
            const matchingMode = this.modes.find(x => x.name === template);
            trainableUnits = 20 - matchingMode.count; //HARDCODED
        }
        let i = 0;
        for (const resType of g_BoonGUIResTypes) {
            const toggledIcon = "stretched:session/icons/bkg/portrait_" + Engine.ConfigDB_GetValue("user", "boongui.rightPanel.color") + ".dds";
            let unspendableResources = (Engine.GetGUIObjectByName(`ControlPanelTabButton[1][${i}]_Background`).sprite == toggledIcon) ? Engine.GetGUIObjectByName(`ControlPanelTabButton[1][${i}]_Count`).caption : 0;
            let spendableRes = this.userStates.resourceCounts[resType] - unspendableResources;
            if (inputState != 0 && placementSupport?.template)
                spendableRes = this.userStates.resourceCounts[resType] - Math.max(unspendableResources, GetTemplateData(placementSupport.template).cost[resType]);
            if (spendableRes < 0)
                spendableRes = 0;
            if (trainableUnits > spendableRes / unitCost[resType]) {
                trainableUnits = Math.floor(spendableRes / unitCost[resType]);
            }
            i++;
        }
        return trainableUnits;
    }
    splitTrainableUnitsAndCheck(template, trainableUnits) {
        if (template) {
            let unitCost = GetTemplateData(template).cost;
            const maxTrainingBatchSize = Engine.GetGUIObjectByName(`ControlPanelTabButton[1][4]_Count`).caption;
            if (trainableUnits > 1 && this.idleTrainers > 1)
                trainableUnits = Math.max(Math.floor(trainableUnits / this.idleTrainers), 1);
            if (trainableUnits > Math.ceil(maxTrainingBatchSize / (unitCost.population)))
                trainableUnits = Math.ceil(maxTrainingBatchSize / (unitCost.population));
            if (trainableUnits * unitCost.population > this.userStates.popLimit - this.userStates.popCount && trainableUnits >= 1)
                trainableUnits = Math.floor((this.userStates.popLimit - this.userStates.popCount) / unitCost.population);
            return trainableUnits;
        }
        return 0;
    }
    canResearch(unitCost) {

        for (const resType of g_BoonGUIResTypes) {
            let spendableRes = this.userStates.resourceCounts[resType];
            if (inputState != 0 && placementSupport?.template)
                spendableRes -= GetTemplateData(placementSupport.template).cost[resType];
            if (spendableRes < 0)
                spendableRes = 0;
            if (unitCost[resType] > spendableRes) {
                return false;
            }
        }
        return true;
    }
    makeResearch(entity, tech, priority) {
        let isTechnologyResearchable = Engine.GuiInterfaceCall("CheckTechnologyRequirements", {
            "tech": tech,
            "player": this.userStates.index
        });
        let state = GetEntityState(entity);
        if (priority == true && state?.production?.queue[0]?.timeRemaining != undefined)
            if (state.production.queue[0].timeRemaining <= Math.round(Engine.ConfigDB_GetValue("user", "boongui.barter.pushOrderIfFrontTimeRemaining")))
                priority = false;
        let hasResForResearch = this.canResearch(TechnologyTemplates.Get(tech).cost);
        if (hasResForResearch && isTechnologyResearchable) {
            Engine.PostNetworkCommand({
                "type": "research",
                "entity": entity,
                "template": tech,
                "pushFront": priority
            });
            this.hasBeenUpdated.stats = false;
            this.lastTrainerOrdered = entity;
            this.timeOfLastOrder = g_SimState.timeElapsed;
            return true;

        }
        return false;
    }
    researchTechnologies() {

        research:
        if (this.hasBeenUpdated.stats == true) {
            const toggledIcon = "stretched:session/icons/bkg/portrait_" + Engine.ConfigDB_GetValue("user", "boongui.rightPanel.color") + ".dds";
            for (let researcherID in this.playerEntities.Researcher) {
                let playerEntity = this.playerEntities.Researcher[researcherID]
                let state = GetEntityState(playerEntity);
                if (state.researcher
                    && this.userStates && (state.production.queue.length === 0 || (state.production.queue.length === 1 && state.production.queue[0].timeRemaining <= 1000))) {
                    let reseachableTechs = JSON.parse(JSON.stringify(state.researcher.technologies));
                    //forge:
                    if (Engine.GetGUIObjectByName(`ControlPanelTabButton[0][1]_Background`).sprite == toggledIcon) {
                        if (state.identity.classes.indexOf("Forge") !== -1) {

                            for (let tech of reseachableTechs.reverse()) {
                                if (state.researcher.technologies.indexOf(tech) != -1)
                                    if (Engine.GetGUIObjectByName(`ControlPanelTabButton[2][${state.researcher.technologies.indexOf(tech)}]_Background`).sprite == toggledIcon
                                        && tech.split('_0').slice(0, 0) <= Engine.GetGUIObjectByName(`ControlPanelTabButton[2][${state.researcher.technologies.indexOf(tech)}]_Count`).caption.length || !tech.split('_0')[1])
                                        if (tech !== null && tech != "archer_attack_spread") {
                                            if (this.makeResearch(playerEntity, tech, false))
                                                break research;
                                        }
                            }
                        }
                    }

                    if (Engine.GetGUIObjectByName(`ControlPanelTabButton[0][2]_Background`).sprite == toggledIcon) {
                        //Storehouse:
                        let triggerWoodAmount = Math.round(parseFloat(Engine.ConfigDB_GetValue("user", "boongui.ecohelp.woodStorehouseP1")));
                        if (Engine.GetGUIObjectByName(`ControlPanelTabButton[3][0]_Background`).sprite == toggledIcon) {
                            if ((hasClass(state, "Storehouse") && (this.userStates.phase != "village" || this.userStates.resourceCounts.wood > triggerWoodAmount) && reseachableTechs[0])) {
                                let tech = reseachableTechs[0];
                                if (this.makeResearch(playerEntity, tech, false))
                                    break research;
                            }
                        }
                        if (Engine.GetGUIObjectByName(`ControlPanelTabButton[3][2]_Background`).sprite == toggledIcon) {
                            if ((hasClass(state, "Storehouse") && reseachableTechs[1])) {
                                let tech = reseachableTechs[1];
                                if (this.makeResearch(playerEntity, tech, false))
                                    break research;
                            }
                        }
                        if (Engine.GetGUIObjectByName(`ControlPanelTabButton[3][3]_Background`).sprite == toggledIcon)
                            if ((hasClass(state, "Storehouse") && reseachableTechs[2])) {
                                let tech = reseachableTechs[2];
                                if (this.makeResearch(playerEntity, tech, false))
                                    break research;
                            }
                        triggerWoodAmount = Math.round(parseFloat(Engine.ConfigDB_GetValue("user", "boongui.ecohelp.woodFarmP1")));
                        //farmstead:
                        if (Engine.GetGUIObjectByName(`ControlPanelTabButton[3][4]_Background`).sprite == toggledIcon) {

                            if ((hasClass(state, "Farmstead") && reseachableTechs[0])) {
                                let tech = reseachableTechs[0];
                                if (this.makeResearch(playerEntity, tech, false))
                                    break research;
                            }
                        }
                        if (Engine.GetGUIObjectByName(`ControlPanelTabButton[3][1]_Background`).sprite == toggledIcon) {
                            if ((hasClass(state, "Farmstead") && (this.userStates.phase != "village" || this.userStates.resourceCounts.wood > triggerWoodAmount) && reseachableTechs[1])) {
                                let tech = reseachableTechs[1];
                                if (this.makeResearch(playerEntity, tech, false))
                                    break research;
                            }
                        }
                    }
                }
            }
        }
    }
    getTrainableUnitsFromTrainer(state) {
        if (state.trainer) {
            let trainableUnitsList = (Engine.ConfigDB_GetValue("user", "boongui.trainer.reversePriority") == "true") ? JSON.parse(JSON.stringify(state.trainer.entities)) : JSON.parse(JSON.stringify(state.trainer.entities)).reverse();
            if (Array.isArray(trainableUnitsList))
                return trainableUnitsList;
            else
                return [];
        }
    }
    trainCitizens() {
        if (this.hasBeenUpdated.pop == true) {

            for (let trainerID in this.playerEntities.Trainer) {
                let state = GetEntityState(this.playerEntities.Trainer[trainerID]);
                let unitToTrain = false;
                let unitToTrainQty = 0;
                let unitToTrainQtyMax = 0;
                if ((state?.production?.queue[0]?.unitTemplate != undefined || state?.production?.queue.length === 0) && !state.production.autoqueue) {
                    if (state.trainer && this.userStates) {
                        let trainableUnitsList = this.getTrainableUnitsFromTrainer(state);

                        for (let trainableUnit of trainableUnitsList) {
                            let matchingMode = this.modes.find(x => x.name == trainableUnit);
                            if (matchingMode != undefined) {

                                if (GetTemplateData(trainableUnit).requiredTechnology) {

                                    let technologyEnabled = Engine.GuiInterfaceCall("IsTechnologyResearched", {
                                        "tech": GetTemplateData(trainableUnit).requiredTechnology,
                                        "player": this.userStates.index
                                    });
                                    if (!technologyEnabled)
                                        continue;
                                }
                                let thisToTrainQty = this.getTrainableUnits(trainableUnit);
                                let thisToTrainQtyMax = this.getRemainingUnitsToTrain(trainableUnit);
                                if ((((thisToTrainQtyMax > unitToTrainQtyMax) && (thisToTrainQtyMax > 0 && thisToTrainQty > 0)) || (matchingMode.checked && thisToTrainQty >= 1))) {

                                    unitToTrain = trainableUnit;
                                    unitToTrainQty = this.getTrainableUnits(trainableUnit); //Do not limite batch for compo
                                    unitToTrainQtyMax = this.getRemainingUnitsToTrain(trainableUnit);
                                    if (matchingMode.checked && unitToTrainQty >= 1) {
                                        break;

                                    }


                                }

                            }

                        }
                    }
                    if (unitToTrain != false || hasClass(state, "Corral")) {



                        if ((state.production.queue.length === 0 || ((state.production.queue.length === 1 || state.production.autoqueue) && state.production.queue[0].timeRemaining <= 1000))) {

                            let trainableUnits = this.splitTrainableUnitsAndCheck(unitToTrain, unitToTrainQty);
                            if (hasClass(state, "Corral")) {
                                let trainableUnitsList = this.getTrainableUnitsFromTrainer(state);
                                let unitCorralSelected = Engine.GetGUIObjectByName(`ControlPanelTabButton[1][5]_Name`).caption;
                                unitToTrain = trainableUnitsList.find(x => x.includes(unitCorralSelected));


                                if (unitToTrain) {
                                    trainableUnits = this.getTrainableUnitsCorrals(unitToTrain);
                                }
                                else
                                    continue;
                            }
                            const template = unitToTrain;
                            if (trainableUnits >= 1) {
                                const batchMultiple = Math.round(Engine.ConfigDB_GetValue("user", "boongui.trainer.batchMultiple"));
                                trainableUnits = (trainableUnits < batchMultiple) ? trainableUnits : trainableUnits - (Math.floor(trainableUnits % batchMultiple));
                                this.hasBeenUpdated = { "stats": false, "pop": false }
                                this.lastTrainerOrdered = this.playerEntities.Trainer[trainerID];
                                this.timeOfLastOrder = g_SimState.timeElapsed;
                                Engine.PostNetworkCommand({
                                    "type": "train",
                                    "entities": JSON.parse("[" + JSON.stringify(this.playerEntities.Trainer[trainerID]) + "]"),
                                    "template": template,
                                    "count": trainableUnits,
                                    "pushFront": false
                                });
                                this.cacheStats(template, trainableUnits, state);
                            }
                        }
                    }
                }
            }
        }
    }
    cacheStats(unit, batchSize, state) {
        let unitCost = GetTemplateData(unit).cost;
        if (hasClass(state, "Corral"))
            this.userStates.classCounts.Animal += batchSize;
        else
            this.userStates.popCount += batchSize * unitCost.population;
        for (const resType of g_BoonGUIResTypes) {
            if (unitCost[resType] > 0)
                this.userStates.resourceCounts[resType] -= unitCost[resType] * batchSize;
        }
        if (this.modes.find(x => x.name == unit))
            this.modes.find(x => x.name == unit).count += batchSize;
        this.idleTrainers--;
    }
    // Return an object of player entities
    getPlayerEntities() {
        this.unitsToIgnore = 0;
        let playerEntities = {
            CivilCentre: [],
            Trainer: [],
            Researcher: []
        };
        for (let mode in this.modes) {
            this.modes[mode].count = 0;
        }
        const interfacePlayerEntities = Engine.GuiInterfaceCall("GetPlayerEntities");
        this.hasMarket = false;
        for (let entityId of interfacePlayerEntities) {
            let state = GetEntityState(entityId);
            let templatedata = GetTemplateData(state.template);
            const matchingMode = this.modes.find(x => x.name == state.template);

            if (matchingMode != undefined) {
                matchingMode.count++;
                if (matchingMode.checked == true || matchingMode.value == 0) {
                    if (templatedata.cost != undefined)
                        if (templatedata.cost.population > 0)
                            this.unitsToIgnore += templatedata.cost.population * 1;
                }
            }
            else if (templatedata.cost != undefined)
                if (templatedata.cost.population > 0)
                    this.unitsToIgnore += templatedata.cost.population * 1;


            if (state?.production?.queue[0] != undefined) {
                if (state.production.queue[0].unitTemplate != undefined) {
                    let unitTemplateInProduction = state.production.queue[0].unitTemplate;
                    if (GetTemplateData(unitTemplateInProduction)?.cost?.population != undefined) {

                        let popCostUnitInProduction = GetTemplateData(unitTemplateInProduction).cost.population;
                        const trainerMatchingMode = this.modes.find(x => x.name == unitTemplateInProduction);
                        if ((trainerMatchingMode != undefined) && popCostUnitInProduction > 0) {
                            if (trainerMatchingMode.value > 0)
                                trainerMatchingMode.count += state.production.queue[0].count * popCostUnitInProduction;
                            else
                                this.unitsToIgnore += state.production.queue[0].count * popCostUnitInProduction;
                        }
                        else if (popCostUnitInProduction > 0)
                            this.unitsToIgnore += state.production.queue[0].count * popCostUnitInProduction;
                        else if (trainerMatchingMode != undefined && popCostUnitInProduction == 0)
                            trainerMatchingMode.count += state.production.queue[0].count;
                    }
                }
            }
            const toggledIcon = "stretched:session/icons/bkg/portrait_" + Engine.ConfigDB_GetValue("user", "boongui.rightPanel.color") + ".dds";
            for (let key in playerEntities) {

                if (hasClass(state, "Foundation"))
                    break;
                if (hasClass(state, "Market"))
                    this.hasMarket = true;
                if (hasClass(state, "Economic") || hasClass(state, "Forge")) {
                    playerEntities["Researcher"].push(entityId);
                    if (!hasClass(state, "Dock") && !hasClass(state, "Corral"))
                        break;
                }
                const classesList = GetTemplateData(state.template).visibleIdentityClasses;
                let configClasses = Engine.ConfigDB_GetValue("user", "boongui.trainer.trainerClasses").split(",");
                if ((Engine.GetGUIObjectByName(`ControlPanelTabButton[1][5]_Background`).sprite == toggledIcon))
                    configClasses.push("Corral");
                if (classesList)
                    if (configClasses.some(c => classesList.includes(c))) {
                        if (hasClass(state, "Corral"))
                            playerEntities["Trainer"].unshift(entityId);
                        else
                            playerEntities["Trainer"].push(entityId);
                        if (hasClass(state, "CivilCentre"))
                            playerEntities["CivilCentre"].push(entityId);
                        break;
                    }


            }
        }

        return playerEntities;
    }

}

