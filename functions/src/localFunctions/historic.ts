import * as admin from "firebase-admin";
import {Scholar} from "../models/scholar";

const getHistoric = (): Promise<Scholar[]> => {
  return new Promise((resolve) => {
    const refHistoric = admin.database().ref("historic");
    const historic: Scholar[] = [];
    refHistoric.orderByValue().on("value", (snapshot) => {
      snapshot.forEach((data) => {
        historic.push(data.val());
      });
      resolve(historic);
    });
  });
};

const createHistoricData = (scholars: Scholar[]) => {
  const dbRef = admin.database().ref().child("historic");
  scholars.forEach((scholar: Scholar) => {
    const childRef = dbRef.push();
    scholar.todaySLP = scholar.yesterdaySLP;
    scholar.yesterdaySLP = 0;
    childRef.set(scholar.getValues());
  });
};

export {createHistoricData, getHistoric};
