import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as request from "request-promise-native";
import {scholarOfficialData} from "./models/interfaces";
import {Scholar} from "./models/scholar";
admin.initializeApp();

// 59 23 1-31 1-12 *

const getScholarsStory = functions.https.onRequest(async (req, res) => {
  const result = await getHistoric();
  res.send(result);
});
const updateHistoricData = functions.pubsub.schedule("every 2 minutes").onRun(async () => {
  let dbScholars:any = await getCurrentData();
  const newScholarOfficialData:scholarOfficialData[] = await Promise.all(dbScholars.map((scholar:Scholar)=>{
    return getOfficialData(scholar);
  }));

  const newScholars:any = newScholarOfficialData.map((officialData:scholarOfficialData)=>{
    return new Scholar().parse(officialData);
  })
  dbScholars = updateLocalScholars(dbScholars, newScholars);
  updateDB(dbScholars);
  createHistoricData(dbScholars);
  return null;
});

const getCurrentData = ()=> {
  const scholars:Scholar[] = [];
  const ref = admin.database().ref().child("scholars");
  ref.orderByValue().on("value", async (snapshot) => {
    snapshot.forEach((data) => {
      scholars.push(new Scholar(data.val()));
    });
    return scholars;
  });
};
const getOfficialData = (scholar:Scholar):Promise<scholarOfficialData> | void => {
  const options = {
    uri: `https://api.lunaciarover.com/stats/${scholar.roninAddress}`,
  };
  request.get(options)
      .then( (result:scholarOfficialData)=> {
        console.log(result);
      })
      .catch((error)=>{
        console.error(error);
      });
};
const updateDB = (scholars:Scholar[]) => {
  const dbRef = admin.database().ref().child("scholars");
  scholars.forEach((scholar:Scholar)=>{
    const childRef = dbRef.child(scholar.id.toString());
    childRef.set(scholar.getValues());
  });
};
const createHistoricData = (scholars:Scholar[]) => {
  const dbRef = admin.database().ref().child("historic");
  scholars.forEach((scholar:Scholar) => {
    const childRef = dbRef.push();
    childRef.set(scholar.getValues());
  });
};
const updateLocalScholars = (dbScholars:Scholar[], newScholars:Scholar[])=> {
  return dbScholars.map((scholar:Scholar)=>{
    let newScholarData = newScholars.find((newData:Scholar) => {
      return newData.roninAddress == scholar.roninAddress;
    });
    if(newScholarData){
      scholar.update(newScholarData);
    }
  })
};
const getHistoric = ():Promise<Scholar[]> => {
  return new Promise((resolve)=>{
    const refHistoric = admin.database().ref("historic");
    let historic:Scholar[] = [];
    refHistoric.orderByValue().on("value", (snapshot)=>{
      snapshot.forEach((data)=> {
        historic.push(data.val());
      });
      resolve(historic);
    });
  });  
};

export {updateHistoricData, getScholarsStory};
