-- CreateEnum
CREATE TYPE "OperationType" AS ENUM ('add', 'subtract', 'multiply', 'divide');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "starting_numbers" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "number" DECIMAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "starting_numbers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "operations" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "parent_id" INTEGER,
    "parent_operation_id" INTEGER,
    "operation_type" "OperationType" NOT NULL,
    "right_operand" DECIMAL NOT NULL,
    "result" DECIMAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "operations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE INDEX "operations_parent_id_idx" ON "operations"("parent_id");

-- CreateIndex
CREATE INDEX "operations_parent_operation_id_idx" ON "operations"("parent_operation_id");

-- AddForeignKey
ALTER TABLE "starting_numbers" ADD CONSTRAINT "starting_numbers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operations" ADD CONSTRAINT "operations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operations" ADD CONSTRAINT "operations_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "starting_numbers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operations" ADD CONSTRAINT "operations_parent_operation_id_fkey" FOREIGN KEY ("parent_operation_id") REFERENCES "operations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
