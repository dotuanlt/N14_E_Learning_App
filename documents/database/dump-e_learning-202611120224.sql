--
-- PostgreSQL database dump
--

\restrict Q5IMortqkk4lsEd9pcMJmwMaRI6l15ANI4TJKOsbsrhnEUPdYLJnbvH2RdGEpg5

-- Dumped from database version 18.4
-- Dumped by pg_dump version 18.4

-- Started on 2026-11-12 02:24:41

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 4 (class 2615 OID 2200)
-- Name: public; Type: SCHEMA; Schema: -; Owner: pg_database_owner
--

CREATE SCHEMA public;


ALTER SCHEMA public OWNER TO pg_database_owner;

--
-- TOC entry 5406 (class 0 OID 0)
-- Dependencies: 4
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: pg_database_owner
--

COMMENT ON SCHEMA public IS 'standard public schema';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 251 (class 1259 OID 33920)
-- Name: banners; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.banners (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title character varying(255) NOT NULL,
    subtitle character varying(255),
    image_url text NOT NULL,
    action_label character varying(50),
    link_type character varying(20) DEFAULT 'NONE'::character varying NOT NULL,
    link_value text,
    "position" character varying(20) DEFAULT 'HOME'::character varying NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    start_at timestamp with time zone,
    end_at timestamp with time zone,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT banners_link_type_check CHECK (((link_type)::text = ANY ((ARRAY['NONE'::character varying, 'COURSE'::character varying, 'CATEGORY'::character varying, 'URL'::character varying])::text[]))),
    CONSTRAINT banners_position_check CHECK ((("position")::text = ANY ((ARRAY['HOME'::character varying, 'MY_COURSES'::character varying])::text[])))
);


ALTER TABLE public.banners OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 33406)
-- Name: cart_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cart_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    cart_id uuid NOT NULL,
    course_id uuid NOT NULL,
    price_at_added numeric(12,2) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.cart_items OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 33387)
-- Name: carts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.carts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.carts OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 33137)
-- Name: categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(100) NOT NULL,
    slug character varying(120) NOT NULL,
    icon_url text,
    color character varying(20),
    sort_order integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.categories OWNER TO postgres;

--
-- TOC entry 241 (class 1259 OID 33644)
-- Name: certificates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.certificates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    enrollment_id uuid NOT NULL,
    certificate_code character varying(50) NOT NULL,
    file_url text,
    issued_at timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.certificates OWNER TO postgres;

--
-- TOC entry 238 (class 1259 OID 33544)
-- Name: coupon_usages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.coupon_usages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    coupon_id uuid NOT NULL,
    user_id uuid NOT NULL,
    order_id uuid NOT NULL,
    discount_amount numeric(12,2) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.coupon_usages OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 33430)
-- Name: coupons; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.coupons (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code character varying(50) NOT NULL,
    description character varying(255),
    discount_type character varying(20) NOT NULL,
    discount_value numeric(12,2) NOT NULL,
    min_order_value numeric(12,2) DEFAULT 0 NOT NULL,
    max_discount_amount numeric(12,2),
    usage_limit integer,
    used_count integer DEFAULT 0 NOT NULL,
    start_at timestamp with time zone NOT NULL,
    end_at timestamp with time zone NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT chk_coupons_percent CHECK ((((discount_type)::text <> 'PERCENTAGE'::text) OR (discount_value <= (100)::numeric))),
    CONSTRAINT chk_coupons_time CHECK ((start_at < end_at)),
    CONSTRAINT chk_coupons_usage CHECK (((usage_limit IS NULL) OR (used_count <= usage_limit))),
    CONSTRAINT coupons_discount_type_check CHECK (((discount_type)::text = ANY ((ARRAY['PERCENTAGE'::character varying, 'FIXED_AMOUNT'::character varying])::text[]))),
    CONSTRAINT coupons_discount_value_check CHECK ((discount_value > (0)::numeric))
);


ALTER TABLE public.coupons OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 33255)
-- Name: course_benefits; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.course_benefits (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    course_id uuid NOT NULL,
    content character varying(500) NOT NULL,
    icon character varying(100),
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.course_benefits OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 33323)
-- Name: course_documents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.course_documents (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    course_id uuid NOT NULL,
    file_name character varying(255) NOT NULL,
    file_url text NOT NULL,
    file_size bigint,
    file_type character varying(50),
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.course_documents OWNER TO postgres;

--
-- TOC entry 249 (class 1259 OID 33874)
-- Name: course_likes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.course_likes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    course_id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.course_likes OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 33342)
-- Name: course_projects; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.course_projects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    course_id uuid NOT NULL,
    description text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.course_projects OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 33238)
-- Name: course_topics; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.course_topics (
    course_id uuid NOT NULL,
    topic_id uuid NOT NULL
);


ALTER TABLE public.course_topics OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 33181)
-- Name: courses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.courses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    instructor_id uuid NOT NULL,
    category_id uuid NOT NULL,
    title character varying(255) NOT NULL,
    slug character varying(280) NOT NULL,
    description text,
    thumbnail_url text,
    intro_video_url text,
    level character varying(20) DEFAULT 'ALL_LEVELS'::character varying NOT NULL,
    original_price numeric(12,2) DEFAULT 0 NOT NULL,
    sale_price numeric(12,2) DEFAULT 0 NOT NULL,
    total_duration_seconds integer DEFAULT 0 NOT NULL,
    total_lessons integer DEFAULT 0 NOT NULL,
    avg_rating numeric(3,2) DEFAULT 0 NOT NULL,
    review_count integer DEFAULT 0 NOT NULL,
    student_count integer DEFAULT 0 NOT NULL,
    like_count integer DEFAULT 0 NOT NULL,
    status character varying(20) DEFAULT 'DRAFT'::character varying NOT NULL,
    rejection_reason text,
    published_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT chk_courses_price CHECK ((sale_price <= original_price)),
    CONSTRAINT courses_level_check CHECK (((level)::text = ANY ((ARRAY['BEGINNER'::character varying, 'INTERMEDIATE'::character varying, 'ADVANCED'::character varying, 'ALL_LEVELS'::character varying])::text[]))),
    CONSTRAINT courses_original_price_check CHECK ((original_price >= (0)::numeric)),
    CONSTRAINT courses_sale_price_check CHECK ((sale_price >= (0)::numeric)),
    CONSTRAINT courses_status_check CHECK (((status)::text = ANY ((ARRAY['DRAFT'::character varying, 'PENDING_REVIEW'::character varying, 'PUBLISHED'::character varying, 'REJECTED'::character varying, 'UNPUBLISHED'::character varying])::text[])))
);


ALTER TABLE public.courses OWNER TO postgres;

--
-- TOC entry 239 (class 1259 OID 33574)
-- Name: enrollments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.enrollments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    course_id uuid NOT NULL,
    order_item_id uuid,
    progress_percentage numeric(5,2) DEFAULT 0 NOT NULL,
    status character varying(20) DEFAULT 'ONGOING'::character varying NOT NULL,
    enrolled_at timestamp with time zone DEFAULT now() NOT NULL,
    completed_at timestamp with time zone,
    last_accessed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT enrollments_progress_percentage_check CHECK (((progress_percentage >= (0)::numeric) AND (progress_percentage <= (100)::numeric))),
    CONSTRAINT enrollments_status_check CHECK (((status)::text = ANY ((ARRAY['ONGOING'::character varying, 'COMPLETED'::character varying, 'REFUNDED'::character varying])::text[])))
);


ALTER TABLE public.enrollments OWNER TO postgres;

--
-- TOC entry 248 (class 1259 OID 33850)
-- Name: follows; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.follows (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    follower_id uuid NOT NULL,
    instructor_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT chk_follows_self CHECK ((follower_id <> instructor_id))
);


ALTER TABLE public.follows OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 33084)
-- Name: instructor_profiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.instructor_profiles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    expertise character varying(255),
    introduction text,
    location character varying(100),
    timezone character varying(50),
    follower_count integer DEFAULT 0 NOT NULL,
    student_count integer DEFAULT 0 NOT NULL,
    course_count integer DEFAULT 0 NOT NULL,
    avg_rating numeric(3,2) DEFAULT 0 NOT NULL,
    review_count integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.instructor_profiles OWNER TO postgres;

--
-- TOC entry 240 (class 1259 OID 33615)
-- Name: lesson_progress; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lesson_progress (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    enrollment_id uuid NOT NULL,
    lesson_id uuid NOT NULL,
    last_position_seconds integer DEFAULT 0 NOT NULL,
    is_completed boolean DEFAULT false NOT NULL,
    completed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.lesson_progress OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 33296)
-- Name: lessons; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lessons (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    section_id uuid NOT NULL,
    title character varying(255) NOT NULL,
    video_url text,
    duration_seconds integer DEFAULT 0 NOT NULL,
    order_index integer NOT NULL,
    is_preview boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.lessons OWNER TO postgres;

--
-- TOC entry 250 (class 1259 OID 33897)
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    type character varying(30) NOT NULL,
    title character varying(255) NOT NULL,
    content text,
    reference_id uuid,
    is_read boolean DEFAULT false NOT NULL,
    read_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT notifications_type_check CHECK (((type)::text = ANY ((ARRAY['PAYMENT'::character varying, 'QA_REPLY'::character varying, 'QA_NEW_QUESTION'::character varying, 'CERTIFICATE'::character varying, 'NEW_COURSE'::character varying, 'PROMOTION'::character varying, 'COURSE_REVIEW'::character varying, 'PROJECT_FEEDBACK'::character varying, 'REFUND'::character varying, 'SYSTEM'::character varying])::text[])))
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- TOC entry 236 (class 1259 OID 33493)
-- Name: order_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_id uuid NOT NULL,
    course_id uuid NOT NULL,
    course_title character varying(255) NOT NULL,
    price numeric(12,2) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.order_items OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 33459)
-- Name: orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.orders (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_code character varying(30) NOT NULL,
    user_id uuid NOT NULL,
    coupon_id uuid,
    subtotal numeric(12,2) NOT NULL,
    discount_amount numeric(12,2) DEFAULT 0 NOT NULL,
    total_amount numeric(12,2) NOT NULL,
    status character varying(20) DEFAULT 'PENDING'::character varying NOT NULL,
    paid_at timestamp with time zone,
    expires_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT orders_status_check CHECK (((status)::text = ANY ((ARRAY['PENDING'::character varying, 'PAID'::character varying, 'FAILED'::character varying, 'CANCELLED'::character varying])::text[])))
);


ALTER TABLE public.orders OWNER TO postgres;

--
-- TOC entry 237 (class 1259 OID 33518)
-- Name: payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_id uuid NOT NULL,
    method character varying(20) NOT NULL,
    amount numeric(12,2) NOT NULL,
    transaction_code character varying(100),
    status character varying(20) DEFAULT 'PENDING'::character varying NOT NULL,
    raw_response text,
    paid_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT payments_method_check CHECK (((method)::text = ANY ((ARRAY['VNPAY'::character varying, 'MOMO'::character varying, 'MOCK'::character varying, 'FREE'::character varying])::text[]))),
    CONSTRAINT payments_status_check CHECK (((status)::text = ANY ((ARRAY['PENDING'::character varying, 'PAID'::character varying, 'FAILED'::character varying, 'REFUNDED'::character varying])::text[])))
);


ALTER TABLE public.payments OWNER TO postgres;

--
-- TOC entry 243 (class 1259 OID 33696)
-- Name: project_submissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.project_submissions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    course_id uuid NOT NULL,
    user_id uuid NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    file_url text NOT NULL,
    file_name character varying(255),
    file_type character varying(50),
    file_size bigint,
    thumbnail_url text,
    feedback text,
    feedback_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.project_submissions OWNER TO postgres;

--
-- TOC entry 245 (class 1259 OID 33760)
-- Name: qa_comments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.qa_comments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    post_id uuid NOT NULL,
    user_id uuid NOT NULL,
    content character varying(1000) NOT NULL,
    is_instructor_answer boolean DEFAULT false NOT NULL,
    deleted_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.qa_comments OWNER TO postgres;

--
-- TOC entry 246 (class 1259 OID 33789)
-- Name: qa_post_likes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.qa_post_likes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    post_id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.qa_post_likes OWNER TO postgres;

--
-- TOC entry 244 (class 1259 OID 33725)
-- Name: qa_posts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.qa_posts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    course_id uuid NOT NULL,
    user_id uuid NOT NULL,
    content character varying(1000) NOT NULL,
    like_count integer DEFAULT 0 NOT NULL,
    comment_count integer DEFAULT 0 NOT NULL,
    is_answered boolean DEFAULT false NOT NULL,
    is_hidden boolean DEFAULT false NOT NULL,
    deleted_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.qa_posts OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 33115)
-- Name: refresh_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.refresh_tokens (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    token_hash character varying(255) NOT NULL,
    fcm_token text,
    device_info character varying(255),
    expires_at timestamp with time zone NOT NULL,
    revoked_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.refresh_tokens OWNER TO postgres;

--
-- TOC entry 242 (class 1259 OID 33668)
-- Name: refund_requests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.refund_requests (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    enrollment_id uuid NOT NULL,
    payment_id uuid,
    amount numeric(12,2) NOT NULL,
    reason text,
    status character varying(20) DEFAULT 'PENDING'::character varying NOT NULL,
    reject_reason text,
    processed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT refund_requests_status_check CHECK (((status)::text = ANY ((ARRAY['PENDING'::character varying, 'COMPLETED'::character varying, 'REJECTED'::character varying])::text[])))
);


ALTER TABLE public.refund_requests OWNER TO postgres;

--
-- TOC entry 247 (class 1259 OID 33812)
-- Name: reviews; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reviews (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    enrollment_id uuid NOT NULL,
    course_id uuid NOT NULL,
    user_id uuid NOT NULL,
    rating integer NOT NULL,
    comment character varying(1000),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT reviews_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


ALTER TABLE public.reviews OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 33364)
-- Name: saved_courses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.saved_courses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    course_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.saved_courses OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 33275)
-- Name: sections; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sections (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    course_id uuid NOT NULL,
    title character varying(255) NOT NULL,
    order_index integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.sections OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 33160)
-- Name: topics; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.topics (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(100) NOT NULL,
    slug character varying(120) NOT NULL,
    search_count integer DEFAULT 0 NOT NULL,
    is_hot boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.topics OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 33058)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    full_name character varying(150) NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    avatar_url text,
    cover_url text,
    job_title character varying(150),
    bio text,
    role character varying(20) DEFAULT 'STUDENT'::character varying NOT NULL,
    status character varying(20) DEFAULT 'PENDING'::character varying NOT NULL,
    email_verified_at timestamp with time zone,
    last_login_at timestamp with time zone,
    failed_login_count integer DEFAULT 0 NOT NULL,
    login_locked_until timestamp with time zone,
    deleted_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['STUDENT'::character varying, 'INSTRUCTOR'::character varying, 'ADMIN'::character varying])::text[]))),
    CONSTRAINT users_status_check CHECK (((status)::text = ANY ((ARRAY['PENDING'::character varying, 'ACTIVE'::character varying, 'LOCKED'::character varying, 'DELETED'::character varying])::text[])))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 5400 (class 0 OID 33920)
-- Dependencies: 251
-- Data for Name: banners; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.banners (id, title, subtitle, image_url, action_label, link_type, link_value, "position", sort_order, start_at, end_at, is_active, created_at, updated_at) FROM stdin;
c7cbe64d-4661-46a6-a9d4-b29b789a238c	Tuần lễ Khởi nghiệp & Kỹ năng số 2026	Ưu đãi lên đến 50% tất cả khóa học	https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80	KHÁM PHÁ NGAY	CATEGORY	code	HOME	1	\N	\N	t	2026-11-11 11:33:35.289537+07	2026-11-11 11:33:35.289537+07
a5214dd0-1c3f-4a42-97d7-a26681b7ccd2	Học tập mọi lúc, mọi nơi trên thiết bị di động	Cấp chứng chỉ tốt nghiệp chuẩn quốc tế	https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=80	BẮT ĐẦU HỌC	NONE	\N	MY_COURSES	1	\N	\N	t	2026-11-11 11:33:35.289537+07	2026-11-11 11:33:35.289537+07
\.


--
-- TOC entry 5382 (class 0 OID 33406)
-- Dependencies: 233
-- Data for Name: cart_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cart_items (id, cart_id, course_id, price_at_added, created_at) FROM stdin;
\.


--
-- TOC entry 5381 (class 0 OID 33387)
-- Dependencies: 232
-- Data for Name: carts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.carts (id, user_id, created_at, updated_at) FROM stdin;
acc31633-04a5-47ee-9a4c-8e41a2d18e27	00000000-0000-0000-0000-000000000004	2026-11-11 11:33:35.281453+07	2026-11-11 11:33:35.281453+07
5044ff74-a424-4c1d-9895-b899960373cc	00000000-0000-0000-0000-000000000008	2026-11-11 11:33:35.281453+07	2026-11-11 11:33:35.281453+07
a1d4b95e-1d50-43d0-bd91-2e2be9e41aa7	00000000-0000-0000-0000-000000000009	2026-11-11 11:33:35.281453+07	2026-11-11 11:33:35.281453+07
\.


--
-- TOC entry 5371 (class 0 OID 33137)
-- Dependencies: 222
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categories (id, name, slug, icon_url, color, sort_order, is_active, created_at, updated_at) FROM stdin;
10000000-0000-0000-0000-000000000001	Business	business	\N	#4F46E5	1	t	2026-11-11 11:33:35.251414+07	2026-11-11 11:33:35.251414+07
10000000-0000-0000-0000-000000000002	Design	design	\N	#EC4899	2	t	2026-11-11 11:33:35.251414+07	2026-11-11 11:33:35.251414+07
10000000-0000-0000-0000-000000000003	Code	code	\N	#10B981	3	t	2026-11-11 11:33:35.251414+07	2026-11-11 11:33:35.251414+07
10000000-0000-0000-0000-000000000004	Writing	writing	\N	#F59E0B	4	t	2026-11-11 11:33:35.251414+07	2026-11-11 11:33:35.251414+07
10000000-0000-0000-0000-000000000005	Movie	movie	\N	#8B5CF6	5	t	2026-11-11 11:33:35.251414+07	2026-11-11 11:33:35.251414+07
10000000-0000-0000-0000-000000000006	Language	language	\N	#06B6D4	6	t	2026-11-11 11:33:35.251414+07	2026-11-11 11:33:35.251414+07
\.


--
-- TOC entry 5390 (class 0 OID 33644)
-- Dependencies: 241
-- Data for Name: certificates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.certificates (id, enrollment_id, certificate_code, file_url, issued_at, created_at) FROM stdin;
8ab4e3e6-0fdc-446e-93d2-2349648b2824	70000000-0000-0000-0000-000000000001	CERT-UX-2026-9041	https://example.com/certs/cert-ux-9041.pdf	2026-10-30 11:33:35.273969+07	2026-11-11 11:33:35.273969+07
6b819754-a85a-4f73-bc48-055221610006	70000000-0000-0000-0000-000000000004	CERT-MKT-2026-8812	https://example.com/certs/cert-mkt-8812.pdf	2026-11-06 11:33:35.273969+07	2026-11-11 11:33:35.273969+07
\.


--
-- TOC entry 5387 (class 0 OID 33544)
-- Dependencies: 238
-- Data for Name: coupon_usages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.coupon_usages (id, coupon_id, user_id, order_id, discount_amount, created_at) FROM stdin;
52ba889c-0f15-4acd-9ba5-05360c8a14bc	1b2ca521-ec37-4cb9-b630-17bd5e4138a3	00000000-0000-0000-0000-000000000004	6b6e6104-43c6-49e0-b1be-214d3231995d	300000.00	2026-11-12 00:36:40.021512+07
\.


--
-- TOC entry 5383 (class 0 OID 33430)
-- Dependencies: 234
-- Data for Name: coupons; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.coupons (id, code, description, discount_type, discount_value, min_order_value, max_discount_amount, usage_limit, used_count, start_at, end_at, is_active, created_at, updated_at) FROM stdin;
42ea95a6-cb2b-4d57-b91a-cfeea9a39814	FLASH50	Giảm 50% đặc biệt trong tuần lễ khai giảng	PERCENTAGE	50.00	500000.00	500000.00	200	0	2026-11-11 11:33:35.288237+07	2026-12-11 11:33:35.288237+07	t	2026-11-11 11:33:35.288237+07	2026-11-11 11:33:35.288237+07
639078ed-4f36-4a7a-8aa0-be497ee25fb9	GIAM50K	Giảm trực tiếp 50.000đ cho đơn hàng từ 300k	FIXED_AMOUNT	50000.00	300000.00	\N	\N	0	2026-11-11 11:33:35.288237+07	2027-02-09 11:33:35.288237+07	t	2026-11-11 11:33:35.288237+07	2026-11-11 11:33:35.288237+07
1b2ca521-ec37-4cb9-b630-17bd5e4138a3	WELCOME20	Giảm ngay 20% cho học viên mới đăng ký	PERCENTAGE	20.00	200000.00	300000.00	500	1	2026-11-11 11:33:35.288237+07	2027-05-10 11:33:35.288237+07	t	2026-11-11 11:33:35.288237+07	2026-11-11 11:33:35.288237+07
\.


