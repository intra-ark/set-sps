-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_lineId_fkey";

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_lineId_fkey" FOREIGN KEY ("lineId") REFERENCES "Line"("id") ON DELETE CASCADE ON UPDATE CASCADE;
