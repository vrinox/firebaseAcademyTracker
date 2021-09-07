import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {getHistoric, createHistoricData} from "./localFunctions/historic";
import {getCurrentData, updateDB, updateLocalScholars, getScholarsOfficialData} from "./localFunctions/scholar";
admin.initializeApp();

// 59 23 1-31 1-12 *

const getScholarsStory = functions.https.onRequest(async (req, res) => {
  const result = await getHistoric();
  res.send(result);
});

const updateHistoricData = functions.pubsub.schedule("every 2 minutes").onRun(async () => {
  let dbScholars:any = await getCurrentData();
  const scholarsNewData = await getScholarsOfficialData(dbScholars);
  dbScholars = updateLocalScholars(dbScholars, scholarsNewData);
  updateDB(dbScholars);
  createHistoricData(dbScholars);
  console.log("the Update was done successfuly");
  return null;
});


export {updateHistoricData, getScholarsStory};
