import * as request from "request-promise-native";
import {Scholar} from "../models/scholar";
import {scholarOfficialData} from "../models/interfaces";
const REST_API_SERVER = "https://game-api.axie.technology";


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
  const options = {
    uri: `${REST_API_SERVER}/api/v1/${scholar.roninAddress}`,
    json: true,
  };
  const apiData:scholarOfficialData = await new Promise((resolve) => {
    request.get(options).then((result: scholarOfficialData) => {
      result.ronin_address = scholar.roninAddress;
      resolve(result);
    });
  });
  return apiData;
};

export {getScholarsOfficialData};
