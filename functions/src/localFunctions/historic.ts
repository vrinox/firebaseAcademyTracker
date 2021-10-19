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

const createHistoricData = (scholars: Scholar[]) => {
  const dbRef = admin.firestore().collection("historic");
  scholars.forEach((scholar: Scholar) => {
    scholar.todaySLP = scholar.yesterdaySLP;
    scholar.lastUpdate = new Date();
    scholar.yesterdaySLP = scholar.tempYesterday;
    console.log(
        `${moment().format("DD/MM/YYYY")}[HISTORIC] ${scholar.name}`,
        JSON.stringify(scholar.getValues())
    );
    dbRef.add(scholar.getValues());
  });
};

export {createHistoricData, getHistoric};
