import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {getHistoric, createHistoricData} from "./localFunctions/historic";
import {getCurrentData, updateDB, updateLocalScholars, getScholarsOfficialData} from "./localFunctions/scholar";
import {Scholar} from "./models/scholar";
admin.initializeApp();

const getScholarsStory = functions.https.onRequest(async (req, res) => {
  const result = await getHistoric();
  res.send(result);
});

const updateScholarData = functions.pubsub.schedule("0 0 * * 1-7").onRun(async () => {
  let dbScholars:any = await getCurrentData();
  getScholarsOfficialData(dbScholars)
      .then((scholarsNewData:Scholar[])=>{
        dbScholars = updateLocalScholars(dbScholars, scholarsNewData);
        updateDB(dbScholars);
        createHistoricData(dbScholars);
        console.log("the Update was done successfuly");
      });
  return null;
});

export {updateScholarData, getScholarsStory};
