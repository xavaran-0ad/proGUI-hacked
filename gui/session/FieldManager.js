class FieldManager
{

    // Return the list of all field gatherers
    getFieldGatherers(ids)
    {
        let gatherers = [];

        // Add fields with gatherers
        const playerEntities = Engine.GuiInterfaceCall("GetPlayerEntities");
        for (let entityId of playerEntities)
        {
            let state = GetEntityState(entityId);

            // Skip if invalid
            if (!("unitAI" in state))
                continue;
            if (!("orders" in state.unitAI))
                continue;
            if (state.unitAI.orders.length == 0)
                continue;
            if (state.unitAI.orders[0].type !== "Gather")
                continue;
            if (!("data" in state.unitAI.orders[0]))
                continue;
            if (!("template" in state.unitAI.orders[0].data))
                continue;
            if (!state.unitAI.orders[0].data.template.endsWith("field"))
                continue;
            if (!ids.includes(state.unitAI.orders[0].data.formerTarget) && !ids.includes(state.unitAI.orders[0].data.target))
                continue;

            // Update array
            gatherers.push(state.id);
        }

        return gatherers;
    }

    // Return the list of all soldier gatherers
    getSoldierFieldGatherers(ids)
    {
        const gatherers = this.getFieldGatherers(ids);
        return gatherers.filter(id => hasClass(GetEntityState(id), "Soldier"));
    }

    // Return the list of all non-soldier gatherers
    getNonSoldierFieldGatherers(ids)
    {
        const gatherers = this.getFieldGatherers(ids);
        return gatherers.filter(id => !hasClass(GetEntityState(id), "Soldier"));
    }

    // Return an object of the form { fieldId: [gatherersId] }
    getFieldGatherersAssociation(ids)
    {
        let fieldGatherersAssociation = {};

        // Add fields with gatherers
        const gatherers = this.getFieldGatherers(ids);
        for (let entityId of gatherers)
        {
            let state = GetEntityState(entityId);
            let target = state.unitAI.orders[0].data.formerTarget || state.unitAI.orders[0].data.target;
            if (!(target in fieldGatherersAssociation))
                fieldGatherersAssociation[target] = [];
            fieldGatherersAssociation[target].push(entityId)
        }

        // Add fields without gatherers
        for (let entityId of ids)
        {
            let state = GetEntityState(entityId);
            // Skip fields under construction
            if (hasClass(state, "Foundation"))
                continue;
            // Skip already considered fields
            if (state.id in fieldGatherersAssociation)
                continue;
            fieldGatherersAssociation[state.id] = [];
        }

        return fieldGatherersAssociation;
    }

    // Return a list made of one field gatherer per non-empty field
    getOneGathererPerField(ids)
    {
        const fieldGatherersAssociation = this.getFieldGatherersAssociation(ids);
        const fieldGatherersAssociationValues = Object.values(fieldGatherersAssociation);
        const gatherers = fieldGatherersAssociationValues.map(x => x[0]).filter(x => x);
        return gatherers;
    }

    // Select all units specified in the ids list
    select(ids)
    {
        g_Selection.reset();
        g_Selection.addList(ids);
    }

    // Select all field gatherers
    selectFieldGatherers(ids)
    {
        const gatherers = this.getFieldGatherers(ids);
        this.select(gatherers);
    }

    // Select all soldier field gatherers
    selectSoldierFieldGatherers(ids)
    {
        const gatherers = this.getSoldierFieldGatherers(ids);
        this.select(gatherers);
    }

    // Select all non-soldier field gatherers
    selectNonSoldierFieldGatherers(ids)
    {
        const gatherers = this.getNonSoldierFieldGatherers(ids);
        this.select(gatherers);
    }

    // Select one gatherer per field
    selectOneGathererPerField(ids)
    {
        const gatherers = this.getOneGathererPerField(ids);
        this.select(gatherers);
    }

    // Evenly distribute gatherers across selected fields
    distributeFieldGatherers(ids)
    {
        const fieldGatherersAssociation = this.getFieldGatherersAssociation(ids);
        const fieldIdsSorted = Object.keys(fieldGatherersAssociation).sort(function(a, b) { return fieldGatherersAssociation[b].length - fieldGatherersAssociation[a].length });
        const gatherersSorted = Object.values(fieldGatherersAssociation).map(x => x.length).sort().reverse();
        const totalGatherers = gatherersSorted.reduce((pv, cv) => cv + pv, 0);
        const size = gatherersSorted.length;
        const quotient = Math.floor(totalGatherers / size);
        const remainder = totalGatherers % size;

        // Move gatherers
        let moving = [];
        for (let fieldIndex in fieldIdsSorted)
        {
            let fieldId = parseInt(fieldIdsSorted[fieldIndex]);
            let epsilon = (fieldIndex < remainder) ? 1 : 0;
            let difference = gatherersSorted[fieldIndex] - quotient - epsilon;

            if (difference > 0)
                moving = moving.concat(fieldGatherersAssociation[fieldId].slice(-difference));
            else if (difference < 0)
            {
                let gathererIds = moving.slice(difference);
                moving = moving.slice(0, difference);
                // Perform command
                Engine.PostNetworkCommand({
		    "type": "gather",
		    "entities": gathererIds,
		    "target": fieldId,
		    "queued": false,
		    "pushFront": false,
		    "formation": g_AutoFormation.getNull()
	        });
            }
        }
    }

}
