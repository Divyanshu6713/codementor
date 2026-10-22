CREATE TABLE "course_progress" (
	"student_id" uuid NOT NULL,
	"lesson_id" text NOT NULL,
	"hint_level" integer DEFAULT 0 NOT NULL,
	"solution_viewed_at" timestamp with time zone,
	"passed_at" timestamp with time zone,
	"passed_hint_level" integer,
	"passed_after_solution" boolean,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "course_progress_student_id_lesson_id_pk" PRIMARY KEY("student_id","lesson_id")
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "is_guest" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "course_progress" ADD CONSTRAINT "course_progress_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;