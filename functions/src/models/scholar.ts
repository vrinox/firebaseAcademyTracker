import moment = require("moment");
import { scholarOfficialData } from "./interfaces";
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
  tempYesterday: number = 0;
  comunity: string[] = [];

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
    this.name = (this.name) ? this.name : unParsedData.ign;
    return this;
  }
  getValues(): object {
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
      weekSLP: this.weekSLP || 0,
      lastUpdate: this.lastUpdate
    }
  }
  update(newData: Scholar): void {
    let oldData: any = this.getValues();

    let today = this.calculateYesterdaySLP(newData.inGameSLP, oldData.inGameSLP);
    let monthAcumulated = this.calculateMonthAcc(today, oldData.monthSLP);
    let weekAccumulated = this.calculateWeekAcc(today, oldData.weekSLP);

    this.tempYesterday = oldData.todaySLP;
    this.todaySLP = 0;
    this.yesterdaySLP = today;
    this.monthSLP = monthAcumulated;
    this.weekSLP = weekAccumulated;
    this.averageSLP = this.calculateAverageSLP();
    this.lastUpdate = new Date(moment().startOf("day").toString());

    this.MMR = newData.MMR;
    this.PVPRank = newData.PVPRank;
    this.inGameSLP = newData.inGameSLP;
    this.inRoninSLP = newData.inRoninSLP;
    this.totalSLP = newData.totalSLP;

    console.log(`[SCHOLAR] ${this.name} [dia]: ${today}slp, [semana]: ${weekAccumulated}slp [mes]: ${monthAcumulated}slp [old-inGame] ${oldData.inGameSLP} [new-inGame] ${newData.inGameSLP}`);
    console.log(`${moment().format('DD/MM/YYYY')}[SCHOLAR][OLD] ${this.name}`, JSON.stringify(oldData));
    console.log(`${moment().format('DD/MM/YYYY')}[SCHOLAR][NEW] ${this.name}`, JSON.stringify(newData));
    console.log(`${moment().format('DD/MM/YYYY')}[SCHOLAR][RESULT] ${this.name}`, JSON.stringify(this.getValues()));
  }
  getDaysDiffStartOf(valor: any): number {
    const startOfTheMonth = moment().startOf(valor);
    const today = moment();
    return today.diff(startOfTheMonth, "days");
  }
  calculateYesterdaySLP(newTotal: number, oldTotal: number) {
    return (newTotal < oldTotal) ? newTotal : newTotal - oldTotal;
  }
  calculateMonthAcc(todaySLP: number, monthAcumulated: number) {
    if (this.getDaysDiffStartOf('month') === 0) {
      this.lastMonthSLP = this.monthSLP;
      monthAcumulated = 0;
    }
    return monthAcumulated + todaySLP;
  }
  calculateWeekAcc(todaySLP: number, weekAccumulated: number) {
    if (this.getDaysDiffStartOf('week') === 0) {
      this.lastWeekSLP = this.weekSLP;
      weekAccumulated = 0;
    }
    return weekAccumulated + todaySLP;
  }
  calculateAverageSLP() {
    return this.monthSLP / this.getDaysDiffStartOf('month');
  }
}