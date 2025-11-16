import { onchainTable } from "ponder";

export const safeProxy = onchainTable("safeProxy", (t) => ({
  id: t.text().primaryKey(),
  address: t.text(),
  owners: t.text().array(),
  threshold: t.bigint(),
  createdAt: t.timestamp(),
  createdBy: t.text(),
}));