--
-- TOC entry 5375 (class 0 OID 33255)
-- Dependencies: 226
-- Data for Name: course_benefits; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.course_benefits (id, course_id, content, icon, sort_order, created_at) FROM stdin;
d111f46b-065d-460a-943f-ec2086777af6	30000000-0000-0000-0000-000000000001	14 giờ video bài giảng chất lượng cao	\N	1	2026-11-11 11:33:35.259317+07
96db4c37-f644-453b-b5c8-834139df9ffa	30000000-0000-0000-0000-000000000001	Tài liệu thực hành Figma & UI Kit miễn phí	\N	2	2026-11-11 11:33:35.259317+07
4f4bea13-a39e-48d1-9433-2ad21c44decc	30000000-0000-0000-0000-000000000001	Cấp chứng chỉ tốt nghiệp từ chuyên gia	\N	3	2026-11-11 11:33:35.259317+07
2de7f663-4750-4dca-8a1b-b6f3cbfb57b2	30000000-0000-0000-0000-000000000004	Thiết kế trực tiếp 3 dự án App & Web thực tế	\N	1	2026-11-11 11:33:35.259317+07
a88a098e-e3d2-4baf-b77d-65815983d73d	30000000-0000-0000-0000-000000000004	Truy cập trọn đời kho tài nguyên Design System	\N	2	2026-11-11 11:33:35.259317+07
8b927c98-7a11-43c9-a006-33954181b4c4	30000000-0000-0000-0000-000000000002	Xây dựng 2 ứng dụng di động hoàn chỉnh đưa lên Store	\N	1	2026-11-11 11:33:35.259317+07
f45e9790-da63-4d05-9eb4-d088d012a47c	30000000-0000-0000-0000-000000000002	Source code GitHub cập nhật liên tục	\N	2	2026-11-11 11:33:35.259317+07
6516da53-c8af-4a02-8e81-70277255d586	30000000-0000-0000-0000-000000000002	Hỗ trợ giải đáp thắc mắc lập trình 24/7	\N	3	2026-11-11 11:33:35.259317+07
8be7db65-2fcf-44a8-91b4-52ab47470801	30000000-0000-0000-0000-000000000005	Kiến trúc chuẩn Microservices thực chiến doanh nghiệp	\N	1	2026-11-11 11:33:35.259317+07
93f5278d-851b-499d-97bd-7859b016aed5	30000000-0000-0000-0000-000000000005	Kỹ thuật tối ưu hóa Database hàng triệu bản ghi	\N	2	2026-11-11 11:33:35.259317+07
09bae8f1-9f95-47b6-bc27-f836cb39b5f2	30000000-0000-0000-0000-000000000003	Chiến lược chạy Ads thực tế ngân sách lớn	\N	1	2026-11-11 11:33:35.259317+07
d74ef90e-2930-4d8e-9604-68d1e32ff594	30000000-0000-0000-0000-000000000003	File mẫu kế hoạch Marketing và bảng theo dõi KPI	\N	2	2026-11-11 11:33:35.259317+07
cea32cad-2d17-4536-b3c3-d9ebe9293f74	30000000-0000-0000-0000-000000000007	Bộ Preset màu điện ảnh độc quyền trị giá 50$	\N	1	2026-11-11 11:33:35.259317+07
db029df1-b785-44cd-8b6f-0206ad1f7c17	30000000-0000-0000-0000-000000000007	Tài liệu âm thanh hiệu ứng SFX bản quyền	\N	2	2026-11-11 11:33:35.259317+07
e5c8cde5-84e1-4239-b783-87ce05e66767	30000000-0000-0000-0000-000000000008	Tự tin đàm phán và thuyết trình với đối tác quốc tế	\N	1	2026-11-11 11:33:35.259317+07
7361f987-2987-4344-b7ef-881e25fd497b	30000000-0000-0000-0000-000000000008	File mẫu 100+ email công việc chuyên nghiệp	\N	2	2026-11-11 11:33:35.259317+07
\.


--
-- TOC entry 5378 (class 0 OID 33323)
-- Dependencies: 229
-- Data for Name: course_documents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.course_documents (id, course_id, file_name, file_url, file_size, file_type, created_at) FROM stdin;
427e9886-0d0c-4500-8f9b-d3842cd69950	30000000-0000-0000-0000-000000000001	Giao_trinh_UX_Research_Co_ban.pdf	https://example.com/docs/ux-research-guide.pdf	2450000	pdf	2026-11-11 11:33:35.266712+07
f3c2641e-9c33-403c-b339-d2113c0969d5	30000000-0000-0000-0000-000000000001	Bieu_mau_Khao_sat_Nguoi_dung.docx	https://example.com/docs/user-survey-template.docx	850000	docx	2026-11-11 11:33:35.266712+07
61a0b9d8-00f1-4f6f-8f71-d66ad8e5d7a0	30000000-0000-0000-0000-000000000004	File_Figma_Design_System_Template.fig	https://example.com/docs/design-system.fig	8900000	fig	2026-11-11 11:33:35.266712+07
b2970408-2f02-47ad-838a-ff997740c778	30000000-0000-0000-0000-000000000004	Bo_Icon_Vectors_UI_Kit_2026.zip	https://example.com/docs/ui-kit-icons.zip	12500000	zip	2026-11-11 11:33:35.266712+07
07d79f4c-23e9-473a-8cc3-519fa07a7f25	30000000-0000-0000-0000-000000000002	Source_Code_React_Native_Elearning.zip	https://example.com/docs/rn-elearning-src.zip	15800000	zip	2026-11-11 11:33:35.266712+07
d659c077-91ec-47fd-b295-28e5bc69d7d2	30000000-0000-0000-0000-000000000002	Huong_dan_Setup_Expo_TypeScript.pdf	https://example.com/docs/setup-expo-ts.pdf	1900000	pdf	2026-11-11 11:33:35.266712+07
0305b43d-2f90-4ebc-be21-d6f9502eb792	30000000-0000-0000-0000-000000000005	Cheatsheet_Spring_Boot_Postgres.pdf	https://example.com/docs/spring-boot-cheatsheet.pdf	1850000	pdf	2026-11-11 11:33:35.266712+07
3252b0ab-a673-4e01-8bc2-c400ecf72867	30000000-0000-0000-0000-000000000005	Kien_truc_Microservices_Clean_Arch.pdf	https://example.com/docs/microservices-arch.pdf	3200000	pdf	2026-11-11 11:33:35.266712+07
021a6db9-be41-4c9f-b367-c59b1aa8e87b	30000000-0000-0000-0000-000000000003	Ke_hoach_Marketing_Plan_2026.xlsx	https://example.com/docs/marketing-plan-template.xlsx	3150000	xlsx	2026-11-11 11:33:35.266712+07
e132738e-375a-4361-b636-f33f11af1e59	30000000-0000-0000-0000-000000000003	Checklist_Chay_Ads_Khong_Bi_Khoa.pdf	https://example.com/docs/ads-checklist.pdf	1400000	pdf	2026-11-11 11:33:35.266712+07
800dea87-5940-442f-aa75-ef331fdbb9c5	30000000-0000-0000-0000-000000000007	Preset_Mau_Lumetri_Premiere_Pro.prfpset	https://example.com/docs/lumetri-cinematic.prfpset	4600000	prfpset	2026-11-11 11:33:35.266712+07
c57280d1-0e16-4491-8659-520faf82f160	30000000-0000-0000-0000-000000000007	Bo_Hieu_ung_Am_thanh_SFX_Ban_quyen.zip	https://example.com/docs/sfx-pack.zip	28500000	zip	2026-11-11 11:33:35.266712+07
c5800795-7766-4b11-9b04-14136df37496	30000000-0000-0000-0000-000000000006	So_tay_Viet_Lach_Sang_Tao_Content.pdf	https://example.com/docs/content-handbook.pdf	2100000	pdf	2026-11-11 11:33:35.266712+07
7764a08a-604b-4b81-b845-4bd699fbd590	30000000-0000-0000-0000-000000000008	Tong_hop_300_Cum_tu_Tieng_Anh_Cong_so.pdf	https://example.com/docs/business-english-300.pdf	5200000	pdf	2026-11-11 11:33:35.266712+07
b1c1b06d-367f-4729-be90-3a1d48f63d20	30000000-0000-0000-0000-000000000008	Mau_Email_Giao_dich_Quoc_te.docx	https://example.com/docs/email-templates.docx	1200000	docx	2026-11-11 11:33:35.266712+07
\.


--
-- TOC entry 5398 (class 0 OID 33874)
-- Dependencies: 249
-- Data for Name: course_likes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.course_likes (id, course_id, user_id, created_at) FROM stdin;
8cf1699a-565b-4cf3-bb8b-4a0c17806699	30000000-0000-0000-0000-000000000001	00000000-0000-0000-0000-000000000004	2026-11-11 11:33:35.286694+07
f7af9fed-8146-4e55-9031-0955af31d389	30000000-0000-0000-0000-000000000002	00000000-0000-0000-0000-000000000004	2026-11-11 11:33:35.286694+07
81c07b2b-a210-46ed-a9b0-d568ca0f4c1f	30000000-0000-0000-0000-000000000003	00000000-0000-0000-0000-000000000008	2026-11-11 11:33:35.286694+07
\.


--
-- TOC entry 5379 (class 0 OID 33342)
-- Dependencies: 230
-- Data for Name: course_projects; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.course_projects (id, course_id, description, created_at, updated_at) FROM stdin;
63340c41-6b88-406e-b6ef-7c5cc17c76f2	30000000-0000-0000-0000-000000000001	Thiết kế lại luồng Onboarding và trang chủ của một ứng dụng bạn yêu thích trên thiết bị di động.	2026-11-11 11:33:35.268378+07	2026-11-11 11:33:35.268378+07
3f5c38a7-3128-4d8e-ad47-d08980159338	30000000-0000-0000-0000-000000000004	Xây dựng hoàn chỉnh một ứng dụng Food Delivery với đầy đủ UI Kit và Component Variant trên Figma.	2026-11-11 11:33:35.268378+07	2026-11-11 11:33:35.268378+07
31f5e7a3-c94b-421e-8e8f-755d2d9c8602	30000000-0000-0000-0000-000000000002	Lập trình ứng dụng E-Commerce bằng React Native Expo, kết nối API giỏ hàng và danh mục sản phẩm.	2026-11-11 11:33:35.268378+07	2026-11-11 11:33:35.268378+07
c9f21cb1-8b21-4113-bddb-087949b1104e	30000000-0000-0000-0000-000000000005	Xây dựng hệ thống Backend Quản lý Khóa học hoàn chỉnh với Spring Boot 3, Spring Security JWT và PostgreSQL.	2026-11-11 11:33:35.268378+07	2026-11-11 11:33:35.268378+07
ae71ea01-5bb6-422a-8be3-9868c371a385	30000000-0000-0000-0000-000000000003	Lập kế hoạch Digital Marketing ra mắt sản phẩm mới với ngân sách 50 triệu và mục tiêu 500 khách hàng đầu tiên.	2026-11-11 11:33:35.268378+07	2026-11-11 11:33:35.268378+07
1047984f-9eb0-497d-86a5-18aebfc44900	30000000-0000-0000-0000-000000000007	Dựng một video giới thiệu sản phẩm 60 giây hoàn chỉnh với chuyển cảnh nhịp điệu và chỉnh màu Lumetri.	2026-11-11 11:33:35.268378+07	2026-11-11 11:33:35.268378+07
beb57e01-0411-4d92-b8af-acef7302d965	30000000-0000-0000-0000-000000000008	Quay video 3 phút thuyết trình bằng tiếng Anh về một giải pháp kinh doanh bạn đề xuất cho công ty.	2026-11-11 11:33:35.268378+07	2026-11-11 11:33:35.268378+07
\.


--
-- TOC entry 5374 (class 0 OID 33238)
-- Dependencies: 225
-- Data for Name: course_topics; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.course_topics (course_id, topic_id) FROM stdin;
30000000-0000-0000-0000-000000000001	20000000-0000-0000-0000-000000000003
30000000-0000-0000-0000-000000000001	20000000-0000-0000-0000-000000000004
30000000-0000-0000-0000-000000000004	20000000-0000-0000-0000-000000000004
30000000-0000-0000-0000-000000000004	20000000-0000-0000-0000-000000000003
30000000-0000-0000-0000-000000000002	20000000-0000-0000-0000-000000000002
30000000-0000-0000-0000-000000000005	20000000-0000-0000-0000-000000000001
30000000-0000-0000-0000-000000000005	20000000-0000-0000-0000-000000000006
30000000-0000-0000-0000-000000000012	20000000-0000-0000-0000-000000000010
30000000-0000-0000-0000-000000000003	20000000-0000-0000-0000-000000000005
30000000-0000-0000-0000-000000000007	20000000-0000-0000-0000-000000000007
30000000-0000-0000-0000-000000000006	20000000-0000-0000-0000-000000000008
30000000-0000-0000-0000-000000000008	20000000-0000-0000-0000-000000000009
\.


--
-- TOC entry 5373 (class 0 OID 33181)
-- Dependencies: 224
-- Data for Name: courses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.courses (id, instructor_id, category_id, title, slug, description, thumbnail_url, intro_video_url, level, original_price, sale_price, total_duration_seconds, total_lessons, avg_rating, review_count, student_count, like_count, status, rejection_reason, published_at, created_at, updated_at) FROM stdin;
30000000-0000-0000-0000-000000000013	00000000-0000-0000-0000-000000000005	10000000-0000-0000-0000-000000000001	Quản trị Dự án Phần mềm Chuẩn Agile & Scrum	quan-tri-du-an-agile-scrum	Làm chủ quy trình phát triển Agile: Sprint Planning, Daily Standup, Retrospective và sử dụng Jira chuyên nghiệp.	https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&auto=format&fit=crop&q=80	https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackSeeTheWorld.mp4	INTERMEDIATE	890000.00	490000.00	930	4	4.20	5	215	0	PUBLISHED	\N	2026-10-22 11:33:35.254254+07	2026-11-11 11:33:35.254254+07	2026-11-11 11:33:35.254254+07
30000000-0000-0000-0000-000000000012	00000000-0000-0000-0000-000000000003	10000000-0000-0000-0000-000000000003	Xây dựng Web App Hiện đại với Next.js & Node.js	fullstack-nextjs-nodejs	Trang bị kiến thức xây dựng web app chuẩn sản xuất: Server Components, SSR/SSG, Prisma ORM và triển khai đám mây.	https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80	https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4	INTERMEDIATE	1100000.00	699000.00	960	4	4.20	5	280	0	PUBLISHED	\N	2026-10-17 11:33:35.254254+07	2026-11-11 11:33:35.254254+07	2026-11-11 11:33:35.254254+07
30000000-0000-0000-0000-000000000016	00000000-0000-0000-0000-000000000011	10000000-0000-0000-0000-000000000006	Luyện Phát âm Chuẩn Mỹ & Thuyết trình Chuyên nghiệp	phat-am-chuan-my-thuyet-trinh	Sửa dứt điểm lỗi ngữ âm, nối âm, nhấn trọng âm và ngữ điệu giúp bài nói tự tin, chuẩn xác như người bản xứ.	https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80	https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4	INTERMEDIATE	890000.00	490000.00	960	4	4.20	5	290	0	PUBLISHED	\N	2026-10-30 11:33:35.254254+07	2026-11-11 11:33:35.254254+07	2026-11-11 11:33:35.254254+07
30000000-0000-0000-0000-000000000006	00000000-0000-0000-0000-000000000007	10000000-0000-0000-0000-000000000004	Kỹ năng Viết lách & Sáng tạo Nội dung Thu hút	ky-nang-viet-lach-sang-tao-noi-dung	Nghệ thuật kể chuyện (Storytelling), xây dựng văn phong cá nhân và sáng tạo bài viết chạm tới cảm xúc độc giả.	https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&auto=format&fit=crop&q=80	https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4	BEGINNER	650000.00	350000.00	960	4	4.20	5	380	0	PUBLISHED	\N	2026-10-14 11:33:35.254254+07	2026-11-11 11:33:35.254254+07	2026-11-11 11:33:35.254254+07
30000000-0000-0000-0000-000000000001	00000000-0000-0000-0000-000000000002	10000000-0000-0000-0000-000000000002	UX Foundation: Nhập môn Thiết kế Trải nghiệm Người dùng	ux-foundation	Nắm vững tư duy nghiên cứu người dùng, thiết kế wireframe, luồng tương tác và kiểm thử usability thực tế.	https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&auto=format&fit=crop&q=80	https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4	BEGINNER	799000.00	499000.00	1080	4	4.20	5	310	0	PUBLISHED	\N	2026-09-12 11:33:35.254254+07	2026-11-11 11:33:35.254254+07	2026-11-11 11:33:35.254254+07
30000000-0000-0000-0000-000000000014	00000000-0000-0000-0000-000000000006	10000000-0000-0000-0000-000000000005	Motion Graphics & Hoạt họa 2D với After Effects	motion-graphics-after-effects	Sáng tạo đồ họa động bắt mắt: Typography Animation, Logo Intro, Keyframing và kỹ thuật Tracking chân thực.	https://images.unsplash.com/photo-1536240478700-b869070f9279?w=800&auto=format&fit=crop&q=80	https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4	INTERMEDIATE	1250000.00	790000.00	1020	4	4.20	5	230	0	PUBLISHED	\N	2026-10-24 11:33:35.254254+07	2026-11-11 11:33:35.254254+07	2026-11-11 11:33:35.254254+07
30000000-0000-0000-0000-000000000002	00000000-0000-0000-0000-000000000003	10000000-0000-0000-0000-000000000003	React Native cơ bản đến nâng cao: Lập trình App iOS & Android	react-native-co-ban-den-nang-cao	Xây dựng ứng dụng di động đa nền tảng hoàn chỉnh với Expo SDK, TypeScript, React Navigation và tích hợp REST API.	https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&auto=format&fit=crop&q=80	https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4	INTERMEDIATE	1200000.00	899000.00	1140	4	4.20	5	520	0	PUBLISHED	\N	2026-09-27 11:33:35.254254+07	2026-11-11 11:33:35.254254+07	2026-11-11 11:33:35.254254+07
30000000-0000-0000-0000-000000000003	00000000-0000-0000-0000-000000000005	10000000-0000-0000-0000-000000000001	Digital Marketing & Growth Hacking 2026	digital-marketing-growth-hacking	Chiến lược tăng trưởng khách hàng đột phá: Facebook Ads, Google Ads, SEO Onpage/Offpage và phân tích chỉ số GA4.	https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80	https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4	BEGINNER	990000.00	590000.00	1050	4	4.20	5	360	0	PUBLISHED	\N	2026-10-07 11:33:35.254254+07	2026-11-11 11:33:35.254254+07	2026-11-11 11:33:35.254254+07
30000000-0000-0000-0000-000000000004	00000000-0000-0000-0000-000000000002	10000000-0000-0000-0000-000000000002	UI Design với Figma từ Zero đến Hero	ui-design-figma-zero-to-hero	Học trọn bộ kỹ năng thiết kế UI bằng Figma: Auto-layout, Variants, Design System và Prototype chuyển động mượt mà.	https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80	https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4	INTERMEDIATE	850000.00	450000.00	1020	4	4.20	5	420	0	PUBLISHED	\N	2026-09-22 11:33:35.254254+07	2026-11-11 11:33:35.254254+07	2026-11-11 11:33:35.254254+07
30000000-0000-0000-0000-000000000015	00000000-0000-0000-0000-000000000007	10000000-0000-0000-0000-000000000004	Copywriting Đỉnh cao: Nghệ thuật Thuyết phục Khách hàng	copywriting-dinh-cao	Học công thức viết tiêu đề gây tò mò, lời kêu gọi hành động CTA sắc sảo và viết trang đích (Landing Page) ra đơn.	https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&auto=format&fit=crop&q=80	https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4	INTERMEDIATE	800000.00	450000.00	990	4	4.20	5	210	0	PUBLISHED	\N	2026-10-27 11:33:35.254254+07	2026-11-11 11:33:35.254254+07	2026-11-11 11:33:35.254254+07
30000000-0000-0000-0000-000000000008	00000000-0000-0000-0000-000000000011	10000000-0000-0000-0000-000000000006	Tiếng Anh Giao tiếp Công sở Tự tin trong 30 Ngày	tieng-anh-giao-tiep-cong-so	Phản xạ tiếng Anh tự nhiên trong họp hành, viết email đàm phán, thuyết trình và thảo luận công việc cùng đồng nghiệp nước ngoài.	https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=80	https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4	BEGINNER	800000.00	420000.00	1020	4	4.20	5	450	0	PUBLISHED	\N	2026-10-20 11:33:35.254254+07	2026-11-11 11:33:35.254254+07	2026-11-11 11:33:35.254254+07
30000000-0000-0000-0000-000000000005	00000000-0000-0000-0000-000000000003	10000000-0000-0000-0000-000000000003	Lập trình Backend chuyên sâu với Spring Boot 3 & PostgreSQL	spring-boot-backend-chuyen-sau	Thiết kế RESTful API chuẩn quốc tế, bảo mật JWT, JPA Hibernate, Transaction Management và tối ưu hiệu năng cơ sở dữ liệu.	https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80	https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4	ADVANCED	1500000.00	990000.00	1110	4	4.20	5	341	0	PUBLISHED	\N	2026-10-02 11:33:35.254254+07	2026-11-11 11:33:35.254254+07	2026-11-11 11:33:35.254254+07
30000000-0000-0000-0000-000000000007	00000000-0000-0000-0000-000000000006	10000000-0000-0000-0000-000000000005	Dựng phim và Kỹ xảo Video với Premiere Pro	dung-phim-premiere-pro	Kỹ thuật dựng phim chuẩn điện ảnh, biên tập âm thanh, chỉnh màu Lumetri Color và xuất file chuẩn đa nền tảng.	https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&auto=format&fit=crop&q=80	https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4	BEGINNER	1100000.00	690000.00	1080	4	4.20	5	411	0	PUBLISHED	\N	2026-10-12 11:33:35.254254+07	2026-11-11 11:33:35.254254+07	2026-11-11 11:33:35.254254+07
\.


