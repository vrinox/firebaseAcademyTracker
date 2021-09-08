import {Reference} from "@firebase/database-types";
import * as admin from "firebase-admin";
import * as request from "request-promise-native";
import {scholarOfficialData} from "../models/interfaces";
import {Scholar} from "../models/scholar";

const getCurrentData = async () => {
  let scholars: Scholar[] = [];
  const ref = admin.database().ref().child("scholars");
  scholars = await getData(scholars, ref);
  return scholars;
};
const getData = (scholars:Scholar[], ref:Reference):Promise<Scholar[]> => {
  return new Promise((resolve)=>{
    ref.orderByValue().on("value", (snapshot) => {
      snapshot.forEach((data) => {
        scholars.push(new Scholar(data.val()));
      });
      resolve(scholars);
    });
  });
};
const getOfficialData = (scholar: Scholar): Promise<scholarOfficialData> => {
  const options = {
    uri: `https://api.lunaciarover.com/stats/${scholar.roninAddress}`,
    json: true,
  };
  return new Promise((resolve)=>{
    request.get(options).then((result:scholarOfficialData)=>{
      resolve(result);
    });
  });
};

const getScholarsOfficialData = (dbScholars: any): Promise<Scholar[]> => {
  return new Promise((resolve)=>{
    Promise.all(dbScholars.map( (scholar: Scholar) => {
      return getOfficialData(scholar);
    }))
        .then((newScholarOfficialData: any[])=>{
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
  const dbRef = admin.database().ref().child("scholars");
  let cont = 0;
  scholars.forEach((scholar: Scholar) => {
    const childRef = dbRef.child(cont.toString());
    childRef.set(scholar.getValues());
    cont++;
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
  const rankedScholars = updatedScholars.sort( (scholarA:Scholar, scholarB:Scholar) => {
    return scholarB.monthSLP - scholarA.monthSLP;
  }).map((scholar:Scholar)=>{
    scholar.mounthlyRank = rank;
    rank++;
    return scholar;
  });
  return rankedScholars;
};
export {getCurrentData, updateDB, updateLocalScholars, getScholarsOfficialData};
