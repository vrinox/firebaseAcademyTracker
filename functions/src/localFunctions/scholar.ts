import * as admin from "firebase-admin";
import * as request from "request-promise-native";
import {scholarOfficialData, earningsData, statsData} from "../models/interfaces";
import {Scholar} from "../models/scholar";

const REST_API_SERVER = "https://api.lunaciaproxy.cloud";

const getCurrentData = async () => {
  let scholars: Scholar[] = [];
  const snapshot = await admin.firestore().collection("scholars").get();
  scholars = await getData(scholars, snapshot);
  return scholars;
};
const getData = (
    scholars: Scholar[],
    snapshot:FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>
): Promise<Scholar[]> => {
  return new Promise((resolve) => {
    snapshot.forEach((doc:FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>) => {
      scholars.push(new Scholar(doc.data()));
    });
    resolve(scholars);
  });
};
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

const updateDB = (scholars: Scholar[]) => {
  const dbRef = admin.firestore().collection("scholars");
  scholars.forEach(async (scholar: Scholar) => {
    const snapshot = await dbRef.where("roninAddress", "==", scholar.roninAddress).get();
    snapshot.forEach((doc)=>{
      doc.ref.update(scholar.getValues());
    });
  });
};

const updateLocalScholars = (dbScholars: Scholar[], scholarsNewData: Scholar[]) => {
  let updatedScholars = dbScholars.map((scholar: Scholar) => {
    const scholarNewData = scholarsNewData.find((newData: Scholar) => {
      return newData.roninAddress == scholar.roninAddress;
    });
    if (scholarNewData) {
      scholar.update(scholarNewData);
    }
    return scholar;
  });
  updatedScholars = calculateMonthlyRank(updatedScholars);
  return updatedScholars;
};

const calculateMonthlyRank = (updatedScholars: Scholar[]) => {
  let rank = 1;
  const rankedScholars = updatedScholars.sort((scholarA: Scholar, scholarB: Scholar) => {
    return scholarB.monthSLP - scholarA.monthSLP;
  }).map((scholar: Scholar) => {
    scholar.mounthlyRank = rank;
    rank++;
    return scholar;
  });
  return rankedScholars;
};

const getOfficialData = async (scholar: Scholar): Promise<scholarOfficialData> => {
  const Allstats: any = {};
  [Allstats.stats, Allstats.earnings] = await Promise.all(
      [
        getStats(scholar.roninAddress),
        getEarnings(scholar.roninAddress),
      ]
  );
  const apiData: scholarOfficialData = parseData(Allstats.earnings, Allstats.stats, scholar.roninAddress);
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

export {getCurrentData, updateDB, updateLocalScholars, getScholarsOfficialData};
