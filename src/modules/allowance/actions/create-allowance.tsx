"use server";
import { db } from "@/db";
import { AllowancesTable, InsertAllowances } from "@/db/schema";
import { getDateInputValue } from "@/modules/shared/utils/date-input";
import { revalidatePath } from "next/cache";

export async function createAllowance(data: InsertAllowances) {
  await db
    .insert(AllowancesTable)
    .values({ ...data, date: getDateInputValue(data.date)! });

  revalidatePath("/");
}
