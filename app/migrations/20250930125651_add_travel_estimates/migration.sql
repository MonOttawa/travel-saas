-- CreateTable
CREATE TABLE "TravelEstimate" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "origin" TEXT,
    "destination" TEXT,
    "startDate" TEXT,
    "returnDate" TEXT,
    "travelMode" TEXT NOT NULL,
    "distance" DOUBLE PRECISION,
    "days" INTEGER,
    "includeHotel" BOOLEAN NOT NULL,
    "includeIncidentals" BOOLEAN NOT NULL,
    "includeOneTimeExtras" BOOLEAN NOT NULL,
    "transportationTotal" DOUBLE PRECISION NOT NULL,
    "mealsTotal" DOUBLE PRECISION NOT NULL,
    "hotelTotal" DOUBLE PRECISION NOT NULL,
    "extrasPerDiemTotal" DOUBLE PRECISION NOT NULL,
    "extrasOneTimeTotal" DOUBLE PRECISION NOT NULL,
    "grandTotal" DOUBLE PRECISION NOT NULL,
    "summary" JSONB NOT NULL,
    "payload" JSONB,

    CONSTRAINT "TravelEstimate_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TravelEstimate" ADD CONSTRAINT "TravelEstimate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
