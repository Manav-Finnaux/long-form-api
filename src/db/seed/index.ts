import { db } from "@/db";
import { locationTable } from "@/db/schemas/pincodes";
import fs from "fs";
import { join } from "path";

type Location = typeof locationTable.$inferInsert;

async function main() {
  const fileName = "location.json";
  const filePath = join(__dirname, fileName);
  const file = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  for (let i = 0; i < file.length; i++) {
    const data = file[i];
    const location: Location = {
      pincode: data.pincode,
      name: data.name,
      block: data.block,
      state: data.state,
      district: data.district,
      tehsil: data.tehsil,
      isActive: true,
    };
    file[i] = location;
  }

  const sanitizedData: Location[] = file;
  const chunkSize = 9000;
  let cur = 0;
  let end = chunkSize > file.length ? file.length : chunkSize;
  let count = 1;
  await db.transaction(async (tx) => {
    while (true) {
      const dataChunk = sanitizedData.slice(cur, end);
      await tx.insert(locationTable).values(dataChunk);
      console.log(`Inserted batch ${count}`);
      count++;
      cur = end;
      if (cur >= sanitizedData.length) {
        console.log("All data inserted");
        break;
      }
      if (end + chunkSize >= sanitizedData.length) {
        end = sanitizedData.length;
      } else {
        end += chunkSize;
      }
    }
  });
  process.exit(0);
}

main();
