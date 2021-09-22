import moment = require("moment");
import {scholarOfficialData} from "./interfaces";
export class Scholar {
  id!: number;
  roninAddress: string = "";
  name: string = "";
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
  lastUpdate: Date = new Date(moment().startOf("day").toString());
  WinRate!: string;
  personalAddress?: string;
  weekSLP: number = 0;
  lastWeekSLP: number = 0;

  constructor(values: Object = {}) {
    Object.assign(this, values);
  }
  parse(unParsedData: scholarOfficialData) {
    this.roninAddress = unParsedData.ronin_address;
    this.inRoninSLP = (isNaN(unParsedData.ronin_slp)) ? 0 : unParsedData.ronin_slp;
    this.totalSLP = (isNaN(unParsedData.total_slp)) ? 0 : unParsedData.total_slp;
    this.inGameSLP = (isNaN(unParsedData.in_game_slp)) ? 0 : unParsedData.in_game_slp;
    this.PVPRank = (isNaN(unParsedData.rank)) ? 0 : unParsedData.rank;
    this.MMR = (isNaN(unParsedData.mmr)) ? 0 : unParsedData.mmr;
    this.name = (this.name)? this.name : unParsedData.ign;
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
      PVPRank: this.PVPRank || 0,
      lastUpdate: this.lastUpdate
    }
  }
  update(newData: Scholar):void {
    this.todaySLP = 0;
    this.yesterdaySLP = this.calculateYesterdaySLP(newData);    
    this.monthSLP = this.calculateMonthSLP();
    this.weekSLP = this.calculateWeekSLP();
    this.averageSLP = this.calculateAverageSLP();
    this.lastUpdate = new Date(moment().startOf("day").toString());
    this.MMR = newData.MMR;
    this.PVPRank = newData.PVPRank;
    this.inGameSLP = newData.inGameSLP;
    this.inRoninSLP = newData.inRoninSLP;
    this.totalSLP = newData.totalSLP;
  }
  getDaysDiffStartOf(valor:any):number {
    const startOfTheMonth = moment().startOf(valor);
    const today = moment();
    return today.diff(startOfTheMonth, "days");
  }
  calculateYesterdaySLP(newData: Scholar){
    return (newData.totalSLP < this.totalSLP)? newData.totalSLP: newData.totalSLP - this.totalSLP;
  }
  calculateMonthSLP(){
    if(this.getDaysDiffStartOf('month') == 0 || this.totalSLP == 0){
      this.lastMonthSLP = this.monthSLP;
      return 0;
    } else {
      return this.monthSLP + this.yesterdaySLP;
    }
  }
  calculateWeekSLP(){
    if(this.getDaysDiffStartOf('week') == 0 || this.totalSLP == 0){
      this.lastWeekSLP = this.lastWeekSLP;
      return 0;
    } else {
      return this.weekSLP + this.yesterdaySLP;
    }
  }
  calculateAverageSLP(){
    return this.monthSLP / this.getDaysDiffStartOf('month');
  }
}