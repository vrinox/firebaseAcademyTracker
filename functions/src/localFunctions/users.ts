import * as admin from "firebase-admin";
import {scholarFirebaseI, userLink} from "../models/interfaces";

const setLink = (user: userLink): Promise<void> => {
  const dbRef = admin.firestore().collection("userLink");
  return dbRef.add(user)
      .then((data)=>{
        return;
      });
};

const getUserAddress = (uid: string):Promise<any> => {
  const dbRef = admin.firestore().collection("userLink");
  return new Promise((resolve, reject) => {
    dbRef.where("uid", "==", uid)
        .get()
        .then((snapshot)=>{
          snapshot.forEach((doc)=>{
            resolve(doc.data().roninAddress);
          });
        });
  });
};

const addScholar = async (userData: scholarFirebaseI) => {
  const dbRef = admin.firestore().collection("scholars");
  return dbRef.add(userData);
};
export {setLink, getUserAddress, addScholar};
