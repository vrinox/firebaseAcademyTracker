import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {createHistoricData} from "./localFunctions/historic";
import {updateDB, getAllScholarsFRomDB, updateLocalScholars, cleanSharedBattles} from "./localFunctions/scholar";
import {Scholar} from "./models/scholar";
import {getScholarsOfficialData} from "./localFunctions/officialData";
admin.initializeApp();

const updateScholarData = functions.pubsub.schedule("0 0 * * 0-6").timeZone("UTC").onRun(async () => {
  let dbScholars:any = await getAllScholarsFRomDB();
  const scholarsNewData:Scholar[] = await getScholarsOfficialData(dbScholars);
  dbScholars = updateLocalScholars(dbScholars, scholarsNewData);
  await updateDB(dbScholars);
  await createHistoricData(dbScholars);
  await cleanSharedBattles();
  return null;
});

export {updateScholarData};
