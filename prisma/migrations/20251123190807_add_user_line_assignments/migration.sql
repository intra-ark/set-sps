-- CreateTable
CREATE TABLE "UserLine" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "lineId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserLine_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserLine_userId_lineId_key" ON "UserLine"("userId", "lineId");

-- AddForeignKey
ALTER TABLE "UserLine" ADD CONSTRAINT "UserLine_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLine" ADD CONSTRAINT "UserLine_lineId_fkey" FOREIGN KEY ("lineId") REFERENCES "Line"("id") ON DELETE CASCADE ON UPDATE CASCADE;
