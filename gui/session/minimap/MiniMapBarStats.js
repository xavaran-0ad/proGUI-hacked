/**
 * If the button that this class manages is pressed, an idle unit having one of the given classes is selected.
 */
class MiniMapBarStats {
	constructor() {
		this.miniMapBarStats = Engine.GetGUIObjectByName("miniMapBarStatsGlow");
		//this.miniMapBarStats.onPress = this.onPress.bind(this);
		this.miniMapBarStats.tooltip = "PlaceHolder";

	}
	onPress() {
	}
}

MiniMapBarStats.prototype.Tooltip = markForTranslation("PlaceHolder");