--
-- TOC entry 5388 (class 0 OID 33574)
-- Dependencies: 239
-- Data for Name: enrollments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.enrollments (id, user_id, course_id, order_item_id, progress_percentage, status, enrolled_at, completed_at, last_accessed_at, created_at, updated_at) FROM stdin;
70000000-0000-0000-0000-000000000001	00000000-0000-0000-0000-000000000004	30000000-0000-0000-0000-000000000001	\N	100.00	COMPLETED	2026-10-12 11:33:35.271505+07	2026-10-30 11:33:35.271505+07	2026-11-10 11:33:35.271505+07	2026-11-11 11:33:35.271505+07	2026-11-11 11:33:35.271505+07
70000000-0000-0000-0000-000000000002	00000000-0000-0000-0000-000000000004	30000000-0000-0000-0000-000000000002	\N	75.00	ONGOING	2026-10-22 11:33:35.271505+07	\N	2026-11-11 09:33:35.271505+07	2026-11-11 11:33:35.271505+07	2026-11-11 11:33:35.271505+07
70000000-0000-0000-0000-000000000003	00000000-0000-0000-0000-000000000004	30000000-0000-0000-0000-000000000004	\N	40.00	ONGOING	2026-11-01 11:33:35.271505+07	\N	2026-11-10 11:33:35.271505+07	2026-11-11 11:33:35.271505+07	2026-11-11 11:33:35.271505+07
70000000-0000-0000-0000-000000000004	00000000-0000-0000-0000-000000000008	30000000-0000-0000-0000-000000000003	\N	100.00	COMPLETED	2026-10-17 11:33:35.271505+07	2026-11-06 11:33:35.271505+07	2026-11-08 11:33:35.271505+07	2026-11-11 11:33:35.271505+07	2026-11-11 11:33:35.271505+07
70000000-0000-0000-0000-000000000005	00000000-0000-0000-0000-000000000009	30000000-0000-0000-0000-000000000005	\N	85.00	ONGOING	2026-10-27 11:33:35.271505+07	\N	2026-11-11 07:33:35.271505+07	2026-11-11 11:33:35.271505+07	2026-11-11 11:33:35.271505+07
70000000-0000-0000-0000-000000000006	00000000-0000-0000-0000-000000000010	30000000-0000-0000-0000-000000000007	\N	60.00	ONGOING	2026-10-30 11:33:35.271505+07	\N	2026-11-10 11:33:35.271505+07	2026-11-11 11:33:35.271505+07	2026-11-11 11:33:35.271505+07
71000000-0000-0000-0000-000000000001	00000000-0000-0000-0000-000000000021	30000000-0000-0000-0000-000000000001	\N	100.00	COMPLETED	2026-10-24 13:38:59.274143+07	2026-11-02 13:38:59.274143+07	2026-11-03 13:38:59.274143+07	2026-11-11 13:38:59.274143+07	2026-11-11 13:38:59.274143+07
71000000-0000-0000-0000-000000000002	00000000-0000-0000-0000-000000000022	30000000-0000-0000-0000-000000000001	\N	100.00	COMPLETED	2026-10-26 13:38:59.274143+07	2026-11-04 13:38:59.274143+07	2026-11-05 13:38:59.274143+07	2026-11-11 13:38:59.274143+07	2026-11-11 13:38:59.274143+07
71000000-0000-0000-0000-000000000003	00000000-0000-0000-0000-000000000024	30000000-0000-0000-0000-000000000001	\N	100.00	COMPLETED	2026-10-28 13:38:59.274143+07	2026-11-06 13:38:59.274143+07	2026-11-07 13:38:59.274143+07	2026-11-11 13:38:59.274143+07	2026-11-11 13:38:59.274143+07
71000000-0000-0000-0000-000000000004	00000000-0000-0000-0000-000000000025	30000000-0000-0000-0000-000000000001	\N	100.00	COMPLETED	2026-10-30 13:38:59.274143+07	2026-11-08 13:38:59.274143+07	2026-11-09 13:38:59.274143+07	2026-11-11 13:38:59.274143+07	2026-11-11 13:38:59.274143+07
71000000-0000-0000-0000-000000000005	00000000-0000-0000-0000-000000000009	30000000-0000-0000-0000-000000000002	\N	100.00	COMPLETED	2026-10-25 13:38:59.274143+07	2026-11-03 13:38:59.274143+07	2026-11-04 13:38:59.274143+07	2026-11-11 13:38:59.274143+07	2026-11-11 13:38:59.274143+07
71000000-0000-0000-0000-000000000006	00000000-0000-0000-0000-000000000021	30000000-0000-0000-0000-000000000002	\N	100.00	COMPLETED	2026-10-27 13:38:59.274143+07	2026-11-05 13:38:59.274143+07	2026-11-06 13:38:59.274143+07	2026-11-11 13:38:59.274143+07	2026-11-11 13:38:59.274143+07
71000000-0000-0000-0000-000000000007	00000000-0000-0000-0000-000000000025	30000000-0000-0000-0000-000000000002	\N	100.00	COMPLETED	2026-10-29 13:38:59.274143+07	2026-11-07 13:38:59.274143+07	2026-11-08 13:38:59.274143+07	2026-11-11 13:38:59.274143+07	2026-11-11 13:38:59.274143+07
71000000-0000-0000-0000-000000000008	00000000-0000-0000-0000-000000000023	30000000-0000-0000-0000-000000000002	\N	100.00	COMPLETED	2026-10-31 13:38:59.274143+07	2026-11-09 13:38:59.274143+07	2026-11-10 13:38:59.274143+07	2026-11-11 13:38:59.274143+07	2026-11-11 13:38:59.274143+07
71000000-0000-0000-0000-000000000009	00000000-0000-0000-0000-000000000023	30000000-0000-0000-0000-000000000003	\N	100.00	COMPLETED	2026-10-24 13:38:59.274143+07	2026-11-02 13:38:59.274143+07	2026-11-03 13:38:59.274143+07	2026-11-11 13:38:59.274143+07	2026-11-11 13:38:59.274143+07
71000000-0000-0000-0000-000000000010	00000000-0000-0000-0000-000000000024	30000000-0000-0000-0000-000000000003	\N	100.00	COMPLETED	2026-10-26 13:38:59.274143+07	2026-11-04 13:38:59.274143+07	2026-11-05 13:38:59.274143+07	2026-11-11 13:38:59.274143+07	2026-11-11 13:38:59.274143+07
71000000-0000-0000-0000-000000000011	00000000-0000-0000-0000-000000000026	30000000-0000-0000-0000-000000000003	\N	100.00	COMPLETED	2026-10-29 13:38:59.274143+07	2026-11-07 13:38:59.274143+07	2026-11-08 13:38:59.274143+07	2026-11-11 13:38:59.274143+07	2026-11-11 13:38:59.274143+07
71000000-0000-0000-0000-000000000012	00000000-0000-0000-0000-000000000010	30000000-0000-0000-0000-000000000003	\N	100.00	COMPLETED	2026-10-31 13:38:59.274143+07	2026-11-09 13:38:59.274143+07	2026-11-10 13:38:59.274143+07	2026-11-11 13:38:59.274143+07	2026-11-11 13:38:59.274143+07
71000000-0000-0000-0000-000000000013	00000000-0000-0000-0000-000000000022	30000000-0000-0000-0000-000000000004	\N	100.00	COMPLETED	2026-10-25 13:38:59.274143+07	2026-11-03 13:38:59.274143+07	2026-11-04 13:38:59.274143+07	2026-11-11 13:38:59.274143+07	2026-11-11 13:38:59.274143+07
71000000-0000-0000-0000-000000000014	00000000-0000-0000-0000-000000000008	30000000-0000-0000-0000-000000000004	\N	100.00	COMPLETED	2026-10-27 13:38:59.274143+07	2026-11-05 13:38:59.274143+07	2026-11-06 13:38:59.274143+07	2026-11-11 13:38:59.274143+07	2026-11-11 13:38:59.274143+07
71000000-0000-0000-0000-000000000015	00000000-0000-0000-0000-000000000024	30000000-0000-0000-0000-000000000004	\N	100.00	COMPLETED	2026-10-29 13:38:59.274143+07	2026-11-07 13:38:59.274143+07	2026-11-08 13:38:59.274143+07	2026-11-11 13:38:59.274143+07	2026-11-11 13:38:59.274143+07
71000000-0000-0000-0000-000000000016	00000000-0000-0000-0000-000000000026	30000000-0000-0000-0000-000000000004	\N	100.00	COMPLETED	2026-10-31 13:38:59.274143+07	2026-11-09 13:38:59.274143+07	2026-11-10 13:38:59.274143+07	2026-11-11 13:38:59.274143+07	2026-11-11 13:38:59.274143+07
71000000-0000-0000-0000-000000000017	00000000-0000-0000-0000-000000000021	30000000-0000-0000-0000-000000000005	\N	100.00	COMPLETED	2026-10-24 13:38:59.274143+07	2026-11-02 13:38:59.274143+07	2026-11-03 13:38:59.274143+07	2026-11-11 13:38:59.274143+07	2026-11-11 13:38:59.274143+07
71000000-0000-0000-0000-000000000018	00000000-0000-0000-0000-000000000025	30000000-0000-0000-0000-000000000005	\N	100.00	COMPLETED	2026-10-26 13:38:59.274143+07	2026-11-04 13:38:59.274143+07	2026-11-05 13:38:59.274143+07	2026-11-11 13:38:59.274143+07	2026-11-11 13:38:59.274143+07
71000000-0000-0000-0000-000000000019	00000000-0000-0000-0000-000000000008	30000000-0000-0000-0000-000000000005	\N	100.00	COMPLETED	2026-10-28 13:38:59.274143+07	2026-11-06 13:38:59.274143+07	2026-11-07 13:38:59.274143+07	2026-11-11 13:38:59.274143+07	2026-11-11 13:38:59.274143+07
71000000-0000-0000-0000-000000000020	00000000-0000-0000-0000-000000000023	30000000-0000-0000-0000-000000000005	\N	100.00	COMPLETED	2026-10-31 13:38:59.274143+07	2026-11-09 13:38:59.274143+07	2026-11-10 13:38:59.274143+07	2026-11-11 13:38:59.274143+07	2026-11-11 13:38:59.274143+07
71000000-0000-0000-0000-000000000021	00000000-0000-0000-0000-000000000010	30000000-0000-0000-0000-000000000006	\N	100.00	COMPLETED	2026-10-23 13:38:59.274143+07	2026-11-01 13:38:59.274143+07	2026-11-02 13:38:59.274143+07	2026-11-11 13:38:59.274143+07	2026-11-11 13:38:59.274143+07
71000000-0000-0000-0000-000000000022	00000000-0000-0000-0000-000000000026	30000000-0000-0000-0000-000000000006	\N	100.00	COMPLETED	2026-10-25 13:38:59.274143+07	2026-11-03 13:38:59.274143+07	2026-11-04 13:38:59.274143+07	2026-11-11 13:38:59.274143+07	2026-11-11 13:38:59.274143+07
71000000-0000-0000-0000-000000000023	00000000-0000-0000-0000-000000000008	30000000-0000-0000-0000-000000000006	\N	100.00	COMPLETED	2026-10-27 13:38:59.274143+07	2026-11-05 13:38:59.274143+07	2026-11-06 13:38:59.274143+07	2026-11-11 13:38:59.274143+07	2026-11-11 13:38:59.274143+07
71000000-0000-0000-0000-000000000024	00000000-0000-0000-0000-000000000022	30000000-0000-0000-0000-000000000006	\N	100.00	COMPLETED	2026-10-29 13:38:59.274143+07	2026-11-07 13:38:59.274143+07	2026-11-08 13:38:59.274143+07	2026-11-11 13:38:59.274143+07	2026-11-11 13:38:59.274143+07
71000000-0000-0000-0000-000000000025	00000000-0000-0000-0000-000000000024	30000000-0000-0000-0000-000000000006	\N	100.00	COMPLETED	2026-10-31 13:38:59.274143+07	2026-11-09 13:38:59.274143+07	2026-11-10 13:38:59.274143+07	2026-11-11 13:38:59.274143+07	2026-11-11 13:38:59.274143+07
71000000-0000-0000-0000-000000000026	00000000-0000-0000-0000-000000000022	30000000-0000-0000-0000-000000000007	\N	100.00	COMPLETED	2026-10-24 13:38:59.274143+07	2026-11-02 13:38:59.274143+07	2026-11-03 13:38:59.274143+07	2026-11-11 13:38:59.274143+07	2026-11-11 13:38:59.274143+07
71000000-0000-0000-0000-000000000027	00000000-0000-0000-0000-000000000026	30000000-0000-0000-0000-000000000007	\N	100.00	COMPLETED	2026-10-26 13:38:59.274143+07	2026-11-04 13:38:59.274143+07	2026-11-05 13:38:59.274143+07	2026-11-11 13:38:59.274143+07	2026-11-11 13:38:59.274143+07
71000000-0000-0000-0000-000000000028	00000000-0000-0000-0000-000000000023	30000000-0000-0000-0000-000000000007	\N	100.00	COMPLETED	2026-10-28 13:38:59.274143+07	2026-11-06 13:38:59.274143+07	2026-11-07 13:38:59.274143+07	2026-11-11 13:38:59.274143+07	2026-11-11 13:38:59.274143+07
71000000-0000-0000-0000-000000000029	00000000-0000-0000-0000-000000000025	30000000-0000-0000-0000-000000000007	\N	100.00	COMPLETED	2026-10-30 13:38:59.274143+07	2026-11-08 13:38:59.274143+07	2026-11-09 13:38:59.274143+07	2026-11-11 13:38:59.274143+07	2026-11-11 13:38:59.274143+07
71000000-0000-0000-0000-000000000030	00000000-0000-0000-0000-000000000024	30000000-0000-0000-0000-000000000008	\N	100.00	COMPLETED	2026-10-23 13:38:59.274143+07	2026-11-01 13:38:59.274143+07	2026-11-02 13:38:59.274143+07	2026-11-11 13:38:59.274143+07	2026-11-11 13:38:59.274143+07
71000000-0000-0000-0000-000000000031	00000000-0000-0000-0000-000000000008	30000000-0000-0000-0000-000000000008	\N	100.00	COMPLETED	2026-10-25 13:38:59.274143+07	2026-11-03 13:38:59.274143+07	2026-11-04 13:38:59.274143+07	2026-11-11 13:38:59.274143+07	2026-11-11 13:38:59.274143+07
71000000-0000-0000-0000-000000000032	00000000-0000-0000-0000-000000000021	30000000-0000-0000-0000-000000000008	\N	100.00	COMPLETED	2026-10-27 13:38:59.274143+07	2026-11-05 13:38:59.274143+07	2026-11-06 13:38:59.274143+07	2026-11-11 13:38:59.274143+07	2026-11-11 13:38:59.274143+07
71000000-0000-0000-0000-000000000033	00000000-0000-0000-0000-000000000026	30000000-0000-0000-0000-000000000008	\N	100.00	COMPLETED	2026-10-29 13:38:59.274143+07	2026-11-07 13:38:59.274143+07	2026-11-08 13:38:59.274143+07	2026-11-11 13:38:59.274143+07	2026-11-11 13:38:59.274143+07
71000000-0000-0000-0000-000000000034	00000000-0000-0000-0000-000000000009	30000000-0000-0000-0000-000000000008	\N	100.00	COMPLETED	2026-10-31 13:38:59.274143+07	2026-11-09 13:38:59.274143+07	2026-11-10 13:38:59.274143+07	2026-11-11 13:38:59.274143+07	2026-11-11 13:38:59.274143+07
71000000-0000-0000-0000-000000000035	00000000-0000-0000-0000-000000000025	30000000-0000-0000-0000-000000000012	\N	100.00	COMPLETED	2026-10-22 13:38:59.274143+07	2026-10-31 13:38:59.274143+07	2026-11-01 13:38:59.274143+07	2026-11-11 13:38:59.274143+07	2026-11-11 13:38:59.274143+07
71000000-0000-0000-0000-000000000036	00000000-0000-0000-0000-000000000021	30000000-0000-0000-0000-000000000012	\N	100.00	COMPLETED	2026-10-24 13:38:59.274143+07	2026-11-02 13:38:59.274143+07	2026-11-03 13:38:59.274143+07	2026-11-11 13:38:59.274143+07	2026-11-11 13:38:59.274143+07
71000000-0000-0000-0000-000000000037	00000000-0000-0000-0000-000000000009	30000000-0000-0000-0000-000000000012	\N	100.00	COMPLETED	2026-10-26 13:38:59.274143+07	2026-11-04 13:38:59.274143+07	2026-11-05 13:38:59.274143+07	2026-11-11 13:38:59.274143+07	2026-11-11 13:38:59.274143+07
71000000-0000-0000-0000-000000000038	00000000-0000-0000-0000-000000000023	30000000-0000-0000-0000-000000000012	\N	100.00	COMPLETED	2026-10-28 13:38:59.274143+07	2026-11-06 13:38:59.274143+07	2026-11-07 13:38:59.274143+07	2026-11-11 13:38:59.274143+07	2026-11-11 13:38:59.274143+07
71000000-0000-0000-0000-000000000039	00000000-0000-0000-0000-000000000022	30000000-0000-0000-0000-000000000012	\N	100.00	COMPLETED	2026-10-30 13:38:59.274143+07	2026-11-08 13:38:59.274143+07	2026-11-09 13:38:59.274143+07	2026-11-11 13:38:59.274143+07	2026-11-11 13:38:59.274143+07
71000000-0000-0000-0000-000000000040	00000000-0000-0000-0000-000000000024	30000000-0000-0000-0000-000000000013	\N	100.00	COMPLETED	2026-10-23 13:38:59.274143+07	2026-11-01 13:38:59.274143+07	2026-11-02 13:38:59.274143+07	2026-11-11 13:38:59.274143+07	2026-11-11 13:38:59.274143+07
71000000-0000-0000-0000-000000000041	00000000-0000-0000-0000-000000000023	30000000-0000-0000-0000-000000000013	\N	100.00	COMPLETED	2026-10-25 13:38:59.274143+07	2026-11-03 13:38:59.274143+07	2026-11-04 13:38:59.274143+07	2026-11-11 13:38:59.274143+07	2026-11-11 13:38:59.274143+07
71000000-0000-0000-0000-000000000042	00000000-0000-0000-0000-000000000008	30000000-0000-0000-0000-000000000013	\N	100.00	COMPLETED	2026-10-27 13:38:59.274143+07	2026-11-05 13:38:59.274143+07	2026-11-06 13:38:59.274143+07	2026-11-11 13:38:59.274143+07	2026-11-11 13:38:59.274143+07
71000000-0000-0000-0000-000000000043	00000000-0000-0000-0000-000000000025	30000000-0000-0000-0000-000000000013	\N	100.00	COMPLETED	2026-10-29 13:38:59.274143+07	2026-11-07 13:38:59.274143+07	2026-11-08 13:38:59.274143+07	2026-11-11 13:38:59.274143+07	2026-11-11 13:38:59.274143+07
71000000-0000-0000-0000-000000000044	00000000-0000-0000-0000-000000000021	30000000-0000-0000-0000-000000000013	\N	100.00	COMPLETED	2026-10-31 13:38:59.274143+07	2026-11-09 13:38:59.274143+07	2026-11-10 13:38:59.274143+07	2026-11-11 13:38:59.274143+07	2026-11-11 13:38:59.274143+07
71000000-0000-0000-0000-000000000045	00000000-0000-0000-0000-000000000022	30000000-0000-0000-0000-000000000014	\N	100.00	COMPLETED	2026-10-22 13:38:59.274143+07	2026-10-31 13:38:59.274143+07	2026-11-01 13:38:59.274143+07	2026-11-11 13:38:59.274143+07	2026-11-11 13:38:59.274143+07
71000000-0000-0000-0000-000000000046	00000000-0000-0000-0000-000000000010	30000000-0000-0000-0000-000000000014	\N	100.00	COMPLETED	2026-10-24 13:38:59.274143+07	2026-11-02 13:38:59.274143+07	2026-11-03 13:38:59.274143+07	2026-11-11 13:38:59.274143+07	2026-11-11 13:38:59.274143+07
71000000-0000-0000-0000-000000000047	00000000-0000-0000-0000-000000000026	30000000-0000-0000-0000-000000000014	\N	100.00	COMPLETED	2026-10-26 13:38:59.274143+07	2026-11-04 13:38:59.274143+07	2026-11-05 13:38:59.274143+07	2026-11-11 13:38:59.274143+07	2026-11-11 13:38:59.274143+07
71000000-0000-0000-0000-000000000048	00000000-0000-0000-0000-000000000025	30000000-0000-0000-0000-000000000014	\N	100.00	COMPLETED	2026-10-28 13:38:59.274143+07	2026-11-06 13:38:59.274143+07	2026-11-07 13:38:59.274143+07	2026-11-11 13:38:59.274143+07	2026-11-11 13:38:59.274143+07
71000000-0000-0000-0000-000000000049	00000000-0000-0000-0000-000000000023	30000000-0000-0000-0000-000000000014	\N	100.00	COMPLETED	2026-10-30 13:38:59.274143+07	2026-11-08 13:38:59.274143+07	2026-11-09 13:38:59.274143+07	2026-11-11 13:38:59.274143+07	2026-11-11 13:38:59.274143+07
71000000-0000-0000-0000-000000000050	00000000-0000-0000-0000-000000000026	30000000-0000-0000-0000-000000000015	\N	100.00	COMPLETED	2026-10-23 13:38:59.274143+07	2026-11-01 13:38:59.274143+07	2026-11-02 13:38:59.274143+07	2026-11-11 13:38:59.274143+07	2026-11-11 13:38:59.274143+07
71000000-0000-0000-0000-000000000051	00000000-0000-0000-0000-000000000023	30000000-0000-0000-0000-000000000015	\N	100.00	COMPLETED	2026-10-25 13:38:59.274143+07	2026-11-03 13:38:59.274143+07	2026-11-04 13:38:59.274143+07	2026-11-11 13:38:59.274143+07	2026-11-11 13:38:59.274143+07
71000000-0000-0000-0000-000000000052	00000000-0000-0000-0000-000000000010	30000000-0000-0000-0000-000000000015	\N	100.00	COMPLETED	2026-10-27 13:38:59.274143+07	2026-11-05 13:38:59.274143+07	2026-11-06 13:38:59.274143+07	2026-11-11 13:38:59.274143+07	2026-11-11 13:38:59.274143+07
71000000-0000-0000-0000-000000000053	00000000-0000-0000-0000-000000000024	30000000-0000-0000-0000-000000000015	\N	100.00	COMPLETED	2026-10-29 13:38:59.274143+07	2026-11-07 13:38:59.274143+07	2026-11-08 13:38:59.274143+07	2026-11-11 13:38:59.274143+07	2026-11-11 13:38:59.274143+07
71000000-0000-0000-0000-000000000054	00000000-0000-0000-0000-000000000008	30000000-0000-0000-0000-000000000015	\N	100.00	COMPLETED	2026-10-31 13:38:59.274143+07	2026-11-09 13:38:59.274143+07	2026-11-10 13:38:59.274143+07	2026-11-11 13:38:59.274143+07	2026-11-11 13:38:59.274143+07
71000000-0000-0000-0000-000000000055	00000000-0000-0000-0000-000000000024	30000000-0000-0000-0000-000000000016	\N	100.00	COMPLETED	2026-10-23 13:38:59.274143+07	2026-11-01 13:38:59.274143+07	2026-11-02 13:38:59.274143+07	2026-11-11 13:38:59.274143+07	2026-11-11 13:38:59.274143+07
71000000-0000-0000-0000-000000000056	00000000-0000-0000-0000-000000000026	30000000-0000-0000-0000-000000000016	\N	100.00	COMPLETED	2026-10-25 13:38:59.274143+07	2026-11-03 13:38:59.274143+07	2026-11-04 13:38:59.274143+07	2026-11-11 13:38:59.274143+07	2026-11-11 13:38:59.274143+07
71000000-0000-0000-0000-000000000057	00000000-0000-0000-0000-000000000021	30000000-0000-0000-0000-000000000016	\N	100.00	COMPLETED	2026-10-27 13:38:59.274143+07	2026-11-05 13:38:59.274143+07	2026-11-06 13:38:59.274143+07	2026-11-11 13:38:59.274143+07	2026-11-11 13:38:59.274143+07
71000000-0000-0000-0000-000000000058	00000000-0000-0000-0000-000000000009	30000000-0000-0000-0000-000000000016	\N	100.00	COMPLETED	2026-10-29 13:38:59.274143+07	2026-11-07 13:38:59.274143+07	2026-11-08 13:38:59.274143+07	2026-11-11 13:38:59.274143+07	2026-11-11 13:38:59.274143+07
71000000-0000-0000-0000-000000000059	00000000-0000-0000-0000-000000000010	30000000-0000-0000-0000-000000000016	\N	100.00	COMPLETED	2026-10-31 13:38:59.274143+07	2026-11-09 13:38:59.274143+07	2026-11-10 13:38:59.274143+07	2026-11-11 13:38:59.274143+07	2026-11-11 13:38:59.274143+07
877e8330-b78c-4a91-b763-2d84a720a440	00000000-0000-0000-0000-000000000004	30000000-0000-0000-0000-000000000005	fa753407-6fd1-40fe-aa59-9f95c42cf0ba	0.00	ONGOING	2026-11-12 00:36:39.963496+07	\N	\N	2026-11-12 00:36:39.965496+07	2026-11-12 00:36:39.965496+07
4e10d0d9-ec63-42dc-90a5-7074b9f4771d	00000000-0000-0000-0000-000000000004	30000000-0000-0000-0000-000000000007	9ca51bbe-8167-4c80-96c5-034853fd1e74	0.00	ONGOING	2026-11-12 00:36:39.994289+07	\N	\N	2026-11-12 00:36:39.994288+07	2026-11-12 00:36:39.994288+07
\.


