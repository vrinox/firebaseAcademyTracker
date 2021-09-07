import * as admin from "firebase-admin";
import * as request from "request-promise-native";
import {scholarOfficialData} from "../models/interfaces";
import {Scholar} from "../models/scholar";

const getCurrentData = () => {
  const scholars: Scholar[] = [];
  const ref = admin.database().ref().child("scholars");
  ref.orderByValue().on("value", async (snapshot) => {
    snapshot.forEach((data) => {
      scholars.push(new Scholar(data.val()));
    });
    return scholars;
  });
};
const getOfficialData = (scholar: Scholar): Promise<scholarOfficialData> | void => {
  const options = {
    uri: `https://api.lunaciarover.com/stats/${scholar.roninAddress}`,
  };
  request.get(options)
      .then((result: scholarOfficialData) => {
        console.log(result);
      })
      .catch((error) => {
        console.error(error);
      });
};

const updateDB = (scholars: Scholar[]) => {
  const dbRef = admin.database().ref().child("scholars");
  scholars.forEach((scholar: Scholar) => {
    const childRef = dbRef.child(scholar.id.toString());
    childRef.set(scholar.getValues());
  });
};

const updateLocalScholars = (dbScholars: Scholar[], newScholars: Scholar[]) => {
  return dbScholars.map((scholar: Scholar) => {
    const newScholarData = newScholars.find((newData: Scholar) => {
      return newData.roninAddress == scholar.roninAddress;
    });
    if (newScholarData) {
      scholar.update(newScholarData);
    }
  });
};

const getScholarsOfficialData = async (dbScholars: any): Promise<Scholar[]> => {
  const newScholarOfficialData: any = await Promise.all(dbScholars.map((scholar: Scholar) => {
    return getOfficialData(scholar);
  }));

  const newScholars: any = newScholarOfficialData.map((officialData: scholarOfficialData) => {
    return new Scholar().parse(officialData);
  });
  return newScholars;
};
export {getCurrentData, updateDB, updateLocalScholars, getScholarsOfficialData};
