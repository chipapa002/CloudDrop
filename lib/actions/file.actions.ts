"use server";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import { UploadFileProps } from "@/types";
import {createAdminClient, createSessionClient} from "@/lib/appwrite";
import { InputFile } from "node-appwrite/file";
import { appwriteconfig } from "@/lib/appwrite/config";
import { ID, Models, Query } from "node-appwrite";
import { constructFileUrl, getFileType, parseStringify } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/actions/user.actions";

const handleError = (error: unknown, message: string) => {
  console.log(error, message);
  throw error;
};

export const uploadFile = async ({
  file,
  ownerId,
  accountId,
  path,
}: UploadFileProps) => {
  const { storage, database } = await createAdminClient();

  try {
    const inputFile = InputFile.fromBuffer(file, file.name);

    const bucketFile = await storage.createFile(
      appwriteconfig.bucketId,
      ID.unique(),
      inputFile,
    );

    const fileDoc = {
      type: getFileType(bucketFile.name).type,
      name: bucketFile.name,
      url: constructFileUrl(bucketFile.$id),
      extension: getFileType(bucketFile.name).extension,
      size: bucketFile.sizeOriginal,
      owner: ownerId,
      accountId,
      users: [],
      bucketId: bucketFile.$id,
    };
    const newFile = await database
      .createDocument(
        appwriteconfig.databaseId,
        appwriteconfig.filesCollectionId,
        ID.unique(),
        fileDoc,
      )
      .catch(async (error: unknown) => {
        await storage.deleteFile(appwriteconfig.bucketId, bucketFile.$id);
        handleError(error, "Failed to create file document");
      });
    revalidatePath(path);
    return parseStringify(newFile);
  } catch (error) {
    handleError(error, "Failed to upload file");
  }
};

const createQueries = (
  currentUser: Models.Document,
  types: string[],
  searchText: string,
  sort: string,
  limit?: number,
) => {
  const queries = [
    Query.or([
      Query.equal("owner", [currentUser.$id]),
      Query.contains("users", [currentUser.email]),
    ]),
  ];

  if (types.length > 0) queries.push(Query.equal("type", types));
  if (searchText) queries.push(Query.contains("name", searchText));
  if (limit) queries.push(Query.limit(limit));

  const [sortBy, orderBy] = sort.split("-");

  queries.push(
    orderBy === "asc" ? Query.orderAsc(sortBy) : Query.orderDesc(sortBy),
  );

  return queries;
};

export const getFiles = async ({
  types = [],
  searchText = "",
  sort = "$createdAt-desc",
  limit,
// eslint-disable-next-line no-undef
}: GetFilesProps) => {
  const { database } = await createAdminClient();

  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error("User not found");
    const queries = createQueries(currentUser, types, searchText, sort, limit);
    const files = await database.listDocuments(
      appwriteconfig.databaseId,
      appwriteconfig.filesCollectionId,
      queries,
    );

    return parseStringify(files);
  } catch (error) {
    handleError(error, "Failed to get files");
  }
};

export const renameFile = async ({
  fileId,
  name,
  extension,
  path,
// eslint-disable-next-line no-undef
}: RenameFileProps) => {
  const { database } = await createAdminClient();

  try {
    const newName = `${name}-${extension}`;
    const updatedFile = await database.updateDocument(
      appwriteconfig.databaseId,
      appwriteconfig.filesCollectionId,
      fileId,
      { name: newName },
    );

    revalidatePath(path);
    return parseStringify(updatedFile);
  } catch (error) {
    handleError(error, "Failed to rename the file");
  }
};

export const updateFileUsers = async ({
  fileId,
  emails,
  path,
// eslint-disable-next-line no-undef
}: UpdateFileUsersProps) => {
  const { database } = await createAdminClient();

  try {
    const updatedFile = await database.updateDocument(
      appwriteconfig.databaseId,
      appwriteconfig.filesCollectionId,
      fileId,
      { users: emails },
    );

    revalidatePath(path);
    return parseStringify(updatedFile);
  } catch (error) {
    handleError(error, "Failed to rename the file");
  }
};

export const deleteFile = async ({
  fileId,
  bucketFileId,
  path,
// eslint-disable-next-line no-undef
}: DeleteFileProps) => {
  const { database, storage } = await createAdminClient();

  try {
    const deletedFile = await database.deleteDocument(
      appwriteconfig.databaseId,
      appwriteconfig.filesCollectionId,
      fileId,
    );

    if (deletedFile) {
      await storage.deleteFile(appwriteconfig.bucketId, bucketFileId);
    }
    revalidatePath(path);
    return parseStringify({ status: "success" });
  } catch (error) {
    handleError(error, "Failed to rename the file");
  }
};

export async function getTotalSpaceUsed() {
  try{
    const { database } = await createSessionClient();
    const currentUser = await getCurrentUser();

    if (!currentUser) throw new Error("User not authenticated");

    const files = await database.listDocuments(
        appwriteconfig.databaseId,
        appwriteconfig.filesCollectionId,
        [Query.equal("owner", currentUser.$id)],
    );

    const totalSpace = {
      image: {size: 0, latestDate: ""},
      document: {size: 0, latestDate: ""},
      video: {size: 0, latestDate: ""},
      audio: {size: 0, latestDate: ""},
      other: {size: 0, latestDate: ""},
      used: 0,
      all: 2 * 1024 * 1024 * 1024 /* 2GB available */
    };

    files.documents.forEach((file) => {
      // eslint-disable-next-line no-undef
      const fileType = file.type as FileType;
      totalSpace[fileType].size += file.size;
      totalSpace.used += file.size;

      if (!totalSpace[fileType].latestDate || new Date(file.$updatedAt) > new Date(totalSpace[fileType].latestDate)) {
        totalSpace[fileType].latestDate = file.$updatedAt;
      }
    });
    return parseStringify(totalSpace)
  } catch (error) {
    handleError(error, "Failed to calculate the total space used");
  }
}
