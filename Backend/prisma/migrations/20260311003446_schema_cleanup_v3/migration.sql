/*
  Warnings:

  - You are about to drop the column `postcode` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `Customer` table. All the data in the column will be lost.
  - Added the required column `postcodeCode` to the `Address` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "Address" DROP COLUMN "postcode",
ADD COLUMN     "postcodeCode" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Customer" DROP COLUMN "email";

-- AlterTable
ALTER TABLE "ProductStock" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "SupplierApplication" ADD COLUMN     "status" "ApplicationStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "SupplierPostcode" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_postcodeCode_fkey" FOREIGN KEY ("postcodeCode") REFERENCES "Postcode"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
