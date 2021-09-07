import moment = require("moment");
import {scholarOfficialData} from "./interfaces";
export class Scholar {
  id!: number;
  roninAddress!: string;
  name!: string;
  todaySLP!: number;
  yesterdaySLP!: number;
  MMR!: number;
  totalSLP!: number;
  inGameSLP!: number;
  inRoninSLP!: number;
  averageSLP!: number;
  PVPRank!: number;
  mounthlyRank!: number;
  monthSLP!: number;
  lastMonthSLP!: number;
  lastUpdate!: Date;
  WinRate!: string;

  constructor(values: Object = {}) {
    Object.assign(this, values);
  }
  parse(unParsedData: scholarOfficialData) {
    this.inRoninSLP = unParsedData.ronin_slp,
      this.totalSLP = unParsedData.total_slp,
      this.inGameSLP = unParsedData.in_game_slp,
      this.PVPRank = unParsedData.rank,
      this.MMR = unParsedData.mmr,
      this.WinRate = unParsedData.win_rate
  }
  getValues():object {
    return {
      roninAddress: this.roninAddress,
      name: this.name,
      todaySLP: this.todaySLP || 0,
      yesterdaySLP: this.yesterdaySLP || 0,
      MMR: this.MMR || 0,
      totalSLP: this.totalSLP || 0,
      inGameSLP: this.inGameSLP || 0,
      inRoninSLP: this.inRoninSLP || 0,
      averageSLP: this.averageSLP || 0,
      mounthlyRank: this.mounthlyRank || 0,
      monthSLP: this.monthSLP || 0,
      lastMonthSLP: this.lastMonthSLP || 0,
      PVPRank: this.PVPRank || 0
    }
  }
  update(newData: Scholar):void {
    const diffDays = this.getDaysDiffStartOfMonth();
    this.yesterdaySLP = this.todaySLP;
    this.todaySLP = newData.totalSLP - this.totalSLP;
    this.monthSLP = this.monthSLP + this.todaySLP;
    this.averageSLP = this.monthSLP / diffDays;
    this.lastUpdate = new Date(moment().startOf("day").toString());
    this.MMR = newData.MMR;
    this.PVPRank = newData.PVPRank;
    this.inGameSLP = newData.inGameSLP;
    this.inRoninSLP = newData.inRoninSLP;
    this.totalSLP = newData.totalSLP;
  }
  getDaysDiffStartOfMonth():number {
    const startOfTheMonth = moment().startOf("month");
    const today = moment();
    return today.diff(startOfTheMonth, "days");
  }
}