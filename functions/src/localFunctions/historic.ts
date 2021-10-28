import * as admin from "firebase-admin";
import moment = require("moment");
import {Scholar} from "../models/scholar";

const getHistoric = (): Promise<Scholar[]> => {
  return new Promise((resolve) => {
    admin.firestore().collection("historic").get().then((snapshot)=>{
      const historic: Scholar[] = [];
      snapshot.docs.map((doc)=>{
        historic.push(new Scholar(doc.data()));
      });
      resolve(historic);
    });
  });
};

const createHistoricData = async (scholars: Scholar[]) => {
  const dbRef = admin.firestore().collection("historic");
  const promiseArray: Promise<any>[] = [];
  scholars.forEach(async (scholar: Scholar) => {
    const insertData:any = scholar.getValues();
    insertData.todaySLP = scholar.yesterdaySLP;
    insertData.lastUpdate = new Date();
    insertData.yesterdaySLP = scholar.tempYesterday;
    console.log(
        `${moment().format("DD/MM/YYYY")}[HISTORIC] ${scholar.name}`,
        JSON.stringify(insertData)
    );
    promiseArray.push(dbRef.add(insertData));
  });
  const result = await Promise.all(promiseArray);
  return result;
};

export {createHistoricData, getHistoric};
