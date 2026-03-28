import { type Request, type Response } from "express";
import { User, type IUser } from "../model/user.model";
import {
  userSchemaValidation,
  userUpdateSchemaValidation,
  type updateSchemaType,
  type userSchemaType,
} from "../utils/validation";
import { parse } from "dotenv";

const CHUNK_SIZE = 500;

function chunkArray<T>(arr: T[], size: number) {
  const result = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

export const BulkCreate = async (req: Request, res: Response) => {
  // get the json array from the req.body

  const users: userSchemaType[] = req.body;
  if (!users || (Array.isArray(users) && users.length === 0)) {
    return res.status(400).json({ message: "Request body is required" });
  }

  if (users?.length <= 0) {
    return res
      .status(400)
      .json({ message: "Users Details should provide to create" });
  }

  //   filter the best versions with the zod and validate it to new array
  try {
    let insertedCount = 0;
    let skippedCount = 0;

    for (const chunk of chunkArray(users, CHUNK_SIZE)) {
      const validDocs = [];

      for (const u of chunk) {
        const parsed = userSchemaValidation.safeParse(u);
        if (parsed.success) {
          console.log("Success");
          validDocs.push(parsed.data);
          console.log(validDocs);
          //   insertedCount++;
        } else {
          console.error("Schema Validation failed for : ", u.fullName);
          skippedCount++;
        }
      }

      if (validDocs.length > 0) {
        try {
          const result = await User.insertMany(validDocs, { ordered: false });
          insertedCount += result.length;
        } catch (bulkError: any) {
          // MongoBulkWriteError: ordered:false inserts non-duplicate docs even on partial failure
          const nInserted: number = bulkError.result?.nInserted ?? 0;
          insertedCount += nInserted;
          skippedCount += bulkError.writeErrors?.length ?? 0;
          console.error("BulkWrite partial error:", bulkError.message);
        }
      }

      //  prevents event loop blocking
      await new Promise((resolve) => setImmediate(resolve));
    }

    if (insertedCount === 0) {
      return res.status(400).json({
        message: "No valid entries found to insert",
        skipped: skippedCount,
      });
    }

    res.status(skippedCount > 0 ? 207 : 200).json({
      message: "Bulk insert completed",
      inserted: insertedCount,
      skipped: skippedCount,
    });

    // catch the errors
  } catch (error) {
    res.status(500).json({
      error: "Internal Server Error",
    });
  }
};
export const BulkUpdate = async (req: Request, res: Response) => {
  const users: updateSchemaType[] = req.body;

  if (!users || (Array.isArray(users) && users.length === 0)) {
    return res.status(400).json({ message: "Request body is required" });
  }

  if (users?.length <= 0) {
    return res
      .status(400)
      .json({ message: "Users Details should provide to Update" });
  }

  //   filter the best versions with the zod and validate it to new array
  try {
    let updatedCount = 0;
    let skippedCount = 0;

    for (const chunk of chunkArray(users, CHUNK_SIZE)) {
      const validDocs = [];

      for (const item of chunk) {
        const parsed = userUpdateSchemaValidation.safeParse(item);
        if (parsed.success) {
          validDocs.push(parsed.data);
        } else {
          skippedCount++;
        }
      }

      if (validDocs.length > 0) {
        const operations = validDocs.map((user) => ({
          updateOne: {
            filter: user.email ? { email: user.email } : { phone: user.phone },
            update: { $set: { ...user, updatedAt: new Date() } },
          },
        }));
        try {
          const result = await User.bulkWrite(operations, { ordered: false });
          updatedCount += result.modifiedCount + result.upsertedCount;
        } catch (bulkError: any) {
          const nModified: number = bulkError.result?.nModified ?? 0;
          updatedCount += nModified;
          skippedCount += bulkError.writeErrors?.length ?? 0;
          console.error("BulkWrite partial error:", bulkError.message);
        }
      }

      //  prevents event loop blocking
      await new Promise((resolve) => setImmediate(resolve));
    }

    if (updatedCount === 0) {
      return res.status(400).json({
        message: "No valid entries found to update",
        skipped: skippedCount,
      });
    }

    res.status(skippedCount > 0 ? 207 : 200).json({
      message: "Bulk update completed",
      updated: updatedCount,
      skipped: skippedCount,
    });

    // catch the errors
  } catch (error) {
    res.status(500).json({
      error: "Internal Server Error",
    });
  }
};