--
-- TOC entry 5397 (class 0 OID 33850)
-- Dependencies: 248
-- Data for Name: follows; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.follows (id, follower_id, instructor_id, created_at) FROM stdin;
\.


--
-- TOC entry 5369 (class 0 OID 33084)
-- Dependencies: 220
-- Data for Name: instructor_profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.instructor_profiles (id, user_id, expertise, introduction, location, timezone, follower_count, student_count, course_count, avg_rating, review_count, created_at, updated_at) FROM stdin;
89798db4-f597-4805-9c5d-ccf08d45354b	00000000-0000-0000-0000-000000000002	UI/UX Design & Prototyping	Chuyên gia thiết kế UI/UX hàng đầu với triết lý thiết kế lấy người dùng làm trung tâm.	San Francisco, USA	America/Los_Angeles	0	7	2	4.20	0	2026-11-11 11:33:35.249612+07	2026-11-11 11:33:35.249612+07
38767775-f6ac-47a1-8ca3-4d85c7225a67	00000000-0000-0000-0000-000000000005	Growth Hacking, Ads & Agile Project	Chuyên gia tối ưu hoá chuyển đổi và quản trị dự án phần mềm theo chuẩn Agile Scrum.	Singapore	Asia/Singapore	0	7	2	4.20	0	2026-11-11 11:33:35.249612+07	2026-11-11 11:33:35.249612+07
6ba25877-a207-409c-acfc-c73c85afc27b	00000000-0000-0000-0000-000000000007	Copywriting & Content Strategy	Giảng dạy kỹ năng viết truyền cảm hứng và sáng tạo nội dung đa kênh bán hàng.	Hà Nội, VN	Asia/Ho_Chi_Minh	0	6	2	4.20	0	2026-11-11 11:33:35.249612+07	2026-11-11 11:33:35.249612+07
b5724841-d854-4e10-affa-f8bab6860602	00000000-0000-0000-0000-000000000011	Business English & Public Speaking	Huấn luyện viên tiếng Anh thương mại giúp học viên tự tin giao tiếp quốc tế.	California, USA	America/Los_Angeles	0	6	2	4.20	0	2026-11-11 11:33:35.249612+07	2026-11-11 11:33:35.249612+07
ef81bf5b-9a46-478d-a3b6-a9150ed08fa7	00000000-0000-0000-0000-000000000003	React Native, Flutter & Spring Boot	Hơn 9 năm xây dựng các ứng dụng phục vụ hàng triệu người dùng tại Đông Nam Á.	TP. Hồ Chí Minh, VN	Asia/Ho_Chi_Minh	0	8	3	4.20	0	2026-11-11 11:33:35.249612+07	2026-11-11 11:33:35.249612+07
0def3549-239a-49db-b9f4-c215b0d4ad8d	00000000-0000-0000-0000-000000000006	Video Editing, Color Grading & VFX	Đạo diễn video và nghệ sĩ dựng phim với hơn 8 năm làm việc cho các thương hiệu lớn.	London, UK	Europe/London	0	6	2	4.20	0	2026-11-11 11:33:35.249612+07	2026-11-11 11:33:35.249612+07
\.


