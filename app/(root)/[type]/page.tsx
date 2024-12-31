import React from "react";
import Sort from "@/components/Sort";
import { getFiles } from "@/lib/actions/file.actions";
import { Models } from "node-appwrite";
import Card from "@/components/Card";
import { getFileTypesParams } from "@/lib/utils";
import Image from "next/image";

// eslint-disable-next-line no-undef
const Page = async ({ searchParams, params }: SearchParamProps) => {
  const type = ((await params)?.type as string) || "";
  const searchText = ((await searchParams)?.query as string) || "";
  const sort = ((await searchParams)?.sort as string) || "";
  // eslint-disable-next-line no-undef
  const types = getFileTypesParams(type) as FileType[];
  const files = await getFiles({ types, searchText, sort });
  return (
    <div className="page-container">
      <section className="w-full">
        <h1 className="h1 capitalize">{type}</h1>
        <div className="total-size-section">
          <p className="body-1">
            {/* Total Size: <span className="h5">0 mb</span> */}
          </p>
          <div className="sort-container">
            <Image src="assets/icons/sort.svg" alt="sort" width={30} height={30} /><div className="w-4 lg:hidden">
          </div>
            <Sort />
          </div>
        </div>
      </section>
      {/* Render the files */}
      {files.total > 0 ? (
        <section className="file-list">
          {files.documents.map((file: Models.Document) => (
            <Card key={file.$id} file={file} />
          ))}
        </section>
      ) : (
        <p className="empty-list">No files uploaded</p>
      )}
    </div>
  );
};
export default Page;
