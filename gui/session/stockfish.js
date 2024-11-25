class stockfish {
    constructor() {
        this.garrisonEnt = new Array();
        this.turretEnt = new Array();
        this.maxChain = 20;
        this.maxChainInversionLenght = this.maxChain;
    }
    // Return an object of player entities
    getPlayerEntities() {
        return Engine.GuiInterfaceCall("GetPlayerEntities");
    }
    getNextRelay(entityId) {
        return this.getClosestRallyPointEntity(entityId, this.getPlayerEntities());

    }
    getClosestEntityToPosition(position, entityList) {
        try {
            // Initialize candidate target
            let closestCandidate = undefined;
            let distanceCandidate = Infinity;

            // Find closest candidate target
            for (let id of entityList) {
                try {
                    let targetState = GetEntityState(id);
                    let targetPosition = new Vector2D(targetState.position.x, targetState.position.z);
                    let distance = position.distanceTo(targetPosition);
                    if (distance < distanceCandidate) {
                        distanceCandidate = distance;
                        closestCandidate = id;
                    }
                } catch (e) { }
            }
            return closestCandidate;
        } catch (e) { }
    }
    getClosestEntity(entityId, entityList) {
        // Get info on given entity
        const state = GetEntityState(entityId);
        if (!state?.rallyPoint?.position)
            return false;
        try {
            const position = new Vector2D(state.position.x, state.position.z);

            // Initialize candidate target
            let closestCandidate = undefined;
            let distanceCandidate = Infinity;

            // Find closest candidate target
            for (let id of entityList) {
                try {
                    let targetState = GetEntityState(id);
                    let targetPosition = new Vector2D(targetState.position.x, targetState.position.z);
                    let distance = position.distanceTo(targetPosition);
                    if (distance < distanceCandidate) {
                        distanceCandidate = distance;
                        closestCandidate = id;
                    }
                } catch (e) { }
            }
            return closestCandidate;
        } catch (e) { }
    }
    getClosestRallyPointEntity(entityId, entityList) {
        // Get info on given entity
        const state = GetEntityState(entityId);
        if (!state?.rallyPoint?.position)
            return false;
        try {
            const position = new Vector2D(state.rallyPoint.position.x, state.rallyPoint.position.z);

            // Initialize candidate target
            let closestCandidate = undefined;
            let distanceCandidate = Infinity;

            // Find closest candidate target
            for (let id of entityList) {
                try {
                    let targetState = GetEntityState(id);
                    let targetPosition = new Vector2D(targetState.position.x, targetState.position.z);
                    let distance = position.distanceTo(targetPosition);
                    if (distance < distanceCandidate) {
                        distanceCandidate = distance;
                        closestCandidate = id;
                    }
                } catch (e) { }
            }
            return closestCandidate;
        } catch (e) { }
    }
    setLinkRallyPoint(newEndEnt, nextRelayEnt) {
        let state = GetEntityState(newEndEnt);
        if (state?.position && !state?.turretHolder) {
            const position = state.position;
            g_UnitActions["set-rallypoint"].execute(
                position,
                {
                    data: {
                        command: "garrison",
                        target: newEndEnt
                    }
                },
                [nextRelayEnt],
                false,
                false
            );
        }
        else if (state?.position && state?.turretHolder) {
            const position = state.position;
            g_UnitActions["set-rallypoint"].execute(
                position,
                {
                    data: {
                        command: "occupy-turret",
                        target: newEndEnt
                    }
                },
                [nextRelayEnt],
                false,
                false
            );
        }
    }
    invertFromEntity(newEndEnt) {
        const nextRelayEnt = this.getNextRelay(newEndEnt);
        if (nextRelayEnt) {
            if (nextRelayEnt != newEndEnt && this.getNextRelay(nextRelayEnt) != newEndEnt && this.maxChainInversionLenght > 0) {
                this.maxChainInversionLenght--;
                this.invertFromEntity(nextRelayEnt);
            }
            this.setLinkRallyPoint(newEndEnt, nextRelayEnt);
        }
    }
    invertFromSelection() {
        this.maxChainInversionLenght = this.maxChain;
        const selectedEntity = g_Selection.filter(e => {
            let state = GetEntityState(e);
            return state && (!!state.garrisonHolder || !!state.turretHolder);
        })[0];
        this.invertFromEntity(selectedEntity);
        this.setLinkRallyPoint(selectedEntity, selectedEntity);
    }
    autoLinkSelection() {
        try {
            const firstEntityState = GetEntityState(g_Selection.filter(e => {
                let state = GetEntityState(e);
                return state && (!!state.garrisonHolder || !!state.turretHolder);
            })[0]);
            let entityList = g_Selection.filter(e => {
                let state = GetEntityState(e);
                return state && (!!state.garrisonHolder || !!state.turretHolder);
            });
            const firstEntityRallyPosition = new Vector2D(firstEntityState.rallyPoint.position.x, firstEntityState.rallyPoint.position.z);
            let closestEntity = this.getClosestEntityToPosition(firstEntityRallyPosition, entityList);
            let nextEntity = this.getClosestEntity(closestEntity, entityList);
            while (entityList.length > 1) {
                closestEntity = this.getClosestEntityToPosition(firstEntityRallyPosition, entityList);
                entityList = entityList.filter(x => x != closestEntity);
                nextEntity = this.getClosestEntity(closestEntity, entityList);
                this.setLinkRallyPoint(closestEntity, nextEntity);
                let closestToEnd = this.getClosestEntityToPosition(firstEntityRallyPosition, [closestEntity, nextEntity])
                if (closestToEnd != closestEntity) {
                    entityList = entityList.filter(x => x != nextEntity);
                    nextEntity = this.getClosestEntity(closestEntity, entityList);
                }
                closestEntity = nextEntity;

            }
            if (Engine.ConfigDB_GetValue("user", "progui.stockfish.debug") === "true")
                warn("auto-link OK");
            this.enableOnSelection();
        } catch (e) {
            warn("auto-link FAILED -- usage: 1.Select buildings to link   2.Set all buildings to the same end rally-point   3.Press this hotkey.");
        }
    }
    clearAll() {
        this.garrisonEnt = [];
        this.turretEnt = [];
        if (Engine.ConfigDB_GetValue("user", "progui.stockfish.debug") === "true")
            warn("Cleared");
    }
    enableOnSelection() {
        const garrisonHolders = g_Selection.filter(e => {
            let state = GetEntityState(e);
            return state && !!state.garrisonHolder;
        });
        garrisonHolders.forEach(entity => {
            if (this.garrisonEnt.indexOf(entity) === -1)
                this.garrisonEnt.push(entity);
        });
        const turretHolders = g_Selection.filter(e => {
            let state = GetEntityState(e);
            return state && !!state.turretHolder;
        });
        turretHolders.forEach(entity => {
            if (this.turretEnt.indexOf(entity) === -1)
                this.turretEnt.push(entity);
        });

        if (Engine.ConfigDB_GetValue("user", "progui.stockfish.debug") === "true")
            warn("Active on : " + JSON.stringify(this.garrisonEnt));
    }
    disableOnSelection() {
        const garrisonHolders = g_Selection.filter(e => {
            let state = GetEntityState(e);
            return state && !!state.garrisonHolder;
        });
        garrisonHolders.forEach(entity => {
            const index = this.garrisonEnt.indexOf(entity);
            if (index !== -1) {
                this.garrisonEnt.splice(index, 1);
            }
        });
        const turretHolders = g_Selection.filter(e => {
            let state = GetEntityState(e);
            return state && !!state.turretHolder;
        });
        turretHolders.forEach(entity => {
            const index = this.garrisonEnt.indexOf(entity);
            if (index !== -1) {
                this.turretEnt.splice(index, 1);
            }
        });
        if (Engine.ConfigDB_GetValue("user", "progui.stockfish.debug") === "true")
            warn("Still active on : " + JSON.stringify(this.garrisonEnt));
    }
    tickTasks() {
        let ownEnts = [];
        let otherEnts = [];

        for (let ent of this.garrisonEnt) {
            try {
                let state = GetEntityState(ent);
                if (state?.garrisonHolder?.entities[0])
                {
                    if (controlsPlayer(GetEntityState(ent).player) && g_ViewedPlayer == GetEntityState(state?.garrisonHolder?.entities[0]).player)
                        ownEnts.push(ent);
                    else if (g_ViewedPlayer == GetEntityState(state?.garrisonHolder?.entities[0]).player)
                        otherEnts.push(ent);
                }
            } catch (e) {
                warn("A StockFish chain has been broken!");
                this.garrisonEnt = this.garrisonEnt.filter(x => x != ent);
            }
            finally { continue; }
        }

        if (ownEnts.length)
            Engine.PostNetworkCommand({
                "type": "unload-all",
                "garrisonHolders": ownEnts
            });

        if (otherEnts.length)
            Engine.PostNetworkCommand({
                "type": "unload-all-by-owner",
                "garrisonHolders": otherEnts
            });
        for (let ent of this.turretEnt) {
            try {
                let state = GetEntityState(ent);
                if (state?.garrisonHolder?.entities[0])
                    {
                    if (controlsPlayer(GetEntityState(ent).player))
                        ownEnts.push(ent);
                    else
                        otherEnts.push(ent);
                    }
            } catch (e) {
                warn("A StockFish chain has been broken!");
                this.garrisonEnt = this.garrisonEnt.filter(x => x != ent);
            }
            finally { continue; }
        }


        let ownedHolders = [];
        let ejectables = [];
        for (let ent of this.turretEnt) {
            try {
                let turretHolderState = GetEntityState(ent);
                if (controlsPlayer(turretHolderState.player))
                    ownedHolders.push(ent);
                else {
                    for (let turret of turretHolderState.turretHolder.turretPoints.map(tp => tp.entity))
                        if (turret && controlsPlayer(GetEntityState(turret).player))
                            ejectables.push(turret);
                }
            } catch (e) {
                warn("A StockFish chain has been broken!");
                this.turretEnt = this.turretEnt.filter(x => x != ent);
            }
            finally { continue; }
        }
        if (ejectables.length)
            Engine.PostNetworkCommand({
                "type": "leave-turret",
                "entities": ejectables
            });

        if (ownedHolders.length)
            Engine.PostNetworkCommand({
                "type": "unload-turrets",
                "entities": ownedHolders
            });
    }
    filterIdleBuildings() {

        let idlebuildings = g_Selection.filter(e => {
            let state = GetEntityState(e);
            if (!state?.production?.queue?.length)
                return state && (state?.production?.queue?.length === 0);
        });
        g_Selection.reset();
        g_Selection.addList(idlebuildings);
    }

}