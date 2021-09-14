import * as request from "request-promise-native";
import {Scholar} from "../models/scholar";
import {scholarOfficialData, earningsData, statsData} from "../models/interfaces";
const REST_API_SERVER = "https://api.lunaciaproxy.cloud";


const getScholarsOfficialData = (dbScholars: any): Promise<Scholar[]> => {
  return new Promise((resolve) => {
    Promise.all(dbScholars.map((scholar: Scholar) => {
      return getOfficialData(scholar);
    }))
        .then((newScholarOfficialData: any[]) => {
          const scholarsNewData: any = newScholarOfficialData.map((officialData: scholarOfficialData) => {
            const scholarNewData = new Scholar();
            scholarNewData.parse(officialData);
            return scholarNewData;
          });
          resolve(scholarsNewData);
        });
  });
};


const getOfficialData = async (scholar: Scholar): Promise<scholarOfficialData> => {
  const Allstats: any = {};
  [Allstats.stats, Allstats.earnings] = await Promise.all(
      [
        getStats(scholar.roninAddress),
        getEarnings(scholar.roninAddress),
      ]
  );
  const earnings = Allstats.earnings.earnings;
  const stats = Allstats.stats.stats;
  const apiData: scholarOfficialData = parseData(earnings, stats, scholar.roninAddress);
  return apiData;
};

const getStats = (roninAddres: string): Promise<any> => {
  const options = {
    uri: `${REST_API_SERVER}/_stats/${roninAddres}`,
    json: true,
  };
  return new Promise((resolve) => {
    request.get(options).then((result: scholarOfficialData) => {
      resolve(result);
    });
  });
};
const getEarnings = (roninAddres: string): Promise<any> => {
  const options = {
    uri: `${REST_API_SERVER}/_earnings/${roninAddres}`,
    json: true,
  };
  return new Promise((resolve) => {
    request.get(options).then((result: scholarOfficialData) => {
      resolve(result);
    });
  });
};

const parseData = (earnings: earningsData, stats: statsData, roninAddress: string) => {
  return {
    ronin_address: roninAddress,
    ronin_slp: earnings.slp_holdings,
    total_slp: earnings.slp_in_total,
    in_game_slp: earnings.slp_inventory,
    rank: stats.rank,
    mmr: stats.elo,
    total_matches: stats.win_total,
    ign: stats.name,
  };
};

export {getScholarsOfficialData};
