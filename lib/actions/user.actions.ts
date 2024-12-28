// create account flow

"use server";

import { createAdminClient, createSessionClient } from "@/lib/appwrite";
import { appwriteconfig } from "@/lib/appwrite/config";
import { ID,  Query } from "node-appwrite";
import { parseStringify } from "@/lib/utils";
import { cookies } from "next/headers";
import { avatarPlaceholderUrl } from "@/constants";
import { redirect } from "next/navigation";


const getUserByEmail = async (email: string) => {
  const { database } = await createAdminClient();

  const result = await database.listDocuments(
    appwriteconfig.databaseId,
    appwriteconfig.usersCollectionId,
    [Query.equal("email", email)],
  );

  return result.total > 0 ? result.documents[0] : null;
};

const handleError = (error: unknown, message: string) => {
  console.log(error, message);
  throw error;
};

export const sendEmailOTP = async ({ email }: { email: string }) => {
  const { account } = await createAdminClient();

  try {
    const session = await account.createEmailToken(ID.unique(), email);
    return session.userId;
  } catch (error) {
    handleError(error, "Failed to send email OTP");
  }
};

export const createAccount = async ({
  fullName,
  email,
}: {
  fullName: string;
  email: string;
}) => {
  const existingAccount = await getUserByEmail(email);

  const accountId = await sendEmailOTP({ email });

  if (!accountId) throw Error("Failed to send an OTP");
  if (!existingAccount) {
    const { database } = await createAdminClient();
    await database.createDocument(
      appwriteconfig.databaseId,
      appwriteconfig.usersCollectionId,
      ID.unique(),
      {
        fullName,
        email,
        avatar: avatarPlaceholderUrl,
        accountId,
      },
    );
  }

  return parseStringify({ accountId });
};

export const verifySecret = async ({
  accountId,
  password,
}: {
  accountId: string;
  password: string;
}) => {
  try {
    const { account } = await createAdminClient();
    const session = await account.createSession(accountId, password);
    (await cookies()).set("appwrite-session", session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: true,
    });
    return parseStringify({ sessionId: session.$id });
  } catch (error) {
    handleError(error, "Failed to send an OTP");
  }
};

export const getCurrentUser = async () => {

  try{

  const { database, account } = await createSessionClient();
  const result = await account.get();
  const user = await database.listDocuments(
    appwriteconfig.databaseId,
    appwriteconfig.usersCollectionId,
    [Query.equal("accountId", result.$id)],
  );
  if (user.total <= 0) return null;

  return parseStringify(user.documents[0]);

  }catch (error) {
    console.log(error, "Failed to get current user");
  }

};

export const logOutUser = async () => {
  const { account } = await createSessionClient();
  try {
    await account.deleteSession("current");
    (await cookies()).delete("appwrite-session");
  } catch (error) {
    handleError(error, "Failed to log-out user");
  } finally {
    redirect("/sign-in");
  }
};

export const signInUser = async ({ email }: { email: string }) => {
  try {
    const existingUser = await getUserByEmail(email);
    // user exists
    if (existingUser) {
      await sendEmailOTP({ email });
      return parseStringify({ accountId: existingUser.accountId });
    }
    return parseStringify({ accountId: null, error: "User not found" });
  } catch (error) {
    handleError(error, "Failed to sign in");
  }
};