--
-- TOC entry 5389 (class 0 OID 33615)
-- Dependencies: 240
-- Data for Name: lesson_progress; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lesson_progress (id, enrollment_id, lesson_id, last_position_seconds, is_completed, completed_at, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5377 (class 0 OID 33296)
-- Dependencies: 228
-- Data for Name: lessons; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lessons (id, section_id, title, video_url, duration_seconds, order_index, is_preview, created_at, updated_at) FROM stdin;
5d060f29-cfca-4834-ba32-d3871016681d	40000000-0000-0000-0000-000000000001	1. Giới thiệu tổng quan về UX và vai trò của UX Designer	https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4	240	1	t	2026-11-11 11:33:35.263587+07	2026-11-11 11:33:35.263587+07
d7238453-f964-4787-8626-3e5bb3c01da3	40000000-0000-0000-0000-000000000001	2. Phân biệt UI và UX: Điểm chạm và trải nghiệm cảm xúc	https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4	280	2	f	2026-11-11 11:33:35.263587+07	2026-11-11 11:33:35.263587+07
ea4b0f68-8fb7-442b-8f05-1e3bfae871cd	40000000-0000-0000-0000-000000000002	3. Phương pháp phỏng vấn người dùng và lập User Persona	https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4	270	1	f	2026-11-11 11:33:35.263587+07	2026-11-11 11:33:35.263587+07
66059b36-539e-4c18-aeb7-9fb44f07a1c9	40000000-0000-0000-0000-000000000002	4. Xây dựng sơ đồ hành trình người dùng (User Journey Map)	https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4	290	2	f	2026-11-11 11:33:35.263587+07	2026-11-11 11:33:35.263587+07
2cebb0f1-8f55-47b1-8fa3-eaa53280fd4e	40000000-0000-0000-0000-000000000003	1. Làm quen giao diện Figma, Canvas và phím tắt thông dụng	https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4	210	1	t	2026-11-11 11:33:35.263587+07	2026-11-11 11:33:35.263587+07
f2e7aa03-e1b6-4f0f-b2fc-c3a6486c7289	40000000-0000-0000-0000-000000000003	2. Tinh chỉnh bố cục linh hoạt với Auto Layout chuyên sâu	https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4	270	2	f	2026-11-11 11:33:35.263587+07	2026-11-11 11:33:35.263587+07
3e29b437-d7a6-43eb-a51b-12e1a47226cd	40000000-0000-0000-0000-000000000004	3. Quản lý Components, Properties và Variants hệ thống	https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4	255	1	f	2026-11-11 11:33:35.263587+07	2026-11-11 11:33:35.263587+07
4f75948b-c8b1-4c3e-bcc0-bc31d4225588	40000000-0000-0000-0000-000000000004	4. Tạo Prototype tương tác chuyển động Smart Animate	https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4	285	2	f	2026-11-11 11:33:35.263587+07	2026-11-11 11:33:35.263587+07
b09fa5bd-9809-40d2-a749-a7a8c5042a88	40000000-0000-0000-0000-000000000005	1. Cài đặt môi trường phát triển Expo & TypeScript chuẩn	https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4	240	1	t	2026-11-11 11:33:35.263587+07	2026-11-11 11:33:35.263587+07
b4f518e5-5cad-41a4-a798-49c109b3d1c2	40000000-0000-0000-0000-000000000005	2. Thiết kế giao diện di động với Flexbox và StyleSheet	https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4	300	2	f	2026-11-11 11:33:35.263587+07	2026-11-11 11:33:35.263587+07
0cbc1693-3738-459d-91ce-c0a07e092028	40000000-0000-0000-0000-000000000006	3. Quản lý State với useState, useEffect và Context API	https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4	290	1	f	2026-11-11 11:33:35.263587+07	2026-11-11 11:33:35.263587+07
8e0be326-d16a-43d9-affa-47cde04d3afb	40000000-0000-0000-0000-000000000006	4. Kết nối REST API Backend và xử lý dữ liệu bất đồng bộ	https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackSeeTheWorld.mp4	310	2	f	2026-11-11 11:33:35.263587+07	2026-11-11 11:33:35.263587+07
6189a6c0-46bd-443d-9dc0-ba06c9a21e70	40000000-0000-0000-0000-000000000007	1. Tổng quan cấu trúc dự án Spring Boot 3 & Maven	https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4	250	1	t	2026-11-11 11:33:35.263587+07	2026-11-11 11:33:35.263587+07
6b3eac70-ce98-45f2-ab71-061cafc01077	40000000-0000-0000-0000-000000000007	2. Thiết kế tầng Controller, Service và DTO Pattern chuẩn	https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4	280	2	f	2026-11-11 11:33:35.263587+07	2026-11-11 11:33:35.263587+07
1320c205-024b-4902-b836-443f77f56331	40000000-0000-0000-0000-000000000008	3. Thao tác Cơ sở dữ liệu với Spring Data JPA & PostgreSQL	https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4	300	1	f	2026-11-11 11:33:35.263587+07	2026-11-11 11:33:35.263587+07
44e354cd-a7b7-4ac8-bbf6-7fe0f7e57abb	40000000-0000-0000-0000-000000000008	4. Xác thực và phân quyền người dùng với Spring Security & JWT	https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4	280	2	f	2026-11-11 11:33:35.263587+07	2026-11-11 11:33:35.263587+07
78fbdb38-c6bf-407d-9177-530662d79f5c	40000000-0000-0000-0000-000000000009	1. Khởi tạo ứng dụng Next.js với App Router hiện đại	https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4	210	1	t	2026-11-11 11:33:35.263587+07	2026-11-11 11:33:35.263587+07
cff99a8e-6688-43c5-a89a-dc8bd6c4bd0d	40000000-0000-0000-0000-000000000009	2. Khai thác sức mạnh của React Server Components	https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4	250	2	f	2026-11-11 11:33:35.263587+07	2026-11-11 11:33:35.263587+07
90513495-b9a7-4d4d-9fc7-8c55b1dd1fe4	40000000-0000-0000-0000-000000000010	3. Tạo Route Handlers và kết nối Database qua Prisma	https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4	240	1	f	2026-11-11 11:33:35.263587+07	2026-11-11 11:33:35.263587+07
090749cc-072c-487e-be98-3480dda3f612	40000000-0000-0000-0000-000000000010	4. Tối ưu SEO, hiệu năng Web Vitals và Deploy Vercel	https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4	260	2	f	2026-11-11 11:33:35.263587+07	2026-11-11 11:33:35.263587+07
78b252f9-cfa1-4445-8850-604f80560657	40000000-0000-0000-0000-000000000011	1. Thiết lập tư duy Growth Hacking và phễu chuyển đổi AARRR	https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4	240	1	t	2026-11-11 11:33:35.263587+07	2026-11-11 11:33:35.263587+07
324ca0d5-43a8-4770-8589-24b5a298946b	40000000-0000-0000-0000-000000000011	2. Nghiên cứu từ khóa SEO và xây dựng kế hoạch nội dung	https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4	260	2	f	2026-11-11 11:33:35.263587+07	2026-11-11 11:33:35.263587+07
ae61f183-2fa7-4f04-a314-d22410a6606c	40000000-0000-0000-0000-000000000012	3. Thiết lập chiến dịch quảng cáo Facebook & Google hiệu quả	https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4	270	1	f	2026-11-11 11:33:35.263587+07	2026-11-11 11:33:35.263587+07
21df9fe5-6cda-47b7-b718-cb9e8074d458	40000000-0000-0000-0000-000000000012	4. Đo lường tỷ lệ chuyển đổi và đọc báo cáo Google Analytics 4	https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4	280	2	f	2026-11-11 11:33:35.263587+07	2026-11-11 11:33:35.263587+07
a87b4981-f727-42d1-98ec-d9c6ff218f7e	40000000-0000-0000-0000-000000000013	1. Giới thiệu các vai trò trong Scrum: PO, Scrum Master, Dev	https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackSeeTheWorld.mp4	210	1	t	2026-11-11 11:33:35.263587+07	2026-11-11 11:33:35.263587+07
31cb363c-aa65-45f0-98ff-937229dfbb00	40000000-0000-0000-0000-000000000013	2. Cách viết User Story chuẩn INVEST và ước lượng Story Points	https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4	230	2	f	2026-11-11 11:33:35.263587+07	2026-11-11 11:33:35.263587+07
f87199e9-9e7f-43e7-bf22-96b52b3eaf3c	40000000-0000-0000-0000-000000000014	3. Tổ chức các buổi họp Sprint Planning và Daily Scrum	https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4	240	1	f	2026-11-11 11:33:35.263587+07	2026-11-11 11:33:35.263587+07
d5a70b1e-9799-4192-a571-085fabc3d985	40000000-0000-0000-0000-000000000014	4. Đánh giá chất lượng với Sprint Review và Retrospective	https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4	250	2	f	2026-11-11 11:33:35.263587+07	2026-11-11 11:33:35.263587+07
fbe5fce7-c0aa-4ba7-a7fe-bd5d1ef77f0b	40000000-0000-0000-0000-000000000015	1. Khởi tạo Project, quản lý Timeline và các công cụ cắt ghép	https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4	240	1	t	2026-11-11 11:33:35.263587+07	2026-11-11 11:33:35.263587+07
af501bb6-3164-4f42-9358-159ae68349f3	40000000-0000-0000-0000-000000000015	2. Kỹ thuật chuyển cảnh (Transitions) mượt mà và cuốn hút	https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4	280	2	f	2026-11-11 11:33:35.263587+07	2026-11-11 11:33:35.263587+07
f3e636c3-bf2c-43e0-96d5-81391fbe4510	40000000-0000-0000-0000-000000000016	3. Chỉnh màu Lumetri Color và áp dụng LUT điện ảnh	https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4	270	1	f	2026-11-11 11:33:35.263587+07	2026-11-11 11:33:35.263587+07
84ce9d78-69c0-4b5b-8f0e-754cddd9f939	40000000-0000-0000-0000-000000000016	4. Xử lý âm thanh, lọc tạp âm và xuất video 4K chất lượng	https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4	290	2	f	2026-11-11 11:33:35.263587+07	2026-11-11 11:33:35.263587+07
4aa47629-d35a-463b-ad5e-91a60902a447	40000000-0000-0000-0000-000000000017	1. Nguyên lý diễn hoạt chuyển động với đồ thị Graph Editor	https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4	230	1	t	2026-11-11 11:33:35.263587+07	2026-11-11 11:33:35.263587+07
47b2ca7b-e5ea-4fbf-9425-bb3346272c80	40000000-0000-0000-0000-000000000017	2. Tạo chuyển động Kinetic Typography cho tiêu đề video	https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4	270	2	f	2026-11-11 11:33:35.263587+07	2026-11-11 11:33:35.263587+07
1a1a918c-cd44-421c-8860-1c5d3810b75e	40000000-0000-0000-0000-000000000018	3. Kỹ thuật Camera Tracking và tách nền phông xanh	https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4	250	1	f	2026-11-11 11:33:35.263587+07	2026-11-11 11:33:35.263587+07
8473e51c-27ae-4535-acdb-d985f5872541	40000000-0000-0000-0000-000000000018	4. Render video tối ưu dung lượng với Adobe Media Encoder	https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4	270	2	f	2026-11-11 11:33:35.263587+07	2026-11-11 11:33:35.263587+07
3edc80db-e2ab-44ea-9c60-6a67815d97b1	40000000-0000-0000-0000-000000000019	1. Xóa bỏ rào cản sợ viết và xây dựng thói quen viết mỗi ngày	https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4	210	1	t	2026-11-11 11:33:35.263587+07	2026-11-11 11:33:35.263587+07
36a97463-4d2b-4b1c-8e3c-461175356b66	40000000-0000-0000-0000-000000000019	2. Nghệ thuật sử dụng ngôn từ gợi hình và gợi cảm xúc	https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4	240	2	f	2026-11-11 11:33:35.263587+07	2026-11-11 11:33:35.263587+07
2bdad68b-d2c6-41f0-a0c0-244ca4e6b82d	40000000-0000-0000-0000-000000000020	3. Cấu trúc bài viết mạch lạc theo quy tắc tam giác ngược	https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4	250	1	f	2026-11-11 11:33:35.263587+07	2026-11-11 11:33:35.263587+07
103e39af-c876-4664-b84e-b142208c4b93	40000000-0000-0000-0000-000000000020	4. Chỉnh sửa và trau chuốt bài viết trước khi xuất bản	https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4	260	2	f	2026-11-11 11:33:35.263587+07	2026-11-11 11:33:35.263587+07
6bc59e2d-c446-4c43-971f-fe01948a9b50	40000000-0000-0000-0000-000000000021	1. Phân biệt người viết nội dung và chuyên gia Copywriter	https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4	210	1	t	2026-11-11 11:33:35.263587+07	2026-11-11 11:33:35.263587+07
b1fa5926-b385-44f8-996a-20227973f650	40000000-0000-0000-0000-000000000021	2. 10 công thức viết tiêu đề thôi miên người đọc lập tức	https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4	260	2	f	2026-11-11 11:33:35.263587+07	2026-11-11 11:33:35.263587+07
366560c9-0494-4ea0-ba43-61214466411f	40000000-0000-0000-0000-000000000022	3. Kỹ thuật đào sâu "nỗi đau" khách hàng bằng mô hình PAS	https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4	250	1	f	2026-11-11 11:33:35.263587+07	2026-11-11 11:33:35.263587+07
dd86bbe4-c55b-46dd-b216-47335c02a1a0	40000000-0000-0000-0000-000000000022	4. Tạo lời kêu gọi hành động Call-to-Action thúc đẩy chốt đơn	https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4	270	2	f	2026-11-11 11:33:35.263587+07	2026-11-11 11:33:35.263587+07
a1225b80-e8d7-43be-9b01-ac51a7765603	40000000-0000-0000-0000-000000000023	1. Giới thiệu bản thân và gây ấn tượng mạnh trong buổi phỏng vấn	https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4	240	1	t	2026-11-11 11:33:35.263587+07	2026-11-11 11:33:35.263587+07
edfbe8d4-73ae-415d-b3f7-6c444bd0c538	40000000-0000-0000-0000-000000000023	2. Các mẫu câu thông dụng khi tham gia cuộc họp quốc tế	https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4	260	2	f	2026-11-11 11:33:35.263587+07	2026-11-11 11:33:35.263587+07
818aea86-b07d-4252-a4e9-8cccd7825bed	40000000-0000-0000-0000-000000000024	3. Quy chuẩn viết Email chuyên nghiệp và phản hồi lịch sự	https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4	250	1	f	2026-11-11 11:33:35.263587+07	2026-11-11 11:33:35.263587+07
1900d9a4-57d2-4c2b-9161-8a31bc93af23	40000000-0000-0000-0000-000000000024	4. Kỹ năng đàm phán giải quyết bất đồng quan điểm công việc	https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackSeeTheWorld.mp4	270	2	f	2026-11-11 11:33:35.263587+07	2026-11-11 11:33:35.263587+07
52580c31-76a0-4e17-b45e-3477e4790f7f	40000000-0000-0000-0000-000000000025	1. Cách đặt khẩu hình miệng cho các nguyên âm cơ bản	https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4	220	1	t	2026-11-11 11:33:35.263587+07	2026-11-11 11:33:35.263587+07
c5d0b667-5de5-4bc7-8f48-5a70ba1c25bb	40000000-0000-0000-0000-000000000025	2. Phân biệt các cặp phụ âm dễ nhầm lẫn như /s/, /ʃ/, /θ/, /ð/	https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4	240	2	f	2026-11-11 11:33:35.263587+07	2026-11-11 11:33:35.263587+07
b3ae644c-cc41-41e6-b2e7-90e5feed9406	40000000-0000-0000-0000-000000000026	3. Bí quyết nối âm và nuốt âm tự nhiên như người bản xứ	https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4	250	1	f	2026-11-11 11:33:35.263587+07	2026-11-11 11:33:35.263587+07
a023d7c5-c28a-48ab-a971-97000dbffa26	40000000-0000-0000-0000-000000000026	4. Ngữ điệu lên xuống và nhịp điệu khi thuyết trình trước đám đông	https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4	250	2	f	2026-11-11 11:33:35.263587+07	2026-11-11 11:33:35.263587+07
\.


--
-- TOC entry 5399 (class 0 OID 33897)
-- Dependencies: 250
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (id, user_id, type, title, content, reference_id, is_read, read_at, created_at) FROM stdin;
8df4e91c-64d2-408e-938d-ae68a8fc30e5	00000000-0000-0000-0000-000000000004	SYSTEM	Chào mừng bạn đến với E-Learning! 🎉	Khám phá hơn 13 khóa học chất lượng cao từ các chuyên gia hàng đầu.	\N	f	\N	2026-11-09 11:33:35.290587+07
8bc27662-7f0c-40fa-bbb0-badd8d8a570b	00000000-0000-0000-0000-000000000004	PROMOTION	Mã ưu đãi WELCOME20 dành cho bạn	Sử dụng mã WELCOME20 để được giảm 20% cho đơn hàng khóa học đầu tiên.	\N	f	\N	2026-11-10 11:33:35.290587+07
77214880-ff38-417b-99e3-98104b49e70d	00000000-0000-0000-0000-000000000004	CERTIFICATE	Chúc mừng bạn đã hoàn thành khóa học UX Foundation	Chứng chỉ tốt nghiệp của bạn đã sẵn sàng trong mục Hồ sơ.	\N	t	\N	2026-10-30 11:33:35.290587+07
c044e4c6-9366-4e71-a2b2-cd30b79576d9	00000000-0000-0000-0000-000000000004	PAYMENT	Thanh toán thành công	Đơn hàng ORD2611111736394TMT đã thanh toán, bạn có thể bắt đầu học ngay.	6b6e6104-43c6-49e0-b1be-214d3231995d	f	\N	2026-11-12 00:36:40.029511+07
\.


--
-- TOC entry 5385 (class 0 OID 33493)
-- Dependencies: 236
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_items (id, order_id, course_id, course_title, price, created_at) FROM stdin;
fa753407-6fd1-40fe-aa59-9f95c42cf0ba	6b6e6104-43c6-49e0-b1be-214d3231995d	30000000-0000-0000-0000-000000000005	Lập trình Backend chuyên sâu với Spring Boot 3 & PostgreSQL	990000.00	2026-11-12 00:36:39.893428+07
9ca51bbe-8167-4c80-96c5-034853fd1e74	6b6e6104-43c6-49e0-b1be-214d3231995d	30000000-0000-0000-0000-000000000007	Dựng phim và Kỹ xảo Video với Premiere Pro	690000.00	2026-11-12 00:36:39.897429+07
\.


--
-- TOC entry 5384 (class 0 OID 33459)
-- Dependencies: 235
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.orders (id, order_code, user_id, coupon_id, subtotal, discount_amount, total_amount, status, paid_at, expires_at, created_at, updated_at) FROM stdin;
6b6e6104-43c6-49e0-b1be-214d3231995d	ORD2611111736394TMT	00000000-0000-0000-0000-000000000004	1b2ca521-ec37-4cb9-b630-17bd5e4138a3	1680000.00	300000.00	1380000.00	PAID	2026-11-12 00:36:39.960304+07	2026-11-12 00:51:39.880526+07	2026-11-12 00:36:39.88643+07	2026-11-12 00:36:39.973497+07
\.


--
-- TOC entry 5386 (class 0 OID 33518)
-- Dependencies: 237
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payments (id, order_id, method, amount, transaction_code, status, raw_response, paid_at, created_at, updated_at) FROM stdin;
f7e80d99-87ca-49e8-b768-018956162b8c	6b6e6104-43c6-49e0-b1be-214d3231995d	MOCK	1380000.00	MOCK-ORD2611111736394TMT	PAID	MOCK:SUCCESS	2026-11-12 00:36:39.960304+07	2026-11-12 00:36:39.904402+07	2026-11-12 00:36:39.975172+07
\.


--
-- TOC entry 5392 (class 0 OID 33696)
-- Dependencies: 243
-- Data for Name: project_submissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.project_submissions (id, course_id, user_id, title, description, file_url, file_name, file_type, file_size, thumbnail_url, feedback, feedback_at, created_at, updated_at) FROM stdin;
60000000-0000-0000-0000-000000000001	30000000-0000-0000-0000-000000000001	00000000-0000-0000-0000-000000000004	Thiết kế Onboarding App Du Lịch Wanderlust	Em đã áp dụng các bước nghiên cứu Persona và thiết kế giao diện đơn giản, tinh tế.	https://example.com/submissions/wanderlust-ux.fig	wanderlust-ux.fig	fig	4500000	https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&auto=format&fit=crop&q=80	Bài làm rất tốt, phân tích hành trình người dùng rõ ràng. Điểm cộng cho phần Wireframe chi tiết!	2026-11-01 11:33:35.269961+07	2026-11-11 11:33:35.269961+07	2026-11-11 11:33:35.269961+07
60000000-0000-0000-0000-000000000002	30000000-0000-0000-0000-000000000002	00000000-0000-0000-0000-000000000004	Ứng dụng Đọc Sách BookWorm với React Native	Ứng dụng hỗ trợ đọc sách ban đêm, lưu trang yêu thích và kết nối API sách.	https://example.com/submissions/bookworm-app.zip	bookworm-app.zip	zip	12300000	https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&auto=format&fit=crop&q=80	Code sạch, phân chia component rõ ràng và mượt mà trên cả iOS lẫn Android!	2026-11-06 11:33:35.269961+07	2026-11-11 11:33:35.269961+07	2026-11-11 11:33:35.269961+07
\.


--
-- TOC entry 5394 (class 0 OID 33760)
-- Dependencies: 245
-- Data for Name: qa_comments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.qa_comments (id, post_id, user_id, content, is_instructor_answer, deleted_at, created_at, updated_at) FROM stdin;
3e2c6880-dc39-4f30-b9f8-763e0fd74dcc	80000000-0000-0000-0000-000000000001	00000000-0000-0000-0000-000000000002	Chào em! Với nghiên cứu định tính (Usability Test), chỉ cần phỏng vấn sâu 5-8 người là có thể phát hiện được 85% lỗi trải nghiệm. Còn với khảo sát số liệu định lượng, em nên có từ 50-100 phản hồi nhé!	t	\N	2026-11-04 11:33:35.279723+07	2026-11-11 11:33:35.279723+07
8aecd0d9-135c-4446-ae34-eb90b80910d9	80000000-0000-0000-0000-000000000002	00000000-0000-0000-0000-000000000003	Chào Học! Em chỉ cần đảm bảo máy tính và điện thoại cùng kết nối vào một mạng Wi-Fi và trỏ API_URL vào IP LAN của máy tính (ví dụ http://192.168.1.x:8080/api/v1) là chạy ngon lành nhé!	t	\N	2026-11-09 11:33:35.279723+07	2026-11-11 11:33:35.279723+07
cdf45bd8-2afe-4109-b152-32332d5c4f45	80000000-0000-0000-0000-000000000003	00000000-0000-0000-0000-000000000003	Với hệ thống phân tán microservices hoặc bảo mật không để lộ số lượng đơn, UUID v7 hoặc v4 là lựa chọn chuẩn. Nếu cần tốc độ chèn cực nhanh theo thứ tự thời gian, em có thể dùng BIGSERIAL hoặc UUID v7 nhé!	t	\N	2026-11-10 11:33:35.279723+07	2026-11-11 11:33:35.279723+07
\.


--
-- TOC entry 5395 (class 0 OID 33789)
-- Dependencies: 246
-- Data for Name: qa_post_likes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.qa_post_likes (id, post_id, user_id, created_at) FROM stdin;
\.


--
-- TOC entry 5393 (class 0 OID 33725)
-- Dependencies: 244
-- Data for Name: qa_posts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.qa_posts (id, course_id, user_id, content, like_count, comment_count, is_answered, is_hidden, deleted_at, created_at, updated_at) FROM stdin;
80000000-0000-0000-0000-000000000001	30000000-0000-0000-0000-000000000001	00000000-0000-0000-0000-000000000004	Cô Sara ơi, khi làm khảo sát người dùng thì số lượng mẫu tối thiểu khoảng bao nhiêu là đạt độ tin cậy ạ?	8	1	t	f	\N	2026-11-03 11:33:35.27801+07	2026-11-11 11:33:35.27801+07
80000000-0000-0000-0000-000000000002	30000000-0000-0000-0000-000000000002	00000000-0000-0000-0000-000000000004	Khi build Expo lên điện thoại Android thật thì cần lưu ý những cấu hình nào về mạng LAN vậy cô?	12	1	t	f	\N	2026-11-08 11:33:35.27801+07	2026-11-11 11:33:35.27801+07
80000000-0000-0000-0000-000000000003	30000000-0000-0000-0000-000000000005	00000000-0000-0000-0000-000000000009	Nên dùng UUID hay Long ID làm khóa chính cho bảng đơn hàng để tối ưu tốc độ đánh index vậy cô?	6	1	t	f	\N	2026-11-09 11:33:35.27801+07	2026-11-11 11:33:35.27801+07
\.


--
-- TOC entry 5370 (class 0 OID 33115)
-- Dependencies: 221
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.refresh_tokens (id, user_id, token_hash, fcm_token, device_info, expires_at, revoked_at, created_at) FROM stdin;
b0ef8b85-8d02-45b8-ab91-5ae728a38255	00000000-0000-0000-0000-000000000004	7e4e8f0f13195d76ef6670cec3441c599a3edecd48eeefc26abacc9d2df4cb3e	\N	\N	2026-11-18 11:41:54.200672+07	\N	2026-11-11 11:41:54.202671+07
7190e6bb-7e0d-4af3-999f-900dff128be9	00000000-0000-0000-0000-000000000004	f27cf5b2896710020c6494815f8e178a6689acfd99062a8a6207857402171ba0	\N	\N	2026-11-18 12:32:31.185179+07	2026-11-11 12:35:49.610353+07	2026-11-11 12:32:31.203085+07
c4530a42-e033-40b0-90b2-407501df6932	00000000-0000-0000-0000-000000000004	574553f046376fa9ea36a4918014de0bd0f43368a4f1095ae1f7c1979b0302de	\N	\N	2026-11-18 12:56:44.789728+07	\N	2026-11-11 12:56:44.789728+07
afa29d86-57e2-467e-afb8-a50705b77d22	00000000-0000-0000-0000-000000000004	9bde962f8cb9c29f45101cee1e4bbe9f7e4767784469a7cfd490300ead8309ce	\N	\N	2026-11-18 13:11:16.502384+07	\N	2026-11-11 13:11:16.502383+07
6db19882-1498-430b-afd2-fa0e75fddf65	00000000-0000-0000-0000-000000000004	c0652c74972442216591b3d08206ec62346c7380118424031af56407a54d1ee7	\N	\N	2026-11-18 13:27:49.907678+07	\N	2026-11-11 13:27:49.908219+07
db0f2e86-d2ac-4d06-a42a-5410ef215632	00000000-0000-0000-0000-000000000004	f4887fd43649c1deab203ca7ca30beeb150aea91e46eb476f5f7ba96ff0c3687	\N	\N	2026-11-18 13:29:45.873768+07	\N	2026-11-11 13:29:45.873768+07
15425b22-6c00-48fe-a03b-1dda7c21c96d	00000000-0000-0000-0000-000000000004	cefca0b7a3cd6bf64b7f78931b2f83c99fabb7d54ad2689aefd74765f8a88cf7	\N	\N	2026-11-18 13:31:55.866916+07	\N	2026-11-11 13:31:55.866916+07
a3183207-d196-437f-aebd-d2974c9e8389	b4638a78-8596-4796-b09e-8487792e686d	7c23717b708aba1ed006125bcd11e70376850beb5f93217814883e8be22b3ffa	\N	\N	2026-11-19 00:11:21.759589+07	\N	2026-11-12 00:11:21.762587+07
ead39011-fed9-4918-92e3-30fc98bcc94c	b4638a78-8596-4796-b09e-8487792e686d	80cc4f90c02dbeff8af519c555b5f65e569bf7546dc01fa4a4a17f64ce17f7a3	\N	\N	2026-11-19 00:32:41.310035+07	2026-11-12 00:33:21.634556+07	2026-11-12 00:32:41.310035+07
2c2cbb70-c10f-4968-b598-5a2128b66e96	00000000-0000-0000-0000-000000000004	36823226282ff3961c486da18a3833e0d2c691c9dfa5aa32f4c7729b0d04df3d	\N	\N	2026-11-19 00:34:10.861443+07	\N	2026-11-12 00:34:10.862442+07
146c2195-e09e-46a4-b689-0f7e52a5f3b1	00000000-0000-0000-0000-000000000004	9de3ac3383957033fc26547adfcb5b07b3427d66ee9cf3a605ffef1604395208	\N	\N	2026-11-19 00:34:16.805307+07	\N	2026-11-12 00:34:16.808307+07
8bf21e39-5e61-47f2-b5c9-6ae933f84712	b4638a78-8596-4796-b09e-8487792e686d	20761b337b92605be64d11d0e53dbd89d93f455786be9b95f21c2e7e0c599c82	\N	\N	2026-11-19 00:49:07.764408+07	\N	2026-11-12 00:49:07.783411+07
4585ab29-fb38-422f-bd68-f75bfe49e907	00000000-0000-0000-0000-000000000004	a1056373712c03fe055a6213214729d6f11fa6e92b697eecf6b8680e6fcecf30	\N	\N	2026-11-19 00:57:03.865453+07	2026-11-12 00:57:19.340731+07	2026-11-12 00:57:03.866418+07
e19f236a-36ee-4aa6-8e7b-7d9099647a9f	b4638a78-8596-4796-b09e-8487792e686d	e86ad8738b6417e672de1688b17e903baa7d77cda165362f8d53c4bfbdb96ed3	\N	\N	2026-11-19 00:57:41.184914+07	2026-11-12 00:58:29.444295+07	2026-11-12 00:57:41.184913+07
\.


--
-- TOC entry 5391 (class 0 OID 33668)
-- Dependencies: 242
-- Data for Name: refund_requests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.refund_requests (id, enrollment_id, payment_id, amount, reason, status, reject_reason, processed_at, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5396 (class 0 OID 33812)
-- Dependencies: 247
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reviews (id, enrollment_id, course_id, user_id, rating, comment, created_at, updated_at) FROM stdin;
47eb79dd-3dd5-49e7-89fa-240a0be31f3d	70000000-0000-0000-0000-000000000001	30000000-0000-0000-0000-000000000001	00000000-0000-0000-0000-000000000004	5	Khóa học tuyệt vời! Cô Sara Weise giảng giải rất dễ hiểu, giúp em định hình được tư duy làm sản phẩm từ đầu.	2026-11-01 11:33:35.275606+07	2026-11-11 11:33:35.275606+07
4301bdbe-ad5a-4b3d-8b0d-f756b5acfe9a	70000000-0000-0000-0000-000000000004	30000000-0000-0000-0000-000000000003	00000000-0000-0000-0000-000000000008	5	Kiến thức Growth Hacking rất thực chiến, học xong áp dụng được ngay vào các chiến dịch quảng cáo công ty.	2026-11-07 11:33:35.275606+07	2026-11-11 11:33:35.275606+07
096d6fba-88fd-40e0-a958-474dcb31ce72	70000000-0000-0000-0000-000000000005	30000000-0000-0000-0000-000000000005	00000000-0000-0000-0000-000000000009	5	Thầy giảng rất sâu về Transaction và Clean Architecture, giải quyết được nhiều vướng mắc trong công việc của mình.	2026-11-09 11:33:35.275606+07	2026-11-11 11:33:35.275606+07
6ae238dc-45ba-4958-9a99-affc1887e34e	70000000-0000-0000-0000-000000000006	30000000-0000-0000-0000-000000000007	00000000-0000-0000-0000-000000000010	4	Bài tập thực hành rất hay, video hướng dẫn chi tiết từng thao tác cắt ghép và chỉnh màu điện ảnh.	2026-11-10 11:33:35.275606+07	2026-11-11 11:33:35.275606+07
406b90e4-3111-4892-82c1-32214cfddbbc	71000000-0000-0000-0000-000000000001	30000000-0000-0000-0000-000000000001	00000000-0000-0000-0000-000000000021	5	Kiến thức về User Persona và Journey Mapping được truyền tải rất trực quan và có ví dụ thực tế.	2026-11-03 13:38:59.283345+07	2026-11-11 13:38:59.283345+07
c0bc1003-2919-467f-9223-49406f615b47	71000000-0000-0000-0000-000000000002	30000000-0000-0000-0000-000000000001	00000000-0000-0000-0000-000000000022	4	Nội dung bài bản, logic. Nếu có thêm bài tập về thiết kế luồng thanh toán phức tạp thì sẽ còn tuyệt hơn.	2026-11-05 13:38:59.283345+07	2026-11-11 13:38:59.283345+07
6eae27b5-45f7-4202-86ea-a0331ad866c0	71000000-0000-0000-0000-000000000003	30000000-0000-0000-0000-000000000001	00000000-0000-0000-0000-000000000024	4	Rất phù hợp cho người mới bắt đầu chuyển ngành sang UX. Video bài giảng chất lượng tốt.	2026-11-07 13:38:59.283345+07	2026-11-11 13:38:59.283345+07
e6ca1a0c-bc9c-4595-9ba6-50e47cfe9851	71000000-0000-0000-0000-000000000004	30000000-0000-0000-0000-000000000001	00000000-0000-0000-0000-000000000025	3	Khóa học tốt nhưng tốc độ giảng ở chương đầu hơi chậm một chút đối với người đã có nền tảng.	2026-11-09 13:38:59.283345+07	2026-11-11 13:38:59.283345+07
47d87fdf-7b93-4262-8df7-9abecefad45f	70000000-0000-0000-0000-000000000002	30000000-0000-0000-0000-000000000002	00000000-0000-0000-0000-000000000004	5	Khóa học quá chất lượng! Thầy Jenny Barry hướng dẫn từ cấu hình Expo đến xử lý State, Navigation cực kỳ chi tiết.	2026-11-02 13:38:59.283345+07	2026-11-11 13:38:59.283345+07
aaeaeb07-5ebb-4a00-8d03-60cf5fdf3775	71000000-0000-0000-0000-000000000005	30000000-0000-0000-0000-000000000002	00000000-0000-0000-0000-000000000009	5	Nhờ khóa học mà mình đã tự tay hoàn thành app thương mại điện tử đầu tiên và deploy lên thiết bị thật.	2026-11-04 13:38:59.283345+07	2026-11-11 13:38:59.283345+07
d38e0ba9-487d-408e-a1ad-50c20ec0af45	71000000-0000-0000-0000-000000000006	30000000-0000-0000-0000-000000000002	00000000-0000-0000-0000-000000000021	4	Giải thích rõ ràng về Hooks và Reanimated. Khóa học cập nhật phiên bản mới rất kịp thời.	2026-11-06 13:38:59.283345+07	2026-11-11 13:38:59.283345+07
485d6c4a-1332-4ab1-a729-3cb554e7e94d	71000000-0000-0000-0000-000000000007	30000000-0000-0000-0000-000000000002	00000000-0000-0000-0000-000000000025	4	Rất hữu ích cho ai muốn làm app đa nền tảng. Code mẫu sạch và chuẩn quy ước đặt tên.	2026-11-08 13:38:59.283345+07	2026-11-11 13:38:59.283345+07
aca3438e-12c3-475a-9d0a-1d46530db64b	71000000-0000-0000-0000-000000000008	30000000-0000-0000-0000-000000000002	00000000-0000-0000-0000-000000000023	3	Kiến thức nâng cao về tích hợp Native Modules hơi nhanh, mong thầy bổ sung thêm tài liệu đọc thêm.	2026-11-10 13:38:59.283345+07	2026-11-11 13:38:59.283345+07
334feca7-8a31-42b9-a299-ad8286143a29	71000000-0000-0000-0000-000000000009	30000000-0000-0000-0000-000000000003	00000000-0000-0000-0000-000000000023	5	Phần phân tích phễu AARRR và tối ưu chi phí chuyển đổi (CAC) quá hay, mở mang rất nhiều góc nhìn mới.	2026-11-03 13:38:59.283345+07	2026-11-11 13:38:59.283345+07
610a83c3-cb2e-48d6-8ed8-98b2d26f7578	71000000-0000-0000-0000-000000000010	30000000-0000-0000-0000-000000000003	00000000-0000-0000-0000-000000000024	4	Chiến dịch mẫu chạy Ads rất thực tế. Thầy chia sẻ cả các case-study thất bại để tránh.	2026-11-05 13:38:59.283345+07	2026-11-11 13:38:59.283345+07
c8c6932f-9b3d-429a-8a60-bc7b1137c2bd	71000000-0000-0000-0000-000000000011	30000000-0000-0000-0000-000000000003	00000000-0000-0000-0000-000000000026	4	Giáo trình cập nhật xu hướng AI marketing mới nhất. Hỗ trợ Q&A rất nhiệt tình.	2026-11-08 13:38:59.283345+07	2026-11-11 13:38:59.283345+07
8c452d87-7f8c-4b93-9e95-8ecb8ca0330d	71000000-0000-0000-0000-000000000012	30000000-0000-0000-0000-000000000003	00000000-0000-0000-0000-000000000010	3	Phần Google Analytics 4 giải thích hơi dồn dập, người chưa từng dùng GA4 cần xem đi xem lại vài lần.	2026-11-10 13:38:59.283345+07	2026-11-11 13:38:59.283345+07
4a1f9a37-d578-486d-a8c1-97225747e85d	70000000-0000-0000-0000-000000000003	30000000-0000-0000-0000-000000000004	00000000-0000-0000-0000-000000000004	5	Khóa học hay nhất về Figma mà mình từng học! Auto Layout và Component Variants được giải thích cực dễ hiểu.	2026-11-01 13:38:59.283345+07	2026-11-11 13:38:59.283345+07
e94dbc31-0be9-4d64-8f9a-09495dd39847	71000000-0000-0000-0000-000000000013	30000000-0000-0000-0000-000000000004	00000000-0000-0000-0000-000000000022	5	Thiết kế Design System từ con số 0 rất chuyên nghiệp, giúp ích trực tiếp cho công việc tại công ty.	2026-11-04 13:38:59.283345+07	2026-11-11 13:38:59.283345+07
d0855c84-970b-44a2-9a11-1fdaf9128997	71000000-0000-0000-0000-000000000014	30000000-0000-0000-0000-000000000004	00000000-0000-0000-0000-000000000008	4	Giảng viên chia sẻ nhiều tips phím tắt và plugin cực hay giúp tiết kiệm 50% thời gian thiết kế.	2026-11-06 13:38:59.283345+07	2026-11-11 13:38:59.283345+07
63970096-fc9e-4934-8a95-6f22bf68cab9	71000000-0000-0000-0000-000000000015	30000000-0000-0000-0000-000000000004	00000000-0000-0000-0000-000000000024	4	Các bài thực hành bám sát sản phẩm mobile app thực tế. Rất đáng đồng tiền bát gạo.	2026-11-08 13:38:59.283345+07	2026-11-11 13:38:59.283345+07
3cd2a0df-2d17-405f-835d-32fc95af9d01	71000000-0000-0000-0000-000000000016	30000000-0000-0000-0000-000000000004	00000000-0000-0000-0000-000000000026	3	Phần prototype animation nâng cao hơi ngắn, mong có thêm buổi workshop chuyên sâu về Smart Animate.	2026-11-10 13:38:59.283345+07	2026-11-11 13:38:59.283345+07
dd4a85c2-a518-4770-9279-48c30bdee68b	71000000-0000-0000-0000-000000000017	30000000-0000-0000-0000-000000000005	00000000-0000-0000-0000-000000000021	5	Cực kỳ ấn tượng với phần thiết kế database tối ưu indexing và xử lý concurrency trong PostgreSQL.	2026-11-03 13:38:59.283345+07	2026-11-11 13:38:59.283345+07
a52c86ad-b851-4492-861f-b912236322f2	71000000-0000-0000-0000-000000000018	30000000-0000-0000-0000-000000000005	00000000-0000-0000-0000-000000000025	4	Hướng dẫn triển khai Docker và viết Unit Test bài bản với JUnit 5 và Mockito.	2026-11-05 13:38:59.283345+07	2026-11-11 13:38:59.283345+07
e08f8e14-1af1-4c53-8bc6-4ada3d0eb73e	71000000-0000-0000-0000-000000000019	30000000-0000-0000-0000-000000000005	00000000-0000-0000-0000-000000000008	4	Kiến thức bảo mật Spring Security và JWT chuẩn chỉ, giải thích bản chất không chỉ copy code.	2026-11-07 13:38:59.283345+07	2026-11-11 13:38:59.283345+07
d6661eec-a003-4c2e-8289-f53c58c5110d	71000000-0000-0000-0000-000000000020	30000000-0000-0000-0000-000000000005	00000000-0000-0000-0000-000000000023	3	Nội dung hơi nặng với người mới, đòi hỏi phải có nền tảng Java Core và SQL khá vững trước khi học.	2026-11-10 13:38:59.283345+07	2026-11-11 13:38:59.283345+07
9d5d24c7-a99c-43eb-b82b-55feeed915cf	71000000-0000-0000-0000-000000000021	30000000-0000-0000-0000-000000000006	00000000-0000-0000-0000-000000000010	5	Cách cô Alex hướng dẫn đặt tiêu đề giật tít và xây dựng mạch bài viết đọc là bị cuốn ngay!	2026-11-02 13:38:59.283345+07	2026-11-11 13:38:59.283345+07
62e9c720-4ab6-41cd-9e3c-dfb456afceac	71000000-0000-0000-0000-000000000022	30000000-0000-0000-0000-000000000006	00000000-0000-0000-0000-000000000026	5	Khóa học giúp mình vượt qua nỗi sợ viết và xây dựng được kênh blog cá nhân có hơn 10k độc giả.	2026-11-04 13:38:59.283345+07	2026-11-11 13:38:59.283345+07
7675554e-bd94-4277-a2a5-7bc64a4511af	71000000-0000-0000-0000-000000000023	30000000-0000-0000-0000-000000000006	00000000-0000-0000-0000-000000000008	4	Nhiều công thức viết bài kinh điển như PAS, AIDA được hệ thống hóa rất bài bản.	2026-11-06 13:38:59.283345+07	2026-11-11 13:38:59.283345+07
ca96d53a-0e61-436b-a1dd-2fc4b517fa2a	71000000-0000-0000-0000-000000000024	30000000-0000-0000-0000-000000000006	00000000-0000-0000-0000-000000000022	4	Bài tập rèn luyện viết hàng ngày rất thú vị, có nhận xét chi tiết từ giảng viên.	2026-11-08 13:38:59.283345+07	2026-11-11 13:38:59.283345+07
f33fdb06-2d0f-499d-aba6-725a61462b56	71000000-0000-0000-0000-000000000025	30000000-0000-0000-0000-000000000006	00000000-0000-0000-0000-000000000024	3	Phần viết kịch bản video TikTok hơi ngắn, mong tác giả đào sâu thêm về storytelling cho video.	2026-11-10 13:38:59.283345+07	2026-11-11 13:38:59.283345+07
b88dedac-6af9-47c8-87c4-56285b5b75f8	71000000-0000-0000-0000-000000000026	30000000-0000-0000-0000-000000000007	00000000-0000-0000-0000-000000000022	5	Khóa học đỉnh cao! Từ cắt ghép nhịp điệu âm thanh đến chỉnh màu Lumetri Color đều quá xịn.	2026-11-03 13:38:59.283345+07	2026-11-11 13:38:59.283345+07
cc944600-8198-43d5-9b13-4ab634b82d35	71000000-0000-0000-0000-000000000027	30000000-0000-0000-0000-000000000007	00000000-0000-0000-0000-000000000026	5	Kho tài nguyên hiệu ứng chuyển cảnh và âm thanh đi kèm khóa học quá phong phú, dùng được luôn.	2026-11-05 13:38:59.283345+07	2026-11-11 13:38:59.283345+07
6e846841-f8a6-4162-a9e5-060f7b364588	71000000-0000-0000-0000-000000000028	30000000-0000-0000-0000-000000000007	00000000-0000-0000-0000-000000000023	4	Giúp mình dựng được video giới thiệu sản phẩm cho công ty và nhận được rất nhiều lời khen.	2026-11-07 13:38:59.283345+07	2026-11-11 13:38:59.283345+07
2cfdc54e-a087-4d7d-ad98-684afbe30c60	71000000-0000-0000-0000-000000000029	30000000-0000-0000-0000-000000000007	00000000-0000-0000-0000-000000000025	3	Khâu tối ưu render và proxy trên máy cấu hình yếu nên được giải thích kỹ hơn một chút.	2026-11-09 13:38:59.283345+07	2026-11-11 13:38:59.283345+07
6a898ed8-0d1c-4c1b-b2ca-69d292f3cd7d	71000000-0000-0000-0000-000000000030	30000000-0000-0000-0000-000000000008	00000000-0000-0000-0000-000000000024	5	Phương pháp Shadowing giúp mình cải thiện ngữ điệu rõ rệt chỉ sau 2 tuần học!	2026-11-02 13:38:59.283345+07	2026-11-11 13:38:59.283345+07
93f6afb3-b04b-46c7-94a0-b3e540c6ab8e	71000000-0000-0000-0000-000000000031	30000000-0000-0000-0000-000000000008	00000000-0000-0000-0000-000000000008	5	Các mẫu câu đàm phán, viết email và thuyết trình trong cuộc họp cực kỳ sát với môi trường làm việc quốc tế.	2026-11-04 13:38:59.283345+07	2026-11-11 13:38:59.283345+07
962a5f9a-1704-4fe9-8f69-a294fe240b44	71000000-0000-0000-0000-000000000032	30000000-0000-0000-0000-000000000008	00000000-0000-0000-0000-000000000021	4	Cô Emily Watson phát âm rất chuẩn và truyền cảm hứng. Học không hề bị áp lực.	2026-11-06 13:38:59.283345+07	2026-11-11 13:38:59.283345+07
ed462f98-b04a-47f6-af54-22745fa2c231	71000000-0000-0000-0000-000000000033	30000000-0000-0000-0000-000000000008	00000000-0000-0000-0000-000000000026	4	Bài tập phản xạ tình huống hàng ngày rất hiệu quả, tự tin hơn hẳn khi họp với sếp Tây.	2026-11-08 13:38:59.283345+07	2026-11-11 13:38:59.283345+07
0ecd9282-3866-4bc0-9a39-5ad1b5349ff2	71000000-0000-0000-0000-000000000034	30000000-0000-0000-0000-000000000008	00000000-0000-0000-0000-000000000009	3	Mong có thêm nhóm thực hành nói 1-1 giữa các học viên để tăng cơ hội cọ xát thực tế.	2026-11-10 13:38:59.283345+07	2026-11-11 13:38:59.283345+07
02a00f00-a562-4e6d-aedf-7d33ea62a9a9	71000000-0000-0000-0000-000000000035	30000000-0000-0000-0000-000000000012	00000000-0000-0000-0000-000000000025	5	Khóa học Fullstack toàn diện nhất mình từng học! App Router, Server Actions và SSR được giải thích ngọn ngành.	2026-11-01 13:38:59.283345+07	2026-11-11 13:38:59.283345+07
99948ac7-1c5b-474a-a024-1355534a825e	71000000-0000-0000-0000-000000000036	30000000-0000-0000-0000-000000000012	00000000-0000-0000-0000-000000000021	5	Dự án cuối khóa xây dựng nền tảng E-commerce hoàn chỉnh từ giỏ hàng đến cổng thanh toán.	2026-11-03 13:38:59.283345+07	2026-11-11 13:38:59.283345+07
02dcb87d-6130-4511-b504-bec2a0d19f9e	71000000-0000-0000-0000-000000000037	30000000-0000-0000-0000-000000000012	00000000-0000-0000-0000-000000000009	4	Codebase mẫu rất chuẩn mực, cấu trúc thư mục module hóa sạch sẽ dễ maintain.	2026-11-05 13:38:59.283345+07	2026-11-11 13:38:59.283345+07
bf353a76-5055-491e-9181-21524622da54	71000000-0000-0000-0000-000000000038	30000000-0000-0000-0000-000000000012	00000000-0000-0000-0000-000000000023	4	Giảng viên giải thích kỹ về tối ưu SEO và Core Web Vitals trên Next.js.	2026-11-07 13:38:59.283345+07	2026-11-11 13:38:59.283345+07
45db89b1-8c89-47df-854e-d6a829c6b1fc	71000000-0000-0000-0000-000000000039	30000000-0000-0000-0000-000000000012	00000000-0000-0000-0000-000000000022	3	Phần phân quyền Role-Based Access Control cần có thêm sơ đồ minh họa luồng xử lý token.	2026-11-09 13:38:59.283345+07	2026-11-11 13:38:59.283345+07
cafa4123-cb1c-448b-b882-ac98f46cc046	71000000-0000-0000-0000-000000000040	30000000-0000-0000-0000-000000000013	00000000-0000-0000-0000-000000000024	5	Khóa học giải phóng tư duy làm việc của cả team mình! Phân định vai trò PO, Scrum Master rất rõ.	2026-11-02 13:38:59.283345+07	2026-11-11 13:38:59.283345+07
dd25b995-252d-4bd3-9986-3eae7622d30a	71000000-0000-0000-0000-000000000041	30000000-0000-0000-0000-000000000013	00000000-0000-0000-0000-000000000023	5	Các ví dụ về ước lượng Story Point và lập kế hoạch Sprint bám sát quy trình thực tế tại các công ty IT.	2026-11-04 13:38:59.283345+07	2026-11-11 13:38:59.283345+07
48830f36-9197-47c7-bb91-281950f33529	71000000-0000-0000-0000-000000000042	30000000-0000-0000-0000-000000000013	00000000-0000-0000-0000-000000000008	4	Biểu đồ Burndown và cách vận hành Daily Standup hiệu quả giúp dự án của mình không còn bị trễ deadline.	2026-11-06 13:38:59.283345+07	2026-11-11 13:38:59.283345+07
f80815c0-6a89-4900-8db7-69af79fc4283	71000000-0000-0000-0000-000000000043	30000000-0000-0000-0000-000000000013	00000000-0000-0000-0000-000000000025	4	Tài liệu mẫu về Product Backlog và User Story rất hữu dụng, tải về áp dụng được ngay.	2026-11-08 13:38:59.283345+07	2026-11-11 13:38:59.283345+07
905244d5-f2d3-43c6-a0c3-13864e7d0f15	71000000-0000-0000-0000-000000000044	30000000-0000-0000-0000-000000000013	00000000-0000-0000-0000-000000000021	3	Nên bổ sung thêm phần so sánh giữa Scrum và Kanban cho các dự án bảo trì/support.	2026-11-10 13:38:59.283345+07	2026-11-11 13:38:59.283345+07
bd992059-5b61-47fa-ac3f-6229bb336e34	71000000-0000-0000-0000-000000000045	30000000-0000-0000-0000-000000000014	00000000-0000-0000-0000-000000000022	5	Thầy David Miller hướng dẫn Curve Editor và Graph Editor đỉnh thực sự! Chuyển động siêu mượt mà.	2026-11-01 13:38:59.283345+07	2026-11-11 13:38:59.283345+07
75bd106a-4c7b-4d1d-b8a6-16dc48506313	71000000-0000-0000-0000-000000000046	30000000-0000-0000-0000-000000000014	00000000-0000-0000-0000-000000000010	5	Từ một người chưa biết gì về After Effects, sau khóa học mình đã tự làm được intro hoạt hình cho kênh YouTube.	2026-11-03 13:38:59.283345+07	2026-11-11 13:38:59.283345+07
0c017222-2046-4835-8471-aa8b0a37af48	71000000-0000-0000-0000-000000000047	30000000-0000-0000-0000-000000000014	00000000-0000-0000-0000-000000000026	4	Các nguyên lý Animation 12 nguyên tắc Disney được lồng ghép cực kỳ khéo léo vào bài giảng.	2026-11-05 13:38:59.283345+07	2026-11-11 13:38:59.283345+07
e2f7b36c-6e89-4bdc-a249-6504d38a374d	71000000-0000-0000-0000-000000000048	30000000-0000-0000-0000-000000000014	00000000-0000-0000-0000-000000000025	4	Kỹ thuật rigging nhân vật 2D với Duik Bassel rất chi tiết và dễ làm theo.	2026-11-07 13:38:59.283345+07	2026-11-11 13:38:59.283345+07
a046469a-d1e8-4bb7-9ee2-e38b0e1443fa	71000000-0000-0000-0000-000000000049	30000000-0000-0000-0000-000000000014	00000000-0000-0000-0000-000000000023	3	Các bài tập cuối khóa khá nặng về thời gian render, cần máy tính có card đồ họa tốt.	2026-11-09 13:38:59.283345+07	2026-11-11 13:38:59.283345+07
d9b815ac-b4c6-4700-9068-1e37c6201ecc	71000000-0000-0000-0000-000000000050	30000000-0000-0000-0000-000000000015	00000000-0000-0000-0000-000000000026	5	Khóa học đã thay đổi hoàn toàn cách mình viết bài bán hàng! Tỷ lệ chuyển đổi trang Landing Page tăng gấp đôi.	2026-11-02 13:38:59.283345+07	2026-11-11 13:38:59.283345+07
e21de585-be79-4e3c-921f-4dc309e38acb	71000000-0000-0000-0000-000000000051	30000000-0000-0000-0000-000000000015	00000000-0000-0000-0000-000000000023	5	Nghệ thuật khơi gợi tử huyệt cảm xúc và xử lý từ chối của khách hàng thông qua ngôn từ quá xuất sắc.	2026-11-04 13:38:59.283345+07	2026-11-11 13:38:59.283345+07
8d3fbf12-3fe9-4d70-b637-7b5a26daea1d	71000000-0000-0000-0000-000000000052	30000000-0000-0000-0000-000000000015	00000000-0000-0000-0000-000000000010	4	Rất nhiều mẫu headline thu hút khách hàng không thể cưỡng lại được. Rất bổ ích.	2026-11-06 13:38:59.283345+07	2026-11-11 13:38:59.283345+07
289d4b51-eef2-477b-8927-57c3e92c6e8e	71000000-0000-0000-0000-000000000053	30000000-0000-0000-0000-000000000015	00000000-0000-0000-0000-000000000024	4	Cô Alex Morgan hướng dẫn cách nghiên cứu thấu hiểu tâm lý khách hàng cực kỳ sâu sắc.	2026-11-08 13:38:59.283345+07	2026-11-11 13:38:59.283345+07
ecc4e28d-9ddd-44b5-afe5-6f9cecd40f2a	71000000-0000-0000-0000-000000000054	30000000-0000-0000-0000-000000000015	00000000-0000-0000-0000-000000000008	3	Nội dung chủ yếu tập trung vào B2C, mong có thêm một chương chuyên biệt về Copywriting cho B2B.	2026-11-10 13:38:59.283345+07	2026-11-11 13:38:59.283345+07
442d6610-dffd-4574-98a5-c4ccfe4a26cb	71000000-0000-0000-0000-000000000055	30000000-0000-0000-0000-000000000016	00000000-0000-0000-0000-000000000024	5	Khóa học sửa phát âm chuẩn từng âm vị IPA, cách nối âm và ngữ điệu câu cực kỳ chi tiết.	2026-11-02 13:38:59.283345+07	2026-11-11 13:38:59.283345+07
edd5f315-eeb1-41cd-ab01-d5eb7589e2e7	71000000-0000-0000-0000-000000000056	30000000-0000-0000-0000-000000000016	00000000-0000-0000-0000-000000000026	5	Nhờ khóa học mà mình đã tự tin thuyết trình trước 50 khách hàng quốc tế mà không còn ngập ngừng.	2026-11-04 13:38:59.283345+07	2026-11-11 13:38:59.283345+07
57e46d3b-530e-4509-8a16-a9ef4c87c03d	71000000-0000-0000-0000-000000000057	30000000-0000-0000-0000-000000000016	00000000-0000-0000-0000-000000000021	4	Cô Emily có cách giảng rất lôi cuốn, chỉ ra đúng các lỗi sai phổ biến của người Việt khi nói tiếng Anh.	2026-11-06 13:38:59.283345+07	2026-11-11 13:38:59.283345+07
5d45c3f3-11d2-4fa8-8c47-420e38d72db5	71000000-0000-0000-0000-000000000058	30000000-0000-0000-0000-000000000016	00000000-0000-0000-0000-000000000009	4	Các mẹo kiểm soát hơi thở và ngôn ngữ cơ thể trên sân khấu rất thực tế và hữu dụng.	2026-11-08 13:38:59.283345+07	2026-11-11 13:38:59.283345+07
33a4238c-044f-4afe-996b-2932c5768049	71000000-0000-0000-0000-000000000059	30000000-0000-0000-0000-000000000016	00000000-0000-0000-0000-000000000010	3	Tốc độ bài tập phản xạ ở các bài cuối hơi nhanh đối với người có phát âm cơ bản.	2026-11-10 13:38:59.283345+07	2026-11-11 13:38:59.283345+07
\.


--
-- TOC entry 5380 (class 0 OID 33364)
-- Dependencies: 231
-- Data for Name: saved_courses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.saved_courses (id, user_id, course_id, created_at) FROM stdin;
8c95c379-e9df-43df-b569-bbe0262a8171	00000000-0000-0000-0000-000000000004	30000000-0000-0000-0000-000000000005	2026-11-11 11:33:35.285249+07
a8aac65a-477e-44b6-b767-2533a62c2445	00000000-0000-0000-0000-000000000004	30000000-0000-0000-0000-000000000007	2026-11-11 11:33:35.285249+07
d4d40fd0-e8c1-498f-ae04-3506b30cc840	00000000-0000-0000-0000-000000000008	30000000-0000-0000-0000-000000000001	2026-11-11 11:33:35.285249+07
\.


--
-- TOC entry 5376 (class 0 OID 33275)
-- Dependencies: 227
-- Data for Name: sections; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sections (id, course_id, title, order_index, created_at, updated_at) FROM stdin;
40000000-0000-0000-0000-000000000001	30000000-0000-0000-0000-000000000001	Chương 1: Tổng quan về Thiết kế UX & Tâm lý học Người dùng	1	2026-11-11 11:33:35.261425+07	2026-11-11 11:33:35.261425+07
40000000-0000-0000-0000-000000000002	30000000-0000-0000-0000-000000000001	Chương 2: Quy trình Nghiên cứu & Phỏng vấn Người dùng	2	2026-11-11 11:33:35.261425+07	2026-11-11 11:33:35.261425+07
40000000-0000-0000-0000-000000000003	30000000-0000-0000-0000-000000000004	Chương 1: Làm chủ Giao diện & Auto-Layout trong Figma	1	2026-11-11 11:33:35.261425+07	2026-11-11 11:33:35.261425+07
40000000-0000-0000-0000-000000000004	30000000-0000-0000-0000-000000000004	Chương 2: Thiết kế Hệ thống Components & Prototype	2	2026-11-11 11:33:35.261425+07	2026-11-11 11:33:35.261425+07
40000000-0000-0000-0000-000000000005	30000000-0000-0000-0000-000000000002	Chương 1: Cài đặt Môi trường Expo & Flexbox Layout	1	2026-11-11 11:33:35.261425+07	2026-11-11 11:33:35.261425+07
40000000-0000-0000-0000-000000000006	30000000-0000-0000-0000-000000000002	Chương 2: Xử lý State, Context API & Tích hợp REST API	2	2026-11-11 11:33:35.261425+07	2026-11-11 11:33:35.261425+07
40000000-0000-0000-0000-000000000007	30000000-0000-0000-0000-000000000005	Chương 1: Kiến trúc Spring Boot 3 & Thiết kế RESTful API	1	2026-11-11 11:33:35.261425+07	2026-11-11 11:33:35.261425+07
40000000-0000-0000-0000-000000000008	30000000-0000-0000-0000-000000000005	Chương 2: Spring Data JPA, PostgreSQL & Bảo mật JWT	2	2026-11-11 11:33:35.261425+07	2026-11-11 11:33:35.261425+07
40000000-0000-0000-0000-000000000009	30000000-0000-0000-0000-000000000012	Chương 1: Khởi tạo Project Next.js & Server Components	1	2026-11-11 11:33:35.261425+07	2026-11-11 11:33:35.261425+07
40000000-0000-0000-0000-000000000010	30000000-0000-0000-0000-000000000012	Chương 2: Xây dựng Backend API & Tích hợp Prisma ORM	2	2026-11-11 11:33:35.261425+07	2026-11-11 11:33:35.261425+07
40000000-0000-0000-0000-000000000011	30000000-0000-0000-0000-000000000003	Chương 1: Tư duy Phễu Chuyển đổi & Xây dựng Chân dung Khách hàng	1	2026-11-11 11:33:35.261425+07	2026-11-11 11:33:35.261425+07
40000000-0000-0000-0000-000000000012	30000000-0000-0000-0000-000000000003	Chương 2: Tối ưu Quảng cáo Đa kênh & Phân tích Chỉ số ROI	2	2026-11-11 11:33:35.261425+07	2026-11-11 11:33:35.261425+07
40000000-0000-0000-0000-000000000013	30000000-0000-0000-0000-000000000013	Chương 1: Nguyên lý Cốt lõi của Khung làm việc Scrum	1	2026-11-11 11:33:35.261425+07	2026-11-11 11:33:35.261425+07
40000000-0000-0000-0000-000000000014	30000000-0000-0000-0000-000000000013	Chương 2: Vận hành Sprint và Quản lý Backlog trên Jira	2	2026-11-11 11:33:35.261425+07	2026-11-11 11:33:35.261425+07
40000000-0000-0000-0000-000000000015	30000000-0000-0000-0000-000000000007	Chương 1: Giao diện Làm việc & Kỹ thuật Cắt ghép Nhịp điệu	1	2026-11-11 11:33:35.261425+07	2026-11-11 11:33:35.261425+07
40000000-0000-0000-0000-000000000016	30000000-0000-0000-0000-000000000007	Chương 2: Chỉnh màu Lumetri Color & Xử lý Âm thanh	2	2026-11-11 11:33:35.261425+07	2026-11-11 11:33:35.261425+07
40000000-0000-0000-0000-000000000017	30000000-0000-0000-0000-000000000014	Chương 1: Cơ bản về Keyframe & Chuyển động Đồ họa	1	2026-11-11 11:33:35.261425+07	2026-11-11 11:33:35.261425+07
40000000-0000-0000-0000-000000000018	30000000-0000-0000-0000-000000000014	Chương 2: Hiệu ứng Visual Effects & Render Chuẩn HD	2	2026-11-11 11:33:35.261425+07	2026-11-11 11:33:35.261425+07
40000000-0000-0000-0000-000000000019	30000000-0000-0000-0000-000000000006	Chương 1: Tìm kiếm Ý tưởng & Khơi nguồn Cảm hứng Viết	1	2026-11-11 11:33:35.261425+07	2026-11-11 11:33:35.261425+07
40000000-0000-0000-0000-000000000020	30000000-0000-0000-0000-000000000006	Chương 2: Kỹ thuật Kể chuyện Storytelling Chạm Cảm xúc	2	2026-11-11 11:33:35.261425+07	2026-11-11 11:33:35.261425+07
40000000-0000-0000-0000-000000000021	30000000-0000-0000-0000-000000000015	Chương 1: Công thức Giật tít Tiêu đề & Thu hút Chú ý	1	2026-11-11 11:33:35.261425+07	2026-11-11 11:33:35.261425+07
40000000-0000-0000-0000-000000000022	30000000-0000-0000-0000-000000000015	Chương 2: Viết Bài Bán hàng Thuyết phục & Lời kêu gọi CTA	2	2026-11-11 11:33:35.261425+07	2026-11-11 11:33:35.261425+07
40000000-0000-0000-0000-000000000023	30000000-0000-0000-0000-000000000008	Chương 1: Giao tiếp Tự tin trong Phỏng vấn & Họp Doanh nghiệp	1	2026-11-11 11:33:35.261425+07	2026-11-11 11:33:35.261425+07
40000000-0000-0000-0000-000000000024	30000000-0000-0000-0000-000000000008	Chương 2: Viết Email Thương mại & Đàm phán Hợp đồng	2	2026-11-11 11:33:35.261425+07	2026-11-11 11:33:35.261425+07
40000000-0000-0000-0000-000000000025	30000000-0000-0000-0000-000000000016	Chương 1: Khẩu hình Miệng & Bảng Ký hiệu Ngữ âm Quốc tế IPA	1	2026-11-11 11:33:35.261425+07	2026-11-11 11:33:35.261425+07
40000000-0000-0000-0000-000000000026	30000000-0000-0000-0000-000000000016	Chương 2: Quy tắc Nhấn Trọng âm, Nối âm & Ngữ điệu Tự nhiên	2	2026-11-11 11:33:35.261425+07	2026-11-11 11:33:35.261425+07
\.


--
-- TOC entry 5372 (class 0 OID 33160)
-- Dependencies: 223
-- Data for Name: topics; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.topics (id, name, slug, search_count, is_hot, created_at, updated_at) FROM stdin;
20000000-0000-0000-0000-000000000001	Java	java	0	t	2026-11-11 11:33:35.252795+07	2026-11-11 11:33:35.252795+07
20000000-0000-0000-0000-000000000003	UX/UI	ux-ui	0	t	2026-11-11 11:33:35.252795+07	2026-11-11 11:33:35.252795+07
20000000-0000-0000-0000-000000000004	Figma	figma	0	t	2026-11-11 11:33:35.252795+07	2026-11-11 11:33:35.252795+07
20000000-0000-0000-0000-000000000005	Growth Hacking	growth-hacking	0	t	2026-11-11 11:33:35.252795+07	2026-11-11 11:33:35.252795+07
20000000-0000-0000-0000-000000000007	Premiere Pro	premiere-pro	0	t	2026-11-11 11:33:35.252795+07	2026-11-11 11:33:35.252795+07
20000000-0000-0000-0000-000000000008	Copywriting	copywriting	0	t	2026-11-11 11:33:35.252795+07	2026-11-11 11:33:35.252795+07
20000000-0000-0000-0000-000000000009	Business English	business-english	0	t	2026-11-11 11:33:35.252795+07	2026-11-11 11:33:35.252795+07
20000000-0000-0000-0000-000000000010	Fullstack Web	fullstack-web	0	f	2026-11-11 11:33:35.252795+07	2026-11-11 11:33:35.252795+07
20000000-0000-0000-0000-000000000002	React Native	react-native	1	t	2026-11-11 11:33:35.252795+07	2026-11-11 11:50:18.51989+07
20000000-0000-0000-0000-000000000006	Spring Boot	spring-boot	1	t	2026-11-11 11:33:35.252795+07	2026-11-11 11:50:25.697725+07
\.


--
-- TOC entry 5368 (class 0 OID 33058)
-- Dependencies: 219
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, full_name, email, password_hash, avatar_url, cover_url, job_title, bio, role, status, email_verified_at, last_login_at, failed_login_count, login_locked_until, deleted_at, created_at, updated_at) FROM stdin;
00000000-0000-0000-0000-000000000001	Quản trị viên	admin@elearning.local	$2a$10$KPlEvdcJ54ioRmxJfPPvyu4qqXZp94fvvwyFzA.BV6GikdIOO7t32	https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80	\N	Hệ thống Quản trị	Quản trị viên hệ thống E-Learning.	ADMIN	ACTIVE	2026-11-11 11:33:35.247815+07	\N	0	\N	\N	2026-11-11 11:33:35.247815+07	2026-11-11 11:33:35.247815+07
00000000-0000-0000-0000-000000000002	Sara Weise	sara@elearning.local	$2a$10$KPlEvdcJ54ioRmxJfPPvyu4qqXZp94fvvwyFzA.BV6GikdIOO7t32	https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80	\N	Lead UI/UX Designer	Chuyên gia thiết kế sản phẩm số với hơn 10 năm kinh nghiệm tại Thung lũng Silicon.	INSTRUCTOR	ACTIVE	2026-11-11 11:33:35.247815+07	\N	0	\N	\N	2026-11-11 11:33:35.247815+07	2026-11-11 11:33:35.247815+07
00000000-0000-0000-0000-000000000003	Jenny Barry	jenny@elearning.local	$2a$10$KPlEvdcJ54ioRmxJfPPvyu4qqXZp94fvvwyFzA.BV6GikdIOO7t32	https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80	\N	Senior Fullstack Engineer	Kỹ sư công nghệ cấp cao chuyên về React Native, Spring Boot và Kiến trúc Microservices.	INSTRUCTOR	ACTIVE	2026-11-11 11:33:35.247815+07	\N	0	\N	\N	2026-11-11 11:33:35.247815+07	2026-11-11 11:33:35.247815+07
00000000-0000-0000-0000-000000000005	Alex Morgan	alex@elearning.local	$2a$10$KPlEvdcJ54ioRmxJfPPvyu4qqXZp94fvvwyFzA.BV6GikdIOO7t32	https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80	\N	Head of Growth Marketing	Cố vấn chiến lược tăng trưởng & Performance Marketing cho hơn 50 startup công nghệ.	INSTRUCTOR	ACTIVE	2026-11-11 11:33:35.247815+07	\N	0	\N	\N	2026-11-11 11:33:35.247815+07	2026-11-11 11:33:35.247815+07
00000000-0000-0000-0000-000000000006	David Miller	david@elearning.local	$2a$10$KPlEvdcJ54ioRmxJfPPvyu4qqXZp94fvvwyFzA.BV6GikdIOO7t32	https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80	\N	Filmmaker & Motion Artist	Đạo diễn hình ảnh và chuyên gia hậu kỳ Premiere Pro, After Effects từng đạt nhiều giải thưởng điện ảnh.	INSTRUCTOR	ACTIVE	2026-11-11 11:33:35.247815+07	\N	0	\N	\N	2026-11-11 11:33:35.247815+07	2026-11-11 11:33:35.247815+07
00000000-0000-0000-0000-000000000007	Emily Watson	emily@elearning.local	$2a$10$KPlEvdcJ54ioRmxJfPPvyu4qqXZp94fvvwyFzA.BV6GikdIOO7t32	https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80	\N	Creative Director & Author	Tác giả sách bán chạy và chuyên gia cố vấn chiến lược nội dung, copywriting thương hiệu.	INSTRUCTOR	ACTIVE	2026-11-11 11:33:35.247815+07	\N	0	\N	\N	2026-11-11 11:33:35.247815+07	2026-11-11 11:33:35.247815+07
00000000-0000-0000-0000-000000000011	Michael Chen	michael@elearning.local	$2a$10$KPlEvdcJ54ioRmxJfPPvyu4qqXZp94fvvwyFzA.BV6GikdIOO7t32	https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80	\N	Language Coach & Speaker	Thạc sĩ Giảng dạy Ngôn ngữ từ Đại học California, hơn 12 năm đào tạo tiếng Anh giao tiếp doanh nghiệp.	INSTRUCTOR	ACTIVE	2026-11-11 11:33:35.247815+07	\N	0	\N	\N	2026-11-11 11:33:35.247815+07	2026-11-11 11:33:35.247815+07
00000000-0000-0000-0000-000000000008	Trần Thị Mai	mai.tran@elearning.local	$2a$10$KPlEvdcJ54ioRmxJfPPvyu4qqXZp94fvvwyFzA.BV6GikdIOO7t32	https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80	\N	Chuyên viên Marketing	Tìm hiểu về phân tích dữ liệu và tự động hóa marketing.	STUDENT	ACTIVE	2026-11-11 11:33:35.247815+07	\N	0	\N	\N	2026-11-11 11:33:35.247815+07	2026-11-11 11:33:35.247815+07
00000000-0000-0000-0000-000000000009	Lê Hoàng Nam	nam.le@elearning.local	$2a$10$KPlEvdcJ54ioRmxJfPPvyu4qqXZp94fvvwyFzA.BV6GikdIOO7t32	https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80	\N	Lập trình viên Backend	Yêu thích Java, Spring Boot và xây dựng hệ thống phân tán.	STUDENT	ACTIVE	2026-11-11 11:33:35.247815+07	\N	0	\N	\N	2026-11-11 11:33:35.247815+07	2026-11-11 11:33:35.247815+07
00000000-0000-0000-0000-000000000010	Phạm Thu Hà	ha.pham@elearning.local	$2a$10$KPlEvdcJ54ioRmxJfPPvyu4qqXZp94fvvwyFzA.BV6GikdIOO7t32	https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&auto=format&fit=crop&q=80	\N	Content Creator	Học làm video ngắn và nâng cao kỹ năng viết lách thu hút.	STUDENT	ACTIVE	2026-11-11 11:33:35.247815+07	\N	0	\N	\N	2026-11-11 11:33:35.247815+07	2026-11-11 11:33:35.247815+07
00000000-0000-0000-0000-000000000021	Hoàng Đức Anh	duc.anh@elearning.local	$2a$10$KPlEvdcJ54ioRmxJfPPvyu4qqXZp94fvvwyFzA.BV6GikdIOO7t32	https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80	\N	Sinh viên CNTT	Đam mê lập trình di động và web fullstack.	STUDENT	ACTIVE	2026-11-11 13:38:59.269219+07	\N	0	\N	\N	2026-11-11 13:38:59.269219+07	2026-11-11 13:38:59.269219+07
00000000-0000-0000-0000-000000000022	Vũ Thị Linh	linh.vu@elearning.local	$2a$10$KPlEvdcJ54ioRmxJfPPvyu4qqXZp94fvvwyFzA.BV6GikdIOO7t32	https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80	\N	Graphic Designer	Yêu thích thiết kế đồ họa, UI/UX và animation.	STUDENT	ACTIVE	2026-11-11 13:38:59.269219+07	\N	0	\N	\N	2026-11-11 13:38:59.269219+07	2026-11-11 13:38:59.269219+07
00000000-0000-0000-0000-000000000023	Bùi Minh Quân	quan.bui@elearning.local	$2a$10$KPlEvdcJ54ioRmxJfPPvyu4qqXZp94fvvwyFzA.BV6GikdIOO7t32	https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80	\N	Marketing Executive	Chuyên viên Digital Marketing và tối ưu phễu chuyển đổi.	STUDENT	ACTIVE	2026-11-11 13:38:59.269219+07	\N	0	\N	\N	2026-11-11 13:38:59.269219+07	2026-11-11 13:38:59.269219+07
00000000-0000-0000-0000-000000000024	Đặng Thảo My	my.dang@elearning.local	$2a$10$KPlEvdcJ54ioRmxJfPPvyu4qqXZp94fvvwyFzA.BV6GikdIOO7t32	https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80	\N	Product Manager	Quản lý phát triển sản phẩm công nghệ theo chuẩn Scrum.	STUDENT	ACTIVE	2026-11-11 13:38:59.269219+07	\N	0	\N	\N	2026-11-11 13:38:59.269219+07	2026-11-11 13:38:59.269219+07
00000000-0000-0000-0000-000000000025	Đỗ Gia Huy	huy.do@elearning.local	$2a$10$KPlEvdcJ54ioRmxJfPPvyu4qqXZp94fvvwyFzA.BV6GikdIOO7t32	https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&auto=format&fit=crop&q=80	\N	Frontend Developer	Lập trình viên React, Next.js và ứng dụng đa nền tảng.	STUDENT	ACTIVE	2026-11-11 13:38:59.269219+07	\N	0	\N	\N	2026-11-11 13:38:59.269219+07	2026-11-11 13:38:59.269219+07
00000000-0000-0000-0000-000000000026	Nguyễn Hải Yến	yen.nguyen@elearning.local	$2a$10$KPlEvdcJ54ioRmxJfPPvyu4qqXZp94fvvwyFzA.BV6GikdIOO7t32	https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80	\N	Content Creator & Copywriter	Sáng tạo nội dung video ngắn, viết bài truyền thông thương hiệu.	STUDENT	ACTIVE	2026-11-11 13:38:59.269219+07	\N	0	\N	\N	2026-11-11 13:38:59.269219+07	2026-11-11 13:38:59.269219+07
b4638a78-8596-4796-b09e-8487792e686d	Minh Tuan	minhtuando150@gmail.com	$2a$10$vFptxdKdkE0liDa2CrSUk.S4h0AR5AB3VCOd1qkZzgeymJeXMwqWa	images/2026/11/52d3f56c-467f-48dc-bfd1-825b6051cceb.jpg	\N	\N	\N	STUDENT	ACTIVE	2026-11-12 00:11:09.127314+07	2026-11-12 00:57:41.094914+07	0	\N	\N	2026-11-12 00:10:14.976235+07	2026-11-12 00:58:12.325222+07
d140ecb6-e330-496e-a6e3-e8c02aed26c2	Tuan	conanst67@gmail.com	$2a$10$hY9q..QiMAbk931nKpwOOuh.4y0MC2IaDMnm6itcLO5jc4yUc/7Ky	\N	\N	\N	\N	STUDENT	ACTIVE	2026-11-12 01:44:37.042559+07	2026-11-12 01:44:45.584414+07	0	\N	\N	2026-11-12 01:44:37.164163+07	2026-11-12 01:44:45.59441+07
00000000-0000-0000-0000-000000000004	Nguyễn Văn Học	student@elearning.local	$2a$10$KPlEvdcJ54ioRmxJfPPvyu4qqXZp94fvvwyFzA.BV6GikdIOO7t32	https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80	\N	Sinh viên CNTT	Học viên đam mê phát triển ứng dụng di động và thiết kế UI/UX.	STUDENT	ACTIVE	2026-11-11 11:33:35.247815+07	2026-11-12 00:57:03.776441+07	0	\N	\N	2026-11-11 11:33:35.247815+07	2026-11-12 00:57:03.867423+07
\.


--
-- TOC entry 5172 (class 2606 OID 33944)
-- Name: banners banners_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.banners
    ADD CONSTRAINT banners_pkey PRIMARY KEY (id);


--
-- TOC entry 5096 (class 2606 OID 33419)
-- Name: cart_items cart_items_cart_id_course_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_cart_id_course_id_key UNIQUE (cart_id, course_id);


--
-- TOC entry 5098 (class 2606 OID 33417)
-- Name: cart_items cart_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_pkey PRIMARY KEY (id);


--
-- TOC entry 5092 (class 2606 OID 33398)
-- Name: carts carts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT carts_pkey PRIMARY KEY (id);


--
-- TOC entry 5094 (class 2606 OID 33400)
-- Name: carts carts_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT carts_user_id_key UNIQUE (user_id);


--
-- TOC entry 5051 (class 2606 OID 33157)
-- Name: categories categories_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_name_key UNIQUE (name);


--
-- TOC entry 5053 (class 2606 OID 33155)
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- TOC entry 5055 (class 2606 OID 33159)
-- Name: categories categories_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_slug_key UNIQUE (slug);


--
-- TOC entry 5132 (class 2606 OID 33662)
-- Name: certificates certificates_certificate_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.certificates
    ADD CONSTRAINT certificates_certificate_code_key UNIQUE (certificate_code);


--
-- TOC entry 5134 (class 2606 OID 33660)
-- Name: certificates certificates_enrollment_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.certificates
    ADD CONSTRAINT certificates_enrollment_id_key UNIQUE (enrollment_id);


--
-- TOC entry 5136 (class 2606 OID 33658)
-- Name: certificates certificates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.certificates
    ADD CONSTRAINT certificates_pkey PRIMARY KEY (id);


--
-- TOC entry 5117 (class 2606 OID 33558)
-- Name: coupon_usages coupon_usages_order_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupon_usages
    ADD CONSTRAINT coupon_usages_order_id_key UNIQUE (order_id);


--
-- TOC entry 5119 (class 2606 OID 33556)
-- Name: coupon_usages coupon_usages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupon_usages
    ADD CONSTRAINT coupon_usages_pkey PRIMARY KEY (id);


--
-- TOC entry 5100 (class 2606 OID 33458)
-- Name: coupons coupons_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_code_key UNIQUE (code);


--
-- TOC entry 5102 (class 2606 OID 33456)
-- Name: coupons coupons_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_pkey PRIMARY KEY (id);


--
-- TOC entry 5072 (class 2606 OID 33269)
-- Name: course_benefits course_benefits_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.course_benefits
    ADD CONSTRAINT course_benefits_pkey PRIMARY KEY (id);


--
-- TOC entry 5082 (class 2606 OID 33336)
-- Name: course_documents course_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.course_documents
    ADD CONSTRAINT course_documents_pkey PRIMARY KEY (id);


--
-- TOC entry 5165 (class 2606 OID 33886)
-- Name: course_likes course_likes_course_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.course_likes
    ADD CONSTRAINT course_likes_course_id_user_id_key UNIQUE (course_id, user_id);


--
-- TOC entry 5167 (class 2606 OID 33884)
-- Name: course_likes course_likes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.course_likes
    ADD CONSTRAINT course_likes_pkey PRIMARY KEY (id);


--
-- TOC entry 5084 (class 2606 OID 33358)
-- Name: course_projects course_projects_course_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.course_projects
    ADD CONSTRAINT course_projects_course_id_key UNIQUE (course_id);


--
-- TOC entry 5086 (class 2606 OID 33356)
-- Name: course_projects course_projects_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.course_projects
    ADD CONSTRAINT course_projects_pkey PRIMARY KEY (id);


--
-- TOC entry 5070 (class 2606 OID 33244)
-- Name: course_topics course_topics_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.course_topics
    ADD CONSTRAINT course_topics_pkey PRIMARY KEY (course_id, topic_id);


--
-- TOC entry 5063 (class 2606 OID 33222)
-- Name: courses courses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_pkey PRIMARY KEY (id);


--
-- TOC entry 5065 (class 2606 OID 33224)
-- Name: courses courses_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_slug_key UNIQUE (slug);


--
-- TOC entry 5121 (class 2606 OID 33596)
-- Name: enrollments enrollments_order_item_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_order_item_id_key UNIQUE (order_item_id);


--
-- TOC entry 5123 (class 2606 OID 33594)
-- Name: enrollments enrollments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_pkey PRIMARY KEY (id);


--
-- TOC entry 5125 (class 2606 OID 33598)
-- Name: enrollments enrollments_user_id_course_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_user_id_course_id_key UNIQUE (user_id, course_id);


--
-- TOC entry 5161 (class 2606 OID 33863)
-- Name: follows follows_follower_id_instructor_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.follows
    ADD CONSTRAINT follows_follower_id_instructor_id_key UNIQUE (follower_id, instructor_id);


--
-- TOC entry 5163 (class 2606 OID 33861)
-- Name: follows follows_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.follows
    ADD CONSTRAINT follows_pkey PRIMARY KEY (id);


--
-- TOC entry 5042 (class 2606 OID 33107)
-- Name: instructor_profiles instructor_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.instructor_profiles
    ADD CONSTRAINT instructor_profiles_pkey PRIMARY KEY (id);


--
-- TOC entry 5044 (class 2606 OID 33109)
-- Name: instructor_profiles instructor_profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.instructor_profiles
    ADD CONSTRAINT instructor_profiles_user_id_key UNIQUE (user_id);


--
-- TOC entry 5128 (class 2606 OID 33633)
-- Name: lesson_progress lesson_progress_enrollment_id_lesson_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lesson_progress
    ADD CONSTRAINT lesson_progress_enrollment_id_lesson_id_key UNIQUE (enrollment_id, lesson_id);


--
-- TOC entry 5130 (class 2606 OID 33631)
-- Name: lesson_progress lesson_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lesson_progress
    ADD CONSTRAINT lesson_progress_pkey PRIMARY KEY (id);


--
-- TOC entry 5078 (class 2606 OID 33315)
-- Name: lessons lessons_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lessons
    ADD CONSTRAINT lessons_pkey PRIMARY KEY (id);


--
-- TOC entry 5080 (class 2606 OID 33317)
-- Name: lessons lessons_section_id_order_index_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lessons
    ADD CONSTRAINT lessons_section_id_order_index_key UNIQUE (section_id, order_index);


--
-- TOC entry 5170 (class 2606 OID 33913)
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- TOC entry 5110 (class 2606 OID 33507)
-- Name: order_items order_items_order_id_course_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_course_id_key UNIQUE (order_id, course_id);


--
-- TOC entry 5112 (class 2606 OID 33505)
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- TOC entry 5106 (class 2606 OID 33480)
-- Name: orders orders_order_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_order_code_key UNIQUE (order_code);


--
-- TOC entry 5108 (class 2606 OID 33478)
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- TOC entry 5115 (class 2606 OID 33537)
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- TOC entry 5140 (class 2606 OID 33714)
-- Name: project_submissions project_submissions_course_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_submissions
    ADD CONSTRAINT project_submissions_course_id_user_id_key UNIQUE (course_id, user_id);


--
-- TOC entry 5142 (class 2606 OID 33712)
-- Name: project_submissions project_submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_submissions
    ADD CONSTRAINT project_submissions_pkey PRIMARY KEY (id);


--
-- TOC entry 5148 (class 2606 OID 33777)
-- Name: qa_comments qa_comments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.qa_comments
    ADD CONSTRAINT qa_comments_pkey PRIMARY KEY (id);


--
-- TOC entry 5150 (class 2606 OID 33799)
-- Name: qa_post_likes qa_post_likes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.qa_post_likes
    ADD CONSTRAINT qa_post_likes_pkey PRIMARY KEY (id);


--
-- TOC entry 5152 (class 2606 OID 33801)
-- Name: qa_post_likes qa_post_likes_post_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.qa_post_likes
    ADD CONSTRAINT qa_post_likes_post_id_user_id_key UNIQUE (post_id, user_id);


--
-- TOC entry 5145 (class 2606 OID 33748)
-- Name: qa_posts qa_posts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.qa_posts
    ADD CONSTRAINT qa_posts_pkey PRIMARY KEY (id);


--
-- TOC entry 5047 (class 2606 OID 33128)
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- TOC entry 5049 (class 2606 OID 33130)
-- Name: refresh_tokens refresh_tokens_token_hash_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_hash_key UNIQUE (token_hash);


--
-- TOC entry 5138 (class 2606 OID 33685)
-- Name: refund_requests refund_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refund_requests
    ADD CONSTRAINT refund_requests_pkey PRIMARY KEY (id);


--
-- TOC entry 5155 (class 2606 OID 33833)
-- Name: reviews reviews_course_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_course_id_user_id_key UNIQUE (course_id, user_id);


--
-- TOC entry 5157 (class 2606 OID 33831)
-- Name: reviews reviews_enrollment_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_enrollment_id_key UNIQUE (enrollment_id);


--
-- TOC entry 5159 (class 2606 OID 33829)
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- TOC entry 5088 (class 2606 OID 33374)
-- Name: saved_courses saved_courses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.saved_courses
    ADD CONSTRAINT saved_courses_pkey PRIMARY KEY (id);


--
-- TOC entry 5090 (class 2606 OID 33376)
-- Name: saved_courses saved_courses_user_id_course_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.saved_courses
    ADD CONSTRAINT saved_courses_user_id_course_id_key UNIQUE (user_id, course_id);


--
-- TOC entry 5074 (class 2606 OID 33290)
-- Name: sections sections_course_id_order_index_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sections
    ADD CONSTRAINT sections_course_id_order_index_key UNIQUE (course_id, order_index);


--
-- TOC entry 5076 (class 2606 OID 33288)
-- Name: sections sections_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sections
    ADD CONSTRAINT sections_pkey PRIMARY KEY (id);


--
-- TOC entry 5057 (class 2606 OID 33178)
-- Name: topics topics_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.topics
    ADD CONSTRAINT topics_name_key UNIQUE (name);


--
-- TOC entry 5059 (class 2606 OID 33176)
-- Name: topics topics_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.topics
    ADD CONSTRAINT topics_pkey PRIMARY KEY (id);


--
-- TOC entry 5061 (class 2606 OID 33180)
-- Name: topics topics_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.topics
    ADD CONSTRAINT topics_slug_key UNIQUE (slug);


--
-- TOC entry 5038 (class 2606 OID 33083)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 5040 (class 2606 OID 33081)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 5066 (class 1259 OID 33236)
-- Name: idx_courses_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_courses_category ON public.courses USING btree (category_id);


--
-- TOC entry 5067 (class 1259 OID 33235)
-- Name: idx_courses_instructor; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_courses_instructor ON public.courses USING btree (instructor_id);


--
-- TOC entry 5068 (class 1259 OID 33237)
-- Name: idx_courses_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_courses_status ON public.courses USING btree (status);


--
-- TOC entry 5126 (class 1259 OID 33614)
-- Name: idx_enrollments_course; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_enrollments_course ON public.enrollments USING btree (course_id);


--
-- TOC entry 5168 (class 1259 OID 33919)
-- Name: idx_notifications_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_user ON public.notifications USING btree (user_id, is_read);


--
-- TOC entry 5103 (class 1259 OID 33492)
-- Name: idx_orders_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_status ON public.orders USING btree (status);


--
-- TOC entry 5104 (class 1259 OID 33491)
-- Name: idx_orders_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_user ON public.orders USING btree (user_id);


--
-- TOC entry 5113 (class 1259 OID 33543)
-- Name: idx_payments_order; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payments_order ON public.payments USING btree (order_id);


--
-- TOC entry 5146 (class 1259 OID 33788)
-- Name: idx_qa_comments_post; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_qa_comments_post ON public.qa_comments USING btree (post_id);


--
-- TOC entry 5143 (class 1259 OID 33759)
-- Name: idx_qa_posts_course; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_qa_posts_course ON public.qa_posts USING btree (course_id);


--
-- TOC entry 5045 (class 1259 OID 33136)
-- Name: idx_refresh_tokens_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_refresh_tokens_user ON public.refresh_tokens USING btree (user_id);


--
-- TOC entry 5153 (class 1259 OID 33849)
-- Name: idx_reviews_course; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reviews_course ON public.reviews USING btree (course_id);


--
-- TOC entry 5187 (class 2606 OID 33420)
-- Name: cart_items cart_items_cart_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_cart_id_fkey FOREIGN KEY (cart_id) REFERENCES public.carts(id) ON DELETE CASCADE;


--
-- TOC entry 5188 (class 2606 OID 33425)
-- Name: cart_items cart_items_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- TOC entry 5186 (class 2606 OID 33401)
-- Name: carts carts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT carts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5202 (class 2606 OID 33663)
-- Name: certificates certificates_enrollment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.certificates
    ADD CONSTRAINT certificates_enrollment_id_fkey FOREIGN KEY (enrollment_id) REFERENCES public.enrollments(id) ON DELETE CASCADE;


--
-- TOC entry 5194 (class 2606 OID 33559)
-- Name: coupon_usages coupon_usages_coupon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupon_usages
    ADD CONSTRAINT coupon_usages_coupon_id_fkey FOREIGN KEY (coupon_id) REFERENCES public.coupons(id) ON DELETE CASCADE;


--
-- TOC entry 5195 (class 2606 OID 33569)
-- Name: coupon_usages coupon_usages_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupon_usages
    ADD CONSTRAINT coupon_usages_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- TOC entry 5196 (class 2606 OID 33564)
-- Name: coupon_usages coupon_usages_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupon_usages
    ADD CONSTRAINT coupon_usages_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5179 (class 2606 OID 33270)
-- Name: course_benefits course_benefits_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.course_benefits
    ADD CONSTRAINT course_benefits_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- TOC entry 5182 (class 2606 OID 33337)
-- Name: course_documents course_documents_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.course_documents
    ADD CONSTRAINT course_documents_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- TOC entry 5218 (class 2606 OID 33887)
-- Name: course_likes course_likes_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.course_likes
    ADD CONSTRAINT course_likes_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- TOC entry 5219 (class 2606 OID 33892)
-- Name: course_likes course_likes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.course_likes
    ADD CONSTRAINT course_likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5183 (class 2606 OID 33359)
-- Name: course_projects course_projects_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.course_projects
    ADD CONSTRAINT course_projects_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- TOC entry 5177 (class 2606 OID 33245)
-- Name: course_topics course_topics_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.course_topics
    ADD CONSTRAINT course_topics_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- TOC entry 5178 (class 2606 OID 33250)
-- Name: course_topics course_topics_topic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.course_topics
    ADD CONSTRAINT course_topics_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.topics(id) ON DELETE CASCADE;


--
-- TOC entry 5175 (class 2606 OID 33230)
-- Name: courses courses_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE RESTRICT;


--
-- TOC entry 5176 (class 2606 OID 33225)
-- Name: courses courses_instructor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_instructor_id_fkey FOREIGN KEY (instructor_id) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- TOC entry 5197 (class 2606 OID 33604)
-- Name: enrollments enrollments_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE RESTRICT;


--
-- TOC entry 5198 (class 2606 OID 33609)
-- Name: enrollments enrollments_order_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_order_item_id_fkey FOREIGN KEY (order_item_id) REFERENCES public.order_items(id) ON DELETE SET NULL;


--
-- TOC entry 5199 (class 2606 OID 33599)
-- Name: enrollments enrollments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5216 (class 2606 OID 33864)
-- Name: follows follows_follower_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.follows
    ADD CONSTRAINT follows_follower_id_fkey FOREIGN KEY (follower_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5217 (class 2606 OID 33869)
-- Name: follows follows_instructor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.follows
    ADD CONSTRAINT follows_instructor_id_fkey FOREIGN KEY (instructor_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5173 (class 2606 OID 33110)
-- Name: instructor_profiles instructor_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.instructor_profiles
    ADD CONSTRAINT instructor_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5200 (class 2606 OID 33634)
-- Name: lesson_progress lesson_progress_enrollment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lesson_progress
    ADD CONSTRAINT lesson_progress_enrollment_id_fkey FOREIGN KEY (enrollment_id) REFERENCES public.enrollments(id) ON DELETE CASCADE;


--
-- TOC entry 5201 (class 2606 OID 33639)
-- Name: lesson_progress lesson_progress_lesson_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lesson_progress
    ADD CONSTRAINT lesson_progress_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(id) ON DELETE CASCADE;


--
-- TOC entry 5181 (class 2606 OID 33318)
-- Name: lessons lessons_section_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lessons
    ADD CONSTRAINT lessons_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.sections(id) ON DELETE CASCADE;


--
-- TOC entry 5220 (class 2606 OID 33914)
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5191 (class 2606 OID 33513)
-- Name: order_items order_items_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE RESTRICT;


--
-- TOC entry 5192 (class 2606 OID 33508)
-- Name: order_items order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- TOC entry 5189 (class 2606 OID 33486)
-- Name: orders orders_coupon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_coupon_id_fkey FOREIGN KEY (coupon_id) REFERENCES public.coupons(id) ON DELETE SET NULL;


--
-- TOC entry 5190 (class 2606 OID 33481)
-- Name: orders orders_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- TOC entry 5193 (class 2606 OID 33538)
-- Name: payments payments_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- TOC entry 5205 (class 2606 OID 33715)
-- Name: project_submissions project_submissions_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_submissions
    ADD CONSTRAINT project_submissions_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- TOC entry 5206 (class 2606 OID 33720)
-- Name: project_submissions project_submissions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_submissions
    ADD CONSTRAINT project_submissions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5209 (class 2606 OID 33778)
-- Name: qa_comments qa_comments_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.qa_comments
    ADD CONSTRAINT qa_comments_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.qa_posts(id) ON DELETE CASCADE;


--
-- TOC entry 5210 (class 2606 OID 33783)
-- Name: qa_comments qa_comments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.qa_comments
    ADD CONSTRAINT qa_comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5211 (class 2606 OID 33802)
-- Name: qa_post_likes qa_post_likes_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.qa_post_likes
    ADD CONSTRAINT qa_post_likes_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.qa_posts(id) ON DELETE CASCADE;


--
-- TOC entry 5212 (class 2606 OID 33807)
-- Name: qa_post_likes qa_post_likes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.qa_post_likes
    ADD CONSTRAINT qa_post_likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5207 (class 2606 OID 33749)
-- Name: qa_posts qa_posts_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.qa_posts
    ADD CONSTRAINT qa_posts_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- TOC entry 5208 (class 2606 OID 33754)
-- Name: qa_posts qa_posts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.qa_posts
    ADD CONSTRAINT qa_posts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5174 (class 2606 OID 33131)
-- Name: refresh_tokens refresh_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5203 (class 2606 OID 33686)
-- Name: refund_requests refund_requests_enrollment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refund_requests
    ADD CONSTRAINT refund_requests_enrollment_id_fkey FOREIGN KEY (enrollment_id) REFERENCES public.enrollments(id) ON DELETE CASCADE;


--
-- TOC entry 5204 (class 2606 OID 33691)
-- Name: refund_requests refund_requests_payment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refund_requests
    ADD CONSTRAINT refund_requests_payment_id_fkey FOREIGN KEY (payment_id) REFERENCES public.payments(id) ON DELETE SET NULL;


--
-- TOC entry 5213 (class 2606 OID 33839)
-- Name: reviews reviews_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- TOC entry 5214 (class 2606 OID 33834)
-- Name: reviews reviews_enrollment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_enrollment_id_fkey FOREIGN KEY (enrollment_id) REFERENCES public.enrollments(id) ON DELETE CASCADE;


--
-- TOC entry 5215 (class 2606 OID 33844)
-- Name: reviews reviews_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5184 (class 2606 OID 33382)
-- Name: saved_courses saved_courses_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.saved_courses
    ADD CONSTRAINT saved_courses_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- TOC entry 5185 (class 2606 OID 33377)
-- Name: saved_courses saved_courses_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.saved_courses
    ADD CONSTRAINT saved_courses_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5180 (class 2606 OID 33291)
-- Name: sections sections_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sections
    ADD CONSTRAINT sections_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


-- Completed on 2026-11-12 02:24:42

--
-- PostgreSQL database dump complete
--

\unrestrict Q5IMortqkk4lsEd9pcMJmwMaRI6l15ANI4TJKOsbsrhnEUPdYLJnbvH2RdGEpg5

