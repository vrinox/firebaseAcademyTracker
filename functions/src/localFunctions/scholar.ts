import * as admin from "firebase-admin";
import moment = require("moment");
import {Scholar} from "../models/scholar";

const getAllScholarsFRomDB = async () => {
  let scholars: Scholar[] = [];
  const snapshot = await admin.firestore().collection("scholars").get();
  scholars = await parseDocsToClassScholar(scholars, snapshot);
  return scholars;
};
const parseDocsToClassScholar = (
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
const updateDB = async (scholars: Scholar[]):Promise<Scholar[]> => {
  const dbRef = admin.firestore().collection("scholars");
  const result = await Promise.all(scholars.map( (scholar) => updateOneScholar(scholar, dbRef)));
  console.log("final promesas");
  return result;
};
const updateOneScholar = async (
    scholar: Scholar,
    dbRef: FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>
) => {
  const insertData:any = scholar.getValues();
  insertData.todaySLP = 0;
  const snapshot = await dbRef.where("roninAddress", "==", scholar.roninAddress).get();
  await snapshot.docs[0].ref.update(insertData);
  console.log("scholar", scholar.name);
  return scholar;
};
const updateLocalScholars = (dbScholars: Scholar[], scholarsNewData: Scholar[]) => {
  let updatedScholars = dbScholars.map((scholar: Scholar) => {
    const scholarNewData = scholarsNewData.find((newData: Scholar) => {
      return newData.roninAddress === scholar.roninAddress;
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
const getScholar = async (roninAddres: string): Promise<Scholar> =>{
  const dbRef = admin.firestore().collection("scholars");
  return new Promise((resolve, reject) => {
    dbRef.where("roninAddress", "==", roninAddres)
        .get()
        .then((snapshot)=>{
          snapshot.forEach((doc)=>{
            resolve(new Scholar(doc.data()));
          });
        });
  });
};
const cleanSharedBattles = async () => {
  const snapShot = await admin.firestore().collection("sharedBattles").get();
  const promiseArray: Promise<any>[] = [];
  snapShot.forEach( async (doc)=>{
    const date = doc.data().creationDate.toDate();
    const controlDate = getControlDate();
    if (date <= controlDate) {
      promiseArray.push(doc.ref.delete());
    }
  });

  const result = await Promise.all(promiseArray);
  return result;
};
const getControlDate = (): any =>{
  const controlDate = moment();
  controlDate.subtract(7, "days");
  return controlDate;
};
export {getAllScholarsFRomDB, updateDB, updateLocalScholars, getScholar, cleanSharedBattles};
