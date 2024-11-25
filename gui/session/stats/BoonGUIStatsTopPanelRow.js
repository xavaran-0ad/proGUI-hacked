class BoonGUIStatsTopPanelRow {
  static Regex_Emblem = /^.+\/(.+)\.png$/;

  constructor(row, index) {
    const PREFIX = row.name;
    this.index = index;
    this.root = Engine.GetGUIObjectByName(PREFIX);
    this.power = Engine.GetGUIObjectByName("militaryPowerBar");
    this.powerEco = Engine.GetGUIObjectByName("ecoPowerBar");
    this.powerEcoBG = Engine.GetGUIObjectByName("backgroundEcoPowerBar");
    this.powerMiliBG = Engine.GetGUIObjectByName("backgroundMilitaryPowerBar");
    this.powerPanel = Engine.GetGUIObjectByName("powerPanel");
    this.powerBar = Engine.GetGUIObjectByName("powerBar");
    this.miniMapBarStats = Engine.GetGUIObjectByName("miniMapBarStatsGlow");

    if (index === 0) this.root.size = ProGUIGetRowSize(index, 36);
    else if (true)
      this.root.size = ProGUIGetRowSize(index, 26, 10);

    this.coloredTeamBackground = Engine.GetGUIObjectByName(
      `${PREFIX}_coloredTeamBackground`
    );
    this.coloredPlayerInfoBackground = Engine.GetGUIObjectByName(
      `${PREFIX}_coloredPlayerInfoBackground`
    );
    this.playerHighlight = Engine.GetGUIObjectByName(
      `${PREFIX}_playerHighlight`
    );
    this.playerHighlight.onPress = () => focusCC(true, this.state);
    this.team = Engine.GetGUIObjectByName(`${PREFIX}_team`);
    this.player = Engine.GetGUIObjectByName(`${PREFIX}_player`);
    this.playernick = "Stuff";
    this.rating = Engine.GetGUIObjectByName(`${PREFIX}_rating`);

    this.civHighlight = Engine.GetGUIObjectByName(`${PREFIX}_civHighlight`);
    this.civHighlight.onPress = () => openStructTree(g_CivData[this.state.civ].Code);
    this.civIcon = Engine.GetGUIObjectByName(`${PREFIX}_civIcon`);

    this.phaseHighlight = Engine.GetGUIObjectByName(`${PREFIX}_phaseHighlight`);
    this.phaseIcon = Engine.GetGUIObjectByName(`${PREFIX}_phaseIcon`);
    this.phaseHighlight.onPress = () => focusCC(true, this.state);
    this.phaseProgress = Engine.GetGUIObjectByName(
      `${PREFIX}_phaseProgressSlider`
    );
    this.phaseProgressTop = this.phaseProgress.size.top;
    this.phaseProgressHeight =
      this.phaseProgress.size.bottom - this.phaseProgress.size.top;

    this.coloredPlayerStatsBackground = Engine.GetGUIObjectByName(
      `${PREFIX}_coloredPlayerStatsBackground`
    );
    this.coloredPlayerStatsBackgroundShader = Engine.GetGUIObjectByName(
      `${PREFIX}_coloredPlayerStatsBackgroundShader`
    );
    this.coloredPlayerStatsBorder = Engine.GetGUIObjectByName(
      `${PREFIX}_coloredPlayerStatsBorder`
    );

    this.popHighlight = Engine.GetGUIObjectByName(`${PREFIX}_popHighlight`);
    this.popCount = Engine.GetGUIObjectByName(`${PREFIX}_popCount`);
    this.popLimit = Engine.GetGUIObjectByName(`${PREFIX}_popLimit`);
    this.idleWorkerHighlight = Engine.GetGUIObjectByName(
      `${PREFIX}_idleWorkerHighlight`
    );
    // TODO in observer mode the idle button is disabled, it shouldn't be.
    this.idleWorkerHighlight.onPress = () =>
      findIdleUnit(g_boonGUI_WorkerTypes);

    this.idleWorkerCount = Engine.GetGUIObjectByName(
      `${PREFIX}_idleWorkerCount`
    );
    this.idleWorkerAlphaMask = Engine.GetGUIObjectByName(
      `${PREFIX}_idleWorkerAlphaMask`
    );
    this.los = Engine.GetGUIObjectByName(`${PREFIX}_los`);
    if (this.index === 0) {
      this.civHighlight.size = "157 -2 215 100%-2";
      this.civIcon.size = "1 1 58 100%+2";
      this.player.size = "18 2 174 100%";
      this.team.size = "0 0% 18 100%-10";
      this.rating.size = "120 0% 154 100%";
      this.los.hidden = true;
      this.los.checked = false;
    }
    this.resource = {
      counts: {},
      gatherers: {},
      rates: {},
    };

    for (const resType of g_BoonGUIResTypes) {
      this.resource[resType] = Engine.GetGUIObjectByName(
        `${PREFIX}_${resType}Highlight`
      );
      this.resource.counts[resType] = Engine.GetGUIObjectByName(
        `${PREFIX}_${resType}Counts`
      );
      this.resource.gatherers[resType] = Engine.GetGUIObjectByName(
        `${PREFIX}_${resType}Gatherers`
      );
      this.resource.rates[resType] = Engine.GetGUIObjectByName(
        `${PREFIX}_${resType}Rates`
      );
      this.resource[resType].onPress = () => {
        if (index === 0) {
          try {
            Engine.SendNetworkChat(
              "/allies " +
              Engine.ConfigDB_GetValue(
                "user",
                "boongui.topPanel.tributeMessage"
              ) +
              " " +
              resType +
              " !"
            );
          } catch (e) {
            warn(e);
          }
        } else {
          let amount = (Engine.HotkeyIsPressed("session.masstribute")) ? 500 : 100;

          this.playerID = g_Players
            .map((e) => e.name)
            .indexOf(this.playernick + " (" + this.rating.caption + ")");
          if (this.playerID == -1)
            this.playerID = g_Players
              .map((e) => e.name)
              .indexOf(this.playernick);
          Engine.PostNetworkCommand({
            type: "tribute",
            player: this.playerID,
            amounts: {
              [resType]: amount,
            },
          });
        }
      };
    }

    this.femaleCitizenHighlight = Engine.GetGUIObjectByName(
      `${PREFIX}_femaleCitizenHighlight`
    );
    this.femaleCitizen = Engine.GetGUIObjectByName(`${PREFIX}_femaleCitizen`);
    this.infantryHighlight = Engine.GetGUIObjectByName(
      `${PREFIX}_infantryHighlight`
    );
    this.infantry = Engine.GetGUIObjectByName(`${PREFIX}_infantry`);
    this.cavalryHighlight = Engine.GetGUIObjectByName(
      `${PREFIX}_cavalryHighlight`
    );
    this.cavalry = Engine.GetGUIObjectByName(`${PREFIX}_cavalry`);
    this.championHighlight = Engine.GetGUIObjectByName(
      `${PREFIX}_championHighlight`
    );
    this.champion = Engine.GetGUIObjectByName(`${PREFIX}_champion`);

    this.ecoTechHighlight = Engine.GetGUIObjectByName(
      `${PREFIX}_ecoTechHighlight`
    );
    this.ecoTechCount = Engine.GetGUIObjectByName(`${PREFIX}_ecoTechCount`);
    this.milTechHighlight = Engine.GetGUIObjectByName(
      `${PREFIX}_milTechHighlight`
    );
    this.milTechCount = Engine.GetGUIObjectByName(`${PREFIX}_milTechCount`);

    this.killDeathRatioHighlight = Engine.GetGUIObjectByName(
      `${PREFIX}_killDeathRatioHighlight`
    );
    this.enemyUnitsKilledTotal = Engine.GetGUIObjectByName(
      `${PREFIX}_enemyUnitsKilledTotal`
    );
    this.divideSign = Engine.GetGUIObjectByName(`${PREFIX}_divideSign`);
    this.unitsLostTotal = Engine.GetGUIObjectByName(`${PREFIX}_unitsLostTotal`);
    this.killDeathRatio = Engine.GetGUIObjectByName(`${PREFIX}_killDeathRatio`);
    this.killRatioShader = Engine.GetGUIObjectByName(`${PREFIX}_killDeathRatio_shader`);
    this.killRatioShaderPos = Engine.GetGUIObjectByName(`${PREFIX}_killDeathRatio_pos`);
    this.killRatioShaderNeg = Engine.GetGUIObjectByName(`${PREFIX}_killDeathRatio_neg`);
    this.killRatioShaderHeaderPos = Engine.GetGUIObjectByName(`Header_killDeathRatio_pos`);
    this.killRatioShaderHeaderNeg = Engine.GetGUIObjectByName(`Header_killDeathRatio_neg`);

    Engine.SetGlobalHotkey("structree", "Press", openStructTree);
    Engine.SetGlobalHotkey("civinfo", "Press", openStructTree);
  }
  makeUnitsTooltip (state, tooltip, unitType) {
    for (const entry of state.queue) {

      if (entry.mode === "units") {
        const classesList = entry.classesList || [];

        if (classesList.includes(unitType)) {
          let unitTemplate = entry.template.replace(/_[A-Za-z]$/, "");
          let dummyIcon = "icon_archer_attack_spread";
          const unitCount = entry.count;
          // Add unit icon inline
          //`[icon="${unitTemplate}" displace="0 5"]` Missing unit icons or fallback icon to make this work
          tooltip += `\n${entry.count}` + g_Indent + unitTemplate.split("_")[unitTemplate.split("_").length - 2].split("/")[unitTemplate.split("_")[unitTemplate.split("_").length - 2].split("/").length - 1] + " " + unitTemplate.split("_")[unitTemplate.split("_").length - 1];
        }
      }
    }
    return tooltip;
  }
  update(state, scales) {
    this.root.hidden = !state;
    if (state?.index != g_ViewedPlayer && Engine.ConfigDB_GetValue("user", "boongui.hideAlliesStats") == "true" && !g_IsObserver)
      this.root.hidden = true
    this.state = state;
    //Resize TopPanel kd stats
    if (Engine.ConfigDB_GetValue("user", "boongui.topPanel.animateKD") == "true") {
      this.killRatioShaderNeg.hidden = false;
      this.killRatioShaderPos.hidden = false;
      this.killRatioShader.hidden = false;
      this.killRatioShader.z = 0;
      this.killRatioShaderHeaderNeg.hidden = false;
      this.killRatioShaderHeaderPos.hidden = false;
      if (state?.powerRate >= 1) {
        this.killRatioShader.size = `50% 0% ${Math.min(50 + 10 * (state.powerRate - 1), 100)}% 100%-2`;
        this.killRatioShader.sprite = `backcolor: 10 189 168 120`
      }
      if (state?.powerRate < 1) {
        this.killRatioShader.size = `${Math.max(50 * (state.powerRate), 0)}% 0% 50% 100%-2`;
        this.killRatioShader.sprite = `backcolor: 187 10 30 155`
      }
    }
    else {
      this.killRatioShaderNeg.hidden = true;
      this.killRatioShaderPos.hidden = true;
      this.killRatioShader.hidden = true;
      this.killRatioShaderHeaderNeg.hidden = true;
      this.killRatioShaderHeaderPos.hidden = true;
    }
    //Resize Minimap power stats
    if (state?.powerRate >= 0 && this.index === 0) {
      this.power.size = `98%+1 95% 92%-3 95%-${Math.min(2.5 * state.powerRate, 15)}%+1`;
      this.miniMapBarStats.tooltip = `Kills to Deaths ratio:   ${Math.round(state.powerRate * 100) / 100}`
    }
    if (state?.ecoRate >= 0 && this.index === 0) {
      this.powerEco.size = `84%-2 94% 89%+1 94%-${Math.min(1.67 * state.ecoRate * 3, 10)}%+1`;
      this.miniMapBarStats.tooltip += `\nResources Gathering:   x${Math.round(state.ecoRate * 100) / 100}`
    }
    if (g_ViewedPlayer != -1) {
      this.powerPanel.sprite = "statsPowerBars";
      this.powerBar.hidden = false;
      this.miniMapBarStats.hidden = false;
    }
    else {
      this.powerPanel.sprite = "statsPowerBarsObs";
      this.powerBar.hidden = true;
      this.miniMapBarStats.hidden = true;
    }

    if (!state) return;
    let value,
      shareratio,
      gatherratio,
      color,
      caption,
      tooltip,
      font,
      colorSingleRow;

    const shouldBlink = Date.now() % 1000 < 500;
    this.coloredTeamBackground.sprite = `backcolor: ${state.teamColor} 115`;
    let paddingFix = 10;
    this.coloredPlayerInfoBackground.sprite = `backcolor: ${state.playerColor} 115`;
    this.coloredPlayerStatsBackgroundShader.sprite = `backcolor: 38 38 38 160`;
    this.coloredTeamBackground.hidden = state.team == -1;
    this.coloredPlayerStatsBackgroundShader.size = `235 0 100% 100%`;
    this.coloredPlayerInfoBackground.size =
      state.team != -1 ? `18 0 235 100%` : `0 0 235 100%`;
    this.team.caption = state.team != -1 ? `${state.team + 1}` : "";

    const playerNick = setStringTags(state.nick, { color: state.playerColor });
    this.playernick = state.nick;

    caption = limitPlayerName(
      this.player,
      state.nick,
      this.rating,
      state.rating
    );
    this.player.caption = caption;
    this.playerHighlight.tooltip = setStringTags(state.name, {
      color: state.playerColor,
    });
    this.playerHighlight.tooltip +=
      state.team != -1
        ? setStringTags("\nTeam " + this.team.caption, {
          color: state.teamColor,
        })
        : "";
    caption = Engine.IsAtlasRunning()
      ? ""
      : `${translateAISettings(
        g_InitAttributes.settings.PlayerData[state.index]
      )}`;
    font = "sans-stroke-14";
    if (caption)
      this.playerHighlight.tooltip += setStringTags(`\n${caption}`, {
        color: "210 210 210",
        font,
      });

    this.team.tooltip = this.playerHighlight.tooltip;
    this.rating.tooltip = this.playerHighlight.tooltip;
    this.rating.caption = state.rating;

    const civ = g_CivData[state.civ];
    const Emblem = civ.Emblem.replace(
      BoonGUIStatsTopPanelRow.Regex_Emblem,
      "$1"
    );

    this.civHighlight.sprite_over =
      "cropped:1,0.6506:" + "session/portraits/emblems/states/hover.png";
    this.civIcon.sprite = "cropped:1,0.6506:" + civ.Emblem;
    tooltip = "";
    tooltip += playerNick + "\n\n";
    tooltip += `[icon="${Emblem}" displace="12 0"] \n`;
    tooltip += `${civ.Name.padEnd(8)}\n`;
    tooltip += setStringTags(this.civIconHotkeyTooltip, { font });
    this.civHighlight.tooltip = tooltip;

    let phase;
    let progress = null;

    const phase_town =
      state.startedResearch.phase_town_generic ||
      state.startedResearch.phase_town_athen;

    const phase_city =
      state.startedResearch.phase_city_generic ||
      state.startedResearch.phase_city_athen;

    if (phase_city) {
      phase = "phase_city";
      progress = phase_city.progress;
    } else if (state.phase == "city") {
      phase = "phase_city";
    } else if (phase_town) {
      progress = phase_town.progress;
      phase = "phase_town";
    } else if (state.phase == "town") {
      phase = "phase_town";
    } else {
      phase = "phase_village";
    }

    const techData = GetTechnologyData(phase, state.civ);
    tooltip = "";
    tooltip += playerNick + "\n";
    tooltip += progress
      ? g_Indent +
      Engine.FormatMillisecondsIntoDateStringGMT(
        (phase_town || phase_city).timeRemaining,
        "m:ss"
      ) +
      g_Indent
      : "";
    tooltip += techData.name.generic;
    this.phaseHighlight.tooltip = tooltip;

    this.phaseIcon.sprite = "stretched:session/portraits/" + techData.icon;
    if (progress == null) {
      this.phaseProgress.hidden = true;
    } else {
      this.phaseProgress.hidden = false;
      const size = this.phaseProgress.size;
      size.top = this.phaseProgressTop + this.phaseProgressHeight * progress;
      this.phaseProgress.size = size;
    }

    const configColoredPlayerStatsBackground = Math.floor(
      Engine.ConfigDB_GetValue(
        "user",
        "boongui.toppanel.coloredPlayerStatsBackground"
      )
    );

    this.coloredPlayerStatsBackground.sprite = `backcolor: ${state.playerColor} ${configColoredPlayerStatsBackground}`;
    //warn(state.playerColor);
    this.coloredPlayerStatsBorder.sprite = `backcolor: ${state.playerColor} 85`;

    tooltip = "";
    tooltip += playerNick + "\n";
    tooltip += state.trainingBlocked
      ? coloredText(
        "Training blocked\n",
        CounterPopulation.prototype.PopulationAlertColor
      )
      : "";
    if (state.trainingBlocked && shouldBlink) {
      value = state.popCount;
      this.popCount.caption = setStringTags(value + "/", {
        color: CounterPopulation.prototype.PopulationAlertColor,
      });
      value = state.popLimit;
      this.popLimit.caption = setStringTags(value, {
        color: CounterPopulation.prototype.PopulationAlertColor,
      });
    } else {
      value = state.popCount;
      color = scales.getColor("popCount", state.popCount);
      this.popCount.caption =
        setStringTags(normalizeValue(value), { color: color }) + "/";
      value = state.popLimit;
      color = scales.getColor("popLimit", state.popLimit);
      this.popLimit.caption = setStringTags(normalizeValue(value), {
        color: color,
      });
    }
    tooltip +=
      "Pop" +
      g_Indent +
      g_Indent +
      " " +
      `${this.popCount.caption} ${this.popLimit.caption}\n`;
    tooltip += "Max" + g_Indent + g_Indent + normalizeValue(state.popMax);

    this.popHighlight.tooltip = tooltip;

    tooltip = "";
    tooltip += playerNick + "\n";

    const filterIdleMode = [];
    value = 0;
    for (let i = 0; i < state.queue.length; ++i) {
      if (state.queue[i].mode === "idle") {
        filterIdleMode.push(state.queue[i]);
        value += state.queue[i].count;
      }
    }
    this.idleWorkerHighlight.enabled = g_ViewedPlayer == state.index;

    // Aim for dark red background and light red font color
    this.idleWorkerAlphaMask.sprite =
      "color:200 0 0 " + Math.min(value, 18) * 10;
    color = value > 0 ? "lightRed" : "dimmedWhite";
    font =
      value > 0
        ? value > 99
          ? "sans-bold-stroke-14"
          : "sans-bold-stroke-16"
        : "sans-stroke-16";
    this.idleWorkerCount.caption = setStringTags(normalizeValue(value), {
      color,
      font,
    });

    tooltip +=
      "Idle Workers" +
      g_Indent +
      g_Indent +
      " " +
      setStringTags(value, { color }) +
      "\n";
    font = "sans-stroke-14";

    for (const i in g_boonGUI_WorkerTypes) {
      // experimant with Named capture groups
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions/Groups_and_Backreferences
      const className = g_boonGUI_WorkerTypes[i].match(
        /(?<classNameRegex>^\w+)/
      )?.groups?.classNameRegex;
      if (!className) continue;

      value = 0;
      if (state.classCounts[className])
        for (let j = 0; j < filterIdleMode.length; ++j) {
          if (filterIdleMode[j].classesList.includes(className))
            value += filterIdleMode[j].count;
        }
      tooltip += setStringTags(`- ${className} ${value}\n`, {
        font,
        color: value > 0 ? "lightRed" : "dimmedWhite",
      });
    }

    tooltip += "\n" + setStringTags(this.idleUnitsTooltip, { font });
    this.idleWorkerHighlight.tooltip = tooltip;

    for (const resType of g_BoonGUIResTypes) {
      tooltip = "";
      tooltip += playerNick + "\n";
      tooltip +=
        resourceNameFirstWord(resType) + " " + resourceIcon(resType) + "\n";

      if (state.resourcesTechs[resType].length > 0) {
        for (let i = 0; i < state.resourcesTechs[resType].length; i += 3) {
          tooltip +=
            state.resourcesTechs[resType]
              .slice(i, i + 3)
              .map((tech) => `[icon="icon_${tech}" displace="0 5"]`)
              .join(" ") + "\n";
        }
      }

      value = state.resourceCounts[resType];
      color = scales.getColor(`${resType}Counts`, value);
      caption = normalizeResourceCount(value);
      this.resource.counts[resType].caption = setStringTags(caption, { color });
      tooltip +=
        setStringTags("Amount", {
          color: value > 0 ? "white" : "dimmedWhite",
        }) +
        `${g_Indent}${g_Indent} ${this.resource.counts[resType].caption}\n`;

      const configResourceGatherersRates = Engine.ConfigDB_GetValue(
        "user",
        "boongui.toppanel.resourceGatherersRates"
      );

      value = state.resourceGatherers[resType];
      color = scales.getColor(`${resType}Gatherers`, value, false, 180);
      caption =
        isNaN(value) || value <= 0
          ? setStringTags("0", { color: "dimmedWhite" })
          : value;
      // For single lines, the gathering rates are displayed in the player color.
      colorSingleRow = setStringTags(
        caption,
        g_stats.lastPlayerLength > 1 ? { color } : { color: state.playerColor }
      );
      this.resource.gatherers[resType].caption =
        configResourceGatherersRates === "Gatherers" ? colorSingleRow : "";
      tooltip +=
        setStringTags("Gatherers", {
          color: value > 0 ? "white" : "dimmedWhite",
        }) + `${g_Indent}${g_Indent}${colorSingleRow}\n`;

      value = state.resourceRates[resType];
      color = scales.getColor(`${resType}Rates`, value, false, 180);
      caption =
        isNaN(value) || value <= 0
          ? setStringTags("+0", { color: "dimmedWhite" })
          : `+${normalizeValue(value)}`;
      colorSingleRow = setStringTags(
        caption,
        g_stats.lastPlayerLength > 1 ? { color } : { color: state.playerColor }
      );
      this.resource.rates[resType].caption =
        configResourceGatherersRates === "Rates" ? colorSingleRow : "";
      tooltip +=
        setStringTags("Income/10s", {
          color: value > 0 ? "white" : "dimmedWhite",
        }) + `${g_Indent}${colorSingleRow}\n`;

      this.resource[resType].tooltip = tooltip;
    }

    value = state.classCounts.FemaleCitizen ?? 0;
    color = scales.getColor("femaleCitizen", value);
    this.femaleCitizen.caption = setStringTags(normalizeValue(value), {
      color,
    });
    tooltip = "";
    tooltip += playerNick + "\n";
    tooltip += this.femaleCitizen.caption + g_Indent + "Female Citizen";
    tooltip = this.makeUnitsTooltip(state, tooltip, "FemaleCitizen");
    this.femaleCitizenHighlight.tooltip = tooltip;

    value = state.classCounts.Infantry ?? 0;
    color = scales.getColor("infantry", value);
    this.infantry.caption = setStringTags(normalizeValue(value), { color });
    tooltip = "";
    tooltip += playerNick + "\n";
    tooltip += this.infantry.caption + g_Indent + "Infantry";
    tooltip = this.makeUnitsTooltip(state, tooltip, "Infantry");
    this.infantryHighlight.tooltip = tooltip;

    value = state.classCounts.Cavalry ?? 0;
    color = scales.getColor("cavalry", value);
    this.cavalry.caption = setStringTags(normalizeValue(value), { color });
    tooltip = "";
    tooltip += playerNick + "\n";
    tooltip += this.cavalry.caption + g_Indent + "Cavalry";
    tooltip = this.makeUnitsTooltip(state, tooltip, "Cavalry");
    this.cavalryHighlight.tooltip = tooltip;

    value = state.classCounts.Champion ?? 0;
    color = scales.getColor("champion", value);
    this.champion.caption = setStringTags(normalizeValue(value), { color });
    tooltip = "";
    tooltip += playerNick + "\n";
    tooltip += this.champion.caption + g_Indent + "Champion";
    tooltip = this.makeUnitsTooltip(state, tooltip, "Champion");
    this.championHighlight.tooltip = tooltip;



    const techArrayCount = [state.economyTechsCount, state.militaryTechsCount];
    const ecoTechColor = scales.getColor(
      "economyTechsCount",
      techArrayCount[0]
    );
    const milTechColor = scales.getColor(
      "militaryTechsCount",
      techArrayCount[1]
    );
    this.ecoTechCount.caption =
      techArrayCount[0] > 0
        ? setStringTags(techArrayCount[0], { color: ecoTechColor })
        : "";
    this.milTechCount.caption =
      techArrayCount[1] > 0
        ? setStringTags(techArrayCount[1], { color: milTechColor })
        : "";

    tooltip = "";
    tooltip += playerNick + "\n";
    tooltip +=
      techArrayCount[0] > 0
        ? `Economy Upgrades${g_Indent}${this.ecoTechCount.caption}\n`
        : "No Economy Upgrades";
    for (const resType of g_BoonGUIResTypes) {
      if (state.resourcesTechs[resType].length > 0) {
        tooltip +=
          resourceNameFirstWord(resType) + " " + resourceIcon(resType) + "\n";
        for (let i = 0; i < state.resourcesTechs[resType].length; i += 4) {
          tooltip +=
            state.resourcesTechs[resType]
              .slice(i, i + 4)
              .map((tech) => `[icon="icon_${tech}" displace="0 5"]`)
              .join(" ") + "\n";
        }
      }
    }
    this.ecoTechHighlight.tooltip = tooltip;

    tooltip = "";
    tooltip += playerNick + "\n";
    if (state.militaryTechs.length > 0) {
      tooltip += `Military Upgrades${g_Indent}${this.milTechCount.caption}\n`;
      for (let i = 0; i < state.militaryTechs.length; i += 4) {
        tooltip +=
          state.militaryTechs
            .slice(i, i + 4)
            .map((tech) => `[icon="icon_${tech}" displace="0 5"]`)
            .join("  ") + " \n";
      }
      tooltip += "\n";
    } else tooltip += "No Military Upgrades";

    this.milTechHighlight.tooltip = tooltip;

    tooltip = "";
    tooltip += playerNick + "\n";
    value = state.killDeathRatio;
    color = scales.getColor("killDeathRatio", value);
    caption = formatKD(value);
    font = caption.length >= 4 ? "sans-stroke-18" : "sans-stroke-20";
    this.killDeathRatio.caption = setStringTags(caption, { color, font });
    this.enemyUnitsKilledTotal.caption = "";
    this.unitsLostTotal.caption = "";
    this.divideSign.caption = "";
    if (caption) {
      value = state.enemyUnitsKilledTotal;
      color = scales.getColor("enemyUnitsKilledTotal", value);
      this.enemyUnitsKilledTotal.caption = setStringTags(
        normalizeValue(value),
        { color }
      );
      value = state.unitsLostTotal;
      color = scales.getColor("unitsLostTotal", value, true);
      this.unitsLostTotal.caption = setStringTags(normalizeValue(value), {
        color,
      });
      this.divideSign.caption = "|";

      tooltip +=
        "Kills " +
        g_Indent +
        g_Indent +
        g_Indent +
        `${this.enemyUnitsKilledTotal.caption}\n`;
      tooltip +=
        "Deaths " + g_Indent + g_Indent + `${this.unitsLostTotal.caption}\n`;
      tooltip += "K/D Ratio" + g_Indent + `${this.killDeathRatio.caption}`;
    } else
      tooltip +=
        "Cowards do not count in battle; they are there, but not in it. Euripides";

    this.killDeathRatioHighlight.tooltip = tooltip;
    color = state.playerColor;
    tooltip = "";
    tooltip += playerNick + "\n";
    font = "sans-stroke-20";
    tooltip += `${setStringTags("○", { color, font })} / ${setStringTags("●", {
      color,
      font,
    })}\n`;
    tooltip += "On/Off Tribute this ally";
    this.los.tooltip = tooltip;
    if (this.los.checked == false) g_EcoHelp.setNotToTribute(this.playernick.split(' ')[0]);
    if (this.los.checked == true) g_EcoHelp.setToTribute(this.playernick.split(' ')[0]);
    if (g_IsObserver || g_GUI == "Boon" || this.index === 0 || Engine.ConfigDB_GetValue("user", "progui.helpers.enable") == "false") this.los.hidden = true; //todo remake the los icon work.
    else if (g_GUI == "Pro" || this.index != 0) this.los.hidden = false;
  }
}

BoonGUIStatsTopPanelRow.prototype.civIconHotkeyTooltip =
  "\nView Civilization Overview / Structure Tree\n" +
  colorizeHotkey("%(hotkey)s", "civinfo") +
  colorizeHotkey("%(hotkey)s", "structree");

BoonGUIStatsTopPanelRow.prototype.civInfo = {
  civ: "",
  page: "page_structree.xml",
};

BoonGUIStatsTopPanelRow.prototype.idleUnitsTooltip = markForTranslation(
  "Cycle through idle workers of the viewed player.\n" +
  colorizeHotkey("%(hotkey)s" + " ", "selection.idleworker")
);

BoonGUIStatsTopPanelRow.prototype.abbreviatedPlayerNames = {};