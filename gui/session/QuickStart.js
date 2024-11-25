class QuickStart {

    constructor() {
        this.playerEntities = this.getPlayerEntities();
        this.currentState = "START";
        this.currentState = (this.isTooLate()) ? "TOOLATE" : "START";
        if (this.currentState == "START")
            this.civilCentreUnitAssociation = this.getCivilCentreUnitAssociation();
        this.IsAbort = false;
    }
    getPlayersStates() {
        return Engine.GuiInterfaceCall("boongui_GetOverlay", {
            g_IsObserver, g_ViewedPlayer, g_LastTickTime
        }).players ?? [];
    }

    // Return an object of player entities
    getPlayerEntities() {

        let playerEntities = {
            CivilCentre: [],
            FemaleCitizen: [],
            Melee: [],
            Ranged: [],
            Cavalry: []
        };

        const interfacePlayerEntities = Engine.GuiInterfaceCall("GetPlayerEntities");
        for (let entityId of interfacePlayerEntities) {
            let state = GetEntityState(entityId);
            for (let key in playerEntities) {
                if (hasClass(state, "Dog"))
                    break;
                if (hasClass(state, "Cavalry")) {
                    playerEntities["Cavalry"].push(entityId);
                    break;
                }
                else if (hasClass(state, key)) {
                    playerEntities[key].push(entityId);
                    break;
                }
            }
        }

        return playerEntities;
    }

    // Return a list of garrisonable player entities
    getGarrisonableEntities() {
        return [
            ...this.playerEntities.FemaleCitizen,
            ...this.playerEntities.Melee,
            ...this.playerEntities.Ranged,
            ...this.playerEntities.Cavalry
        ];
    }

    // Return a list of gaia entities of given resource type
    getGaiaEntities(resourceType) {
        let entities = [];
        Engine.SetViewedPlayer(0);
        const interfaceGaiaEntities = Engine.GuiInterfaceCall("GetPlayerEntities");
        Engine.SetViewedPlayer(g_ViewedPlayer);
        for (let entityId of interfaceGaiaEntities) {
            let state = GetEntityState(entityId);
            if ("resourceSupply" in state && "type" in state.resourceSupply && "specific" in state.resourceSupply.type && state.resourceSupply.type.specific === resourceType.specific)
                entities.push(entityId);
        }

        return entities;
    }

    // Return an object of the form {civilCentreId: entityIdList}
    getCivilCentreUnitAssociation() {
        let civilCentreUnitAssociation = Object.fromEntries(this.playerEntities.CivilCentre.map(id => [id, []]));
        const garrisonable = this.getGarrisonableEntities();
        garrisonable.forEach(id => civilCentreUnitAssociation[this.getClosestEntity(id, this.playerEntities.CivilCentre)].push(id));

        return civilCentreUnitAssociation;
    }
    getGenericResourceType() {
        return {
            meat: "food",
            fruit: "food",
            wood: "tree"
        }
    }

    // Return an object of the form {unitClass: resource}
    getUnitResourceAssociation() {
        return {

            Cavalry: { generic: this.getGenericResourceType()[Engine.ConfigDB_GetValue("user", "boongui.quickStart.cavalryAssignment")], specific: Engine.ConfigDB_GetValue("user", "boongui.quickStart.cavalryAssignment") },
            FemaleCitizen: { generic: this.getGenericResourceType()[Engine.ConfigDB_GetValue("user", "boongui.quickStart.femaleAssignment")], specific: Engine.ConfigDB_GetValue("user", "boongui.quickStart.femaleAssignment") },
            Melee: { generic: this.getGenericResourceType()[Engine.ConfigDB_GetValue("user", "boongui.quickStart.meleeAssignment")], specific: Engine.ConfigDB_GetValue("user", "boongui.quickStart.meleeAssignment") },
            Ranged: { generic: this.getGenericResourceType()[Engine.ConfigDB_GetValue("user", "boongui.quickStart.rangedAssignment")], specific: Engine.ConfigDB_GetValue("user", "boongui.quickStart.rangedAssignment") }
        }
    }
    getResourceObject(label) {
        if (label == "fruit")
            return { generic: "food", specific: "fruit" };
        if (label == "meat")
            return { generic: "food", specific: "meat" };
        if (label == "wood")
            return { generic: "wood", specific: "tree" };
        if (label == "stone")
            return { generic: "stone", specific: "rock" };
        if (label == "metal")
            return { generic: "metal", specific: "ore" };
        return { generic: undefined, specific: undefined };
    }

    // Return the id of the closest entity from a list
    getClosestEntity(entityId, entityList) {
        // Get info on given entity
        const state = GetEntityState(entityId);
        const position = new Vector2D(state.position.x, state.position.z);

        // Initialize candidate target
        let closestCandidate = undefined;
        let distanceCandidate = Infinity;

        // Find closest candidate target
        for (let id of entityList) {
            let targetState = GetEntityState(id);
            let targetPosition = new Vector2D(targetState.position.x, targetState.position.z);
            let distance = position.distanceTo(targetPosition);
            if (distance < distanceCandidate) {
                distanceCandidate = distance;
                closestCandidate = id;
            }
        }
        if (distanceCandidate > 125) {

            //warn("Resource not found in visible range.");
            return false;
        }
        return closestCandidate;
    }

    // End of get functions

    // Garrison units in closest CC
    garrison() {
        for (let civilCentreId in this.civilCentreUnitAssociation) {
            civilCentreId = parseInt(civilCentreId);
            g_UnitActions["garrison"].execute(
                civilCentreId,
                { target: civilCentreId },
                this.civilCentreUnitAssociation[civilCentreId],
                false,
                false
            );
        }
    }

    // Train citizens from CCs
    trainCitizens() {
        const playersStates = this.getPlayersStates();
        const userStates = playersStates.find(x => x.index === g_ViewedPlayer);
        let unitTypeID = parseFloat(Engine.ConfigDB_GetValue("user", "boongui.quickStart.unitsToTrain"));
        if (userStates.civ == "pers" && unitTypeID == 3)
            unitTypeID = 5;
        const template = GetEntityState(this.playerEntities.CivilCentre[0]).trainer.entities[unitTypeID];
        let trainableUnits = Math.round(parseFloat(Engine.ConfigDB_GetValue("user", "boongui.quickStart.numberOfUnitsToTrain")));

        if (trainableUnits > userStates.resourceCounts.food / GetTemplateData(template).cost.food)
            trainableUnits = Math.floor(userStates.resourceCounts.food / template.cost.food);
        Engine.PostNetworkCommand({
            "type": "train",
            "entities": this.playerEntities.CivilCentre,
            "template": template,
            "count": trainableUnits,
            "pushFront": false
        });
    }

    // Set rally point of entity on closest resource
    setRallyPoint(entityId, unitClass, resource) {
        const resourceType = (unitClass) ? this.getUnitResourceAssociation()[unitClass] : resource;
        const closestResource = this.getClosestEntity(entityId, this.getGaiaEntities(resourceType));

        if (!closestResource) {
            g_UnitActions["unset-rallypoint"].execute(
                undefined,
                undefined,
                [entityId],
                false,
                false
            );
            return;
        }
        const closestResourceState = GetEntityState(closestResource)
        const closestResourcePosition = closestResourceState.position;
        const closestResourceTemplate = closestResourceState.template;
        if (resourceType && closestResource)
            g_UnitActions["set-rallypoint"].execute(
                closestResourcePosition,
                {
                    data: {
                        command: "gather",
                        resourceType: resourceType,
                        resourceTemplate: closestResourceTemplate,
                        target: closestResource
                    }
                },
                [entityId],
                false,
                false
            );

        // Also move camera
        if (resourceType.specific == Engine.ConfigDB_GetValue("user", "boongui.quickStart.camerafocus"))
            Engine.CameraMoveTo(closestResourcePosition.x, closestResourcePosition.z);
    }

    // Unload all units of same class from a specific building
    unloadUnitClassFromBuilding(entityId, unitClass) {
        const unitList = this.playerEntities[unitClass];
        const templates = new Set(unitList.map(id => GetTemplateData(GetEntityState(id).template).selectionGroupName));
        for (let template of templates.keys()) {
            if (Engine.ConfigDB_GetValue("user", "boongui.quickStart.unloadIfUndefined") == "true" || (this.getUnitResourceAssociation()[unitClass].specific != "unassigned"))
                Engine.PostNetworkCommand({
                    "type": "unload-template",
                    "all": true,
                    "template": template,
                    "owner": g_ViewedPlayer,
                    "garrisonHolders": [entityId]
                });
        }
    }

    // Unload all units from all buildings
    unload() {
        for (let entityId of this.playerEntities.CivilCentre) {
            entityId = parseInt(entityId);
            for (let unitClass in this.getUnitResourceAssociation()) {

                this.setRallyPoint(entityId, unitClass);
                this.unloadUnitClassFromBuilding(entityId, unitClass)

            }
        }
    }

    // Determine whether the given building has all units garrisoned
    isGarrisoned(entityId) {
        return GetEntityState(entityId).garrisonHolder.entities.length == this.civilCentreUnitAssociation[entityId].length;
    }

    // Determine whether the given building has been unloaded
    isUnloaded(entityId) {
        return GetEntityState(entityId).garrisonHolder.entities.length == 0;
    }

    // Determine whether some action has already run
    isStartComplete() {
        if (this.currentState != "START")
            return false;
        return g_SimState.timeElapsed > 0;
    }

    // Determine whether all CCs have all units garrisoned
    isGarrisonComplete() {
        if (this.currentState != "BEFORE_UNLOAD")
            return false;
        return this.playerEntities.CivilCentre.every(id => this.isGarrisoned(id));
    }

    // Determine whether all CCs have been unloaded
    isUnloadComplete() {
        if (this.currentState != "UNLOADING")
            return false;
        return this.playerEntities.CivilCentre.every(id => this.isUnloaded(id));
    }

    // Determine whether it's too late to run. Default: more than 10 seconds
    // This happens, for example, when rejoining a game
    isTooLate() {
        return g_SimState.timeElapsed > 10000;
    }
    isAborted() {
        return this.IsAbort;
    }
    abort() {
        this.IsAbort = true;
    }

    // Select citizens from options
    selectCitizens() {
        g_Selection.reset();
        let entities = Engine.ConfigDB_GetValue("user", "boongui.quickStart.selectUnits").split(' ');
        for (let entity of entities)
            try {
                g_Selection.addList(this.playerEntities[entity]);
            } catch (e) { }
    }

    selectCivicCenter() {
        g_Selection.reset();
        g_Selection.addList(this.playerEntities.CivilCentre);
    }

    // Place farmstead
    placeFoundation() {
        let key = Engine.ConfigDB_GetValue("user", "boongui.quickStart.placeFoundation");
        if (key == "None")
            return;
        key = key.toLowerCase();
        const playerState = GetSimState().players[Engine.GetPlayerID()];
        const template = "structures/" + playerState.civ + "/" + key;
        startBuildingPlacement(template, playerState);
    }
    setFinalRallyPoint() {
        const resourceType = this.getResourceObject(Engine.ConfigDB_GetValue("user", "boongui.quickStart.rallyPoint"));
        for (let entityId of this.playerEntities.CivilCentre) {
            entityId = parseInt(entityId);
            this.setRallyPoint(entityId, false, resourceType);
        }
    }

}