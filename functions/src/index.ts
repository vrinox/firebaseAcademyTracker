import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {createHistoricData} from "./localFunctions/historic";
import {getAllScholarsFRomDB, updateDB, updateLocalScholars} from "./localFunctions/scholar";
import {Scholar} from "./models/scholar";
import {getScholarsOfficialData} from "./localFunctions/officialData";
import moment = require("moment");
admin.initializeApp();

const updateScholarData = functions.pubsub.schedule("59 0 * * 0-6").timeZone("Europe/London").onRun(async () => {
  let dbScholars:any = await getAllScholarsFRomDB();
  getScholarsOfficialData(dbScholars)
      .then((scholarsNewData:Scholar[])=>{
        dbScholars = updateLocalScholars(dbScholars, scholarsNewData);
        updateDB(dbScholars);
        createHistoricData(dbScholars);
        console.log("the Update was done successfuly", moment().format());
      });
  return null;
});

export {updateScholarData};
