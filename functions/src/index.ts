import * as functions from "firebase-functions";
import * as corsModule from "cors";
import * as admin from "firebase-admin";
import {createHistoricData} from "./localFunctions/historic";
import {addScholar} from "./localFunctions/users";
import {getAllScholarsFRomDB, updateDB, updateLocalScholars} from "./localFunctions/scholar";
import {Scholar} from "./models/scholar";
import {getScholarsOfficialData} from "./localFunctions/officialData";
import moment = require("moment");
const cors = corsModule({
  origin: true,
});
admin.initializeApp();

// const getScholarsStory = functions.https.onRequest(async (req, res) => {
//   const result = await getHistoric();
//   res.send(result);
// });

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

const addNewScholar = functions.https.onRequest( (req, res) => {
  cors(req, res, async ()=> {
    const docRef = await addScholar(req.body);
    res.send({
      "success": true,
      "id": docRef.id,
    });
  });
});

export {updateScholarData, addNewScholar};
