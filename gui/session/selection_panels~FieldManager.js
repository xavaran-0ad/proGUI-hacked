g_SelectionPanels.FieldManagerSelection = {
    "getMaxNumberOfItems": function() {	return 4; },
    "rowLength": 4,
    "getItems": function(unitEntStates)
    {
	if (unitEntStates.some(state => !hasClass(state, "Field")))
	    return [];

        return [
            "select_field_gatherers",
            "select_soldier_field_gatherers",
            "select_non_soldier_field_gatherers",
            "select_one_gatherer_per_field"
        ];
    },
    "setupButton": function(data)
    {
	const unitIds = data.unitEntStates.map(state => state.id);
        let counter = 0;
        if (data.item == "select_field_gatherers")
        {
            data.button.onPress = function() { fieldManager.selectFieldGatherers(unitIds) };
            data.button.tooltip = "Select all gatherers from selected fields.";
            counter = fieldManager.getFieldGatherers(unitIds).length;
        }
        else if (data.item == "select_soldier_field_gatherers")
        {
            data.button.onPress = function() { fieldManager.selectSoldierFieldGatherers(unitIds) };
            data.button.tooltip = "Select all gatherers from selected fields.";
            counter = fieldManager.getSoldierFieldGatherers(unitIds).length;
        }
        else if (data.item == "select_non_soldier_field_gatherers")
        {
            data.button.onPress = function() { fieldManager.selectNonSoldierFieldGatherers(unitIds) };
            data.button.tooltip = "Select all non-soldier gatherers from selected fields.";
            counter = fieldManager.getNonSoldierFieldGatherers(unitIds).length;
        }
        else if (data.item == "select_one_gatherer_per_field")
        {
            data.button.onPress = function() { fieldManager.selectOneGathererPerField(unitIds) };
            data.button.tooltip = "Select one gatherer from each selected field.";
            counter = fieldManager.getOneGathererPerField(unitIds).length;
        }
        data.countDisplay.caption = counter;
        data.button.enabled = (counter > 0);
        data.icon.sprite = "stretched:" + ((counter > 0) ? "" : "grayscale:") + "session/icons/fieldmanager/" + data.item + ".png";
	setPanelObjectPosition(data.button, data.i, data.rowLength);

        return true;
    }
};

g_SelectionPanels.FieldManagerAction = {
    "getMaxNumberOfItems": function() { return 1; },
    "rowLength": 1,
    "getItems": function(unitEntStates)
    {
	if (unitEntStates.some(state => !hasClass(state, "Field")))
	    return [];

        return [
            "distribute_field_gatherers"
        ];
    },
    "setupButton": function(data)
    {
        const unitIds = data.unitEntStates.map(state => state.id);
        if (data.item == "distribute_field_gatherers")
        {
            data.button.onPress = function() { fieldManager.distributeFieldGatherers(unitIds) };
            data.button.tooltip = "Evenly distribute gatherers across selected fields.";
        }
        data.icon.sprite = "stretched:session/icons/fieldmanager/" + data.item + ".png";
	setPanelObjectPosition(data.button, data.i, data.rowLength);

        return true;
    }
};

g_PanelsOrder.push("FieldManagerSelection");
g_PanelsOrder.push("FieldManagerAction");
