import moment = require("moment");
import {scholarOfficialData} from "./interfaces";
export class Scholar {
  id!: number;
  roninAddress: string = "";
  name!: string;
  todaySLP: number = 0;
  yesterdaySLP: number = 0;
  MMR: number = 0;
  totalSLP: number = 0;
  inGameSLP: number = 0;
  inRoninSLP: number = 0;
  averageSLP: number = 0;
  PVPRank: number = 0;
  mounthlyRank: number = 0;
  monthSLP: number = 0;
  lastMonthSLP: number = 0;
  lastUpdate: Date = new Date;
  WinRate!: string;
  personalAddress?: string;

  constructor(values: Object = {}) {
    Object.assign(this, values);
  }
  parse(unParsedData: scholarOfficialData) {
    this.roninAddress = unParsedData.ronin_address;
    this.inRoninSLP = unParsedData.ronin_slp;
    this.totalSLP = unParsedData.total_slp;
    this.inGameSLP = unParsedData.in_game_slp;
    this.PVPRank = unParsedData.rank;
    this.MMR = unParsedData.mmr;
    return this;
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
    this.todaySLP = 0;
    this.yesterdaySLP = newData.totalSLP - this.totalSLP;
    this.monthSLP = this.monthSLP + this.yesterdaySLP;
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