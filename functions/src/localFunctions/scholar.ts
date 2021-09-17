import * as admin from "firebase-admin";
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
            console.log(doc.data());
            resolve(new Scholar(doc.data()));
          });
        });
  });
};

export {getAllScholarsFRomDB, updateDB, updateLocalScholars, getScholar};
