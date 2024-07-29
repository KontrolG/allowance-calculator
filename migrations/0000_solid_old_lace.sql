CREATE TABLE IF NOT EXISTS "allowances" (
	"id" serial PRIMARY KEY NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"date" date NOT NULL,
	"amount" numeric NOT NULL,
	"diff" numeric NOT NULL,
	"isCalculated" boolean DEFAULT false
);
