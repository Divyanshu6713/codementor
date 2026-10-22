CREATE TABLE "py_activity" (
	"student_id" uuid NOT NULL,
	"day" text NOT NULL,
	"seconds" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "py_activity_student_id_day_pk" PRIMARY KEY("student_id","day")
);
--> statement-breakpoint
CREATE TABLE "py_assessments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"kind" text NOT NULL,
	"scope_id" text NOT NULL,
	"question_ids" jsonb NOT NULL,
	"exercise_key" text,
	"time_limit_s" integer,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"submitted_at" timestamp with time zone,
	"score" integer,
	"total" integer,
	"passed" boolean,
	"details" jsonb
);
--> statement-breakpoint
CREATE TABLE "py_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"item_id" text NOT NULL,
	"lesson_id" text,
	"module_id" text,
	"kind" text NOT NULL,
	"mode" text NOT NULL,
	"correct" boolean NOT NULL,
	"revealed" boolean DEFAULT false NOT NULL,
	"hint_used" boolean DEFAULT false NOT NULL,
	"difficulty" integer NOT NULL,
	"answer" text,
	"assessment_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "py_code_saves" (
	"student_id" uuid NOT NULL,
	"key" text NOT NULL,
	"code" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "py_code_saves_student_id_key_pk" PRIMARY KEY("student_id","key")
);
--> statement-breakpoint
CREATE TABLE "py_exercise_progress" (
	"student_id" uuid NOT NULL,
	"exercise_key" text NOT NULL,
	"hint_level" integer DEFAULT 0 NOT NULL,
	"solution_viewed_at" timestamp with time zone,
	"passed_at" timestamp with time zone,
	"passed_hint_level" integer,
	"passed_after_solution" boolean,
	"checks" integer DEFAULT 0 NOT NULL,
	"timer_started_at" timestamp with time zone,
	"best_ms" integer,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "py_exercise_progress_student_id_exercise_key_pk" PRIMARY KEY("student_id","exercise_key")
);
--> statement-breakpoint
CREATE TABLE "py_reviews" (
	"student_id" uuid NOT NULL,
	"lesson_id" text NOT NULL,
	"box" integer DEFAULT 1 NOT NULL,
	"due_at" timestamp with time zone NOT NULL,
	"last_result" boolean,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "py_reviews_student_id_lesson_id_pk" PRIMARY KEY("student_id","lesson_id")
);
--> statement-breakpoint
CREATE TABLE "py_settings" (
	"student_id" uuid PRIMARY KEY NOT NULL,
	"guided" boolean DEFAULT true NOT NULL,
	"unlocked" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "py_activity" ADD CONSTRAINT "py_activity_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "py_assessments" ADD CONSTRAINT "py_assessments_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "py_attempts" ADD CONSTRAINT "py_attempts_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "py_code_saves" ADD CONSTRAINT "py_code_saves_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "py_exercise_progress" ADD CONSTRAINT "py_exercise_progress_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "py_reviews" ADD CONSTRAINT "py_reviews_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "py_settings" ADD CONSTRAINT "py_settings_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "py_assessments_student_idx" ON "py_assessments" USING btree ("student_id","started_at");--> statement-breakpoint
CREATE INDEX "py_attempts_student_idx" ON "py_attempts" USING btree ("student_id","created_at");--> statement-breakpoint
CREATE INDEX "py_attempts_lesson_idx" ON "py_attempts" USING btree ("student_id","lesson_id");