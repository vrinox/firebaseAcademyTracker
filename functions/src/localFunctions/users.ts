import * as admin from "firebase-admin";
import {scholarFirebaseI, userLink} from "../models/interfaces";
import {Scholar} from "../models/scholar";
import {getScholar} from "./scholar";

const getUserLinkData = (uid: string):Promise<any> => {
  const dbRef = admin.firestore().collection("userLink");
  return new Promise((resolve, reject) => {
    dbRef.where("uid", "==", uid)
        .get()
        .then((snapshot)=>{
          snapshot.forEach((doc)=>{
            resolve(doc.data());
          });
        });
  });
};

const addScholar = async (userData: scholarFirebaseI) => {
  const dbRef = admin.firestore().collection("scholars");
  return dbRef.add(userData);
};

const addNewUserLink = async (userLinkData:any) => {
  const dbRef = admin.firestore().collection("userLink");
  return dbRef.add(userLinkData);
};

const getAllAppUserData = async (uid:string): Promise<{userData:any, scholar: any}> =>{
  const userLinkData: userLink = await getUserLinkData(uid);
  const scholar: Scholar = await getScholar(userLinkData.roninAddress);
  return {
    userData: userLinkData,
    scholar: scholar.getValues(),
  };
};
export {addNewUserLink, addScholar, getAllAppUserData};
