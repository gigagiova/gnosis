-- CreateTable
CREATE TABLE "essays" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "contents" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "essays_pkey" PRIMARY KEY ("id")
);
