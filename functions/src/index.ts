import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {createHistoricData} from "./localFunctions/historic";
import {addScholar, addNewUserLink, getAllAppUserData} from "./localFunctions/users";
import {getCurrentData, updateDB, updateLocalScholars, getScholarsOfficialData} from "./localFunctions/scholar";
import {Scholar} from "./models/scholar";
import * as corsModule from "cors";
const cors = corsModule({
  origin: true,
});
admin.initializeApp();

// const getScholarsStory = functions.https.onRequest(async (req, res) => {
//   const result = await getHistoric();
//   res.send(result);
// });

const updateScholarData = functions.pubsub.schedule("0 0 * * 1-7").timeZone("Europe/London").onRun(async () => {
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

const addNewScholar = functions.https.onRequest( (req, res) => {
  cors(req, res, async ()=> {
    const docRef = await addScholar(req.body);
    res.send({
      "success": true,
      "id": docRef.id,
    });
  });
});

const addUserLink = functions.https.onRequest( (req, res) => {
  cors(req, res, async ()=> {
    const docRef = await addNewUserLink(req.body);
    res.send({
      "success": true,
      "userLinkId": docRef.id,
    });
  });
});

const getAppUserData = functions.https.onRequest( (req, res) => {
  cors(req, res, async ()=> {
    const userData = await getAllAppUserData(req.body.uid);
    res.send({
      "success": true,
      "userData": userData,
    });
  });
});

export {updateScholarData, addNewScholar, addUserLink, getAppUserData};
