--
-- PostgreSQL database dump
--

\restrict 2hXrKRBQzmZqVhI1adYq5pWib4afXjd8n7dsrdEEReyDANTaA9JWdhlUSKd616T

-- Dumped from database version 16.13
-- Dumped by pg_dump version 16.13

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.vocabulary_tags DROP CONSTRAINT IF EXISTS vocabulary_tags_vocabulary_id_fkey;
ALTER TABLE IF EXISTS ONLY public.vocabulary_notes DROP CONSTRAINT IF EXISTS vocabulary_notes_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.vocabulary_notes DROP CONSTRAINT IF EXISTS vocabulary_notes_source_attempt_id_fkey;
ALTER TABLE IF EXISTS ONLY public.user_notifications DROP CONSTRAINT IF EXISTS user_notifications_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.user_notifications DROP CONSTRAINT IF EXISTS user_notifications_campaign_id_fkey;
ALTER TABLE IF EXISTS ONLY public.user_devices DROP CONSTRAINT IF EXISTS user_devices_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.test_attempts DROP CONSTRAINT IF EXISTS test_attempts_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.test_attempts DROP CONSTRAINT IF EXISTS test_attempts_topic_id_fkey;
ALTER TABLE IF EXISTS ONLY public.questions DROP CONSTRAINT IF EXISTS questions_topic_id_fkey;
ALTER TABLE IF EXISTS ONLY public.notification_settings DROP CONSTRAINT IF EXISTS notification_settings_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.notification_campaigns DROP CONSTRAINT IF EXISTS notification_campaigns_created_by_id_fkey;
ALTER TABLE IF EXISTS ONLY public.leaderboard_cache DROP CONSTRAINT IF EXISTS leaderboard_cache_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.flashcards DROP CONSTRAINT IF EXISTS flashcards_vocabulary_id_fkey;
ALTER TABLE IF EXISTS ONLY public.flashcards DROP CONSTRAINT IF EXISTS flashcards_deck_id_fkey;
ALTER TABLE IF EXISTS ONLY public.flashcard_reviews DROP CONSTRAINT IF EXISTS flashcard_reviews_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.flashcard_reviews DROP CONSTRAINT IF EXISTS flashcard_reviews_flashcard_id_fkey;
ALTER TABLE IF EXISTS ONLY public.flashcard_decks DROP CONSTRAINT IF EXISTS flashcard_decks_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.daily_streaks DROP CONSTRAINT IF EXISTS daily_streaks_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.attempt_parts DROP CONSTRAINT IF EXISTS attempt_parts_question_id_fkey;
ALTER TABLE IF EXISTS ONLY public.attempt_parts DROP CONSTRAINT IF EXISTS attempt_parts_attempt_id_fkey;
ALTER TABLE IF EXISTS ONLY public.ai_scoring_results DROP CONSTRAINT IF EXISTS ai_scoring_results_attempt_part_id_fkey;
DROP INDEX IF EXISTS public.ix_vocabulary_tags_vocabulary_id;
DROP INDEX IF EXISTS public.ix_vocabulary_tags_tag;
DROP INDEX IF EXISTS public.ix_vocabulary_notes_word;
DROP INDEX IF EXISTS public.ix_vocabulary_notes_user_id;
DROP INDEX IF EXISTS public.ix_users_username;
DROP INDEX IF EXISTS public.ix_users_firebase_uid;
DROP INDEX IF EXISTS public.ix_users_email;
DROP INDEX IF EXISTS public.ix_user_notifications_user_id;
DROP INDEX IF EXISTS public.ix_user_notifications_notification_type;
DROP INDEX IF EXISTS public.ix_user_notifications_is_read;
DROP INDEX IF EXISTS public.ix_user_notifications_created_at;
DROP INDEX IF EXISTS public.ix_user_notifications_category;
DROP INDEX IF EXISTS public.ix_user_notifications_campaign_id;
DROP INDEX IF EXISTS public.ix_user_devices_user_id;
DROP INDEX IF EXISTS public.ix_topics_ielts_part;
DROP INDEX IF EXISTS public.ix_topics_category;
DROP INDEX IF EXISTS public.ix_test_attempts_user_id;
DROP INDEX IF EXISTS public.ix_test_attempts_topic_id;
DROP INDEX IF EXISTS public.ix_test_attempts_status;
DROP INDEX IF EXISTS public.ix_questions_topic_id;
DROP INDEX IF EXISTS public.ix_questions_ielts_part;
DROP INDEX IF EXISTS public.ix_notification_campaigns_notification_type;
DROP INDEX IF EXISTS public.ix_notification_campaigns_category;
DROP INDEX IF EXISTS public.ix_leaderboard_cache_user_id;
DROP INDEX IF EXISTS public.ix_leaderboard_cache_period_type;
DROP INDEX IF EXISTS public.ix_flashcards_deck_id;
DROP INDEX IF EXISTS public.ix_flashcard_reviews_user_id;
DROP INDEX IF EXISTS public.ix_flashcard_reviews_flashcard_id;
DROP INDEX IF EXISTS public.ix_flashcard_decks_user_id;
DROP INDEX IF EXISTS public.ix_daily_streaks_user_id;
DROP INDEX IF EXISTS public.ix_blog_posts_slug;
DROP INDEX IF EXISTS public.ix_blog_posts_is_published;
DROP INDEX IF EXISTS public.ix_blog_posts_category;
DROP INDEX IF EXISTS public.ix_attempt_parts_attempt_id;
ALTER TABLE IF EXISTS ONLY public.vocabulary_tags DROP CONSTRAINT IF EXISTS vocabulary_tags_pkey;
ALTER TABLE IF EXISTS ONLY public.vocabulary_notes DROP CONSTRAINT IF EXISTS vocabulary_notes_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.user_notifications DROP CONSTRAINT IF EXISTS user_notifications_pkey;
ALTER TABLE IF EXISTS ONLY public.user_devices DROP CONSTRAINT IF EXISTS user_devices_pkey;
ALTER TABLE IF EXISTS ONLY public.user_devices DROP CONSTRAINT IF EXISTS user_devices_fcm_token_key;
ALTER TABLE IF EXISTS ONLY public.topics DROP CONSTRAINT IF EXISTS topics_pkey;
ALTER TABLE IF EXISTS ONLY public.test_attempts DROP CONSTRAINT IF EXISTS test_attempts_pkey;
ALTER TABLE IF EXISTS ONLY public.questions DROP CONSTRAINT IF EXISTS questions_pkey;
ALTER TABLE IF EXISTS ONLY public.notification_settings DROP CONSTRAINT IF EXISTS notification_settings_user_id_key;
ALTER TABLE IF EXISTS ONLY public.notification_settings DROP CONSTRAINT IF EXISTS notification_settings_pkey;
ALTER TABLE IF EXISTS ONLY public.notification_campaigns DROP CONSTRAINT IF EXISTS notification_campaigns_pkey;
ALTER TABLE IF EXISTS ONLY public.leaderboard_cache DROP CONSTRAINT IF EXISTS leaderboard_cache_pkey;
ALTER TABLE IF EXISTS ONLY public.flashcards DROP CONSTRAINT IF EXISTS flashcards_pkey;
ALTER TABLE IF EXISTS ONLY public.flashcard_reviews DROP CONSTRAINT IF EXISTS flashcard_reviews_pkey;
ALTER TABLE IF EXISTS ONLY public.flashcard_decks DROP CONSTRAINT IF EXISTS flashcard_decks_pkey;
ALTER TABLE IF EXISTS ONLY public.daily_streaks DROP CONSTRAINT IF EXISTS daily_streaks_pkey;
ALTER TABLE IF EXISTS ONLY public.blog_posts DROP CONSTRAINT IF EXISTS blog_posts_pkey;
ALTER TABLE IF EXISTS ONLY public.attempt_parts DROP CONSTRAINT IF EXISTS attempt_parts_pkey;
ALTER TABLE IF EXISTS ONLY public.ai_scoring_results DROP CONSTRAINT IF EXISTS ai_scoring_results_pkey;
ALTER TABLE IF EXISTS ONLY public.ai_scoring_results DROP CONSTRAINT IF EXISTS ai_scoring_results_attempt_part_id_key;
DROP TABLE IF EXISTS public.vocabulary_tags;
DROP TABLE IF EXISTS public.vocabulary_notes;
DROP TABLE IF EXISTS public.users;
DROP TABLE IF EXISTS public.user_notifications;
DROP TABLE IF EXISTS public.user_devices;
DROP TABLE IF EXISTS public.topics;
DROP TABLE IF EXISTS public.test_attempts;
DROP TABLE IF EXISTS public.questions;
DROP TABLE IF EXISTS public.notification_settings;
DROP TABLE IF EXISTS public.notification_campaigns;
DROP TABLE IF EXISTS public.leaderboard_cache;
DROP TABLE IF EXISTS public.flashcards;
DROP TABLE IF EXISTS public.flashcard_reviews;
DROP TABLE IF EXISTS public.flashcard_decks;
DROP TABLE IF EXISTS public.daily_streaks;
DROP TABLE IF EXISTS public.blog_posts;
DROP TABLE IF EXISTS public.attempt_parts;
DROP TABLE IF EXISTS public.ai_scoring_results;
SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: ai_scoring_results; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_scoring_results (
    id uuid NOT NULL,
    attempt_part_id uuid NOT NULL,
    fluency_band double precision,
    lexical_band double precision,
    grammar_band double precision,
    pronunciation_band double precision,
    overall_band double precision,
    pronunciation_details jsonb,
    feedback jsonb,
    strengths jsonb,
    weaknesses jsonb,
    suggested_improvements jsonb,
    sample_better_answer jsonb,
    grammar_errors jsonb,
    vocabulary_suggestions jsonb,
    raw_llm_response text,
    scored_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: attempt_parts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.attempt_parts (
    id uuid NOT NULL,
    attempt_id uuid NOT NULL,
    question_id uuid,
    audio_url character varying(500),
    transcript text,
    duration_seconds integer,
    part_number integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: blog_posts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.blog_posts (
    id uuid NOT NULL,
    title character varying(500) NOT NULL,
    slug character varying(500) NOT NULL,
    excerpt text,
    content text NOT NULL,
    cover_image_url character varying(1000),
    author_name character varying(255) NOT NULL,
    author_avatar character varying(1000),
    category character varying(50) NOT NULL,
    tags jsonb,
    read_time_minutes integer NOT NULL,
    is_published boolean NOT NULL,
    is_featured boolean NOT NULL,
    view_count integer NOT NULL,
    published_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: daily_streaks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.daily_streaks (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    streak_date date NOT NULL,
    xp_earned integer NOT NULL,
    tests_completed integer NOT NULL,
    words_learned integer NOT NULL,
    study_minutes integer NOT NULL
);


--
-- Name: flashcard_decks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.flashcard_decks (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    is_public boolean NOT NULL,
    card_count integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: flashcard_reviews; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.flashcard_reviews (
    id uuid NOT NULL,
    flashcard_id uuid NOT NULL,
    user_id uuid NOT NULL,
    quality_rating integer NOT NULL,
    easiness_factor double precision NOT NULL,
    interval_days integer NOT NULL,
    repetition_number integer NOT NULL,
    reviewed_at timestamp with time zone DEFAULT now() NOT NULL,
    next_review_at timestamp with time zone
);


--
-- Name: flashcards; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.flashcards (
    id uuid NOT NULL,
    deck_id uuid NOT NULL,
    vocabulary_id uuid,
    front_content text NOT NULL,
    back_content text NOT NULL,
    audio_url character varying(500),
    extra_info jsonb,
    order_index integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: leaderboard_cache; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.leaderboard_cache (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    period_type character varying(20) NOT NULL,
    period_value character varying(20) NOT NULL,
    avg_band_score double precision NOT NULL,
    total_tests integer NOT NULL,
    total_xp integer NOT NULL,
    rank integer NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: notification_campaigns; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notification_campaigns (
    id uuid NOT NULL,
    title character varying(255) NOT NULL,
    body text NOT NULL,
    notification_type character varying(50) NOT NULL,
    category character varying(50),
    audience character varying(50) NOT NULL,
    data jsonb,
    created_by_id uuid,
    total_recipients integer NOT NULL,
    sent_count integer NOT NULL,
    failed_count integer NOT NULL,
    status character varying(30) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    sent_at timestamp with time zone
);


--
-- Name: notification_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notification_settings (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    daily_reminder boolean NOT NULL,
    reminder_time time without time zone NOT NULL,
    new_words_reminder boolean NOT NULL,
    streak_reminder boolean NOT NULL,
    leaderboard_update boolean NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    event_notifications boolean DEFAULT true,
    blog_notifications boolean DEFAULT true,
    forecast_notifications boolean DEFAULT true,
    tips_notifications boolean DEFAULT true,
    news_notifications boolean DEFAULT true
);


--
-- Name: questions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.questions (
    id uuid NOT NULL,
    topic_id uuid NOT NULL,
    question_text text NOT NULL,
    question_text_vi text,
    ielts_part character varying(10) NOT NULL,
    cue_card_content text,
    follow_up_questions jsonb,
    difficulty character varying(20) NOT NULL,
    sample_answer jsonb,
    key_vocabulary jsonb,
    is_active boolean NOT NULL,
    order_index integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: test_attempts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.test_attempts (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    topic_id uuid,
    ielts_part character varying(10) NOT NULL,
    status character varying(20) NOT NULL,
    overall_band double precision,
    fluency_score double precision,
    lexical_score double precision,
    grammar_score double precision,
    pronunciation_score double precision,
    duration_seconds integer,
    xp_earned integer NOT NULL,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    completed_at timestamp with time zone
);


--
-- Name: topics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.topics (
    id uuid NOT NULL,
    title character varying(255) NOT NULL,
    title_vi character varying(255),
    description text,
    category character varying(50) NOT NULL,
    ielts_part character varying(10) NOT NULL,
    difficulty character varying(20) NOT NULL,
    icon character varying(50),
    is_active boolean NOT NULL,
    order_index integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: user_devices; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_devices (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    fcm_token character varying(500) NOT NULL,
    device_type character varying(20) NOT NULL,
    device_name character varying(100),
    last_active_at timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: user_notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_notifications (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    campaign_id uuid,
    title character varying(255) NOT NULL,
    body text NOT NULL,
    notification_type character varying(50) NOT NULL,
    category character varying(50),
    data jsonb,
    is_read boolean NOT NULL,
    read_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid NOT NULL,
    email character varying(255) NOT NULL,
    username character varying(50),
    full_name character varying(255) NOT NULL,
    hashed_password character varying(255),
    avatar_url character varying(500),
    auth_provider character varying(20) NOT NULL,
    firebase_uid character varying(128),
    target_band_score double precision,
    target_exam_date date,
    current_level character varying(20),
    total_xp integer NOT NULL,
    current_streak integer NOT NULL,
    longest_streak integer NOT NULL,
    is_active boolean NOT NULL,
    is_admin boolean NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    goal_target integer,
    goal_start_date date
);


--
-- Name: vocabulary_notes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vocabulary_notes (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    word character varying(100) NOT NULL,
    phonetic character varying(200),
    audio_url character varying(500),
    definitions jsonb,
    examples jsonb,
    user_note text,
    source_context text,
    source_attempt_id uuid,
    mastery_level character varying(20) NOT NULL,
    review_count integer NOT NULL,
    next_review_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: vocabulary_tags; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vocabulary_tags (
    id uuid NOT NULL,
    vocabulary_id uuid NOT NULL,
    tag character varying(50) NOT NULL
);


--
-- Data for Name: ai_scoring_results; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.ai_scoring_results (id, attempt_part_id, fluency_band, lexical_band, grammar_band, pronunciation_band, overall_band, pronunciation_details, feedback, strengths, weaknesses, suggested_improvements, sample_better_answer, grammar_errors, vocabulary_suggestions, raw_llm_response, scored_at) FROM stdin;
b2f712de-17a9-4219-87b4-941e54de0382	ab626ff6-3924-40fc-95f7-37290a3d0bee	0	0	0	0	0	{"error": "Audio file not found"}	{"summary": "Unfortunately, the audio file was not found, so it's impossible to evaluate the candidate's response. The evaluation requires a valid audio file to assess the candidate's speaking skills.", "detailed": "Since the audio file is missing, the candidate's performance in fluency, lexical resource, grammatical range and accuracy, and pronunciation cannot be assessed. Normally, the evaluation would consider factors such as the flow of speech, vocabulary range, sentence structure variety, and clarity of pronunciation to determine the band score. Without the audio file, it's not possible to provide a detailed analysis or identify specific strengths, weaknesses, or areas for improvement."}	[]	["Audio file not found"]	["Ensure that the audio file is properly uploaded and accessible for evaluation"]	{"text": "This section cannot be provided due to the lack of a question transcript.", "explanation": "A sample answer would typically demonstrate strong speaking skills, including clear pronunciation, varied vocabulary, and coherent, well-structured sentences. However, without a specific question or context from the missing audio file, it's not possible to provide a relevant example."}	[]	[]	\N	2026-05-10 17:40:56.499478+00
094a4dff-35c5-4d7a-890e-5281d183d6a0	18d33f72-064f-41b6-ae6f-f9097341caf1	0	0	0	0	0	{"error": "Audio file not found"}	{"summary": "The candidate's response was not assessable due to a technical issue with the audio file.", "detailed": "Unfortunately, the audio file for the candidate's response was not found, which means the response could not be evaluated. In a typical IELTS Speaking part 1, candidates are expected to demonstrate their ability to engage in general conversation, using a range of vocabulary, grammatical structures, and pronunciation skills. Since no audio was available, it's impossible to assess these aspects or provide specific feedback on strengths, weaknesses, or suggested improvements."}	[]	["Unable to assess due to missing audio"]	["Ensure audio files are properly uploaded for evaluation"]	{"text": "In my free time, I enjoy a variety of activities such as reading, hiking, and practicing photography. Each of these hobbies allows me to explore different aspects of my personality and interests. For example, reading helps me expand my vocabulary and knowledge, while hiking lets me appreciate nature's beauty.", "explanation": "This answer demonstrates a clear and engaging response to a general question, showcasing the candidate's vocabulary range, grammatical accuracy, and ability to discuss personal interests coherently."}	[]	[]	\N	2026-05-10 17:40:56.499478+00
1de1101b-ed6d-406a-acb2-3cc74e86c090	9e5489c3-23f3-485e-8644-c2e8132764c0	0	0	0	0	0	{"error": "Audio file not found"}	{"summary": "No audio file was found, so an evaluation cannot be made. The candidate's speaking abilities cannot be assessed.", "detailed": "Since the audio file for the candidate's response is missing, it's impossible to evaluate their fluency, lexical resource, grammatical range and accuracy, or pronunciation. Therefore, no specific feedback can be provided, and the candidate cannot be scored according to the IELTS band descriptors."}	[]	["No audio file available for evaluation"]	["Ensure that all required audio files are uploaded correctly for evaluation"]	{"text": "This section cannot be provided due to the lack of a candidate response.", "explanation": "A sample answer cannot be supplied without knowing the specific question or context of the missing audio file."}	[]	[]	\N	2026-05-10 17:54:52.057848+00
025e4891-64c5-4c4b-83e0-f47f2773221a	568c1d0f-31ef-4b83-ac90-72e2e7cf0190	0	0	0	0	0	{"error": "Audio file not found"}	{"summary": "Unfortunately, due to the absence of an audio file, it's impossible to evaluate the candidate's speaking skills. The assessment requires a spoken response to judge fluency, vocabulary, grammar, and pronunciation.", "detailed": "The lack of an audio file means that the candidate's ability to speak coherently, use a range of vocabulary, construct grammatically correct sentences, and pronounce words clearly cannot be assessed. Normally, the evaluation would consider factors such as the flow of speech, accuracy of grammar, appropriateness of vocabulary, and clarity of pronunciation. However, without a spoken response, these aspects cannot be judged."}	[]	["No audio file provided for assessment"]	["Ensure that all required materials, including audio files, are uploaded correctly for evaluation"]	{"text": "This section cannot be completed without a specific question from the candidate's audio file.", "explanation": "A sample better answer would typically provide a model response that demonstrates strong speaking skills relevant to the question asked. However, without the specific question or context from the missing audio file, it's not possible to provide such an example."}	[]	[]	\N	2026-05-10 17:54:52.057848+00
121b5c4b-c794-4225-8201-3a3db0481d3c	c44c0881-eed3-4b9f-9218-c88ae1eb93ee	0	0	0	0	0	{"error": "Audio file not found"}	{"summary": "Unfortunately, the audio file was not found, so an evaluation could not be performed. The candidate's speaking abilities could not be assessed.", "detailed": "Since the audio file containing the candidate's response was not available, it was impossible to evaluate their fluency, lexical resource, grammatical range and accuracy, or pronunciation. Normally, the evaluation would consider factors such as the flow of speech, vocabulary range, sentence structure variety, and clarity of pronunciation. However, without the audio, no assessment or feedback can be provided."}	[]	["Audio file not available for evaluation"]	["Ensure that the audio file is properly uploaded for evaluation"]	{"text": "This section cannot be provided due to the lack of a candidate response.", "explanation": "A sample answer would typically demonstrate strong fluency, a wide range of vocabulary, varied and accurate sentence structures, and clear pronunciation. However, without the context of the candidate's actual response, a specific example cannot be given."}	[]	[]	\N	2026-05-10 17:54:52.057848+00
ceebe9db-9be4-4a84-9d6c-0faebbe4dc18	4fa1ddaa-a2d3-455f-acd2-9238b7dbd14f	0	0	0	0	0	{"error": "Audio file not found"}	{"summary": "No audio file was found to evaluate the candidate's response. The evaluation criteria for IELTS speaking cannot be applied without an audio recording.", "detailed": "The absence of an audio file means that the candidate's performance in fluency, lexical resource, grammatical range and accuracy, and pronunciation cannot be assessed. To provide a valid evaluation, a recording of the candidate's speech is necessary. This would allow for an analysis of their ability to express ideas coherently, use a range of vocabulary, construct grammatically correct sentences, and speak with clear pronunciation."}	[]	["No audio file provided for evaluation"]	["Ensure that audio files are properly uploaded and accessible for evaluation"]	{"text": "Unfortunately, without a specific question from the provided context, it's challenging to offer a sample answer. Typically, a strong response in IELTS Part 1 would involve clear, fluent speech, a variety of vocabulary, accurate grammar, and good pronunciation.", "explanation": "A better answer would demonstrate the candidate's ability to engage in conversation naturally, showcasing their language skills across all assessment criteria."}	[]	[]	\N	2026-05-10 17:54:52.057848+00
f6613309-5bdf-46c6-bfcb-8d77f80420a3	34a0e2ce-7a70-499c-a88f-52516c74c06d	0	0	0	0	0	{"error": "Exception with error code: \\n[CALL STACK BEGIN]\\n\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xd9bec) [0xffff9e539bec]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xda3dc) [0xffff9e53a3dc]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xd5aa8) [0xffff9e535aa8]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xe11ac) [0xffff9e5411ac]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xe2d08) [0xffff9e542d08]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xd6260) [0xffff9e536260]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x149bcc) [0xffff9e5a9bcc]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x105ff8) [0xffff9e565ff8]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x107104) [0xffff9e567104]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x139760) [0xffff9e599760]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x98770) [0xffff9e4f8770]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x13860c) [0xffff9e59860c]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x90a84) [0xffff9e4f0a84]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(recognizer_create_speech_recognizer_from_config+0x110) [0xffff9e6326c4]\\n/lib/aarch64-linux-gnu/libffi.so.8(+0x6a94) [0xffffa0e66a94]\\n/lib/aarch64-linux-gnu/libffi.so.8(+0x6088) [0xffffa0e66088]\\n/usr/local/lib/python3.11/lib-dynload/_ctypes.cpython-311-aarch64-linux-gnu.so(+0x12360) [0xffffa0ea2360]\\n[CALL STACK END]\\n\\nException with an error code: 0xa (SPXERR_INVALID_HEADER)"}	{"summary": "No speech was provided for evaluation. Therefore, no assessment of fluency, lexical resource, grammatical range and accuracy, or pronunciation can be made.", "detailed": "Since the transcription of the candidate's response failed due to an error and no Pronunciation Assessment Data could be collected, it's impossible to evaluate the candidate's performance across any of the IELTS Speaking assessment criteria. Normally, the evaluation would consider factors such as the flow of speech, vocabulary range, sentence structure variety, and clarity of pronunciation. Without a recorded or transcribed speech sample, no detailed analysis can be provided."}	[]	["No speech sample available for evaluation"]	["Ensure that the speech is recorded clearly", "Check the transcription software for any technical issues", "Practice speaking to improve overall performance"]	{"text": "Unfortunately, without the specific question asked in the IELTS Speaking Part 1, a sample answer cannot be provided. However, a good answer would typically be fluent, use a range of vocabulary, and demonstrate varied and accurate grammatical structures.", "explanation": "A Band 7.5+ level answer would show the candidate's ability to speak clearly and coherently, using appropriate vocabulary and grammar with only occasional minor errors."}	[]	[]	\N	2026-05-10 18:01:36.819651+00
961d3748-5ccf-4f62-9ce2-93cb064d4aa8	f40e1176-c44f-48b0-942f-b76967e779e2	0	0	0	0	0	{"error": "Exception with error code: \\n[CALL STACK BEGIN]\\n\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xd9bec) [0xffff9e539bec]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xda3dc) [0xffff9e53a3dc]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xd5aa8) [0xffff9e535aa8]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xe11ac) [0xffff9e5411ac]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xe2d08) [0xffff9e542d08]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xd6260) [0xffff9e536260]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x149bcc) [0xffff9e5a9bcc]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x105ff8) [0xffff9e565ff8]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x107104) [0xffff9e567104]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x139760) [0xffff9e599760]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x98770) [0xffff9e4f8770]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x13860c) [0xffff9e59860c]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x90a84) [0xffff9e4f0a84]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(recognizer_create_speech_recognizer_from_config+0x110) [0xffff9e6326c4]\\n/lib/aarch64-linux-gnu/libffi.so.8(+0x6a94) [0xffffa0e66a94]\\n/lib/aarch64-linux-gnu/libffi.so.8(+0x6088) [0xffffa0e66088]\\n/usr/local/lib/python3.11/lib-dynload/_ctypes.cpython-311-aarch64-linux-gnu.so(+0x12360) [0xffffa0ea2360]\\n[CALL STACK END]\\n\\nException with an error code: 0xa (SPXERR_INVALID_HEADER)"}	{"summary": "No speech was provided for evaluation. The transcription and pronunciation assessment failed due to technical errors.", "detailed": "Unfortunately, due to transcription and pronunciation assessment errors, it was impossible to evaluate the candidate's speech. The errors included the decommissioning of the speech model used for transcription and an exception with an error code related to invalid headers in the pronunciation assessment. Therefore, no assessment of fluency, lexical resource, grammatical range and accuracy, or pronunciation could be made."}	[]	["Technical issues prevented the evaluation of the candidate's speech"]	["Ensure that the technical equipment and models used for transcription and pronunciation assessment are up-to-date and functioning properly"]	{"text": "", "explanation": ""}	[]	[]	\N	2026-05-10 18:01:36.819651+00
267c7d9d-19fb-4049-a8df-6eda7f9464be	b99bccdf-f49b-4517-b6cb-02951ba2b452	0	0	0	0	0	{"error": "Exception with error code: \\n[CALL STACK BEGIN]\\n\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xd9bec) [0xffff9e539bec]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xda3dc) [0xffff9e53a3dc]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xd5aa8) [0xffff9e535aa8]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xe11ac) [0xffff9e5411ac]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xe2d08) [0xffff9e542d08]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xd6260) [0xffff9e536260]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x149bcc) [0xffff9e5a9bcc]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x105ff8) [0xffff9e565ff8]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x107104) [0xffff9e567104]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x139760) [0xffff9e599760]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x98770) [0xffff9e4f8770]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x13860c) [0xffff9e59860c]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x90a84) [0xffff9e4f0a84]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(recognizer_create_speech_recognizer_from_config+0x110) [0xffff9e6326c4]\\n/lib/aarch64-linux-gnu/libffi.so.8(+0x6a94) [0xffffa0e66a94]\\n/lib/aarch64-linux-gnu/libffi.so.8(+0x6088) [0xffffa0e66088]\\n/usr/local/lib/python3.11/lib-dynload/_ctypes.cpython-311-aarch64-linux-gnu.so(+0x12360) [0xffffa0ea2360]\\n[CALL STACK END]\\n\\nException with an error code: 0xa (SPXERR_INVALID_HEADER)"}	{"summary": "Due to the absence of a transcript, it's impossible to assess the candidate's performance. The evaluation relies on the analysis of spoken language, which is unavailable in this case.", "detailed": "The lack of transcript data means that the candidate's fluency, lexical resource, grammatical range and accuracy, and pronunciation cannot be evaluated. Normally, the assessment would consider factors such as coherence, vocabulary range, sentence structure, and intonation. Without this information, providing specific feedback or suggestions for improvement is not possible."}	[]	["No transcript available for assessment"]	["Provide a clear and audible recording for evaluation"]	{"text": "Unfortunately, a sample answer cannot be provided without knowing the specific question asked.", "explanation": "Sample answers are typically given to illustrate how a candidate could have better addressed the question, but in this case, the question itself is not available."}	[]	[]	\N	2026-05-10 18:01:36.819651+00
ad812911-a315-4b0a-a096-9dba9d312f40	d48e75a0-5fb6-4ab7-acc7-1ef3047e4389	4	3.5	3	2.5	3.5	{"error": "Exception with error code: \\n[CALL STACK BEGIN]\\n\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xd9bec) [0xffff89949bec]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xda3dc) [0xffff8994a3dc]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xd5aa8) [0xffff89945aa8]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xe11ac) [0xffff899511ac]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xe2d08) [0xffff89952d08]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xd6260) [0xffff89946260]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x149bcc) [0xffff899b9bcc]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x105ff8) [0xffff89975ff8]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x107104) [0xffff89977104]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x139760) [0xffff899a9760]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x98770) [0xffff89908770]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x13860c) [0xffff899a860c]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x90a84) [0xffff89900a84]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(recognizer_create_speech_recognizer_from_config+0x110) [0xffff89a426c4]\\n/lib/aarch64-linux-gnu/libffi.so.8(+0x6a94) [0xffff8c276a94]\\n/lib/aarch64-linux-gnu/libffi.so.8(+0x6088) [0xffff8c276088]\\n/usr/local/lib/python3.11/lib-dynload/_ctypes.cpython-311-aarch64-linux-gnu.so(+0x12360) [0xffff8c2b2360]\\n[CALL STACK END]\\n\\nException with an error code: 0xa (SPXERR_INVALID_HEADER)"}	{"summary": "The candidate's response lacks fluency, coherence, and variety in vocabulary and sentence structure, making it difficult to understand at times. However, they attempt to convey their main idea.", "detailed": "The candidate's speech is marked by hesitation and simplistic sentence structures, often relying on basic vocabulary. They struggle with grammatical accuracy and pronunciation, which affects the overall intelligibility of their response. Despite this, they attempt to express their idea, albeit in a straightforward and not fully developed manner."}	["Attempts to convey the main idea", "Uses basic vocabulary correctly", "Shows some willingness to communicate"]	["Lack of fluency and coherence", "Limited vocabulary range", "Pronunciation issues"]	["Practice speaking regularly to improve fluency", "Learn and use more complex vocabulary and sentence structures", "Work on pronunciation to enhance clarity"]	{"text": "To be honest, I spend a significant amount of time scrolling through my phone, particularly on TikTok, where I get to stay updated on current events, trends, and interesting stories. It's become a habit for me to scroll through it as soon as I have some free time.", "explanation": "This answer scores higher because it demonstrates better fluency, a wider range of vocabulary (e.g., 'significant amount of time', 'current events', 'trends'), and more complex sentence structures, all of which contribute to a clearer and more engaging expression of the idea."}	[{"rule": "Incorrect use of 'scroll' which typically means to move through text or images on a screen, not to travel to a location", "original": "To scroll home", "corrected": "When I'm at home or To get home"}, {"rule": "Preposition usage; 'scroll through' is the correct phrase to use when discussing navigating through digital content", "original": "I mainly use my phone for scrolling the TikTok", "corrected": "I mainly use my phone to scroll through TikTok"}]	[{"basic_word": "updated", "better_alternatives": ["informative", "relevant", "up-to-date"]}, {"basic_word": "use it", "better_alternatives": ["utilize it", "take advantage of it", "make the most of it"]}]	\N	2026-05-10 18:08:38.047959+00
4c9a5af5-d9f0-48c7-9899-e8e385ca0c4e	07e9d654-0901-4288-bbf7-3e56ac60613a	4	3.5	3	3	3.5	{"error": "Exception with error code: \\n[CALL STACK BEGIN]\\n\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xd9bec) [0xffff89949bec]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xda3dc) [0xffff8994a3dc]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xd5aa8) [0xffff89945aa8]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xe11ac) [0xffff899511ac]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xe2d08) [0xffff89952d08]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xd6260) [0xffff89946260]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x149bcc) [0xffff899b9bcc]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x105ff8) [0xffff89975ff8]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x107104) [0xffff89977104]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x139760) [0xffff899a9760]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x98770) [0xffff89908770]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x13860c) [0xffff899a860c]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x90a84) [0xffff89900a84]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(recognizer_create_speech_recognizer_from_config+0x110) [0xffff89a426c4]\\n/lib/aarch64-linux-gnu/libffi.so.8(+0x6a94) [0xffff8c276a94]\\n/lib/aarch64-linux-gnu/libffi.so.8(+0x6088) [0xffff8c276088]\\n/usr/local/lib/python3.11/lib-dynload/_ctypes.cpython-311-aarch64-linux-gnu.so(+0x12360) [0xffff8c2b2360]\\n[CALL STACK END]\\n\\nException with an error code: 0xa (SPXERR_INVALID_HEADER)"}	{"summary": "The candidate's response lacks coherence and fluency, with limited vocabulary and grammatical errors. However, the candidate attempts to address the question.", "detailed": "The candidate's speech is often interrupted by hesitation and lacks a clear structure. Vocabulary is basic and repetitive, with 'I use it' being an oversimplified expression. Grammatically, the candidate struggles with sentence formation and verb tense consistency. The pronunciation assessment indicates significant issues, likely impacting overall intelligibility."}	["Attempted to address the question", "Showed some basic vocabulary knowledge"]	["Lack of fluency and coherence", "Limited vocabulary range", "Frequent grammatical errors"]	["Practice speaking continuously on a topic to improve fluency", "Expand vocabulary through reading and listening", "Focus on accurate sentence structure and grammar in responses"]	{"text": "To be honest, I often find myself scrolling through my phone, especially when I'm on TikTok. It's a great way to catch up on current events and trends. I believe it's a common habit among my peers as well.", "explanation": "This answer demonstrates better fluency, uses more precise vocabulary, and exhibits a more coherent structure, all of which contribute to a higher band score."}	[{"rule": "Preposition usage and verb tense consistency", "original": "To scroll home, I mainly use my phone for scrolling the TikTok", "corrected": "To be honest, I mainly use my phone for scrolling through TikTok"}]	[{"basic_word": "use", "better_alternatives": ["utilize", "employ", "leverage"]}]	\N	2026-05-10 18:08:38.047959+00
70145db7-dc60-431a-ba26-6eb9f1074908	0c8e02f1-ad47-4ab2-b19e-af65fae03e10	4	3.5	3	3	3.5	{"error": "Exception with error code: \\n[CALL STACK BEGIN]\\n\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xd9bec) [0xffff89949bec]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xda3dc) [0xffff8994a3dc]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xd5aa8) [0xffff89945aa8]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xe11ac) [0xffff899511ac]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xe2d08) [0xffff89952d08]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xd6260) [0xffff89946260]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x149bcc) [0xffff899b9bcc]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x105ff8) [0xffff89975ff8]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x107104) [0xffff89977104]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x139760) [0xffff899a9760]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x98770) [0xffff89908770]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x13860c) [0xffff899a860c]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x90a84) [0xffff89900a84]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(recognizer_create_speech_recognizer_from_config+0x110) [0xffff89a426c4]\\n/lib/aarch64-linux-gnu/libffi.so.8(+0x6a94) [0xffff8c276a94]\\n/lib/aarch64-linux-gnu/libffi.so.8(+0x6088) [0xffff8c276088]\\n/usr/local/lib/python3.11/lib-dynload/_ctypes.cpython-311-aarch64-linux-gnu.so(+0x12360) [0xffff8c2b2360]\\n[CALL STACK END]\\n\\nException with an error code: 0xa (SPXERR_INVALID_HEADER)"}	{"summary": "The response is limited and lacks clarity, with noticeable grammatical errors and limited vocabulary. The candidate struggles to maintain fluency and coherence throughout the answer.", "detailed": "The candidate's response is short and fails to fully address the question. There is a lack of discourse markers and linking words, making the speech seem disjointed. Vocabulary is basic and not accurately used, with phrases like 'scroll home' and 'get some updated information' that do not clearly convey the intended meaning. Grammatically, the sentence structure is simple and there are noticeable errors, such as missing articles and incorrect verb usage. Pronunciation is also affected, with unclear stress patterns and individual sound production issues, as evident from the provided error code indicating difficulties in speech recognition."}	["The candidate attempts to use the phone as an example.", "There's an effort to provide a personal experience."]	["Limited vocabulary and grammatical range.", "Pronunciation issues hinder intelligibility."]	["Expand answers to fully address the question.", "Practice using a variety of vocabulary and sentence structures.", "Work on improving pronunciation clarity."]	{"text": "For scrolling through my social media feeds at home, I primarily use my phone, especially for TikTok, as it allows me to stay updated with the latest trends and news. I find it quite convenient.", "explanation": "This sample answer scores higher because it clearly and coherently responds to the question, uses more precise vocabulary ('scrolling through', 'latest trends'), and demonstrates better grammatical range and accuracy ('as it allows me')."}	[{"rule": "Preposition usage and phrase correction for clarity.", "original": "To scroll home", "corrected": "For scrolling through my social media feeds at home"}, {"rule": "Correct preposition usage and article omission.", "original": "I mainly use my phone for scrolling the TikTok", "corrected": "I primarily use my phone, especially for TikTok"}]	[{"basic_word": "updated information", "better_alternatives": ["latest news", "current events", "trending topics"]}, {"basic_word": "use it", "better_alternatives": ["utilize it", "make use of it", "take advantage of it"]}]	\N	2026-05-10 18:08:38.047959+00
36248f63-fceb-4e52-8244-bf46f7f445bd	da4a2237-3af7-4228-a948-ee6588a5a3c3	0	0	0	0	0	{"error": "Exception with error code: \\n[CALL STACK BEGIN]\\n\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xd9bec) [0xffff89949bec]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xda3dc) [0xffff8994a3dc]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xd5aa8) [0xffff89945aa8]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xe11ac) [0xffff899511ac]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xe2d08) [0xffff89952d08]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xd6260) [0xffff89946260]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x149bcc) [0xffff899b9bcc]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x105ff8) [0xffff89975ff8]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x107104) [0xffff89977104]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x139760) [0xffff899a9760]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x98770) [0xffff89908770]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x13860c) [0xffff899a860c]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x90a84) [0xffff89900a84]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(recognizer_create_speech_recognizer_from_config+0x110) [0xffff89a426c4]\\n/lib/aarch64-linux-gnu/libffi.so.8(+0x6a94) [0xffff8c276a94]\\n/lib/aarch64-linux-gnu/libffi.so.8(+0x6088) [0xffff8c276088]\\n/usr/local/lib/python3.11/lib-dynload/_ctypes.cpython-311-aarch64-linux-gnu.so(+0x12360) [0xffff8c2b2360]\\n[CALL STACK END]\\n\\nException with an error code: 0xa (SPXERR_INVALID_HEADER)"}	{"summary": "The candidate's response was inadequate, failing to address the question or demonstrate any language skills. The repeated use of 'no' without context does not allow for assessment of fluency, lexical resource, grammatical range and accuracy, or pronunciation.", "detailed": "The candidate's answer, 'No, no, no, no, no,' does not provide any meaningful content to evaluate their language abilities. This response does not meet the basic requirements for IELTS Speaking Part 1, which expects candidates to engage in conversation, provide information, and demonstrate their command of English. Given the lack of actual speech beyond repetition of a negative response, it's impossible to assess fluency, as there's no flow of ideas or use of discourse markers. Similarly, lexical resource, grammatical range and accuracy, and pronunciation cannot be evaluated due to the absence of varied vocabulary, sentence structures, or intelligible speech."}	[]	["Lack of engagement with the question", "Failure to demonstrate any language skills"]	["Practice responding to questions with relevant information", "Develop vocabulary to express opinions and ideas", "Improve pronunciation by practicing clear and intelligible speech"]	{"text": "Well, to be honest, I've had a variety of experiences, but generally, I'd say my days are quite fulfilling. I usually start my morning with some exercise, followed by a good breakfast. Then, I head to work or class. One thing I really enjoy doing in my free time is reading; it helps me unwind and expand my knowledge on different subjects.", "explanation": "This sample answer demonstrates a better level of fluency, lexical resource, grammatical range and accuracy, and pronunciation. The candidate engages with the question, provides personal experiences, and uses a range of vocabulary and sentence structures, making it easier to understand and evaluate their language proficiency."}	[]	[]	\N	2026-05-10 18:11:35.55181+00
86b77ddc-a3db-4d73-9894-ab245d788307	2636d884-31a5-428c-9804-1a5fd3abd216	0	0	0	0	0	{"error": "Exception with error code: \\n[CALL STACK BEGIN]\\n\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xd9bec) [0xffff89949bec]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xda3dc) [0xffff8994a3dc]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xd5aa8) [0xffff89945aa8]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xe11ac) [0xffff899511ac]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xe2d08) [0xffff89952d08]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xd6260) [0xffff89946260]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x149bcc) [0xffff899b9bcc]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x105ff8) [0xffff89975ff8]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x107104) [0xffff89977104]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x139760) [0xffff899a9760]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x98770) [0xffff89908770]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x13860c) [0xffff899a860c]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x90a84) [0xffff89900a84]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(recognizer_create_speech_recognizer_from_config+0x110) [0xffff89a426c4]\\n/lib/aarch64-linux-gnu/libffi.so.8(+0x6a94) [0xffff8c276a94]\\n/lib/aarch64-linux-gnu/libffi.so.8(+0x6088) [0xffff8c276088]\\n/usr/local/lib/python3.11/lib-dynload/_ctypes.cpython-311-aarch64-linux-gnu.so(+0x12360) [0xffff8c2b2360]\\n[CALL STACK END]\\n\\nException with an error code: 0xa (SPXERR_INVALID_HEADER)"}	{"summary": "The candidate's response was extremely limited and did not address the question. It lacked coherence, vocabulary, grammatical structure, and pronunciation clarity.", "detailed": "The candidate's answer, consisting of repeated 'no's, failed to provide any meaningful information or demonstrate language proficiency in any aspect. The response did not exhibit fluency, lacked any lexical resource, did not form coherent sentences, and the pronunciation, though minimal, was not clear or well-defined. This kind of response does not allow for an accurate assessment of the candidate's language skills."}	[]	["Failure to address the question", "Lack of vocabulary", "Inability to form coherent sentences"]	["Respond to the question directly", "Use a variety of vocabulary", "Practice forming complete sentences"]	{"text": "Well, I think that's a really interesting question. Generally, when it comes to general speaking, I believe it's essential to be open-minded and willing to discuss a wide range of topics. This helps not only in understanding different perspectives but also in improving one's communication skills.", "explanation": "This sample answer scores higher because it directly addresses the question, demonstrates a range of vocabulary ('interesting', 'open-minded', 'wide range of topics'), and showcases grammatical accuracy and fluency."}	[{"rule": "Forming a coherent sentence in response to a question", "original": "No, no, no, no, no.", "corrected": "I'm not sure I understand the question."}]	[{"basic_word": "No", "better_alternatives": ["Certainly not", "I disagree", "That's not my view"]}]	\N	2026-05-10 18:11:35.55181+00
3e942f51-3fe8-4475-bbf4-92e54bdf2c9f	4d5cf1b7-a627-41b2-9dc5-a607e360615b	0	0	0	0	0	{"error": "Exception with error code: \\n[CALL STACK BEGIN]\\n\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xd9bec) [0xffff89949bec]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xda3dc) [0xffff8994a3dc]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xd5aa8) [0xffff89945aa8]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xe11ac) [0xffff899511ac]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xe2d08) [0xffff89952d08]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xd6260) [0xffff89946260]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x149bcc) [0xffff899b9bcc]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x105ff8) [0xffff89975ff8]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x107104) [0xffff89977104]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x139760) [0xffff899a9760]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x98770) [0xffff89908770]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x13860c) [0xffff899a860c]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x90a84) [0xffff89900a84]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(recognizer_create_speech_recognizer_from_config+0x110) [0xffff89a426c4]\\n/lib/aarch64-linux-gnu/libffi.so.8(+0x6a94) [0xffff8c276a94]\\n/lib/aarch64-linux-gnu/libffi.so.8(+0x6088) [0xffff8c276088]\\n/usr/local/lib/python3.11/lib-dynload/_ctypes.cpython-311-aarch64-linux-gnu.so(+0x12360) [0xffff8c2b2360]\\n[CALL STACK END]\\n\\nException with an error code: 0xa (SPXERR_INVALID_HEADER)"}	{"summary": "The candidate's response lacks any meaningful content, coherence, or vocabulary, making it unassessable.", "detailed": "The candidate's answer consists solely of 'No' repeated five times, which does not provide any information, show fluency, demonstrate vocabulary, exhibit grammatical structures, or display intelligible pronunciation. This response does not meet the requirements of the IELTS Speaking test in any of the assessment criteria."}	[]	["Lack of content", "Inability to form coherent sentences", "Insufficient vocabulary", "Poor grammatical structure", "Unintelligible pronunciation"]	["Develop a wider range of vocabulary", "Practice forming complex sentences", "Improve pronunciation through practice and feedback", "Engage in conversations to enhance fluency and coherence"]	{"text": "I'm not sure I understand the question. Could you please clarify or give me an example?", "explanation": "This sample answer demonstrates a basic attempt to communicate, seek clarification, and engage with the question, which is more in line with what is expected in the IELTS Speaking test."}	[{"rule": "Using phrases to express uncertainty or seek clarification.", "original": "No", "corrected": "I'm not sure."}]	[{"basic_word": "No", "better_alternatives": ["Certainly not", "I'm afraid not", "Not at all"]}]	\N	2026-05-10 18:11:35.55181+00
82efc0e9-baa1-447e-995b-671641aa3184	51d86d12-6b45-4284-8fc9-709045b037d2	4.5	3.5	3	3	3.5	{"error": "Exception with error code: \\n[CALL STACK BEGIN]\\n\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xd9bec) [0xffff89949bec]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xda3dc) [0xffff8994a3dc]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xd5aa8) [0xffff89945aa8]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xe11ac) [0xffff899511ac]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xe2d08) [0xffff89952d08]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xd6260) [0xffff89946260]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x149bcc) [0xffff899b9bcc]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x105ff8) [0xffff89975ff8]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x107104) [0xffff89977104]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x139760) [0xffff899a9760]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x98770) [0xffff89908770]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x13860c) [0xffff899a860c]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x90a84) [0xffff89900a84]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(recognizer_create_speech_recognizer_from_config+0x110) [0xffff89a426c4]\\n/lib/aarch64-linux-gnu/libffi.so.8(+0x6a94) [0xffff8c276a94]\\n/lib/aarch64-linux-gnu/libffi.so.8(+0x6088) [0xffff8c276088]\\n/usr/local/lib/python3.11/lib-dynload/_ctypes.cpython-311-aarch64-linux-gnu.so(+0x12360) [0xffff8c2b2360]\\n[CALL STACK END]\\n\\nException with an error code: 0xa (SPXERR_INVALID_HEADER)"}	{"summary": "The candidate's response lacks coherence and fluency, with noticeable hesitation and grammatical errors. Despite the efforts to convey a personal experience, the language use is limited and not precise.", "detailed": "The candidate starts with a clear intention to discuss their internet usage but fails to develop the idea further due to limitations in vocabulary and grammatical structures. The speech is marred by hesitations and incorrect sentence formations, which impede the flow of the conversation. Furthermore, the pronunciation, although understandable, shows signs of strain, especially with individual sound production and intonation patterns."}	["Attempt to engage in the conversation", "Willingness to share personal experiences"]	["Limited vocabulary range", "Grammatical inaccuracies and lack of sentence variety"]	["Practice speaking regularly to improve fluency", "Expand vocabulary through reading and listening", "Focus on correcting common grammatical errors"]	{"text": "I must admit, I'm somewhat dependent on the internet. I use it daily, not just for work or study, but also for leisure. For instance, I often start my day by checking the news and my social media accounts. This habit helps me stay updated about what's happening around the world and keeps me connected with friends and family.", "explanation": "This answer scores higher because it demonstrates better coherence and fluency, with a clear and logical structure. The vocabulary is more varied and appropriately used, and the grammar is mostly accurate, contributing to an overall smoother delivery."}	[{"rule": "Correct use of prepositions and adverbs to indicate frequency", "original": "I use the internet every day and every time", "corrected": "I use the internet every day, all the time"}, {"rule": "Correct phrase structure and word order", "original": "in this day-to-day on the things I like", "corrected": "in my daily life, I like to"}]	[{"basic_word": "addicted", "better_alternatives": ["dependent", " hooked"]}, {"basic_word": "start each on", "better_alternatives": ["begin with", "start by"]}]	\N	2026-05-10 18:18:57.789146+00
677dcc5d-7a51-487b-97ad-5d22e488d416	2631f8fd-67b6-4953-9323-9f0cc304271e	4	3.5	3	2.5	3.5	{"error": "Exception with error code: \\n[CALL STACK BEGIN]\\n\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xd9bec) [0xffff89949bec]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xda3dc) [0xffff8994a3dc]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xd5aa8) [0xffff89945aa8]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xe11ac) [0xffff899511ac]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xe2d08) [0xffff89952d08]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xd6260) [0xffff89946260]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x149bcc) [0xffff899b9bcc]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x105ff8) [0xffff89975ff8]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x107104) [0xffff89977104]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x139760) [0xffff899a9760]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x98770) [0xffff89908770]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x13860c) [0xffff899a860c]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x90a84) [0xffff89900a84]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(recognizer_create_speech_recognizer_from_config+0x110) [0xffff89a426c4]\\n/lib/aarch64-linux-gnu/libffi.so.8(+0x6a94) [0xffff8c276a94]\\n/lib/aarch64-linux-gnu/libffi.so.8(+0x6088) [0xffff8c276088]\\n/usr/local/lib/python3.11/lib-dynload/_ctypes.cpython-311-aarch64-linux-gnu.so(+0x12360) [0xffff8c2b2360]\\n[CALL STACK END]\\n\\nException with an error code: 0xa (SPXERR_INVALID_HEADER)"}	{"summary": "The candidate's response lacks coherence and fluency, with noticeable grammatical inaccuracies and limited vocabulary. Pronunciation is also a significant issue, with unclear intonation and stress patterns.", "detailed": "The candidate's attempt to discuss their daily use of the internet is hindered by frequent hesitations, inaccurate sentence structures, and a narrow range of vocabulary. There's an overreliance on basic words and phrases, and the candidate fails to paraphrase or use idiomatic expressions effectively. Pronunciation is marred by an error in the provided assessment data, indicating difficulties with clear speech."}	["The candidate attempts to address the question directly", "There's an effort to use basic discourse markers", "The topic of internet use is relevant to the candidate's life"]	["Lack of fluency and coherence in speech", "Limited and inaccurate use of vocabulary", "Pronunciation issues affecting intelligibility"]	["Practice speaking on everyday topics to improve fluency", "Learn and use more precise vocabulary related to the topic", "Work on pronunciation by listening to and mimicking native speakers"]	{"text": "I'm quite an avid user of the internet, not just for entertainment but also for educational purposes. I find myself browsing through various websites and applications on a daily basis to stay updated on news and trends. Sometimes, I even take notes or download new apps that I think might be useful.", "explanation": "This sample answer scores higher because it displays a better range of vocabulary, more accurate grammar, and a clearer structure. The candidate also provides specific examples and details about their internet use, making the response more engaging and coherent."}	[{"rule": "Correct use of prepositions and verb tenses", "original": "I start each on I start on a bit into the internet", "corrected": "I start every day by going online"}, {"rule": "Proper use of prepositions and phrase structures", "original": "in this day-to-day on the things I like", "corrected": "in my daily life, regarding things I enjoy"}]	[{"basic_word": "like", "better_alternatives": ["enjoy", "am fond of", "appreciate"]}, {"basic_word": "things", "better_alternatives": ["aspects", "activities", "topics"]}]	\N	2026-05-10 18:18:57.789146+00
1792dcc0-fee1-4278-bbc7-88f86fecd20f	4721ea32-7474-450c-8c44-10be481a9bbc	5	4.5	4	4	4.5	{"error": "Exception with error code: \\n[CALL STACK BEGIN]\\n\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xd9bec) [0xffff89949bec]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xda3dc) [0xffff8994a3dc]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xd5aa8) [0xffff89945aa8]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xe11ac) [0xffff899511ac]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xe2d08) [0xffff89952d08]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xd6260) [0xffff89946260]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x149bcc) [0xffff899b9bcc]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x105ff8) [0xffff89975ff8]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x107104) [0xffff89977104]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x139760) [0xffff899a9760]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x98770) [0xffff89908770]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x13860c) [0xffff899a860c]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x90a84) [0xffff89900a84]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(recognizer_create_speech_recognizer_from_config+0x110) [0xffff89a426c4]\\n/lib/aarch64-linux-gnu/libffi.so.8(+0x6a94) [0xffff8c276a94]\\n/lib/aarch64-linux-gnu/libffi.so.8(+0x6088) [0xffff8c276088]\\n/usr/local/lib/python3.11/lib-dynload/_ctypes.cpython-311-aarch64-linux-gnu.so(+0x12360) [0xffff8c2b2360]\\n[CALL STACK END]\\n\\nException with an error code: 0xa (SPXERR_INVALID_HEADER)"}	{"summary": "The candidate's response demonstrates some ability to communicate their ideas but lacks clarity, coherence, and grammatical accuracy. Improvement in pronunciation and vocabulary usage is also necessary.", "detailed": "The candidate's speech is marred by hesitation, lack of discourse markers, and simplistic sentence structures. There's an over-reliance on basic vocabulary and noticeable errors in grammar and pronunciation. However, the candidate attempts to convey their thoughts on internet usage, which is relevant to the question. With more practice and attention to linguistic aspects, the candidate can enhance their speaking skills."}	["Attempt to engage with the topic", "Basic vocabulary usage", "Trying to convey personal experiences"]	["Lack of coherence and fluency", " Limited vocabulary range and precision", "Noticeable grammatical and pronunciation errors"]	["Practice speaking regularly to improve fluency and coherence", "Expand vocabulary by learning synonyms, antonyms, and collocations", "Focus on accurate pronunciation of individual sounds and intonation patterns"]	{"text": "I must admit, I'm somewhat addicted to the internet. Every day, I find myself checking my phone for updates on social media, news, and emails. I also use it to take notes and explore new applications, which I think is really helpful for staying organized and learning new things.", "explanation": "This sample answer scores higher because it demonstrates better fluency, coherence, and grammatical accuracy. The vocabulary used is more precise and varied, and the sentence structure is more complex, enhancing overall clarity and effectiveness."}	[{"rule": "Correct use of prepositions and verb tenses for coherent expression", "original": "I start each on I start on a bit into the internet into my phone", "corrected": "I start every day by checking my phone and going online"}]	[{"basic_word": "like", "better_alternatives": ["for instance", "such as", "including"]}, {"basic_word": "things", "better_alternatives": ["applications", "tools", "resources"]}]	\N	2026-05-10 18:18:57.789146+00
71af8462-27bf-42dd-9862-10933dcce67f	c3167eb7-abc0-40e6-94e7-f8a6c02f9f0c	4	3.5	3	3	3.5	{"error": "Exception with error code: \\n[CALL STACK BEGIN]\\n\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xd9bec) [0xffff89949bec]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xda3dc) [0xffff8994a3dc]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xd5aa8) [0xffff89945aa8]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xe11ac) [0xffff899511ac]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xe2d08) [0xffff89952d08]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xd6260) [0xffff89946260]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x149bcc) [0xffff899b9bcc]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x105ff8) [0xffff89975ff8]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x107104) [0xffff89977104]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x139760) [0xffff899a9760]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x98770) [0xffff89908770]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x13860c) [0xffff899a860c]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x90a84) [0xffff89900a84]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(recognizer_create_speech_recognizer_from_config+0x110) [0xffff89a426c4]\\n/lib/aarch64-linux-gnu/libffi.so.8(+0x6a94) [0xffff8c276a94]\\n/lib/aarch64-linux-gnu/libffi.so.8(+0x6088) [0xffff8c276088]\\n/usr/local/lib/python3.11/lib-dynload/_ctypes.cpython-311-aarch64-linux-gnu.so(+0x12360) [0xffff8c2b2360]\\n[CALL STACK END]\\n\\nException with an error code: 0xa (SPXERR_INVALID_HEADER)"}	{"summary": "The candidate's response lacks clarity and coherence, with noticeable difficulties in pronunciation and grammatical accuracy. However, there is an attempt to engage with the topic.", "detailed": "The candidate's speech is marked by hesitation and lacks a clear flow of ideas. The use of vocabulary is basic and often imprecise, with limited ability to paraphrase or use idiomatic expressions. Grammatically, the response is simple and contains frequent errors, affecting overall intelligibility. Pronunciation is also impacted by difficulties with individual sound production and intonation patterns."}	["Attempt to answer the question", "Basic vocabulary usage", "Willingness to discuss the topic"]	["Lack of fluency and coherence", "Limited vocabulary range and precision", "Frequent grammatical errors"]	["Practice speaking on various topics to improve fluency", "Expand vocabulary through reading and listening", "Focus on grammatical accuracy and sentence structure variety"]	{"text": "I'm quite dependent on the internet these days. I use it daily for a variety of purposes, from checking my emails and social media to researching topics of interest and downloading new apps. It's become an integral part of my daily routine, and I find it hard to imagine life without it.", "explanation": "This sample answer scores higher because it demonstrates better fluency, uses more precise vocabulary, and exhibits more complex and accurate sentence structures."}	[{"rule": "Correct use of prepositions and tenses", "original": "I use the internet every day and every time", "corrected": "I use the internet every day, all the time"}, {"rule": "Correct phrase structure and preposition usage", "original": "in this day-to-day on the things I like", "corrected": "in my daily life for things I like"}]	[{"basic_word": "addicted", "better_alternatives": ["dependent", "reliant"]}, {"basic_word": "new applications", "better_alternatives": ["latest apps", "recent software releases"]}]	\N	2026-05-10 18:18:57.789146+00
1ed61018-8aa7-43ec-ba31-b78c66063f0c	be752421-a716-4b3b-95e8-fecb12751891	4	3.5	3	3	3.5	{"error": "Exception with error code: \\n[CALL STACK BEGIN]\\n\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xd9bec) [0xffff89949bec]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xda3dc) [0xffff8994a3dc]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xd5aa8) [0xffff89945aa8]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xe11ac) [0xffff899511ac]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xe2d08) [0xffff89952d08]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xd6260) [0xffff89946260]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x149bcc) [0xffff899b9bcc]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x105ff8) [0xffff89975ff8]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x107104) [0xffff89977104]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x139760) [0xffff899a9760]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x98770) [0xffff89908770]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x13860c) [0xffff899a860c]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x90a84) [0xffff89900a84]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(recognizer_create_speech_recognizer_from_config+0x110) [0xffff89a426c4]\\n/lib/aarch64-linux-gnu/libffi.so.8(+0x6a94) [0xffff8c276a94]\\n/lib/aarch64-linux-gnu/libffi.so.8(+0x6088) [0xffff8c276088]\\n/usr/local/lib/python3.11/lib-dynload/_ctypes.cpython-311-aarch64-linux-gnu.so(+0x12360) [0xffff8c2b2360]\\n[CALL STACK END]\\n\\nException with an error code: 0xa (SPXERR_INVALID_HEADER)"}	{"summary": "The candidate's response lacks coherence and fluency, with noticeable grammatical errors and limited vocabulary. Despite some attempts to express ideas, the response is hindered by pronunciation issues and an inability to fully develop thoughts.", "detailed": "The candidate starts with a straightforward opinion but fails to elaborately support it with examples or logical reasoning. The speech is marred by hesitations, incorrect word choices, and grammatical inaccuracies, which significantly detract from the overall intelligibility and clarity of the message. Furthermore, the pronunciation assessment data indicates technical issues, suggesting difficulties in speech recognition, which may not accurately reflect the candidate's pronunciation abilities. However, based on the provided transcript, it's clear that the candidate struggles with smooth delivery and accurate pronunciation of certain sounds."}	["Attempts to provide an opinion on the topic", "Recognizes the impact of technology on lives"]	["Lack of fluency and coherence in speech", "Limited vocabulary range and frequent grammatical errors"]	["Practice speaking on various topics to improve fluency and coherence", "Expand vocabulary through reading and listening to English materials", "Focus on correct grammar and sentence structure in speech"]	{"text": "I firmly believe that technology has revolutionized our way of life. For instance, with the advent of AI, we have access to an immense amount of knowledge at our fingertips. This not only enhances our learning capabilities but also facilitates instant communication with people worldwide, thereby bridging geographical gaps. However, it's crucial to strike a balance between technological advancements and traditional research methods to ensure a comprehensive understanding of subjects.", "explanation": "This sample answer demonstrates a clear opinion supported by examples, showcases a broader range of vocabulary, and exhibits better grammatical accuracy and fluency, all of which contribute to a higher band score."}	[{"rule": "Subject-verb agreement and tense consistency", "original": "in this AI era, AI will help people improve their lives", "corrected": "in this era of AI, AI is helping people improve their lives"}, {"rule": "Correct use of verbs and prepositions", "original": "They get the knowledge fully and immediately", "corrected": "They can access knowledge fully and immediately"}]	[{"basic_word": "era", "better_alternatives": ["age", "period", "timeframe"]}, {"basic_word": "improve", "better_alternatives": ["enhance", "advance", "refine"]}]	\N	2026-05-10 18:36:33.364444+00
37addbe0-c7d1-4167-b528-24e366fc300a	6195f0a4-48b6-425c-b6bd-4ecc6d3d7b50	4	3.5	3	4	3.5	{"error": "Exception with error code: \\n[CALL STACK BEGIN]\\n\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xd9bec) [0xffff89949bec]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xda3dc) [0xffff8994a3dc]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xd5aa8) [0xffff89945aa8]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xe11ac) [0xffff899511ac]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xe2d08) [0xffff89952d08]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xd6260) [0xffff89946260]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x149bcc) [0xffff899b9bcc]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x105ff8) [0xffff89975ff8]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x107104) [0xffff89977104]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x139760) [0xffff899a9760]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x98770) [0xffff89908770]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x13860c) [0xffff899a860c]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x90a84) [0xffff89900a84]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(recognizer_create_speech_recognizer_from_config+0x110) [0xffff89a426c4]\\n/lib/aarch64-linux-gnu/libffi.so.8(+0x6a94) [0xffff8c276a94]\\n/lib/aarch64-linux-gnu/libffi.so.8(+0x6088) [0xffff8c276088]\\n/usr/local/lib/python3.11/lib-dynload/_ctypes.cpython-311-aarch64-linux-gnu.so(+0x12360) [0xffff8c2b2360]\\n[CALL STACK END]\\n\\nException with an error code: 0xa (SPXERR_INVALID_HEADER)"}	{"summary": "The candidate's response shows some understanding of the topic but lacks coherence and precision in vocabulary. Fluency is somewhat affected by hesitation patterns.", "detailed": "The candidate attempts to address the question of how technology has improved lives but struggles to articulate their thoughts clearly. There is a noticeable lack of discourse markers and linking phrases, leading to disjointed ideas. Vocabulary is basic and lacks variety, with the candidate relying on simple words and phrases. Grammatically, the response contains several errors, including incomplete sentences and improper use of tenses. Pronunciation is generally clear, but there are instances of mispronunciation and awkward stress patterns, which slightly impede intelligibility."}	["The candidate attempts to provide a positive perspective on technology.", "There is a basic structure to the response, starting with an opinion."]	["Lack of coherence and linking of ideas.", "Limited vocabulary and grammatical accuracy."]	["Practice using discourse markers to link ideas.", "Expand vocabulary range through reading and learning new words.", "Focus on improving grammatical accuracy by practicing sentence construction."]	{"text": "I firmly believe that technology has significantly enhanced our lives, particularly in this AI-driven era. For instance, access to information has become incredibly swift and efficient, allowing us to make informed decisions more quickly than ever before. Furthermore, technological advancements in healthcare have led to better patient outcomes and more personalized care. While there are concerns about over-reliance on technology, the benefits, in my opinion, outweigh the drawbacks.", "explanation": "This answer demonstrates a clearer and more coherent structure, utilizes a wider range of vocabulary, and exhibits better grammatical accuracy. It also provides specific examples to support the opinion, making the argument more convincing."}	[{"rule": "Avoid redundant phrases.", "original": "in this era, in this AI era", "corrected": "in this AI era"}, {"rule": "Subject-verb agreement and tense consistency.", "original": "AI will help people improve their lives", "corrected": "AI helps people improve their lives"}, {"rule": "Use of appropriate prepositions and phrasal verbs.", "original": "they get the knowledge fully and immediately", "corrected": "they can access knowledge fully and immediately"}]	[{"basic_word": "improved", "better_alternatives": ["enhanced", "revolutionized"]}, {"basic_word": "get", "better_alternatives": ["access", "obtain"]}, {"basic_word": "era", "better_alternatives": ["age", "period"]}]	\N	2026-05-10 18:36:33.364444+00
66864916-9f96-4e65-b6a8-80c3a362f5dd	b34744bd-7f25-449c-90e0-3650b32497fd	4	3.5	4	3	3.5	{"error": "Exception with error code: \\n[CALL STACK BEGIN]\\n\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xd9bec) [0xffff975e9bec]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xda3dc) [0xffff975ea3dc]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xd5aa8) [0xffff975e5aa8]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xe11ac) [0xffff975f11ac]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xe2d08) [0xffff975f2d08]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xd6260) [0xffff975e6260]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x149bcc) [0xffff97659bcc]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x105ff8) [0xffff97615ff8]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x107104) [0xffff97617104]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x139760) [0xffff97649760]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x98770) [0xffff975a8770]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x13860c) [0xffff9764860c]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x90a84) [0xffff975a0a84]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(recognizer_create_speech_recognizer_from_config+0x110) [0xffff976e26c4]\\n/lib/aarch64-linux-gnu/libffi.so.8(+0x6a94) [0xffff99f16a94]\\n/lib/aarch64-linux-gnu/libffi.so.8(+0x6088) [0xffff99f16088]\\n/usr/local/lib/python3.11/lib-dynload/_ctypes.cpython-311-aarch64-linux-gnu.so(+0x12360) [0xffff99f52360]\\n[CALL STACK END]\\n\\nException with an error code: 0xa (SPXERR_INVALID_HEADER)"}	{"summary": "The candidate's response demonstrates limited ability in fluency, vocabulary, grammar, and pronunciation. There is a clear need for improvement in all areas to achieve a higher band score.", "detailed": "The candidate's speech is hesitant and lacks coherence, with noticeable pauses and self-corrections. Vocabulary is basic and lacks variety, with no evidence of idiomatic expressions or collocations. Grammar is simple and sometimes inaccurate, with limited sentence structure. Pronunciation is affected by an error, as indicated by the technical issue, which makes it difficult to assess accurately."}	["willingness to learn"]	["limited vocabulary", "hesitant speech", "technical issues with pronunciation assessment"]	["practicing fluent speech", "expanding vocabulary range", "working on pronunciation clarity"]	{"text": "In my free time, I'm keen on acquiring new skills, such as learning a new language or exploring different hobbies. This not only broadens my horizons but also keeps me engaged and motivated.", "explanation": "This sample answer demonstrates a higher level of fluency, vocabulary range, and grammatical accuracy, making it more coherent and engaging."}	[{"rule": "Correct use of verb 'like to' for expressing preferences", "original": "In my free time, I also use", "corrected": "In my free time, I also like to"}, {"rule": "Using 'would like to' for polite expressions of desire", "original": "I want to", "corrected": "I'd like to"}]	[{"basic_word": "learn", "better_alternatives": ["acquire", "develop", "master"]}, {"basic_word": "something new", "better_alternatives": ["a new skill", "a hobby", "a language"]}]	\N	2026-05-10 18:46:39.014183+00
e41850a6-722a-4e12-8127-42a92766e53b	a9011a01-9c5a-4415-8b44-2cb17f660c9b	4	3	3	3	3	{"error": "Exception with error code: \\n[CALL STACK BEGIN]\\n\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xd9bec) [0xffff975e9bec]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xda3dc) [0xffff975ea3dc]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xd5aa8) [0xffff975e5aa8]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xe11ac) [0xffff975f11ac]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xe2d08) [0xffff975f2d08]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xd6260) [0xffff975e6260]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x149bcc) [0xffff97659bcc]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x105ff8) [0xffff97615ff8]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x107104) [0xffff97617104]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x139760) [0xffff97649760]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x98770) [0xffff975a8770]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x13860c) [0xffff9764860c]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x90a84) [0xffff975a0a84]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(recognizer_create_speech_recognizer_from_config+0x110) [0xffff976e26c4]\\n/lib/aarch64-linux-gnu/libffi.so.8(+0x6a94) [0xffff99f16a94]\\n/lib/aarch64-linux-gnu/libffi.so.8(+0x6088) [0xffff99f16088]\\n/usr/local/lib/python3.11/lib-dynload/_ctypes.cpython-311-aarch64-linux-gnu.so(+0x12360) [0xffff99f52360]\\n[CALL STACK END]\\n\\nException with an error code: 0xa (SPXERR_INVALID_HEADER)"}	{"summary": "The candidate's response shows limited ability in all areas, with noticeable struggles in fluency, vocabulary, grammar, and pronunciation. The response lacks coherence and contains errors.", "detailed": "The candidate's answer is brief and lacks detail, with an inability to sustain speech on the topic. Vocabulary is basic, grammatical structures are simple and sometimes incorrect, and pronunciation is affected by errors in individual sounds and intonation patterns, making it sometimes difficult to understand. The candidate seems to hesitate and correct themselves multiple times, indicating difficulties in finding the right words or structures to express their ideas."}	["Willingness to attempt a response", "Basic understanding of the question"]	["Lack of fluency and coherence", "Limited vocabulary and grammatical range"]	["Practice speaking on various topics to improve fluency", "Expand vocabulary through reading and listening to English media", "Focus on correcting common grammatical errors and practicing pronunciation"]	{"text": "In my free time, I'm quite keen on learning something new. I believe it's essential to keep challenging ourselves and broadening our horizons. Whether it's picking up a new language, reading about history, or even learning how to cook a new dish, I find it all fascinating.", "explanation": "This answer scores higher because it demonstrates better fluency, uses more varied and accurate vocabulary, and exhibits more complex and accurate grammatical structures. The ideas are also more coherent and well-connected, showing an ability to sustain speech on the topic."}	[{"rule": "Correct use of prepositional phrases to indicate time", "original": "I want to... In free time", "corrected": "In my free time, I want to..."}, {"rule": "Providing more detail to support the idea", "original": "learn something new", "corrected": "learn something new, such as a language or a skill"}]	[{"basic_word": "learn", "better_alternatives": ["acquire", "pick up", "master"]}, {"basic_word": "new", "better_alternatives": ["novel", "innovative", "fresh"]}]	\N	2026-05-10 18:46:39.014183+00
376f6722-6e9b-41d8-b760-9e8f36d7403c	0abd5262-aca1-41ae-ae4c-c30a2687893b	2	2	2	2	2	{"error": "Exception with error code: \\n[CALL STACK BEGIN]\\n\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xd9bec) [0xffff975e9bec]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xda3dc) [0xffff975ea3dc]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xd5aa8) [0xffff975e5aa8]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xe11ac) [0xffff975f11ac]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xe2d08) [0xffff975f2d08]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xd6260) [0xffff975e6260]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x149bcc) [0xffff97659bcc]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x105ff8) [0xffff97615ff8]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x107104) [0xffff97617104]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x139760) [0xffff97649760]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x98770) [0xffff975a8770]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x13860c) [0xffff9764860c]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x90a84) [0xffff975a0a84]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(recognizer_create_speech_recognizer_from_config+0x110) [0xffff976e26c4]\\n/lib/aarch64-linux-gnu/libffi.so.8(+0x6a94) [0xffff99f16a94]\\n/lib/aarch64-linux-gnu/libffi.so.8(+0x6088) [0xffff99f16088]\\n/usr/local/lib/python3.11/lib-dynload/_ctypes.cpython-311-aarch64-linux-gnu.so(+0x12360) [0xffff99f52360]\\n[CALL STACK END]\\n\\nException with an error code: 0xa (SPXERR_INVALID_HEADER)"}	{"summary": "The candidate's response lacks coherence, vocabulary, and grammatical accuracy, resulting in a low overall score.", "detailed": "The candidate's response, 'I have found new internet in my free time,' does not adequately address the question of how often they use the internet. The sentence structure is simple and lacks variety, with no clear indication of frequency or duration of internet use. Additionally, the pronunciation assessment data indicates technical issues, but based on the provided transcript, the pronunciation is not fluent or clear."}	[]	["Lack of coherence", "Limited vocabulary", "Poor grammatical accuracy"]	["Practice speaking about daily habits and routines", "Expand vocabulary related to technology and internet use", "Focus on improving sentence structure and grammatical accuracy"]	{"text": "I use the internet quite frequently, almost every day. I usually check my emails and social media in the morning, and then I might do some online shopping or watch videos in my free time.", "explanation": "This answer scores higher because it directly addresses the question, uses more varied and accurate sentence structures, and includes relevant vocabulary related to internet use."}	[{"rule": "Using the correct verb tense and phrase to express frequency", "original": "I have found new internet", "corrected": "I often use the internet"}]	[{"basic_word": "new", "better_alternatives": ["frequently", "regularly", "daily"]}, {"basic_word": "found", "better_alternatives": ["use", "access", "utilize"]}]	\N	2026-05-10 19:32:36.930455+00
a8284cab-fa57-4aef-be25-cb860bb26646	c05ff749-c7e7-4360-aa55-941a37b31c89	7	7.5	7	5	6.5	{"error": "Exception with error code: \\n[CALL STACK BEGIN]\\n\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xd9bec) [0xffffb5529bec]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xda3dc) [0xffffb552a3dc]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xd5aa8) [0xffffb5525aa8]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xe11ac) [0xffffb55311ac]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xe2d08) [0xffffb5532d08]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xd6260) [0xffffb5526260]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x149bcc) [0xffffb5599bcc]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x105ff8) [0xffffb5555ff8]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x107104) [0xffffb5557104]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x139760) [0xffffb5589760]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x98770) [0xffffb54e8770]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x13860c) [0xffffb558860c]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x90a84) [0xffffb54e0a84]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(recognizer_create_speech_recognizer_from_config+0x110) [0xffffb56226c4]\\n/lib/aarch64-linux-gnu/libffi.so.8(+0x6a94) [0xffffb7f56a94]\\n/lib/aarch64-linux-gnu/libffi.so.8(+0x6088) [0xffffb7f56088]\\n/usr/local/lib/python3.11/lib-dynload/_ctypes.cpython-311-aarch64-linux-gnu.so(+0x12360) [0xffffb7f92360]\\n[CALL STACK END]\\n\\nException with an error code: 0xa (SPXERR_INVALID_HEADER)"}	{"summary": "The candidate provides a unique and coherent response, showcasing a good range of vocabulary and grammatical structures. However, the pronunciation assessment data indicates significant issues, with an error code suggesting problems in recognizing speech patterns, which would severely impact overall intelligibility and fluency.", "detailed": "The candidate's ability to engage in discourse and provide a logical flow of ideas is commendable, especially in a part of the test where personal experiences are typically shared. The use of phrases like 'if I were choosing' and 'things like' demonstrates an attempt at complex discourse management and vocabulary usage. The sentence structure, while not overly complex, is mostly accurate, with no glaring grammatical errors that impede understanding. However, the major concern lies in the pronunciation, where despite the candidate's language ability, the technology used was unable to process the speech correctly, indicating potential significant issues with clarity, intonation, or individual sound production that are not directly assessable from the provided transcript alone."}	["Unique and coherent response", "Good range of vocabulary", "Attempt at complex discourse management"]	["Pronunciation issues as indicated by error code", "Lack of personal experiences in response"]	["Practice speaking to improve pronunciation clarity and fluency", "Prepare to discuss personal experiences and hobbies", "Enhance sentence structure complexity for higher band scores"]	{"text": "In my free time, I enjoy reading books on history and science. I find it fascinating how different disciplines can influence each other, leading to new ideas and perspectives. Additionally, I appreciate engaging in conversations about these topics, as they not only broaden my knowledge but also help me understand how others perceive the world.", "explanation": "This sample answer scores higher because it directly addresses the question with personal experiences, demonstrates a clear interest, and shows a capacity for complex thought and conversation, all while maintaining good fluency and grammatical accuracy."}	[{"rule": "Quantifier usage for abstract nouns", "original": "I don't have free time or personal experiences", "corrected": "I don't have much free time or many personal experiences to draw upon"}]	[{"basic_word": "learning", "better_alternatives": ["self-study", "academic pursuits"]}, {"basic_word": "helping", "better_alternatives": ["contributing to", "assisting with"]}]	\N	2026-05-11 07:07:52.435173+00
6e18161f-3abf-4fb0-8b79-2f298ccb7788	fda53b06-8566-41b6-9a1f-9477eb0cae1c	6	6.5	6	5	6	{"error": "Exception with error code: \\n[CALL STACK BEGIN]\\n\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xd9bec) [0xffffb5529bec]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xda3dc) [0xffffb552a3dc]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xd5aa8) [0xffffb5525aa8]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xe11ac) [0xffffb55311ac]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xe2d08) [0xffffb5532d08]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xd6260) [0xffffb5526260]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x149bcc) [0xffffb5599bcc]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x105ff8) [0xffffb5555ff8]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x107104) [0xffffb5557104]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x139760) [0xffffb5589760]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x98770) [0xffffb54e8770]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x13860c) [0xffffb558860c]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x90a84) [0xffffb54e0a84]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(recognizer_create_speech_recognizer_from_config+0x110) [0xffffb56226c4]\\n/lib/aarch64-linux-gnu/libffi.so.8(+0x6a94) [0xffffb7f56a94]\\n/lib/aarch64-linux-gnu/libffi.so.8(+0x6088) [0xffffb7f56088]\\n/usr/local/lib/python3.11/lib-dynload/_ctypes.cpython-311-aarch64-linux-gnu.so(+0x12360) [0xffffb7f92360]\\n[CALL STACK END]\\n\\nException with an error code: 0xa (SPXERR_INVALID_HEADER)"}	{"summary": "The candidate demonstrates a reasonable ability to engage in conversation and convey ideas, albeit with noticeable limitations in fluency and pronunciation. Vocabulary and grammar show potential but lack refinement.", "detailed": "The candidate's response indicates an effort to engage with the topic, discussing preferences for activities that involve learning and conversation. However, the speech is marred by hesitation and a somewhat stilted delivery, which affects fluency. The vocabulary range is somewhat limited but includes commendable attempts at using more complex words like 'problem solving' and 'across different fields.' Grammar is generally accurate but could benefit from more variety in sentence structure. Pronunciation is hindered by technical issues, making it difficult to assess natural speech patterns accurately."}	["Attempts to use complex vocabulary", "Engages with the topic", "shows potential for grammatical accuracy"]	["Limited fluency due to hesitation", "Pronunciation assessment is compromised due to technical issues", "Lack of variety in sentence structure"]	["Practice speaking to improve fluency and reduce hesitation", "Work on pronunciation by listening to and mimicking native speakers", "Expand vocabulary range and use more nuanced expressions"]	{"text": "I believe I'd prefer spending my free time with others, as it offers a dynamic environment that fosters learning and personal growth. Engaging in conversations with people from diverse backgrounds can be incredibly enriching, allowing one to broaden their perspectives and gain insights into different cultures and ways of thinking.", "explanation": "This sample answer scores higher because it demonstrates a smoother flow of ideas, more precise vocabulary, and a better range of grammatical structures, all of which contribute to a more engaging and coherent response."}	[{"rule": "Use of more idiomatic expressions for better coherence", "original": "I don't have free time or personal experiences", "corrected": "I don't really have much free time for personal experiences"}]	[{"basic_word": "things", "better_alternatives": ["activities", "pursuits", "hobbies"]}]	\N	2026-05-11 07:07:52.435173+00
ebfb547a-3d34-4993-8bbc-aed142f154b9	8a973016-543e-42c0-b416-6ce296bde534	6.5	7	6	5.5	6	{"error": "Exception with error code: \\n[CALL STACK BEGIN]\\n\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xd9bec) [0xffffb5529bec]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xda3dc) [0xffffb552a3dc]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xd5aa8) [0xffffb5525aa8]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xe11ac) [0xffffb55311ac]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xe2d08) [0xffffb5532d08]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xd6260) [0xffffb5526260]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x149bcc) [0xffffb5599bcc]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x105ff8) [0xffffb5555ff8]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x107104) [0xffffb5557104]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x139760) [0xffffb5589760]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x98770) [0xffffb54e8770]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x13860c) [0xffffb558860c]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x90a84) [0xffffb54e0a84]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(recognizer_create_speech_recognizer_from_config+0x110) [0xffffb56226c4]\\n/lib/aarch64-linux-gnu/libffi.so.8(+0x6a94) [0xffffb7f56a94]\\n/lib/aarch64-linux-gnu/libffi.so.8(+0x6088) [0xffffb7f56088]\\n/usr/local/lib/python3.11/lib-dynload/_ctypes.cpython-311-aarch64-linux-gnu.so(+0x12360) [0xffffb7f92360]\\n[CALL STACK END]\\n\\nException with an error code: 0xa (SPXERR_INVALID_HEADER)"}	{"summary": "The candidate demonstrates a good command of vocabulary but struggles with fluency and pronunciation. The flow of speech is sometimes interrupted by hesitation, and individual sound production is not always clear. Grammatical range and accuracy are generally satisfactory, but there are some noticeable errors.", "detailed": "The response begins well, with the candidate discussing their preference for activities involving learning, problem-solving, and conversation. However, the speech lacks cohesion at times, and there are noticeable pauses and filler words. The vocabulary used is diverse and precise, with phrases such as 'reading across different fields' showing a good range. Nevertheless, the pronunciation assessment data indicates significant issues, including an error code related to speech recognition, suggesting difficulties with accent, intonation, or sound production that impede understanding. The sentence structure is mostly simple or compound, with some evidence of complex sentences, but there are grammatical errors that detract from the overall effectiveness of the communication."}	["Good vocabulary range and precision", "Ability to discuss personal experiences and interests", "Some evidence of complex sentence structures"]	["Hesitation and lack of fluency", "Pronunciation issues that affect intelligibility", "Noticeable grammatical errors"]	["Practice speaking regularly to improve fluency and reduce hesitation", "Focus on improving pronunciation by listening to and mimicking native speakers", "Study and practice more complex grammatical structures to enhance accuracy and variety"]	{"text": "Actually, my hobbies have evolved significantly since childhood. While I used to enjoy more physical activities like cycling and swimming, nowadays I find myself gravitating towards intellectually stimulating pursuits such as reading across various disciplines, engaging in debates, and solving puzzles. This shift reflects my growing interest in learning and personal development.", "explanation": "This sample answer scores higher because it demonstrates a smoother flow of speech, more varied and accurate grammar, and a clearer, more cohesive structure. The vocabulary is also more sophisticated, and the response directly addresses the question, showing a stronger ability to engage with the topic."}	[{"rule": "Conditional tense and phrase structure clarity", "original": "But if I were choosing based on the kinds of things I'm built around", "corrected": "But if I had to choose based on the kind of person I am"}]	[{"basic_word": "things", "better_alternatives": ["aspects", "traits", "characteristics"]}]	\N	2026-05-11 07:07:52.435173+00
87287678-6a06-4a1d-beb6-9fe96ddc8c06	71d0ab2a-8d3d-41a7-9452-c74aa6f1983f	0	0	0	0	0	{"error": "Exception with error code: \\n[CALL STACK BEGIN]\\n\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xd9bec) [0xffffb7689bec]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xda3dc) [0xffffb768a3dc]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xd5aa8) [0xffffb7685aa8]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xe11ac) [0xffffb76911ac]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xe2d08) [0xffffb7692d08]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xd6260) [0xffffb7686260]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x149bcc) [0xffffb76f9bcc]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x105ff8) [0xffffb76b5ff8]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x107104) [0xffffb76b7104]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x139760) [0xffffb76e9760]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x98770) [0xffffb7648770]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x13860c) [0xffffb76e860c]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x90a84) [0xffffb7640a84]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(recognizer_create_speech_recognizer_from_config+0x110) [0xffffb77826c4]\\n/lib/aarch64-linux-gnu/libffi.so.8(+0x6a94) [0xffffba0b6a94]\\n/lib/aarch64-linux-gnu/libffi.so.8(+0x6088) [0xffffba0b6088]\\n/usr/local/lib/python3.11/lib-dynload/_ctypes.cpython-311-aarch64-linux-gnu.so(+0x12360) [0xffffba0f2360]\\n[CALL STACK END]\\n\\nException with an error code: 0xa (SPXERR_INVALID_HEADER)"}	{"summary": "The candidate failed to provide a coherent response to the question, resulting in a band score of 0.0 across all criteria.", "detailed": "The candidate's response did not address the question about the effectiveness of online learning compared to traditional classroom learning. Instead, the transcript consisted of unrelated phrases and error messages, indicating a technical issue or a complete lack of engagement with the topic. As a result, it was impossible to assess the candidate's fluency, lexical resource, grammatical range and accuracy, or pronunciation."}	[]	[" Failure to address the question", " Absence of coherent speech"]	["Practice responding to IELTS Speaking questions", "Develop strategies for managing technical issues during the exam", "Focus on clearly and coherently expressing ideas"]	{"text": "I think online learning can be as effective as traditional classroom learning in some cases. For instance, it offers flexibility and accessibility, which can be particularly beneficial for individuals with busy schedules or those living in remote areas. However, it lacks the face-to-face interaction and immediate feedback that traditional classrooms provide. To make online learning more effective, it's crucial to have engaging virtual platforms, regular check-ins with instructors, and a structured learning environment.", "explanation": "This sample answer scores higher because it directly addresses the question, presents a clear opinion, and supports it with relevant examples and considerations. It also demonstrates a range of vocabulary, grammatical accuracy, and fluent expression of ideas."}	[]	[]	\N	2026-05-17 11:15:16.405683+00
ccf03514-3aab-4f05-86c3-fa9318bda1e7	85163d31-c03a-4220-ab08-d9f7684860c6	2	1.5	1	1	1.5	{"error": "Exception with error code: \\n[CALL STACK BEGIN]\\n\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xd9bec) [0xffff7eeb9bec]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xda3dc) [0xffff7eeba3dc]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xd5aa8) [0xffff7eeb5aa8]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xe11ac) [0xffff7eec11ac]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xe2d08) [0xffff7eec2d08]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xd6260) [0xffff7eeb6260]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x149bcc) [0xffff7ef29bcc]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x105ff8) [0xffff7eee5ff8]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x107104) [0xffff7eee7104]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x139760) [0xffff7ef19760]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x98770) [0xffff7ee78770]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x13860c) [0xffff7ef1860c]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x90a84) [0xffff7ee70a84]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(recognizer_create_speech_recognizer_from_config+0x110) [0xffff7efb26c4]\\n/lib/aarch64-linux-gnu/libffi.so.8(+0x6a94) [0xffff88cb6a94]\\n/lib/aarch64-linux-gnu/libffi.so.8(+0x6088) [0xffff88cb6088]\\n/usr/local/lib/python3.11/lib-dynload/_ctypes.cpython-311-aarch64-linux-gnu.so(+0x12360) [0xffff88cf2360]\\n[CALL STACK END]\\n\\nException with an error code: 0xa (SPXERR_INVALID_HEADER)"}	{"summary": "The candidate's response lacks coherence, vocabulary range, and grammatical accuracy. The answer seems unrelated to the question asked.", "detailed": "The candidate fails to address the question about enjoying work or studies, instead mentioning travel and an unrelated phrase. The response is brief, lacks discourse markers, and does not demonstrate the ability to paraphrase or use idiomatic expressions. Grammatical errors and pronunciation issues significantly hinder intelligibility."}	[]	["Lack of relevance to the question", "Insufficient vocabulary", "Grammatical inaccuracies"]	["Practice speaking on a variety of topics related to work, studies, and personal interests", "Expand vocabulary by learning new words, collocations, and phrases", "Focus on improving grammatical accuracy through exercises and speaking practice"]	{"text": "I really enjoy my studies because they provide me with a wide range of opportunities to explore different subjects and fields. This variety keeps my academic life interesting and motivates me to learn more.", "explanation": "This answer is more coherent and directly addresses the question. It uses a variety of sentence structures and vocabulary, demonstrating a better command of English."}	[{"rule": "Gerund use after enjoy", "original": "I enjoy to travel", "corrected": "I enjoy traveling"}, {"rule": "Contextual appropriateness", "original": "love you", "corrected": "This phrase is inappropriate and unrelated in this context"}]	[{"basic_word": "enjoy", "better_alternatives": ["appreciate", "find pleasure in"]}, {"basic_word": "love", "better_alternatives": ["have affection for", "care deeply about"]}]	\N	2026-05-18 13:33:29.957955+00
36ecee66-c29a-4620-a997-8199d8ee36ba	eba03377-9907-40a5-83e0-8c5a56ef53cb	0	0	0	0	0	{"error": "Exception with error code: \\n[CALL STACK BEGIN]\\n\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xd9bec) [0xffffa0569bec]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xda3dc) [0xffffa056a3dc]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xd5aa8) [0xffffa0565aa8]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xe11ac) [0xffffa05711ac]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xe2d08) [0xffffa0572d08]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xd6260) [0xffffa0566260]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x149bcc) [0xffffa05d9bcc]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x105ff8) [0xffffa0595ff8]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x107104) [0xffffa0597104]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x139760) [0xffffa05c9760]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x98770) [0xffffa0528770]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x13860c) [0xffffa05c860c]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x90a84) [0xffffa0520a84]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(recognizer_create_speech_recognizer_from_config+0x110) [0xffffa06626c4]\\n/lib/aarch64-linux-gnu/libffi.so.8(+0x6a94) [0xffffa5d36a94]\\n/lib/aarch64-linux-gnu/libffi.so.8(+0x6088) [0xffffa5d36088]\\n/usr/local/lib/python3.11/lib-dynload/_ctypes.cpython-311-aarch64-linux-gnu.so(+0x12360) [0xffffa5d72360]\\n[CALL STACK END]\\n\\nException with an error code: 0xa (SPXERR_INVALID_HEADER)"}	{"summary": "The candidate failed to provide a response to the question, instead repeating it. This indicates a lack of ability to engage with the topic and provide meaningful discourse.", "detailed": "The candidate's response, which was merely a repetition of the question, demonstrates no fluency, lexical resource, grammatical range and accuracy, or pronunciation skills. There is no evidence of the candidate's ability to express opinions, use vocabulary, construct sentences, or produce sounds clearly. The 'pronunciation assessment data' provided seems unrelated to the speaking response and appears to be an error message from a speech recognition system."}	[]	["Lack of engagement with the question", "Inability to express opinions or ideas"]	["Practice answering questions directly and concisely", "Develop a range of vocabulary related to common IELTS topics", "Improve ability to construct grammatically correct sentences"]	{"text": "I believe technology has significantly improved our lives in many aspects. For instance, it has enhanced communication through social media and messaging apps, making it easier to stay connected with people across the globe. Additionally, it has provided unparalleled access to information, facilitating learning and personal development.", "explanation": "This answer engages with the question, presents a clear opinion, and supports it with examples, demonstrating a good range of vocabulary and grammatical structures."}	[]	[]	\N	2026-05-18 16:10:07.515341+00
5187e048-d64d-4b74-b2c3-85c6a1a7d23e	25dc2619-2ea4-450f-8019-0fea7ace6c5c	0	0	0	0	0	{"error": "Exception with error code: \\n[CALL STACK BEGIN]\\n\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xd9bec) [0xffffa0569bec]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xda3dc) [0xffffa056a3dc]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xd5aa8) [0xffffa0565aa8]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xe11ac) [0xffffa05711ac]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xe2d08) [0xffffa0572d08]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0xd6260) [0xffffa0566260]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x149bcc) [0xffffa05d9bcc]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x105ff8) [0xffffa0595ff8]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x107104) [0xffffa0597104]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x139760) [0xffffa05c9760]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x98770) [0xffffa0528770]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x13860c) [0xffffa05c860c]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(+0x90a84) [0xffffa0520a84]\\n/usr/local/lib/python3.11/site-packages/azure/cognitiveservices/speech/libMicrosoft.CognitiveServices.Speech.core.so(recognizer_create_speech_recognizer_from_config+0x110) [0xffffa06626c4]\\n/lib/aarch64-linux-gnu/libffi.so.8(+0x6a94) [0xffffa5d36a94]\\n/lib/aarch64-linux-gnu/libffi.so.8(+0x6088) [0xffffa5d36088]\\n/usr/local/lib/python3.11/lib-dynload/_ctypes.cpython-311-aarch64-linux-gnu.so(+0x12360) [0xffffa5d72360]\\n[CALL STACK END]\\n\\nException with an error code: 0xa (SPXERR_INVALID_HEADER)"}	{"summary": "The candidate did not provide an answer to the question, resulting in a lack of assessment of fluency, coherence, vocabulary, grammar, and pronunciation.", "detailed": "The candidate simply repeated the question, indicating a severe lack of ability to engage with the topic or demonstrate any skills in the English language as required by the IELTS speaking exam. This resulted in an inability to evaluate any aspect of their speaking ability, from the range and accuracy of their vocabulary to the complexity and accuracy of their grammar, and their pronunciation."}	[]	["Inability to address the question", "Lack of engagement with the topic"]	["Practice answering questions directly and concisely", "Develop strategies for handling unfamiliar topics", "Improve vocabulary range and accuracy"]	{"text": "I mainly use my phone for social media and checking emails. Occasionally, I use it for making calls or sending texts to my friends and family. I also sometimes use my phone for navigation when I'm in an unfamiliar area.", "explanation": "This answer demonstrates basic fluency, coherence, and use of simple vocabulary and grammar, providing a starting point for more complex interactions."}	[]	[]	\N	2026-05-18 16:10:07.515341+00
\.


--
-- Data for Name: attempt_parts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.attempt_parts (id, attempt_id, question_id, audio_url, transcript, duration_seconds, part_number, created_at) FROM stdin;
aec5f68d-a72f-4104-b908-ae9d5dc8cc88	db49ed24-fca7-479f-bbef-608d8f6455fe	\N	/audio/34081509-7190-4e7f-9d4b-f27af82ebea8/db49ed24-fca7-479f-bbef-608d8f6455fe/part1.webm	\N	\N	1	2026-04-24 11:40:47.025197+00
ef326553-0fee-4def-8e83-c0b1a136f694	224a1808-e278-45cd-ad62-72234ac38dbb	\N	/audio/9637c189-68a4-4878-b23e-fa0415f058c1/224a1808-e278-45cd-ad62-72234ac38dbb/part1.webm	\N	\N	1	2026-05-09 09:55:38.719651+00
89f11f7c-1c13-46ae-9704-07ecb31fe3ca	2cb08da6-dd51-4e7f-9d85-4cecd5665dbf	\N	/audio/9637c189-68a4-4878-b23e-fa0415f058c1/2cb08da6-dd51-4e7f-9d85-4cecd5665dbf/part1.webm	\N	\N	1	2026-05-09 10:08:03.612721+00
c38b727f-3133-4398-be6c-fc94f6b44b7f	0b6292dc-ab7b-40c1-bbd7-13cd430bfc3a	\N	/audio/26b52365-6979-452d-9899-9606ed772ff6/0b6292dc-ab7b-40c1-bbd7-13cd430bfc3a/part1.webm	\N	\N	1	2026-05-10 11:36:50.667321+00
05db00f6-bce0-466d-a7a3-f2ebbda90463	f5b1db75-c7c0-493a-aa56-bda8aae254a8	\N	/audio/26b52365-6979-452d-9899-9606ed772ff6/f5b1db75-c7c0-493a-aa56-bda8aae254a8/part1.webm	\N	\N	1	2026-05-10 15:10:31.077568+00
4fa6b8dc-c6b4-4c1e-a6e4-9d6c6bb6c2e6	c88e41a3-c8a5-42f2-a7b2-17c98b3c6534	\N	/audio/17964b0e-ba35-4c9f-b101-7c9e48e3b920/c88e41a3-c8a5-42f2-a7b2-17c98b3c6534/part1.webm	\N	\N	1	2026-05-10 15:22:18.02777+00
18eec7d6-ba04-40b2-9d4e-df2dfb8d7667	accdf8c2-6bb5-4573-9374-b31c9f83cfe1	\N	/audio/17964b0e-ba35-4c9f-b101-7c9e48e3b920/accdf8c2-6bb5-4573-9374-b31c9f83cfe1/part1.webm	\N	\N	1	2026-05-10 15:37:50.142441+00
d2233ed9-5d01-44dc-a9fe-c587bcf63b26	c2121634-606c-4633-b9c3-735df04f7945	\N	/code/uploads/c2121634-606c-4633-b9c3-735df04f7945_part1.m4a	\N	\N	1	2026-05-10 17:08:01.009909+00
96caf198-cce7-43c6-877e-e989873e6b1f	cde0cfe9-377e-4752-b4a4-73ff263ab163	\N	/code/uploads/cde0cfe9-377e-4752-b4a4-73ff263ab163_part1.m4a	\N	\N	1	2026-05-10 17:10:18.928253+00
eb25777c-3dc5-4c21-ad7c-bf147c38064f	203ee045-74bf-40f9-87e6-73b291712d16	\N	/code/uploads/203ee045-74bf-40f9-87e6-73b291712d16_part1.m4a	\N	\N	1	2026-05-10 17:11:28.075977+00
9b059146-70db-4146-9dcc-573e18225983	f059df10-3cab-4f7b-acdb-f9e4ef584702	\N	/code/uploads/f059df10-3cab-4f7b-acdb-f9e4ef584702_part1.m4a	\N	\N	1	2026-05-10 17:29:03.52012+00
0ce6072d-db37-4b33-82a6-97ab9a54da28	b54fc86a-f153-434f-848c-7eec35c49773	\N	/code/uploads/b54fc86a-f153-434f-848c-7eec35c49773_part1.m4a	\N	\N	1	2026-05-10 17:29:29.540564+00
7e5c840d-d0dd-4021-b254-6f61e8b0d61b	b54fc86a-f153-434f-848c-7eec35c49773	\N	/code/uploads/b54fc86a-f153-434f-848c-7eec35c49773_part1.m4a	\N	\N	1	2026-05-10 17:29:50.276336+00
f1331e2c-846d-471c-ab78-0ed09bd77ad0	b54fc86a-f153-434f-848c-7eec35c49773	\N	/code/uploads/b54fc86a-f153-434f-848c-7eec35c49773_part1.m4a	\N	\N	1	2026-05-10 17:30:20.21737+00
089d59f5-935b-4298-a150-d1399dd9703c	b54fc86a-f153-434f-848c-7eec35c49773	\N	/code/uploads/b54fc86a-f153-434f-848c-7eec35c49773_part1.m4a	\N	\N	1	2026-05-10 17:30:36.759648+00
8724d354-96fc-451a-b46d-13554b909759	a47a3e1f-8a80-4f72-b86f-f3842ea89e1f	\N	/code/uploads/a47a3e1f-8a80-4f72-b86f-f3842ea89e1f_part1.m4a	\N	\N	1	2026-05-10 17:31:31.982185+00
2a0078c9-40f6-4ee9-a91e-3c3aa3b0c2aa	a47a3e1f-8a80-4f72-b86f-f3842ea89e1f	\N	/code/uploads/a47a3e1f-8a80-4f72-b86f-f3842ea89e1f_part1.m4a	\N	\N	1	2026-05-10 17:31:41.885461+00
259314d0-a2d7-4c77-8566-0d752a7473e8	a47a3e1f-8a80-4f72-b86f-f3842ea89e1f	\N	/code/uploads/a47a3e1f-8a80-4f72-b86f-f3842ea89e1f_part1.m4a	\N	\N	1	2026-05-10 17:31:49.976782+00
18d33f72-064f-41b6-ae6f-f9097341caf1	dfba54a8-59f4-4f2e-a108-c42bd19e83f0	\N	/code/uploads/dfba54a8-59f4-4f2e-a108-c42bd19e83f0_part1.m4a	[Error] Audio file not found: /code/uploads/dfba54a8-59f4-4f2e-a108-c42bd19e83f0_part1.m4a	\N	1	2026-05-10 17:40:52.608747+00
ab626ff6-3924-40fc-95f7-37290a3d0bee	dfba54a8-59f4-4f2e-a108-c42bd19e83f0	\N	/code/uploads/dfba54a8-59f4-4f2e-a108-c42bd19e83f0_part1.m4a	[Error] Audio file not found: /code/uploads/dfba54a8-59f4-4f2e-a108-c42bd19e83f0_part1.m4a	\N	1	2026-05-10 17:40:33.576175+00
f40e1176-c44f-48b0-942f-b76967e779e2	d8aa8e58-ed0f-4579-ba19-8b8b2987675e	\N	/code/app/uploads/d8aa8e58-ed0f-4579-ba19-8b8b2987675e_part1.m4a	[Transcription failed: Error code: 400 - {'error': {'message': 'The model `distil-whisper-large-v3-en` has been decommissioned and is no longer supported. Please refer to https://console.groq.com/docs/deprecations for a recommendation on which model to use instead.', 'type': 'invalid_request_error', 'code': 'model_decommissioned'}}]	\N	1	2026-05-10 18:01:19.168874+00
4fa1ddaa-a2d3-455f-acd2-9238b7dbd14f	fc8a12d7-6081-4340-ac78-638b7dd54570	\N	/code/uploads/fc8a12d7-6081-4340-ac78-638b7dd54570_part1.m4a	[Error] Audio file not found: /code/uploads/fc8a12d7-6081-4340-ac78-638b7dd54570_part1.m4a	\N	1	2026-05-10 17:54:47.481938+00
568c1d0f-31ef-4b83-ac90-72e2e7cf0190	fc8a12d7-6081-4340-ac78-638b7dd54570	\N	/code/uploads/fc8a12d7-6081-4340-ac78-638b7dd54570_part1.m4a	[Error] Audio file not found: /code/uploads/fc8a12d7-6081-4340-ac78-638b7dd54570_part1.m4a	\N	1	2026-05-10 17:54:21.915405+00
9e5489c3-23f3-485e-8644-c2e8132764c0	fc8a12d7-6081-4340-ac78-638b7dd54570	\N	/code/uploads/fc8a12d7-6081-4340-ac78-638b7dd54570_part1.m4a	[Error] Audio file not found: /code/uploads/fc8a12d7-6081-4340-ac78-638b7dd54570_part1.m4a	\N	1	2026-05-10 17:53:42.909667+00
c44c0881-eed3-4b9f-9218-c88ae1eb93ee	fc8a12d7-6081-4340-ac78-638b7dd54570	\N	/code/uploads/fc8a12d7-6081-4340-ac78-638b7dd54570_part1.m4a	[Error] Audio file not found: /code/uploads/fc8a12d7-6081-4340-ac78-638b7dd54570_part1.m4a	\N	1	2026-05-10 17:54:34.082627+00
34a0e2ce-7a70-499c-a88f-52516c74c06d	d8aa8e58-ed0f-4579-ba19-8b8b2987675e	\N	/code/app/uploads/d8aa8e58-ed0f-4579-ba19-8b8b2987675e_part1.m4a	[Transcription failed: Error code: 400 - {'error': {'message': 'The model `distil-whisper-large-v3-en` has been decommissioned and is no longer supported. Please refer to https://console.groq.com/docs/deprecations for a recommendation on which model to use instead.', 'type': 'invalid_request_error', 'code': 'model_decommissioned'}}]	\N	1	2026-05-10 18:01:03.771487+00
b99bccdf-f49b-4517-b6cb-02951ba2b452	d8aa8e58-ed0f-4579-ba19-8b8b2987675e	\N	/code/app/uploads/d8aa8e58-ed0f-4579-ba19-8b8b2987675e_part1.m4a	[Transcription failed: Error code: 400 - {'error': {'message': 'The model `distil-whisper-large-v3-en` has been decommissioned and is no longer supported. Please refer to https://console.groq.com/docs/deprecations for a recommendation on which model to use instead.', 'type': 'invalid_request_error', 'code': 'model_decommissioned'}}]	\N	1	2026-05-10 18:01:33.093988+00
07e9d654-0901-4288-bbf7-3e56ac60613a	a1fa5f2d-f93b-42c3-9859-c8f3f592a6f1	\N	/code/app/uploads/a1fa5f2d-f93b-42c3-9859-c8f3f592a6f1_part1.m4a	To scroll home, I mainly use my phone for scrolling the TikTok and get some updated information. And I think I use it.	\N	1	2026-05-10 18:08:13.366309+00
0c8e02f1-ad47-4ab2-b19e-af65fae03e10	a1fa5f2d-f93b-42c3-9859-c8f3f592a6f1	\N	/code/app/uploads/a1fa5f2d-f93b-42c3-9859-c8f3f592a6f1_part1.m4a	To scroll home, I mainly use my phone for scrolling the TikTok and get some updated information. And I think I use it.	\N	1	2026-05-10 18:08:34.239751+00
d48e75a0-5fb6-4ab7-acc7-1ef3047e4389	a1fa5f2d-f93b-42c3-9859-c8f3f592a6f1	\N	/code/app/uploads/a1fa5f2d-f93b-42c3-9859-c8f3f592a6f1_part1.m4a	To scroll home, I mainly use my phone for scrolling the TikTok and get some updated information. And I think I use it.	\N	1	2026-05-10 18:08:01.299354+00
2636d884-31a5-428c-9804-1a5fd3abd216	ceebcb6a-6b1c-4ba8-9b84-bbbf5195da21	\N	/code/app/uploads/ceebcb6a-6b1c-4ba8-9b84-bbbf5195da21_part1.m4a	No, no, no, no, no.	\N	1	2026-05-10 18:11:16.450364+00
4d5cf1b7-a627-41b2-9dc5-a607e360615b	ceebcb6a-6b1c-4ba8-9b84-bbbf5195da21	\N	/code/app/uploads/ceebcb6a-6b1c-4ba8-9b84-bbbf5195da21_part1.m4a	No, no, no, no, no.	\N	1	2026-05-10 18:11:32.060796+00
da4a2237-3af7-4228-a948-ee6588a5a3c3	ceebcb6a-6b1c-4ba8-9b84-bbbf5195da21	\N	/code/app/uploads/ceebcb6a-6b1c-4ba8-9b84-bbbf5195da21_part1.m4a	No, no, no, no, no.	\N	1	2026-05-10 18:10:59.098596+00
2631f8fd-67b6-4953-9323-9f0cc304271e	8bdf60b6-bcf3-41bd-b26f-09fec9794a8a	\N	/code/app/uploads/8bdf60b6-bcf3-41bd-b26f-09fec9794a8a_part1.m4a	I use the internet every day and every time because you can say that I'm addicted to internet because in this day-to-day on the things I like I start each on I start on a bit into the internet into my phone like some notes and new applications I also use the	\N	1	2026-05-10 18:17:26.962936+00
4721ea32-7474-450c-8c44-10be481a9bbc	8bdf60b6-bcf3-41bd-b26f-09fec9794a8a	\N	/code/app/uploads/8bdf60b6-bcf3-41bd-b26f-09fec9794a8a_part1.m4a	I use the internet every day and every time because you can say that I'm addicted to internet because in this day on the things I like I start each on I start on a bit into the internet into my phone like some notes and new applications	\N	1	2026-05-10 18:18:09.711383+00
51d86d12-6b45-4284-8fc9-709045b037d2	8bdf60b6-bcf3-41bd-b26f-09fec9794a8a	\N	/code/app/uploads/8bdf60b6-bcf3-41bd-b26f-09fec9794a8a_part1.m4a	I use the internet every day and every time because you can say that I'm addicted to internet because in this day-to-day on the things I like I start each on I start on a bit into the internet into my phone like some notes and new applications I also use the	\N	1	2026-05-10 18:16:41.943282+00
c3167eb7-abc0-40e6-94e7-f8a6c02f9f0c	8bdf60b6-bcf3-41bd-b26f-09fec9794a8a	\N	/code/app/uploads/8bdf60b6-bcf3-41bd-b26f-09fec9794a8a_part1.m4a	I use the internet every day and every time because you can say that I'm addicted to internet because in this day-to-day on the things I like I start each on I start on a bit into the internet into my phone like some notes and new applications I also use the	\N	1	2026-05-10 18:18:49.186201+00
6195f0a4-48b6-425c-b6bd-4ecc6d3d7b50	89cb1f3d-eeab-4158-a0f6-0b7c5db44304	\N	/code/app/uploads/89cb1f3d-eeab-4158-a0f6-0b7c5db44304_part1.m4a	Yes, I think technology has improved our lives. You know, in this era, in this AI era, AI will help people improve their lives. They get the knowledge fully and immediately they do not like to research fully because some drug as you can because you know because people	\N	1	2026-05-10 18:36:00.373663+00
be752421-a716-4b3b-95e8-fecb12751891	89cb1f3d-eeab-4158-a0f6-0b7c5db44304	\N	/code/app/uploads/89cb1f3d-eeab-4158-a0f6-0b7c5db44304_part1.m4a	Yes, I think technology has improved our lives. You know, in this era, in this AI era, AI will help people improve their lives. They get the knowledge fully and immediately they do not like to research fully because some drug as you can because you know because people	\N	1	2026-05-10 18:35:18.026591+00
a9011a01-9c5a-4415-8b44-2cb17f660c9b	5e3759d1-db21-462f-8733-c9ed38fff556	\N	/code/app/uploads/5e3759d1-db21-462f-8733-c9ed38fff556_part1.m4a	In my free time, I also use... I want to... In free time, I want to learn something new.	\N	1	2026-05-10 18:46:33.228556+00
b34744bd-7f25-449c-90e0-3650b32497fd	5e3759d1-db21-462f-8733-c9ed38fff556	\N	/code/app/uploads/5e3759d1-db21-462f-8733-c9ed38fff556_part1.m4a	In my free time, I also use... I want to... In free time, I want to learn something new.	\N	1	2026-05-10 18:46:12.475685+00
0abd5262-aca1-41ae-ae4c-c30a2687893b	20161298-8bfe-47ca-9dea-f2fa152e0483	43cbf24d-99fd-4231-b0fe-7acac5da9753	/code/app/uploads/20161298-8bfe-47ca-9dea-f2fa152e0483_part1.m4a	I have found new internet in my free time.	\N	1	2026-05-10 19:32:02.910058+00
fd5ce164-41e2-4713-a497-323cc37330d5	7a80869e-97fb-4c8e-a629-e48752c66f7f	02bdca34-aedd-4843-9435-803eb334e3c6	/code/app/uploads/7a80869e-97fb-4c8e-a629-e48752c66f7f_part1.m4a	\N	\N	1	2026-05-11 07:06:08.357127+00
8a973016-543e-42c0-b416-6ce296bde534	08d252be-614b-4080-975c-ce28b57cb858	d9119e74-1a01-43ff-97ed-8ca573d6f7af	/code/app/uploads/08d252be-614b-4080-975c-ce28b57cb858_part3.m4a	... personal experiences. But if I were choosing based on the kinds of things I'm built around, I'd probably prefer activities that involve learning, problem solving, and conversation. Things like reading across different fields.	\N	3	2026-05-11 07:07:46.273992+00
c05ff749-c7e7-4360-aa55-941a37b31c89	08d252be-614b-4080-975c-ce28b57cb858	ce8fb916-b11a-44af-8d6b-2dacf5090f16	/code/app/uploads/08d252be-614b-4080-975c-ce28b57cb858_part1.m4a	I don't have free time or personal experiences, but if I were choosing based on the kinds of things I'm built around, I'd probably prefer activities that involve learning, problem-solving, and conversation. Things like reading across different fields, analyzing ideas, helping with creative projects, or exploring how people think.	\N	1	2026-05-11 07:06:51.001481+00
fda53b06-8566-41b6-9a1f-9477eb0cae1c	08d252be-614b-4080-975c-ce28b57cb858	02bdca34-aedd-4843-9435-803eb334e3c6	/code/app/uploads/08d252be-614b-4080-975c-ce28b57cb858_part2.m4a	I don't have free time or personal experiences, but if I were choosing based on the kinds of things I'm built around, I'd probably prefer activities that involve learning, problem solving, and conversation. Things like reading across different fields.	\N	2	2026-05-11 07:07:19.624719+00
71d0ab2a-8d3d-41a7-9452-c74aa6f1983f	c714f6b9-7c00-45f0-b9f7-a0b62bdb0631	fc3411bb-2e67-4272-b914-cecec37af4e4	/code/app/uploads/c714f6b9-7c00-45f0-b9f7-a0b62bdb0631_part1.m4a	Hello, hello, 123, there we go.	\N	1	2026-05-17 11:13:57.806874+00
85163d31-c03a-4220-ab08-d9f7684860c6	7ff9715e-bf63-4f82-996c-0cbad35b9492	7d70398e-572e-42fb-9eb0-389c5e33dad7	/code/app/uploads/7ff9715e-bf63-4f82-996c-0cbad35b9492_part3.m4a	I enjoy to travel and love you.	\N	3	2026-05-18 13:33:24.12665+00
25dc2619-2ea4-450f-8019-0fea7ace6c5c	2b484e8f-c29b-4b8e-8995-0f9acbe75307	1d7b6c74-9a93-471f-a134-f93a354ec7f1	/code/app/uploads/2b484e8f-c29b-4b8e-8995-0f9acbe75307_part2.m4a	What do you mainly use your phone for?	\N	2	2026-05-18 16:09:45.723914+00
eba03377-9907-40a5-83e0-8c5a56ef53cb	2b484e8f-c29b-4b8e-8995-0f9acbe75307	320b3b6e-67bb-4ae5-b9c4-8dac6ad9773e	/code/app/uploads/2b484e8f-c29b-4b8e-8995-0f9acbe75307_part1.m4a	Do you think technology has improved our lives?	\N	1	2026-05-18 16:09:29.628256+00
887fd3ba-a2bb-4dd2-9399-388c0b3efedb	29a33072-645e-4bd0-a76f-8745d80be08e	e51894de-7484-4daf-89c2-9fe6e10f7630	/code/app/uploads/29a33072-645e-4bd0-a76f-8745d80be08e_part1.m4a	\N	\N	1	2026-05-18 16:11:57.744895+00
\.


--
-- Data for Name: blog_posts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.blog_posts (id, title, slug, excerpt, content, cover_image_url, author_name, author_avatar, category, tags, read_time_minutes, is_published, is_featured, view_count, published_at, created_at, updated_at) FROM stdin;
8851ef34-4bed-46b5-bf3b-42079d7d4122	KKK	kkk	Học học nx học mãi	HHHH	https://www.google.com/imgres?q=h%E1%BB%8Dc&imgurl=https%3A%2F%2Flh7-us.googleusercontent.com%2Fdocsz%2FAD_4nXdAEx228cxGFmRLM5QN21A1UAy79NPs9282x0KOph4_ZN2zvLOYz2HawmHC8RRTOu5UfS7TVDxvqF6tB8h9X4DpBzRbNJ7q0nb_2cVmdtzY0zD244GDUTJiLycJbok0tT92QlgchxOHbqdJNTIWyA%3Fkey%3DvL3GzXGo5ojNevm8M6LFnA&imgrefurl=https%3A%2F%2Fbaotuyenquang.com.vn%2Fphuong-phap-hoc-tap-hieu-qua-giup-ban-tien-bo-nhanh-chong-194512.html&docid=r6VIi94shAa8BM&tbnid=DGZ2CH8-tIaw1M&vet=12ahUKEwj_ssTrhsOUAxUohlYBHZEvBNEQnPAOegQIKhAB..i&w=700&h=438&hcb=2&ved=2ahUKEwj_ssTrhsOUAxUohlYBHZEvBNEQnPAOegQIKhAB	Unilingo Team	\N	news	null	1	t	t	4	2026-05-18 14:37:37.541397+00	2026-05-18 14:37:37.52897+00	2026-05-18 15:33:30.235294+00
d0f48f3e-9436-4161-95c9-72a15ab64469	kkk	kkk-7c2e5c	12334	khong có	\N	Unilingo Team	\N	forecast	null	1	t	f	0	2026-05-18 15:33:59.412725+00	2026-05-18 15:33:59.406175+00	2026-05-18 16:18:47.865206+00
e66e4ef9-15e9-49ba-a108-33c98a306999	hiiiiokkl	hiiiiokkl	\N	okojhgdfj	\N	Unilingo Team	\N	forecast	null	1	t	t	0	2026-05-18 15:22:12.935861+00	2026-05-18 15:22:12.918986+00	2026-05-18 15:22:12.918986+00
015fadae-71d8-4604-8f1d-6fad5e723e8a	HỌc tiếng việt	hc-ting-vit	alo alo	alsskdwkd	https://th.bing.com/th/id/OIP.8Sd_lZXrC1rkqoD34eWMOgHaMh?w=192&h=325&c=7&r=0&o=7&dpr=2&pid=1.7&rm=3	Unilingo Team	\N	forecast	null	1	t	t	2	2026-05-18 14:22:18.103217+00	2026-05-18 14:22:18.084159+00	2026-05-18 15:33:22.727505+00
4c9951fd-5ce6-41fe-87e3-907672ee10a2	Forecast IELTS in Q3	forecast-ielts-in-q3	Buy forecast, contact me right now to get full information and new test!	Hãy học ngay hôm nay	https://th.bing.com/th/id/OIP.esmRcw0KUZxTzXi47NhZYwHaD4?w=310&h=180&c=7&r=0&o=7&dpr=2&pid=1.7&rm=3	Unilingo Team	\N	forecast	null	1	t	t	2	2026-05-18 14:08:56.721866+00	2026-05-18 14:08:56.704217+00	2026-05-18 15:33:24.925403+00
\.


--
-- Data for Name: daily_streaks; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.daily_streaks (id, user_id, streak_date, xp_earned, tests_completed, words_learned, study_minutes) FROM stdin;
6305137c-0800-4f51-89bf-97213a90b4c6	9637c189-68a4-4878-b23e-fa0415f058c1	2026-05-09	200	2	0	5
1ed1d056-a077-461e-8afb-d3bf0ff66f0a	26b52365-6979-452d-9899-9606ed772ff6	2026-05-10	100	2	0	5
df3890b0-85e3-4a4c-8a2a-ca7acd06342f	17964b0e-ba35-4c9f-b101-7c9e48e3b920	2026-05-10	600	7	0	5
542f8076-df75-4721-bde6-2cc5aa91de02	9637c189-68a4-4878-b23e-fa0415f058c1	2026-05-10	400	8	0	5
1afb07be-2914-4954-ac4b-e460693fa9fc	9637c189-68a4-4878-b23e-fa0415f058c1	2026-05-11	50	1	0	5
feb99e6d-7e4d-450f-82d8-c7a5093222ca	9637c189-68a4-4878-b23e-fa0415f058c1	2026-05-17	150	1	0	5
9dac28f0-8315-4f07-8df6-cc52407411cb	8fdcf1b2-90e8-4ec3-ad3f-fc3cc2d9e17a	2026-05-18	100	2	0	5
\.


--
-- Data for Name: flashcard_decks; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.flashcard_decks (id, user_id, title, description, is_public, card_count, created_at, updated_at) FROM stdin;
338122b5-7899-49f0-9a6c-d84e33b96602	34081509-7190-4e7f-9d4b-f27af82ebea8	Deck	Ok	f	0	2026-04-24 11:44:05.315996+00	2026-04-24 11:44:05.315996+00
f999eed8-5160-4c9e-937c-64841de47622	34081509-7190-4e7f-9d4b-f27af82ebea8	My Vocabulary	Auto-generated from 2 vocabulary notes	f	2	2026-04-24 11:44:10.418786+00	2026-04-24 11:44:10.418786+00
41acef25-9f81-4340-8434-b858b540231f	34081509-7190-4e7f-9d4b-f27af82ebea8	My Vocabulary	Auto-generated from 2 vocabulary notes	f	2	2026-04-24 14:47:14.959032+00	2026-04-24 14:47:14.959032+00
5c8a6e35-b123-42e1-9589-1e81636e3414	34081509-7190-4e7f-9d4b-f27af82ebea8	My Vocabulary	Auto-generated from 2 vocabulary notes	f	2	2026-04-24 14:47:17.187607+00	2026-04-24 14:47:17.187607+00
29e8bfda-0f8a-4721-be09-92d981f2b71f	9637c189-68a4-4878-b23e-fa0415f058c1	Hello	\N	f	0	2026-05-09 09:56:24.898627+00	2026-05-09 09:56:24.898627+00
0a3110d0-e995-4466-bedd-6a331fea656b	9637c189-68a4-4878-b23e-fa0415f058c1	My Vocabulary	Auto-generated from 2 vocabulary notes	f	2	2026-05-09 09:57:31.388176+00	2026-05-09 09:57:31.388176+00
2cad293f-da72-49ff-9244-8302abbe6b6e	9637c189-68a4-4878-b23e-fa0415f058c1	Kurukuru	\N	f	6	2026-05-10 09:01:51.287797+00	2026-05-10 10:02:12.215358+00
da9d503a-f58c-4283-8c9a-7db63ec45872	9637c189-68a4-4878-b23e-fa0415f058c1	Thien tesr	\N	f	1	2026-05-10 09:01:45.503113+00	2026-05-10 11:30:14.568827+00
8983b8ab-f1b3-4313-98e7-552fb2de44eb	26b52365-6979-452d-9899-9606ed772ff6	Ok	\N	f	1	2026-05-10 15:12:22.742684+00	2026-05-10 15:12:31.538827+00
002a08ab-2a6b-4a22-87b3-363747a37369	26b52365-6979-452d-9899-9606ed772ff6	Flashcard 1	\N	f	3	2026-05-10 15:18:40.344711+00	2026-05-10 15:18:57.969881+00
2b6acc32-fef6-466d-9702-4c27aeec4f7d	9637c189-68a4-4878-b23e-fa0415f058c1	Thien	\N	f	3	2026-05-10 19:34:30.639661+00	2026-05-10 19:34:58.948425+00
d5ae30f3-0089-4842-a8e7-52c874c31e36	9637c189-68a4-4878-b23e-fa0415f058c1	Abc	Kbu	f	4	2026-05-11 07:10:29.167848+00	2026-05-11 07:11:09.586503+00
\.


--
-- Data for Name: flashcard_reviews; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.flashcard_reviews (id, flashcard_id, user_id, quality_rating, easiness_factor, interval_days, repetition_number, reviewed_at, next_review_at) FROM stdin;
97a5f826-bd76-4c8a-9aa1-376294e15d79	d072977a-ab4e-401d-af5d-4150e0487208	34081509-7190-4e7f-9d4b-f27af82ebea8	3	2.36	1	1	2026-04-24 11:44:25.762331+00	2026-04-25 11:44:25.770725+00
73ef325e-6a4c-4f0f-9a83-781b91cae82f	1f3d7f42-278f-42b3-9a20-30418eb6edfa	34081509-7190-4e7f-9d4b-f27af82ebea8	5	2.6	1	1	2026-04-24 11:44:30.686677+00	2026-04-25 11:44:30.695676+00
57f49c3e-1d00-4123-ba0e-128f52d686b6	ac4e6d5f-9b02-4bad-88a9-42e93d91c1b0	34081509-7190-4e7f-9d4b-f27af82ebea8	1	1.96	1	0	2026-04-24 14:48:43.734741+00	2026-04-25 14:48:43.7411+00
622dedeb-0de3-4ab3-8ddb-06cb14b7d83e	3dc0905b-da14-427f-bfa5-e4b5aa33c3d2	34081509-7190-4e7f-9d4b-f27af82ebea8	5	2.6	1	1	2026-04-24 14:48:44.811412+00	2026-04-25 14:48:44.815798+00
647a64db-c8b2-4b4d-b4fc-868969da8ac6	ed25177b-3389-4985-9403-b8130bdb540b	34081509-7190-4e7f-9d4b-f27af82ebea8	3	2.36	1	1	2026-04-24 14:48:51.714361+00	2026-04-25 14:48:51.720276+00
974e4982-be37-489c-a02b-2ef0853c188f	eb36d735-c856-4371-95c9-5ae1522a4487	34081509-7190-4e7f-9d4b-f27af82ebea8	3	2.36	1	1	2026-04-24 14:48:52.279766+00	2026-04-25 14:48:52.287599+00
613dc493-1eee-4f47-ab1a-c7f8bd2c9438	deb9bf45-cf28-4720-bc2e-8f943432fd56	9637c189-68a4-4878-b23e-fa0415f058c1	3	2.36	1	1	2026-05-09 09:57:37.188405+00	2026-05-10 09:57:37.195999+00
7e70fda8-0edd-4239-9e1f-d069a72a236a	07aaeea4-d2dc-4bf5-bdb3-dda91b0e8ee2	9637c189-68a4-4878-b23e-fa0415f058c1	1	1.96	1	0	2026-05-10 09:02:44.646343+00	2026-05-11 09:02:44.660615+00
376f176c-6221-468e-ab78-68cf94eb0f6a	21f76095-bb0c-4b01-ad7c-d614c9dc29df	9637c189-68a4-4878-b23e-fa0415f058c1	5	2.6	1	1	2026-05-10 09:02:45.607227+00	2026-05-11 09:02:45.615663+00
2c53603e-5896-498e-b104-ad16c65d75e8	07aaeea4-d2dc-4bf5-bdb3-dda91b0e8ee2	9637c189-68a4-4878-b23e-fa0415f058c1	1	1.42	1	0	2026-05-10 09:02:46.91814+00	2026-05-11 09:02:46.924623+00
6bf227d3-a98f-4a2c-88ad-9c68b9ca21d3	07aaeea4-d2dc-4bf5-bdb3-dda91b0e8ee2	9637c189-68a4-4878-b23e-fa0415f058c1	5	1.52	1	1	2026-05-10 09:02:47.711902+00	2026-05-11 09:02:47.717533+00
decebeb0-1016-40ab-8737-f4adcc81d46d	867e156d-0747-4492-a08c-115bb71472c2	9637c189-68a4-4878-b23e-fa0415f058c1	5	2.6	1	1	2026-05-10 09:54:52.780534+00	2026-05-11 09:54:52.786749+00
419d00ef-e634-4f2c-b137-6cf485aba97d	9934412d-e810-4061-9e14-e140c9cdc6ee	9637c189-68a4-4878-b23e-fa0415f058c1	1	1.96	1	0	2026-05-10 11:30:23.308498+00	2026-05-11 11:30:23.318289+00
a6ec96f1-4ab9-4c23-827f-e221d49f99d7	9934412d-e810-4061-9e14-e140c9cdc6ee	9637c189-68a4-4878-b23e-fa0415f058c1	1	1.42	1	0	2026-05-10 11:30:23.974653+00	2026-05-11 11:30:23.981098+00
e103e3b9-1229-45ff-ac82-d7abe545924a	9934412d-e810-4061-9e14-e140c9cdc6ee	9637c189-68a4-4878-b23e-fa0415f058c1	1	1.3	1	0	2026-05-10 11:30:25.5653+00	2026-05-11 11:30:25.572134+00
8825b418-5279-4ba2-b14a-36152545bee2	9934412d-e810-4061-9e14-e140c9cdc6ee	9637c189-68a4-4878-b23e-fa0415f058c1	1	1.3	1	0	2026-05-10 11:30:25.565349+00	2026-05-11 11:30:25.573072+00
9292742f-ddf8-4f84-b2fb-e066c31ceed5	9934412d-e810-4061-9e14-e140c9cdc6ee	9637c189-68a4-4878-b23e-fa0415f058c1	1	1.3	1	0	2026-05-10 11:30:26.799501+00	2026-05-11 11:30:26.805138+00
9c999fde-dd60-4216-901e-c64d794bfc32	9934412d-e810-4061-9e14-e140c9cdc6ee	9637c189-68a4-4878-b23e-fa0415f058c1	1	1.3	1	0	2026-05-10 11:30:26.853641+00	2026-05-11 11:30:26.858345+00
754a2275-4b1d-4ed3-8b29-2c02d42a9d4f	9934412d-e810-4061-9e14-e140c9cdc6ee	9637c189-68a4-4878-b23e-fa0415f058c1	1	1.3	1	0	2026-05-10 11:30:27.309552+00	2026-05-11 11:30:27.314352+00
4d86b480-e509-4dea-8fae-949af41ebf4a	9934412d-e810-4061-9e14-e140c9cdc6ee	9637c189-68a4-4878-b23e-fa0415f058c1	1	1.3	1	0	2026-05-10 11:30:28.19631+00	2026-05-11 11:30:28.201126+00
d0eb62cf-f685-4f68-8d09-f47de22bfd0e	9934412d-e810-4061-9e14-e140c9cdc6ee	9637c189-68a4-4878-b23e-fa0415f058c1	5	1.4	1	1	2026-05-10 11:30:28.438442+00	2026-05-11 11:30:28.443057+00
ac012ea4-fb7a-4e96-a1e2-3613f3a37dec	25756e6a-74bb-4edd-8d5b-73659c898482	26b52365-6979-452d-9899-9606ed772ff6	1	1.96	1	0	2026-05-10 15:19:02.654104+00	2026-05-11 15:19:02.659868+00
941278b0-2b82-4cf5-bd55-851b6b6d31f0	5a02c2b1-80f7-4daf-b773-569a999e0a6d	26b52365-6979-452d-9899-9606ed772ff6	1	1.96	1	0	2026-05-10 15:19:03.765489+00	2026-05-11 15:19:03.770884+00
2eb6d10f-df88-4295-b530-7288b6194071	0d324fed-6fcb-400c-a51c-d6482bf93ca7	26b52365-6979-452d-9899-9606ed772ff6	1	1.96	1	0	2026-05-10 15:19:05.974141+00	2026-05-11 15:19:05.98182+00
0a5a9407-71b4-44d5-b531-27f51eec6b3c	25756e6a-74bb-4edd-8d5b-73659c898482	26b52365-6979-452d-9899-9606ed772ff6	1	1.42	1	0	2026-05-10 15:19:07.40556+00	2026-05-11 15:19:07.413097+00
3218ff9f-c451-4fb6-abde-399d619fdf60	5a02c2b1-80f7-4daf-b773-569a999e0a6d	26b52365-6979-452d-9899-9606ed772ff6	5	2.06	1	1	2026-05-10 15:19:09.011519+00	2026-05-11 15:19:09.017517+00
92849c37-46bf-428c-ae26-4ad14bb6edb6	0d324fed-6fcb-400c-a51c-d6482bf93ca7	26b52365-6979-452d-9899-9606ed772ff6	5	2.06	1	1	2026-05-10 15:19:09.924094+00	2026-05-11 15:19:09.929684+00
47e181e2-7660-4036-b5e7-73ef33ff6503	25756e6a-74bb-4edd-8d5b-73659c898482	26b52365-6979-452d-9899-9606ed772ff6	5	1.52	1	1	2026-05-10 15:19:10.848894+00	2026-05-11 15:19:10.853516+00
0d71b7e4-b394-4d93-b5e0-38bbe3cc9072	952a5930-f244-43b6-9193-6f2b0763039a	9637c189-68a4-4878-b23e-fa0415f058c1	1	1.96	1	0	2026-05-10 19:35:07.606005+00	2026-05-11 19:35:07.626353+00
8e48b0aa-18fd-4d0a-b3f6-c556ecf80a5b	a1c25ea2-57f0-4a44-a105-831196c9e38e	9637c189-68a4-4878-b23e-fa0415f058c1	5	2.6	1	1	2026-05-10 19:35:08.929255+00	2026-05-11 19:35:08.933494+00
7eb268e4-4979-4530-8a5c-0ffa4995f096	03c0a9ef-3d82-484a-aabd-7a77b74f839e	9637c189-68a4-4878-b23e-fa0415f058c1	1	1.96	1	0	2026-05-10 19:35:10.355932+00	2026-05-11 19:35:10.360931+00
55ed79e2-a49e-45d7-bc1e-51044470577c	952a5930-f244-43b6-9193-6f2b0763039a	9637c189-68a4-4878-b23e-fa0415f058c1	5	2.06	1	1	2026-05-10 19:35:11.96426+00	2026-05-11 19:35:11.968487+00
0f21f823-8032-4fa0-8fef-20b4bc4d38c2	03c0a9ef-3d82-484a-aabd-7a77b74f839e	9637c189-68a4-4878-b23e-fa0415f058c1	5	2.06	1	1	2026-05-10 19:35:12.783927+00	2026-05-11 19:35:12.788458+00
efb302e8-3e3a-4ffc-9eca-8907925252de	243cee87-9f87-40a9-80ee-de899a445b5c	9637c189-68a4-4878-b23e-fa0415f058c1	5	2.6	1	1	2026-05-11 07:11:18.249936+00	2026-05-12 07:11:18.264892+00
9586a674-a7bd-446e-bbd5-ab604b621512	6a2f5a5d-aa81-4116-ad18-30b848b25c4c	9637c189-68a4-4878-b23e-fa0415f058c1	5	2.6	1	1	2026-05-11 07:11:24.157465+00	2026-05-12 07:11:24.166406+00
c02ea6a9-ab33-42ef-910f-08168008f95b	1665ceef-4fe0-40e6-bfc2-330d74f88217	9637c189-68a4-4878-b23e-fa0415f058c1	5	2.6	1	1	2026-05-11 07:11:30.089497+00	2026-05-12 07:11:30.101519+00
\.


--
-- Data for Name: flashcards; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.flashcards (id, deck_id, vocabulary_id, front_content, back_content, audio_url, extra_info, order_index, created_at) FROM stdin;
d072977a-ab4e-401d-af5d-4150e0487208	f999eed8-5160-4c9e-937c-64841de47622	e5ce9d9d-e102-4f80-86c2-7879e86dea80	haptic	(adjective) Of or relating to the sense of touch.\n(adjective) Of or relating to haptics.	https://api.dictionaryapi.dev/media/pronunciations/en/haptic-au.mp3	{"phonetic": null}	0	2026-04-24 11:44:10.418786+00
1f3d7f42-278f-42b3-9a20-30418eb6edfa	f999eed8-5160-4c9e-937c-64841de47622	73be108d-ef05-4fa1-947e-963b217e620d	push	(noun) A short, directed application of force; an act of pushing.\n(noun) An act of tensing the muscles of the abdomen in order to expel its contents.	https://api.dictionaryapi.dev/media/pronunciations/en/push-1-us.mp3	{"phonetic": "[pʷʊʃ]"}	1	2026-04-24 11:44:10.418786+00
ed25177b-3389-4985-9403-b8130bdb540b	41acef25-9f81-4340-8434-b858b540231f	e5ce9d9d-e102-4f80-86c2-7879e86dea80	haptic	(adjective) Of or relating to the sense of touch.\n(adjective) Of or relating to haptics.	https://api.dictionaryapi.dev/media/pronunciations/en/haptic-au.mp3	{"phonetic": null}	0	2026-04-24 14:47:14.959032+00
eb36d735-c856-4371-95c9-5ae1522a4487	41acef25-9f81-4340-8434-b858b540231f	73be108d-ef05-4fa1-947e-963b217e620d	push	(noun) A short, directed application of force; an act of pushing.\n(noun) An act of tensing the muscles of the abdomen in order to expel its contents.	https://api.dictionaryapi.dev/media/pronunciations/en/push-1-us.mp3	{"phonetic": "[pʷʊʃ]"}	1	2026-04-24 14:47:14.959032+00
ac4e6d5f-9b02-4bad-88a9-42e93d91c1b0	5c8a6e35-b123-42e1-9589-1e81636e3414	e5ce9d9d-e102-4f80-86c2-7879e86dea80	haptic	(adjective) Of or relating to the sense of touch.\n(adjective) Of or relating to haptics.	https://api.dictionaryapi.dev/media/pronunciations/en/haptic-au.mp3	{"phonetic": null}	0	2026-04-24 14:47:17.187607+00
3dc0905b-da14-427f-bfa5-e4b5aa33c3d2	5c8a6e35-b123-42e1-9589-1e81636e3414	73be108d-ef05-4fa1-947e-963b217e620d	push	(noun) A short, directed application of force; an act of pushing.\n(noun) An act of tensing the muscles of the abdomen in order to expel its contents.	https://api.dictionaryapi.dev/media/pronunciations/en/push-1-us.mp3	{"phonetic": "[pʷʊʃ]"}	1	2026-04-24 14:47:17.187607+00
cdb26552-5b92-423a-88ce-788be29ad454	0a3110d0-e995-4466-bedd-6a331fea656b	ffb0742a-0b0b-4ecb-aa59-fd9f0a86b5b2	meet	(noun) A sports competition, especially for track and field (a track meet) or swimming (a swim meet).\n(noun) A gathering of riders, horses and hounds for foxhunting; a field meet for hunting.	https://api.dictionaryapi.dev/media/pronunciations/en/meet-uk.mp3	{"phonetic": "/miːt/"}	0	2026-05-09 09:57:31.388176+00
deb9bf45-cf28-4720-bc2e-8f943432fd56	0a3110d0-e995-4466-bedd-6a331fea656b	c46f45d1-6139-4cf3-b4b8-fac5c157f16d	thank	(noun) An expression of appreciation; a thought.	https://api.dictionaryapi.dev/media/pronunciations/en/thank-us.mp3	{"phonetic": "[θaŋk]"}	1	2026-05-09 09:57:31.388176+00
07aaeea4-d2dc-4bf5-bdb3-dda91b0e8ee2	2cad293f-da72-49ff-9244-8302abbe6b6e	\N	Okk	Kaka	\N	null	0	2026-05-10 09:02:03.410543+00
21f76095-bb0c-4b01-ad7c-d614c9dc29df	2cad293f-da72-49ff-9244-8302abbe6b6e	\N	Sustainable	Beenf vững	\N	null	1	2026-05-10 09:02:29.025449+00
867e156d-0747-4492-a08c-115bb71472c2	2cad293f-da72-49ff-9244-8302abbe6b6e	\N	hi	(noun) The word "hi" used as a greeting.\n(interjection) A friendly, informal, casual greeting said when meeting someone.\n(interjection) An exclamation to call attention.\n(interjection) Expressing wonder or derision.\n\n/haɪ/	\N	null	2	2026-05-10 09:54:34.678492+00
eda44fee-ab53-48f5-ba23-48383625ba17	2cad293f-da72-49ff-9244-8302abbe6b6e	\N	hi	(noun) The word "hi" used as a greeting.\n(interjection) A friendly, informal, casual greeting said when meeting someone.\n(interjection) An exclamation to call attention.\n(interjection) Expressing wonder or derision.\n\n/haɪ/	\N	null	3	2026-05-10 10:02:06.056181+00
febce9c5-1246-4a10-b928-810cca92e0ed	2cad293f-da72-49ff-9244-8302abbe6b6e	\N	hi	(noun) The word "hi" used as a greeting.\n(interjection) A friendly, informal, casual greeting said when meeting someone.\n(interjection) An exclamation to call attention.\n(interjection) Expressing wonder or derision.\n\n/haɪ/	\N	null	4	2026-05-10 10:02:09.128583+00
89e74b38-b79b-4521-af72-796fb111be81	2cad293f-da72-49ff-9244-8302abbe6b6e	\N	hi	(noun) The word "hi" used as a greeting.\n(interjection) A friendly, informal, casual greeting said when meeting someone.\n(interjection) An exclamation to call attention.\n(interjection) Expressing wonder or derision.\n\n/haɪ/	\N	null	5	2026-05-10 10:02:12.215358+00
9934412d-e810-4061-9e14-e140c9cdc6ee	da9d503a-f58c-4283-8c9a-7db63ec45872	\N	Kkkk	Kkkk	\N	null	0	2026-05-10 11:30:14.568827+00
b3c6c757-e9fb-4120-a5ac-992fa3d82b09	8983b8ab-f1b3-4313-98e7-552fb2de44eb	\N	sustainable	when	\N	null	0	2026-05-10 15:12:31.538827+00
25756e6a-74bb-4edd-8d5b-73659c898482	002a08ab-2a6b-4a22-87b3-363747a37369	\N	arigato	Cảm ơn	\N	null	0	2026-05-10 15:18:49.592794+00
5a02c2b1-80f7-4daf-b773-569a999e0a6d	002a08ab-2a6b-4a22-87b3-363747a37369	\N	fuck	(noun) An act of sexual intercourse.\n(noun) A sexual partner, especially a casual one.\n(noun) A highly contemptible person.\n(verb) To have sexual intercourse, to copulate.\n(verb) To have sexual intercourse with.\n(verb) To insert one’s penis, a dildo or other phallic object, into a specified orifice or cleft.\n(adverb) Used as an intensifier for the words "yes" and "no".\n(interjection) Expressing dismay or discontent.\n(interjection) Expressing surprise.\n\n/fʊk/	\N	null	1	2026-05-10 15:18:55.217258+00
0d324fed-6fcb-400c-a51c-d6482bf93ca7	002a08ab-2a6b-4a22-87b3-363747a37369	\N	crook	(noun) A bend; turn; curve; curvature; a flexure.\n(noun) A bending of the knee; a genuflection.\n(noun) A bent or curved part; a curving piece or portion (of anything).\n(verb) To bend, or form into a hook.\n(verb) To become bent or hooked.\n(verb) To turn from the path of rectitude; to pervert; to misapply; to twist.\n\n/kɹʊk/	\N	null	2	2026-05-10 15:18:57.969881+00
952a5930-f244-43b6-9193-6f2b0763039a	2b6acc32-fef6-466d-9702-4c27aeec4f7d	\N	Work	Lamf viec	\N	null	0	2026-05-10 19:34:38.840519+00
a1c25ea2-57f0-4a44-a105-831196c9e38e	2b6acc32-fef6-466d-9702-4c27aeec4f7d	\N	sin	(noun) A violation of God's will or religious law.\n(noun) A misdeed.\n(noun) A sin offering; a sacrifice for sin.\n(verb) To commit a sin.\n\n/sɪn/	\N	null	1	2026-05-10 19:34:55.053122+00
03c0a9ef-3d82-484a-aabd-7a77b74f839e	2b6acc32-fef6-466d-9702-4c27aeec4f7d	\N	eat	(noun) Something to be eaten; a meal; a food item.\n(verb) To ingest; to be ingested.\n(verb) To use up.\n(verb) To cause (someone) to worry.\n\n/iːt/	\N	null	2	2026-05-10 19:34:58.948425+00
243cee87-9f87-40a9-80ee-de899a445b5c	d5ae30f3-0089-4842-a8e7-52c874c31e36	\N	Table	Cai ban	\N	null	0	2026-05-11 07:10:43.526701+00
6a2f5a5d-aa81-4116-ad18-30b848b25c4c	d5ae30f3-0089-4842-a8e7-52c874c31e36	\N	Chair	Cai ghe	\N	null	1	2026-05-11 07:10:54.259132+00
cc01fea4-8968-438f-8dd4-721f8c810341	d5ae30f3-0089-4842-a8e7-52c874c31e36	\N	work	(noun) (heading) Employment.\n(noun) (heading) Effort.\n(noun) Sustained effort to achieve a goal or result, especially overcoming obstacles.\n\n/wɜːk/	\N	null	2	2026-05-11 07:11:05.317012+00
1665ceef-4fe0-40e6-bfc2-330d74f88217	d5ae30f3-0089-4842-a8e7-52c874c31e36	\N	deduplicate	(verb) To eliminate redundant duplicate data from.\n\n/diːˈdʒuːplɪkeɪt/	\N	null	3	2026-05-11 07:11:09.586503+00
\.


--
-- Data for Name: leaderboard_cache; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.leaderboard_cache (id, user_id, period_type, period_value, avg_band_score, total_tests, total_xp, rank, updated_at) FROM stdin;
4e9e2a42-19ae-4cd7-b683-2fa186d4dfa6	9637c189-68a4-4878-b23e-fa0415f058c1	all_time	all	2.2	10	850	1	2026-05-18 12:07:12.473614+00
9ec2ba8a-5e64-469b-a89b-7c16ce57e0e5	17964b0e-ba35-4c9f-b101-7c9e48e3b920	all_time	all	0	1	650	2	2026-05-18 12:07:12.473614+00
16353bd4-3d22-49a2-afcb-3dfabc4d3f2c	26b52365-6979-452d-9899-9606ed772ff6	all_time	all	0	0	180	3	2026-05-18 12:07:12.473614+00
01f40570-e28f-46df-942e-45135d54c07b	da74a312-081a-4403-83a3-a3d3bc43fc0c	all_time	all	0	0	70	6	2026-05-18 14:00:00.092547+00
575d27d9-43b2-4e27-a2f2-c60d3add8fd0	4574e198-338f-4aba-8fc0-e0c0d8ef7dce	all_time	all	0	0	20	7	2026-05-18 14:00:00.092547+00
e7fe5c70-6af3-4f04-ab13-e7186826b1aa	7ccf2c86-7304-4b6b-bf31-089d97813ab2	all_time	all	0	0	0	8	2026-05-18 14:00:00.092547+00
736b7266-9a8e-403c-91bf-58174b778373	98fdafa6-5af0-4496-9d41-71074c7684cd	all_time	all	0	0	0	9	2026-05-18 14:00:00.092547+00
a9050770-b350-424f-8671-a0f24aa56ad0	34081509-7190-4e7f-9d4b-f27af82ebea8	all_time	all	0	0	0	10	2026-05-18 14:00:00.092547+00
5a1cb22f-85b0-4d24-b2eb-166c33fd3df3	8fdcf1b2-90e8-4ec3-ad3f-fc3cc2d9e17a	all_time	all	0.8	2	120	4	2026-05-18 18:00:00.785282+00
84c2055e-818c-4a99-8672-9908529efb18	12064a1b-59cf-43ef-9096-faf8a672ffdb	all_time	all	0	0	120	5	2026-05-18 18:00:00.785282+00
\.


--
-- Data for Name: notification_campaigns; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.notification_campaigns (id, title, body, notification_type, category, audience, data, created_by_id, total_recipients, sent_count, failed_count, status, created_at, sent_at) FROM stdin;
ddf3be02-ca66-4e26-b44d-c8cfd475ac0e	Sales giảm giá sập sàn, mua ngay trong hôm nay	Thanh toán bằng Momo để lấy ưu đãi	event	event	selected	{}	34081509-7190-4e7f-9d4b-f27af82ebea8	1	1	0	stored	2026-05-18 14:05:32.581648+00	2026-05-18 14:05:32.681573+00
060814d0-a1a3-45e2-968b-37cd6f2a6b13	Sales giảm giá sập sàn, mua ngay trong hôm nay	Thanh toán bằng Momo để lấy ưu đãi	event	event	selected	{}	34081509-7190-4e7f-9d4b-f27af82ebea8	1	1	0	stored	2026-05-18 14:05:43.412778+00	2026-05-18 14:05:43.428358+00
1c208ee9-51e6-44de-9262-d5923c552a7b	Sales giảm giá sập sàn, mua ngay trong hôm nay	Thanh toán bằng Momo để lấy ưu đãi	event	event	selected	{}	34081509-7190-4e7f-9d4b-f27af82ebea8	1	1	0	stored	2026-05-18 14:06:00.258424+00	2026-05-18 14:06:00.289231+00
50fe627b-25f4-4361-be50-c79294d8e9ca	Forecast IELTS in Q3	Buy forecast, contact me right now to get full information and new test!	forecast	forecast	active	{"route": "blog/forecast-ielts-in-q3"}	34081509-7190-4e7f-9d4b-f27af82ebea8	10	10	0	stored	2026-05-18 14:08:56.745524+00	2026-05-18 14:08:56.764223+00
786aafa2-55c4-4d8d-b914-67d023690587	HỌc tiếng việt	alo alo	forecast	forecast	active	{"route": "blog/hc-ting-vit"}	34081509-7190-4e7f-9d4b-f27af82ebea8	10	10	0	stored	2026-05-18 14:22:18.120972+00	2026-05-18 14:22:18.255294+00
2e708d25-2209-4323-b267-6f70e5b6137d	KKK	Học học nx học mãi	news	news	active	{"route": "blog/kkk"}	34081509-7190-4e7f-9d4b-f27af82ebea8	10	10	0	stored	2026-05-18 14:37:37.567164+00	2026-05-18 14:37:37.643013+00
399969c8-883c-44c1-9be6-f1a01a30db97	Good job	Fighting	event	event	active	{}	34081509-7190-4e7f-9d4b-f27af82ebea8	10	10	0	stored	2026-05-18 14:37:54.996933+00	2026-05-18 14:37:55.022317+00
31512a0f-c111-4d18-b566-f999e54f053c	kkkkk	kkkkk	event	event	active	{}	34081509-7190-4e7f-9d4b-f27af82ebea8	10	10	1	failed	2026-05-18 15:21:23.833601+00	2026-05-18 15:21:24.661132+00
e2c3a808-fae5-42c3-b804-9aefbb0a84fe	hihi	hi	event	event	active	{}	34081509-7190-4e7f-9d4b-f27af82ebea8	10	10	1	failed	2026-05-18 15:21:48.949555+00	2026-05-18 15:21:49.077746+00
3c1f442a-8678-49a0-8700-f02dbdf7f68d	hiiiiokkl	A new IELTS article is available in Unilingo.	forecast	forecast	active	{"route": "blog/hiiiiokkl"}	34081509-7190-4e7f-9d4b-f27af82ebea8	10	10	1	failed	2026-05-18 15:22:12.956996+00	2026-05-18 15:22:13.13349+00
5d129b5d-e0b2-4018-89d9-142785d393fa	thien kun 	hihi	event	event	active	{}	34081509-7190-4e7f-9d4b-f27af82ebea8	10	10	1	failed	2026-05-18 15:32:36.409872+00	2026-05-18 15:32:36.795098+00
7275703b-37f3-4e00-b580-49e5e8102b41	kkk	123	forecast	forecast	active	{"route": "blog/kkk-7c2e5c"}	34081509-7190-4e7f-9d4b-f27af82ebea8	10	10	1	failed	2026-05-18 15:33:59.42712+00	2026-05-18 15:33:59.546291+00
99f3cbbb-51f8-45f4-8968-fe4c16aed498	kkk	12334	forecast	forecast	active	{"route": "blog/kkk-7c2e5c"}	34081509-7190-4e7f-9d4b-f27af82ebea8	10	10	1	partial	2026-05-18 16:18:47.949737+00	2026-05-18 16:18:48.631862+00
8bb175bd-3bff-4572-a16c-fc9f1e9bda75	saiksđ	jfhekdnwkfw	event	event	active	{}	34081509-7190-4e7f-9d4b-f27af82ebea8	10	10	1	partial	2026-05-18 16:19:34.990881+00	2026-05-18 16:19:35.156138+00
94009a2c-5a6f-4b5b-9e45-db6eede6e1d0	Your streak is waiting	Complete one short speaking practice today to keep your streak alive.	streak	system	selected	{"route": "practice"}	\N	3	3	0	stored	2026-05-18 18:00:00.183468+00	2026-05-18 18:00:00.261596+00
\.


--
-- Data for Name: notification_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.notification_settings (id, user_id, daily_reminder, reminder_time, new_words_reminder, streak_reminder, leaderboard_update, updated_at, event_notifications, blog_notifications, forecast_notifications, tips_notifications, news_notifications) FROM stdin;
d265f758-4635-4b5c-8790-1387a7f7a998	98fdafa6-5af0-4496-9d41-71074c7684cd	t	09:00:00	t	t	t	2026-04-24 07:05:27.563813+00	t	t	t	t	t
40acbb55-f33b-4060-bf39-0ad1bcff821c	34081509-7190-4e7f-9d4b-f27af82ebea8	t	09:00:00	t	t	t	2026-04-24 11:19:52.289477+00	t	t	t	t	t
fc66d5de-a0ed-438c-8816-41c00d6d7e4d	7ccf2c86-7304-4b6b-bf31-089d97813ab2	t	09:00:00	t	t	t	2026-05-03 12:26:24.307869+00	t	t	t	t	t
ca4858c1-48b2-405e-80e6-412d06de98b6	9637c189-68a4-4878-b23e-fa0415f058c1	t	09:00:00	t	t	t	2026-05-09 08:31:58.02018+00	t	t	t	t	t
f0b8e7a6-53bf-455a-8699-9da7773d6cd8	da74a312-081a-4403-83a3-a3d3bc43fc0c	t	09:00:00	t	t	t	2026-05-09 08:34:59.547483+00	t	t	t	t	t
3bbf2c34-3983-416b-ab87-d0cd4f5f0548	26b52365-6979-452d-9899-9606ed772ff6	t	09:00:00	t	t	t	2026-05-10 11:32:57.577908+00	t	t	t	t	t
85e72c8c-7f1c-42ad-a793-399162ba9a71	17964b0e-ba35-4c9f-b101-7c9e48e3b920	t	09:00:00	t	t	t	2026-05-10 15:21:20.022439+00	t	t	t	t	t
da2ab723-d6b5-4382-9a3e-d20076377294	4574e198-338f-4aba-8fc0-e0c0d8ef7dce	t	09:00:00	t	t	t	2026-05-10 19:37:30.976214+00	t	t	t	t	t
a69f54d2-a511-4644-bd2a-2e6ce3b537f5	12064a1b-59cf-43ef-9096-faf8a672ffdb	t	09:00:00	t	t	t	2026-05-11 07:13:41.651758+00	t	t	t	t	t
79eb9871-2a99-4a69-8943-94ac7d8f2662	8fdcf1b2-90e8-4ec3-ad3f-fc3cc2d9e17a	t	09:00:00	t	t	t	2026-05-18 13:26:31.716113+00	t	t	t	t	t
\.


--
-- Data for Name: questions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.questions (id, topic_id, question_text, question_text_vi, ielts_part, cue_card_content, follow_up_questions, difficulty, sample_answer, key_vocabulary, is_active, order_index, created_at) FROM stdin;
982ea7a2-dcbe-47b0-a636-9b15a96f7a52	8c18cd2c-8919-4ce3-b9f4-ef5124e8b033	Do you work or are you a student?	Bạn đi làm hay đi học?	part1	\N	\N	easy	null	\N	t	0	2026-04-24 05:33:03.857484+00
e51894de-7484-4daf-89c2-9fe6e10f7630	8c18cd2c-8919-4ce3-b9f4-ef5124e8b033	What do you do for work?	Bạn làm công việc gì?	part1	\N	\N	easy	null	\N	t	1	2026-04-24 05:33:03.857484+00
f1aa4255-13ff-41ce-9686-bb1a4fa55d14	8c18cd2c-8919-4ce3-b9f4-ef5124e8b033	What subjects are you studying?	Bạn đang học những môn gì?	part1	\N	\N	easy	null	\N	t	2	2026-04-24 05:33:03.857484+00
afd58c01-d024-4c0b-a514-27f093c2ce75	8c18cd2c-8919-4ce3-b9f4-ef5124e8b033	Why did you choose this field of study?	Tại sao bạn chọn ngành học này?	part1	\N	\N	easy	null	\N	t	3	2026-04-24 05:33:03.857484+00
7d70398e-572e-42fb-9eb0-389c5e33dad7	8c18cd2c-8919-4ce3-b9f4-ef5124e8b033	What do you enjoy most about your work/studies?	Bạn thích điều gì nhất về công việc/học tập?	part1	\N	\N	easy	null	\N	t	4	2026-04-24 05:33:03.857484+00
a0aeeddd-7e8f-4a26-a07b-b879605f1c7b	ad11c3c5-e20a-47e7-9b05-ff230ff28678	Where are you from?	Bạn đến từ đâu?	part1	\N	\N	easy	null	\N	t	0	2026-04-24 05:33:03.857484+00
a5c8bb4c-d3f0-4d05-b236-9ad937f889bc	ad11c3c5-e20a-47e7-9b05-ff230ff28678	What do you like about your hometown?	Bạn thích điều gì ở quê hương?	part1	\N	\N	easy	null	\N	t	1	2026-04-24 05:33:03.857484+00
d302ea8a-e776-45f5-a4cd-32ee74b58e4e	ad11c3c5-e20a-47e7-9b05-ff230ff28678	Has your hometown changed much recently?	Quê hương bạn có thay đổi nhiều gần đây không?	part1	\N	\N	easy	null	\N	t	2	2026-04-24 05:33:03.857484+00
cdfc0eea-d1ad-452b-a930-4f504ac73ad1	ad11c3c5-e20a-47e7-9b05-ff230ff28678	Is your hometown a good place for young people?	Quê bạn có phải nơi tốt cho người trẻ không?	part1	\N	\N	easy	null	\N	t	3	2026-04-24 05:33:03.857484+00
ce8fb916-b11a-44af-8d6b-2dacf5090f16	2498bf43-f218-478f-83f9-36fa862f8842	What do you do in your free time?	Bạn làm gì trong thời gian rảnh?	part1	\N	\N	easy	null	\N	t	0	2026-04-24 05:33:03.857484+00
ba99fc1d-147d-4a9c-a498-a4225808db5c	2498bf43-f218-478f-83f9-36fa862f8842	Do you have any hobbies?	Bạn có sở thích gì không?	part1	\N	\N	easy	null	\N	t	1	2026-04-24 05:33:03.857484+00
d9119e74-1a01-43ff-97ed-8ca573d6f7af	2498bf43-f218-478f-83f9-36fa862f8842	Have your hobbies changed since you were a child?	Sở thích của bạn có thay đổi từ khi còn nhỏ không?	part1	\N	\N	easy	null	\N	t	2	2026-04-24 05:33:03.857484+00
02bdca34-aedd-4843-9435-803eb334e3c6	2498bf43-f218-478f-83f9-36fa862f8842	Do you prefer to spend your free time alone or with others?	Bạn thích dành thời gian rảnh một mình hay với người khác?	part1	\N	\N	easy	null	\N	t	3	2026-04-24 05:33:03.857484+00
43cbf24d-99fd-4231-b0fe-7acac5da9753	6034269a-9769-4093-9f74-f2ac74cb172e	How often do you use the internet?	Bạn sử dụng internet bao lâu một lần?	part1	\N	\N	medium	null	\N	t	0	2026-04-24 05:33:03.857484+00
1d7b6c74-9a93-471f-a134-f93a354ec7f1	6034269a-9769-4093-9f74-f2ac74cb172e	What do you mainly use your phone for?	Bạn chủ yếu dùng điện thoại để làm gì?	part1	\N	\N	medium	null	\N	t	1	2026-04-24 05:33:03.857484+00
320b3b6e-67bb-4ae5-b9c4-8dac6ad9773e	6034269a-9769-4093-9f74-f2ac74cb172e	Do you think technology has improved our lives?	Bạn có nghĩ công nghệ đã cải thiện cuộc sống không?	part1	\N	\N	medium	null	\N	t	2	2026-04-24 05:33:03.857484+00
ea8767cb-4e5d-444d-868e-46375fdd4ee7	1e249892-4264-4bc3-a64a-8ba2919a6632	Describe a place you have visited that you found very interesting.	Mô tả một nơi bạn đã đến thăm mà bạn thấy rất thú vị.	part2	You should say:\n• where this place is\n• when you visited it\n• what you did there\nand explain why you found it interesting.	\N	medium	{"text": "I'd like to talk about Hoi An Ancient Town, which I visited last autumn. It's a UNESCO World Heritage Site located in central Vietnam. I spent four days exploring the narrow streets lined with centuries-old houses painted in vibrant yellow. What captivated me most was how well-preserved the architecture was — a harmonious blend of Vietnamese, Chinese, and Japanese influences. I found it particularly fascinating because every corner told a story of the town's rich trading history.", "band_level": 7.5}	\N	t	0	2026-04-24 05:33:03.857484+00
1acf771f-b115-484f-b59f-1a0d0a3171b2	e8039208-c525-46cf-99b7-ba514fc7d990	Describe a person who has inspired you in your life.	Mô tả một người đã truyền cảm hứng cho bạn trong cuộc sống.	part2	You should say:\n• who this person is\n• how you know them\n• what they have done that inspired you\nand explain why they were such an inspiration to you.	\N	medium	null	\N	t	0	2026-04-24 05:33:03.857484+00
f23f7380-52d6-4f5b-9dc0-465cd451b643	63e47d07-b2a6-4043-8fc7-a15723153778	Describe a book or movie that you really enjoyed.	Mô tả một cuốn sách hoặc bộ phim mà bạn thực sự thích.	part2	You should say:\n• what the book/movie was about\n• when you read/watched it\n• why you chose it\nand explain why you enjoyed it so much.	\N	medium	null	\N	t	0	2026-04-24 05:33:03.857484+00
9dd0efb7-258a-4cae-8a6a-bb8d1d748a54	b5dcecaf-578d-4383-83c9-3fd59e191957	How has education changed in your country over the past few decades?	Giáo dục ở nước bạn thay đổi thế nào trong vài thập kỷ qua?	part3	\N	\N	hard	null	\N	t	0	2026-04-24 05:33:03.857484+00
fc3411bb-2e67-4272-b914-cecec37af4e4	b5dcecaf-578d-4383-83c9-3fd59e191957	Do you think online learning is as effective as traditional classroom learning?	Bạn có nghĩ học trực tuyến hiệu quả như học truyền thống?	part3	\N	\N	hard	null	\N	t	1	2026-04-24 05:33:03.857484+00
ddfaa65a-2680-4221-8d4a-b1fce5be80cd	b5dcecaf-578d-4383-83c9-3fd59e191957	What role should technology play in education?	Công nghệ nên đóng vai trò gì trong giáo dục?	part3	\N	\N	hard	null	\N	t	2	2026-04-24 05:33:03.857484+00
88b33e52-0e87-4e25-a4e9-6e3f8daac9f1	b5dcecaf-578d-4383-83c9-3fd59e191957	Is a university degree still important for career success?	Bằng đại học có còn quan trọng cho sự nghiệp không?	part3	\N	\N	hard	null	\N	t	3	2026-04-24 05:33:03.857484+00
5add2dfe-92fb-453b-b294-0f500f2bdb68	e2a6500d-35ec-4130-9b78-acdbe34b0b51	What do you think are the biggest environmental challenges facing the world today?	Bạn nghĩ thách thức môi trường lớn nhất hiện nay là gì?	part3	\N	\N	hard	null	\N	t	0	2026-04-24 05:33:03.857484+00
79adf941-f610-444f-a044-c54bd2d29e8e	e2a6500d-35ec-4130-9b78-acdbe34b0b51	Should governments or individuals take more responsibility for protecting the environment?	Chính phủ hay cá nhân nên chịu trách nhiệm nhiều hơn về bảo vệ môi trường?	part3	\N	\N	hard	null	\N	t	1	2026-04-24 05:33:03.857484+00
656bc16d-c472-4120-a46b-de7c39501f51	e2a6500d-35ec-4130-9b78-acdbe34b0b51	How can cities become more environmentally friendly?	Các thành phố có thể trở nên thân thiện hơn với môi trường bằng cách nào?	part3	\N	\N	hard	null	\N	t	2	2026-04-24 05:33:03.857484+00
4ebe274e-2d86-46dc-a6f6-f96ff98ede7a	04ba6c52-3d4e-470d-a612-ea20cc97b8f8	How has technology changed the way people communicate?	Công nghệ đã thay đổi cách con người giao tiếp như thế nào?	part3	\N	\N	hard	null	\N	t	0	2026-04-24 05:33:03.857484+00
e6079987-e1f7-4a69-9db9-951f82a0f5cd	04ba6c52-3d4e-470d-a612-ea20cc97b8f8	Do you think artificial intelligence will replace human jobs in the future?	Bạn có nghĩ AI sẽ thay thế công việc con người trong tương lai?	part3	\N	\N	hard	null	\N	t	1	2026-04-24 05:33:03.857484+00
3fdbaf23-aa4a-44ce-88bb-7dd3efff6aa1	04ba6c52-3d4e-470d-a612-ea20cc97b8f8	What are the advantages and disadvantages of social media?	Ưu điểm và nhược điểm của mạng xã hội là gì?	part3	\N	\N	hard	null	\N	t	2	2026-04-24 05:33:03.857484+00
\.


--
-- Data for Name: test_attempts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.test_attempts (id, user_id, topic_id, ielts_part, status, overall_band, fluency_score, lexical_score, grammar_score, pronunciation_score, duration_seconds, xp_earned, started_at, completed_at) FROM stdin;
db49ed24-fca7-479f-bbef-608d8f6455fe	34081509-7190-4e7f-9d4b-f27af82ebea8	8c18cd2c-8919-4ce3-b9f4-ef5124e8b033	part1	scoring	\N	\N	\N	\N	\N	\N	0	2026-04-24 11:40:35.223153+00	\N
b154af6a-ae8d-4ba1-9851-44ade15fd22d	34081509-7190-4e7f-9d4b-f27af82ebea8	8c18cd2c-8919-4ce3-b9f4-ef5124e8b033	part1	in_progress	\N	\N	\N	\N	\N	\N	0	2026-04-24 14:45:38.073354+00	\N
2c600a98-9321-472c-8bc6-d6cf9633e78a	34081509-7190-4e7f-9d4b-f27af82ebea8	b5dcecaf-578d-4383-83c9-3fd59e191957	part3	in_progress	\N	\N	\N	\N	\N	\N	0	2026-04-24 14:45:41.659459+00	\N
a27786f2-f85e-4bf8-9755-acfa8e6c8c78	34081509-7190-4e7f-9d4b-f27af82ebea8	8c18cd2c-8919-4ce3-b9f4-ef5124e8b033	part1	in_progress	\N	\N	\N	\N	\N	\N	0	2026-04-24 14:49:16.192575+00	\N
c47fbc4d-2d11-47d9-a98c-58f821a34e79	34081509-7190-4e7f-9d4b-f27af82ebea8	8c18cd2c-8919-4ce3-b9f4-ef5124e8b033	part1	in_progress	\N	\N	\N	\N	\N	\N	0	2026-04-24 14:49:39.038923+00	\N
416e4f7e-172d-452f-b0b6-ee279a29546e	34081509-7190-4e7f-9d4b-f27af82ebea8	b5dcecaf-578d-4383-83c9-3fd59e191957	part3	in_progress	\N	\N	\N	\N	\N	\N	0	2026-04-24 14:49:39.038855+00	\N
ce67eea6-ae29-49da-828b-d70f48a03730	9637c189-68a4-4878-b23e-fa0415f058c1	8c18cd2c-8919-4ce3-b9f4-ef5124e8b033	part1	in_progress	\N	\N	\N	\N	\N	\N	0	2026-05-09 08:42:56.290157+00	\N
ce38923a-b26c-4b1d-87af-a5e2b71568a9	da74a312-081a-4403-83a3-a3d3bc43fc0c	8c18cd2c-8919-4ce3-b9f4-ef5124e8b033	part1	in_progress	\N	\N	\N	\N	\N	\N	0	2026-05-09 09:52:18.338079+00	\N
eebca44c-e2f4-4c2a-a4d9-9cca1d6e947e	9637c189-68a4-4878-b23e-fa0415f058c1	e2a6500d-35ec-4130-9b78-acdbe34b0b51	part3	in_progress	\N	\N	\N	\N	\N	\N	0	2026-05-09 09:54:20.037436+00	\N
224a1808-e278-45cd-ad62-72234ac38dbb	9637c189-68a4-4878-b23e-fa0415f058c1	8c18cd2c-8919-4ce3-b9f4-ef5124e8b033	part1	scoring	\N	\N	\N	\N	\N	\N	50	2026-05-09 09:55:35.656582+00	\N
5fa54ba2-7bab-4aef-8d21-67747435e24c	9637c189-68a4-4878-b23e-fa0415f058c1	8c18cd2c-8919-4ce3-b9f4-ef5124e8b033	part1	in_progress	\N	\N	\N	\N	\N	\N	0	2026-05-09 09:56:11.555498+00	\N
2cb08da6-dd51-4e7f-9d85-4cecd5665dbf	9637c189-68a4-4878-b23e-fa0415f058c1	b5dcecaf-578d-4383-83c9-3fd59e191957	part3	scoring	\N	\N	\N	\N	\N	\N	150	2026-05-09 10:08:00.466895+00	\N
466483a6-70b9-4702-9e5f-e559ecf53ac7	9637c189-68a4-4878-b23e-fa0415f058c1	e2a6500d-35ec-4130-9b78-acdbe34b0b51	part3	in_progress	\N	\N	\N	\N	\N	\N	0	2026-05-10 07:24:04.120184+00	\N
0b6292dc-ab7b-40c1-bbd7-13cd430bfc3a	26b52365-6979-452d-9899-9606ed772ff6	8c18cd2c-8919-4ce3-b9f4-ef5124e8b033	part1	scoring	\N	\N	\N	\N	\N	\N	50	2026-05-10 11:36:47.730241+00	\N
f5b1db75-c7c0-493a-aa56-bda8aae254a8	26b52365-6979-452d-9899-9606ed772ff6	ad11c3c5-e20a-47e7-9b05-ff230ff28678	part1	scoring	\N	\N	\N	\N	\N	\N	50	2026-05-10 15:10:28.770121+00	\N
4496bd34-615f-458b-aa00-bcc1e82cc2a8	26b52365-6979-452d-9899-9606ed772ff6	8c18cd2c-8919-4ce3-b9f4-ef5124e8b033	part1	in_progress	\N	\N	\N	\N	\N	\N	0	2026-05-10 15:15:39.542199+00	\N
63020c57-cfed-494e-84df-b4c92292ff99	26b52365-6979-452d-9899-9606ed772ff6	8c18cd2c-8919-4ce3-b9f4-ef5124e8b033	part1	in_progress	\N	\N	\N	\N	\N	\N	0	2026-05-10 15:15:44.241463+00	\N
d627945f-3bad-482d-b1b8-bc97936c8947	26b52365-6979-452d-9899-9606ed772ff6	1e249892-4264-4bc3-a64a-8ba2919a6632	part2	in_progress	\N	\N	\N	\N	\N	\N	0	2026-05-10 15:17:28.824765+00	\N
fd79b892-ad54-47ee-bc07-7b00631544e1	17964b0e-ba35-4c9f-b101-7c9e48e3b920	8c18cd2c-8919-4ce3-b9f4-ef5124e8b033	part1	in_progress	\N	\N	\N	\N	\N	\N	0	2026-05-10 15:22:02.300256+00	\N
c88e41a3-c8a5-42f2-a7b2-17c98b3c6534	17964b0e-ba35-4c9f-b101-7c9e48e3b920	ad11c3c5-e20a-47e7-9b05-ff230ff28678	part1	scoring	\N	\N	\N	\N	\N	\N	50	2026-05-10 15:22:15.769185+00	\N
052fab23-7ad5-4910-af2a-38cf73ecf9f3	17964b0e-ba35-4c9f-b101-7c9e48e3b920	ad11c3c5-e20a-47e7-9b05-ff230ff28678	part1	in_progress	\N	\N	\N	\N	\N	\N	0	2026-05-10 15:22:33.909098+00	\N
aa114bd2-995d-458e-806c-cbe19ebd8cdc	17964b0e-ba35-4c9f-b101-7c9e48e3b920	2498bf43-f218-478f-83f9-36fa862f8842	part1	in_progress	\N	\N	\N	\N	\N	\N	0	2026-05-10 15:22:36.105463+00	\N
d0a97baf-7c9b-4160-bccd-82c2ca7ac8fb	17964b0e-ba35-4c9f-b101-7c9e48e3b920	6034269a-9769-4093-9f74-f2ac74cb172e	part1	in_progress	\N	\N	\N	\N	\N	\N	0	2026-05-10 15:22:38.273764+00	\N
359af9d0-cd56-4a98-b508-803578171673	17964b0e-ba35-4c9f-b101-7c9e48e3b920	2498bf43-f218-478f-83f9-36fa862f8842	part1	in_progress	\N	\N	\N	\N	\N	\N	0	2026-05-10 15:22:54.098135+00	\N
accdf8c2-6bb5-4573-9374-b31c9f83cfe1	17964b0e-ba35-4c9f-b101-7c9e48e3b920	8c18cd2c-8919-4ce3-b9f4-ef5124e8b033	part1	scoring	\N	\N	\N	\N	\N	\N	50	2026-05-10 15:37:47.918864+00	\N
8af87ea4-ffb8-474f-b2f1-3a7a270d5657	17964b0e-ba35-4c9f-b101-7c9e48e3b920	8c18cd2c-8919-4ce3-b9f4-ef5124e8b033	part1	in_progress	\N	\N	\N	\N	\N	\N	0	2026-05-10 16:35:26.342145+00	\N
1a36e3e4-ca1e-44e9-8de2-b4de148befa5	17964b0e-ba35-4c9f-b101-7c9e48e3b920	1e249892-4264-4bc3-a64a-8ba2919a6632	part2	in_progress	\N	\N	\N	\N	\N	\N	0	2026-05-10 16:36:53.337883+00	\N
c2121634-606c-4633-b9c3-735df04f7945	17964b0e-ba35-4c9f-b101-7c9e48e3b920	2498bf43-f218-478f-83f9-36fa862f8842	part1	in_progress	\N	\N	\N	\N	\N	\N	0	2026-05-10 17:07:56.183755+00	\N
abbe8fc7-2836-4441-a3dc-9eec53d6e6d2	17964b0e-ba35-4c9f-b101-7c9e48e3b920	e8039208-c525-46cf-99b7-ba514fc7d990	part2	in_progress	\N	\N	\N	\N	\N	\N	0	2026-05-10 17:08:01.118184+00	\N
53d11b46-9536-44cc-9c56-37f8e67a4743	17964b0e-ba35-4c9f-b101-7c9e48e3b920	6034269a-9769-4093-9f74-f2ac74cb172e	part1	in_progress	\N	\N	\N	\N	\N	\N	0	2026-05-10 17:09:35.881212+00	\N
cde0cfe9-377e-4752-b4a4-73ff263ab163	17964b0e-ba35-4c9f-b101-7c9e48e3b920	1e249892-4264-4bc3-a64a-8ba2919a6632	part2	in_progress	\N	\N	\N	\N	\N	\N	0	2026-05-10 17:09:42.786408+00	\N
203ee045-74bf-40f9-87e6-73b291712d16	17964b0e-ba35-4c9f-b101-7c9e48e3b920	04ba6c52-3d4e-470d-a612-ea20cc97b8f8	part3	failed	\N	\N	\N	\N	\N	\N	150	2026-05-10 17:10:19.019272+00	\N
b051fca8-c8e1-4947-9dad-bcf86fbc0664	17964b0e-ba35-4c9f-b101-7c9e48e3b920	2498bf43-f218-478f-83f9-36fa862f8842	part1	in_progress	\N	\N	\N	\N	\N	\N	0	2026-05-10 17:26:47.003844+00	\N
f059df10-3cab-4f7b-acdb-f9e4ef584702	17964b0e-ba35-4c9f-b101-7c9e48e3b920	e8039208-c525-46cf-99b7-ba514fc7d990	part2	failed	\N	\N	\N	\N	\N	\N	100	2026-05-10 17:27:37.464062+00	\N
b54fc86a-f153-434f-848c-7eec35c49773	17964b0e-ba35-4c9f-b101-7c9e48e3b920	e2a6500d-35ec-4130-9b78-acdbe34b0b51	part3	failed	\N	\N	\N	\N	\N	\N	150	2026-05-10 17:29:07.749524+00	\N
f0136203-c23b-453e-accc-b6dfab11ad36	17964b0e-ba35-4c9f-b101-7c9e48e3b920	ad11c3c5-e20a-47e7-9b05-ff230ff28678	part1	in_progress	\N	\N	\N	\N	\N	\N	0	2026-05-10 17:31:00.321564+00	\N
d851c187-b8cd-4b27-b8f1-a6448384bd5a	17964b0e-ba35-4c9f-b101-7c9e48e3b920	8c18cd2c-8919-4ce3-b9f4-ef5124e8b033	part1	in_progress	\N	\N	\N	\N	\N	\N	0	2026-05-10 17:31:03.876152+00	\N
c9609e2f-de49-46e6-851d-65a6de2f07e9	17964b0e-ba35-4c9f-b101-7c9e48e3b920	2498bf43-f218-478f-83f9-36fa862f8842	part1	in_progress	\N	\N	\N	\N	\N	\N	0	2026-05-10 17:31:05.430391+00	\N
57c84ef3-ceb9-4dd3-9e43-0ba1c9c74346	17964b0e-ba35-4c9f-b101-7c9e48e3b920	6034269a-9769-4093-9f74-f2ac74cb172e	part1	in_progress	\N	\N	\N	\N	\N	\N	0	2026-05-10 17:31:06.429984+00	\N
a47a3e1f-8a80-4f72-b86f-f3842ea89e1f	17964b0e-ba35-4c9f-b101-7c9e48e3b920	8c18cd2c-8919-4ce3-b9f4-ef5124e8b033	part1	failed	\N	\N	\N	\N	\N	\N	50	2026-05-10 17:31:09.255324+00	\N
80a80ed8-077b-4ea1-ab13-008c2a62dd53	17964b0e-ba35-4c9f-b101-7c9e48e3b920	ad11c3c5-e20a-47e7-9b05-ff230ff28678	part1	in_progress	\N	\N	\N	\N	\N	\N	0	2026-05-10 17:35:32.500075+00	\N
cd42499d-06f0-48fb-8167-417241176571	17964b0e-ba35-4c9f-b101-7c9e48e3b920	8c18cd2c-8919-4ce3-b9f4-ef5124e8b033	part1	in_progress	\N	\N	\N	\N	\N	\N	0	2026-05-10 17:40:10.445278+00	\N
dfba54a8-59f4-4f2e-a108-c42bd19e83f0	17964b0e-ba35-4c9f-b101-7c9e48e3b920	6034269a-9769-4093-9f74-f2ac74cb172e	part1	completed	\N	\N	\N	\N	\N	\N	50	2026-05-10 17:40:16.570291+00	2026-05-10 17:41:00.007735+00
ce6d3149-09d0-4cc1-864a-03da4b172c96	17964b0e-ba35-4c9f-b101-7c9e48e3b920	63e47d07-b2a6-4043-8fc7-a15723153778	part2	in_progress	\N	\N	\N	\N	\N	\N	0	2026-05-10 17:41:41.834863+00	\N
ad4910c2-ccec-4059-bede-a68cf227bfe9	17964b0e-ba35-4c9f-b101-7c9e48e3b920	2498bf43-f218-478f-83f9-36fa862f8842	part1	in_progress	\N	\N	\N	\N	\N	\N	0	2026-05-10 17:41:46.441659+00	\N
af9e12a9-7a01-42eb-bcc1-9d8e8c04cc9c	17964b0e-ba35-4c9f-b101-7c9e48e3b920	6034269a-9769-4093-9f74-f2ac74cb172e	part1	in_progress	\N	\N	\N	\N	\N	\N	0	2026-05-10 17:41:49.93754+00	\N
a2924154-d02d-4a1a-b8f7-dbb1c74a3168	17964b0e-ba35-4c9f-b101-7c9e48e3b920	2498bf43-f218-478f-83f9-36fa862f8842	part1	in_progress	\N	\N	\N	\N	\N	\N	0	2026-05-10 17:41:52.861205+00	\N
d4ef690f-0eea-4e2c-99df-b9fb4649540e	17964b0e-ba35-4c9f-b101-7c9e48e3b920	6034269a-9769-4093-9f74-f2ac74cb172e	part1	in_progress	\N	\N	\N	\N	\N	\N	0	2026-05-10 17:41:56.345092+00	\N
745e71b8-900a-4168-af1a-15541c5bf113	17964b0e-ba35-4c9f-b101-7c9e48e3b920	6034269a-9769-4093-9f74-f2ac74cb172e	part1	in_progress	\N	\N	\N	\N	\N	\N	0	2026-05-10 17:41:59.812945+00	\N
cb146809-c107-4ce1-aac2-1ea0885972ba	17964b0e-ba35-4c9f-b101-7c9e48e3b920	ad11c3c5-e20a-47e7-9b05-ff230ff28678	part1	in_progress	\N	\N	\N	\N	\N	\N	0	2026-05-10 17:42:02.059189+00	\N
44f4e686-1677-4693-9fd1-0818c4e058c0	17964b0e-ba35-4c9f-b101-7c9e48e3b920	8c18cd2c-8919-4ce3-b9f4-ef5124e8b033	part1	in_progress	\N	\N	\N	\N	\N	\N	0	2026-05-10 17:42:03.897878+00	\N
a4b4a275-c383-4485-804d-544f620c73ca	17964b0e-ba35-4c9f-b101-7c9e48e3b920	ad11c3c5-e20a-47e7-9b05-ff230ff28678	part1	in_progress	\N	\N	\N	\N	\N	\N	0	2026-05-10 17:42:06.769858+00	\N
9dae76e0-30d3-4699-9ada-60ea1f0898fc	17964b0e-ba35-4c9f-b101-7c9e48e3b920	6034269a-9769-4093-9f74-f2ac74cb172e	part1	in_progress	\N	\N	\N	\N	\N	\N	0	2026-05-10 17:42:08.508679+00	\N
b5fa8ce7-5a2e-4e6c-b719-d2aa0e28147e	17964b0e-ba35-4c9f-b101-7c9e48e3b920	8c18cd2c-8919-4ce3-b9f4-ef5124e8b033	part1	in_progress	\N	\N	\N	\N	\N	\N	0	2026-05-10 17:42:10.267824+00	\N
8fcfaea1-5a32-4f1b-9757-b6512db18b44	9637c189-68a4-4878-b23e-fa0415f058c1	8c18cd2c-8919-4ce3-b9f4-ef5124e8b033	part1	in_progress	\N	\N	\N	\N	\N	\N	0	2026-05-10 17:53:06.107161+00	\N
fc8a12d7-6081-4340-ac78-638b7dd54570	9637c189-68a4-4878-b23e-fa0415f058c1	ad11c3c5-e20a-47e7-9b05-ff230ff28678	part1	completed	0	0	0	0	0	\N	0	2026-05-10 17:53:19.979463+00	2026-05-10 17:54:58.085494+00
d8aa8e58-ed0f-4579-ba19-8b8b2987675e	9637c189-68a4-4878-b23e-fa0415f058c1	2498bf43-f218-478f-83f9-36fa862f8842	part1	completed	0	0	0	0	0	\N	0	2026-05-10 18:00:44.951019+00	2026-05-10 18:01:43.635971+00
a1fa5f2d-f93b-42c3-9859-c8f3f592a6f1	9637c189-68a4-4878-b23e-fa0415f058c1	6034269a-9769-4093-9f74-f2ac74cb172e	part1	completed	3.5	4	3.5	3	2.8	\N	35	2026-05-10 18:07:39.927245+00	2026-05-10 18:08:49.186574+00
ceebcb6a-6b1c-4ba8-9b84-bbbf5195da21	9637c189-68a4-4878-b23e-fa0415f058c1	6034269a-9769-4093-9f74-f2ac74cb172e	part1	completed	0	0	0	0	0	\N	0	2026-05-10 18:10:32.243156+00	2026-05-10 18:11:44.662583+00
8bdf60b6-bcf3-41bd-b26f-09fec9794a8a	9637c189-68a4-4878-b23e-fa0415f058c1	6034269a-9769-4093-9f74-f2ac74cb172e	part1	completed	3.5	4.4	3.8	3.2	3.1	\N	35	2026-05-10 18:15:55.257249+00	2026-05-10 18:19:12.806895+00
3b89a88d-e4db-47ad-8037-6705de3c1b77	9637c189-68a4-4878-b23e-fa0415f058c1	ad11c3c5-e20a-47e7-9b05-ff230ff28678	part1	in_progress	\N	\N	\N	\N	\N	\N	0	2026-05-10 18:32:12.863324+00	\N
8a2bbc97-f9c7-4064-8a2d-14b137c9e856	9637c189-68a4-4878-b23e-fa0415f058c1	2498bf43-f218-478f-83f9-36fa862f8842	part1	in_progress	\N	\N	\N	\N	\N	\N	0	2026-05-10 18:32:16.219687+00	\N
06b5e915-acba-4621-ad1a-62be59bc9d37	9637c189-68a4-4878-b23e-fa0415f058c1	2498bf43-f218-478f-83f9-36fa862f8842	part1	in_progress	\N	\N	\N	\N	\N	\N	0	2026-05-10 18:32:48.952341+00	\N
fcc17a14-787c-4bdb-9fbf-ef3910c7ce12	9637c189-68a4-4878-b23e-fa0415f058c1	2498bf43-f218-478f-83f9-36fa862f8842	part1	in_progress	\N	\N	\N	\N	\N	\N	0	2026-05-10 18:33:46.81157+00	\N
c0ab157f-6b52-4ec3-8b3b-f847b9a493e3	9637c189-68a4-4878-b23e-fa0415f058c1	6034269a-9769-4093-9f74-f2ac74cb172e	part1	in_progress	\N	\N	\N	\N	\N	\N	0	2026-05-10 18:33:48.522774+00	\N
89cb1f3d-eeab-4158-a0f6-0b7c5db44304	9637c189-68a4-4878-b23e-fa0415f058c1	6034269a-9769-4093-9f74-f2ac74cb172e	part1	completed	3.5	4	3.5	3	3.5	\N	35	2026-05-10 18:34:38.384649+00	2026-05-10 18:36:42.643065+00
27672737-21c2-4324-a649-1349d1ce17cd	9637c189-68a4-4878-b23e-fa0415f058c1	8c18cd2c-8919-4ce3-b9f4-ef5124e8b033	part1	in_progress	\N	\N	\N	\N	\N	\N	0	2026-05-10 18:45:10.902419+00	\N
6d83177a-93e3-453b-8f38-40881ef05b12	9637c189-68a4-4878-b23e-fa0415f058c1	ad11c3c5-e20a-47e7-9b05-ff230ff28678	part1	in_progress	\N	\N	\N	\N	\N	\N	0	2026-05-10 18:45:15.23843+00	\N
5e3759d1-db21-462f-8733-c9ed38fff556	9637c189-68a4-4878-b23e-fa0415f058c1	2498bf43-f218-478f-83f9-36fa862f8842	part1	completed	3.5	4	3.2	3.5	3	\N	35	2026-05-10 18:45:18.432705+00	2026-05-10 18:46:46.129385+00
20161298-8bfe-47ca-9dea-f2fa152e0483	9637c189-68a4-4878-b23e-fa0415f058c1	6034269a-9769-4093-9f74-f2ac74cb172e	part1	completed	2	2	2	2	2	\N	20	2026-05-10 19:31:35.208074+00	2026-05-10 19:32:39.898983+00
e96ba484-0cc5-4395-a89c-3096a88e9398	9637c189-68a4-4878-b23e-fa0415f058c1	8c18cd2c-8919-4ce3-b9f4-ef5124e8b033	part1	in_progress	\N	\N	\N	\N	\N	\N	0	2026-05-10 19:33:13.479237+00	\N
71b435ef-1cec-42c7-8fab-6242905f7d4b	9637c189-68a4-4878-b23e-fa0415f058c1	6034269a-9769-4093-9f74-f2ac74cb172e	part1	in_progress	\N	\N	\N	\N	\N	\N	0	2026-05-11 07:03:43.343116+00	\N
f2558fbb-0dbf-48b3-a20c-2bdc81bb8d60	9637c189-68a4-4878-b23e-fa0415f058c1	b5dcecaf-578d-4383-83c9-3fd59e191957	part3	in_progress	\N	\N	\N	\N	\N	\N	0	2026-05-11 07:04:48.737064+00	\N
7330a1e6-9802-46f9-9c3b-4b7d43038169	9637c189-68a4-4878-b23e-fa0415f058c1	b5dcecaf-578d-4383-83c9-3fd59e191957	part3	in_progress	\N	\N	\N	\N	\N	\N	0	2026-05-11 07:04:53.240051+00	\N
7a80869e-97fb-4c8e-a629-e48752c66f7f	9637c189-68a4-4878-b23e-fa0415f058c1	2498bf43-f218-478f-83f9-36fa862f8842	part1	in_progress	\N	\N	\N	\N	\N	\N	0	2026-05-11 07:05:43.678199+00	\N
08d252be-614b-4080-975c-ce28b57cb858	9637c189-68a4-4878-b23e-fa0415f058c1	2498bf43-f218-478f-83f9-36fa862f8842	part1	completed	6	6.5	7	6.3	5.2	\N	60	2026-05-11 07:06:12.34048+00	2026-05-11 07:08:02.74663+00
f3c22d95-ea08-4631-b813-db98065f2d96	12064a1b-59cf-43ef-9096-faf8a672ffdb	8c18cd2c-8919-4ce3-b9f4-ef5124e8b033	part1	in_progress	\N	\N	\N	\N	\N	\N	0	2026-05-11 07:15:31.355541+00	\N
a60a4847-ac8c-439a-b06f-4b5f02c2e292	12064a1b-59cf-43ef-9096-faf8a672ffdb	e8039208-c525-46cf-99b7-ba514fc7d990	part2	in_progress	\N	\N	\N	\N	\N	\N	0	2026-05-11 07:16:20.390542+00	\N
c714f6b9-7c00-45f0-b9f7-a0b62bdb0631	9637c189-68a4-4878-b23e-fa0415f058c1	b5dcecaf-578d-4383-83c9-3fd59e191957	part3	completed	0	0	0	0	0	\N	0	2026-05-17 11:13:36.728236+00	2026-05-17 11:15:20.299057+00
7ff9715e-bf63-4f82-996c-0cbad35b9492	8fdcf1b2-90e8-4ec3-ad3f-fc3cc2d9e17a	8c18cd2c-8919-4ce3-b9f4-ef5124e8b033	part1	completed	1.5	2	1.5	1	1	\N	15	2026-05-18 13:32:30.835474+00	2026-05-18 13:33:33.36345+00
2b484e8f-c29b-4b8e-8995-0f9acbe75307	8fdcf1b2-90e8-4ec3-ad3f-fc3cc2d9e17a	6034269a-9769-4093-9f74-f2ac74cb172e	part1	completed	0	0	0	0	0	\N	0	2026-05-18 16:09:03.139195+00	2026-05-18 16:10:17.300644+00
29a33072-645e-4bd0-a76f-8745d80be08e	8fdcf1b2-90e8-4ec3-ad3f-fc3cc2d9e17a	8c18cd2c-8919-4ce3-b9f4-ef5124e8b033	part1	in_progress	\N	\N	\N	\N	\N	\N	0	2026-05-18 16:11:37.963228+00	\N
\.


--
-- Data for Name: topics; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.topics (id, title, title_vi, description, category, ielts_part, difficulty, icon, is_active, order_index, created_at) FROM stdin;
8c18cd2c-8919-4ce3-b9f4-ef5124e8b033	Work & Studies	Công việc & Học tập	Questions about your job, studies, and daily routine	daily_life	part1	easy	💼	t	0	2026-04-24 05:33:03.857484+00
ad11c3c5-e20a-47e7-9b05-ff230ff28678	Hometown	Quê hương	Questions about the place you come from	daily_life	part1	easy	🏘️	t	1	2026-04-24 05:33:03.857484+00
2498bf43-f218-478f-83f9-36fa862f8842	Hobbies & Free Time	Sở thích & Thời gian rảnh	Questions about what you do in your spare time	daily_life	part1	easy	🎨	t	2	2026-04-24 05:33:03.857484+00
6034269a-9769-4093-9f74-f2ac74cb172e	Technology	Công nghệ	Questions about technology use in daily life	technology	part1	medium	📱	t	3	2026-04-24 05:33:03.857484+00
1e249892-4264-4bc3-a64a-8ba2919a6632	A Place You Visited	Một nơi bạn đã đến thăm	Describe a memorable place you have visited	travel	part2	medium	✈️	t	4	2026-04-24 05:33:03.857484+00
e8039208-c525-46cf-99b7-ba514fc7d990	A Person Who Inspired You	Một người truyền cảm hứng cho bạn	Describe someone who has had a significant influence on your life	people	part2	medium	🌟	t	5	2026-04-24 05:33:03.857484+00
63e47d07-b2a6-4043-8fc7-a15723153778	A Book or Movie You Enjoyed	Một cuốn sách hoặc bộ phim bạn thích	Describe a book or movie that left a strong impression on you	entertainment	part2	medium	📚	t	6	2026-04-24 05:33:03.857484+00
b5dcecaf-578d-4383-83c9-3fd59e191957	Education & Learning	Giáo dục & Học tập	Abstract discussion about education systems and learning methods	education	part3	hard	🎓	t	7	2026-04-24 05:33:03.857484+00
e2a6500d-35ec-4130-9b78-acdbe34b0b51	Environment & Climate	Môi trường & Khí hậu	Discussion about environmental challenges and sustainability	environment	part3	hard	🌍	t	8	2026-04-24 05:33:03.857484+00
04ba6c52-3d4e-470d-a612-ea20cc97b8f8	Technology & Society	Công nghệ & Xã hội	Discussion about technology's impact on modern society	technology	part3	hard	🤖	t	9	2026-04-24 05:33:03.857484+00
\.


--
-- Data for Name: user_devices; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_devices (id, user_id, fcm_token, device_type, device_name, last_active_at, created_at) FROM stdin;
607fc2d5-2fda-4512-a3fe-189e36d14d92	8fdcf1b2-90e8-4ec3-ad3f-fc3cc2d9e17a	fMQyvUn4SJWYY_sgu-Ji69:APA91bGZuwqlQgYKTtA_vLVz1RKP2ggvdh99HXlCZB4njuj3P1PpM5-4nvc72V79tBq4h7hY1cLpDcHKDOzvSwnkroxgXr2IEvfNDYX4pFToGHyY70G0Rzg	android	android device	2026-05-18 12:15:15.850895+00	2026-05-18 12:15:15.850895+00
79b9c5b8-75c6-4af7-ae61-46322870a6da	8fdcf1b2-90e8-4ec3-ad3f-fc3cc2d9e17a	ch9LX9NmRMC_ny4ZCzzHB9:APA91bEX4u5JRxXwZqKw741H5aBK8B9zKj_zThKwOESpgp6ZtCFDOjXKr0sFYk56L0vkscN0oeGG80jC2T6JPZ8r2_hcKbDLQ2QL2gwxHjo-IIJiynm382k	android	android device	2026-05-18 16:08:51.303727+00	2026-05-18 16:08:51.303727+00
\.


--
-- Data for Name: user_notifications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_notifications (id, user_id, campaign_id, title, body, notification_type, category, data, is_read, read_at, created_at) FROM stdin;
1333cf2f-407b-4024-8773-5d58809d28b8	8fdcf1b2-90e8-4ec3-ad3f-fc3cc2d9e17a	1c208ee9-51e6-44de-9262-d5923c552a7b	Sales giảm giá sập sàn, mua ngay trong hôm nay	Thanh toán bằng Momo để lấy ưu đãi	event	event	{}	t	2026-05-18 14:06:09.287672+00	2026-05-18 14:06:00.258424+00
7bcaf0c4-de6f-44c1-8c9e-4adf6dfc82a2	8fdcf1b2-90e8-4ec3-ad3f-fc3cc2d9e17a	060814d0-a1a3-45e2-968b-37cd6f2a6b13	Sales giảm giá sập sàn, mua ngay trong hôm nay	Thanh toán bằng Momo để lấy ưu đãi	event	event	{}	t	2026-05-18 14:06:10.917334+00	2026-05-18 14:05:43.412778+00
cc2dd3ba-b23f-4984-924e-a89941c2fe57	8fdcf1b2-90e8-4ec3-ad3f-fc3cc2d9e17a	ddf3be02-ca66-4e26-b44d-c8cfd475ac0e	Sales giảm giá sập sàn, mua ngay trong hôm nay	Thanh toán bằng Momo để lấy ưu đãi	event	event	{}	t	2026-05-18 14:06:11.226166+00	2026-05-18 14:05:32.581648+00
3be153c5-f193-4ceb-96bc-22458a2c6686	98fdafa6-5af0-4496-9d41-71074c7684cd	50fe627b-25f4-4361-be50-c79294d8e9ca	Forecast IELTS in Q3	Buy forecast, contact me right now to get full information and new test!	forecast	forecast	{"route": "blog/forecast-ielts-in-q3"}	f	\N	2026-05-18 14:08:56.745524+00
2bb0d46d-1d67-4a49-8924-ba460a97a9e0	34081509-7190-4e7f-9d4b-f27af82ebea8	50fe627b-25f4-4361-be50-c79294d8e9ca	Forecast IELTS in Q3	Buy forecast, contact me right now to get full information and new test!	forecast	forecast	{"route": "blog/forecast-ielts-in-q3"}	f	\N	2026-05-18 14:08:56.745524+00
00dd3129-b545-4555-a2bf-848bdab7ce58	7ccf2c86-7304-4b6b-bf31-089d97813ab2	50fe627b-25f4-4361-be50-c79294d8e9ca	Forecast IELTS in Q3	Buy forecast, contact me right now to get full information and new test!	forecast	forecast	{"route": "blog/forecast-ielts-in-q3"}	f	\N	2026-05-18 14:08:56.745524+00
49f956ec-d521-40b8-8c72-aacaf39df0d9	9637c189-68a4-4878-b23e-fa0415f058c1	50fe627b-25f4-4361-be50-c79294d8e9ca	Forecast IELTS in Q3	Buy forecast, contact me right now to get full information and new test!	forecast	forecast	{"route": "blog/forecast-ielts-in-q3"}	f	\N	2026-05-18 14:08:56.745524+00
b7be4d79-35ae-4b7e-b01d-e5e1aa4cbe78	da74a312-081a-4403-83a3-a3d3bc43fc0c	50fe627b-25f4-4361-be50-c79294d8e9ca	Forecast IELTS in Q3	Buy forecast, contact me right now to get full information and new test!	forecast	forecast	{"route": "blog/forecast-ielts-in-q3"}	f	\N	2026-05-18 14:08:56.745524+00
424dd6a2-db76-4ff1-85c3-c49819b89671	26b52365-6979-452d-9899-9606ed772ff6	50fe627b-25f4-4361-be50-c79294d8e9ca	Forecast IELTS in Q3	Buy forecast, contact me right now to get full information and new test!	forecast	forecast	{"route": "blog/forecast-ielts-in-q3"}	f	\N	2026-05-18 14:08:56.745524+00
a9dc7392-3609-4a57-92cd-6b2f1c7c88a2	17964b0e-ba35-4c9f-b101-7c9e48e3b920	50fe627b-25f4-4361-be50-c79294d8e9ca	Forecast IELTS in Q3	Buy forecast, contact me right now to get full information and new test!	forecast	forecast	{"route": "blog/forecast-ielts-in-q3"}	f	\N	2026-05-18 14:08:56.745524+00
0d9a75d6-3e18-4db8-8534-c0ca8b4f051f	4574e198-338f-4aba-8fc0-e0c0d8ef7dce	50fe627b-25f4-4361-be50-c79294d8e9ca	Forecast IELTS in Q3	Buy forecast, contact me right now to get full information and new test!	forecast	forecast	{"route": "blog/forecast-ielts-in-q3"}	f	\N	2026-05-18 14:08:56.745524+00
905cf3fd-8c9a-46bc-914c-caddfb9b07ac	12064a1b-59cf-43ef-9096-faf8a672ffdb	50fe627b-25f4-4361-be50-c79294d8e9ca	Forecast IELTS in Q3	Buy forecast, contact me right now to get full information and new test!	forecast	forecast	{"route": "blog/forecast-ielts-in-q3"}	f	\N	2026-05-18 14:08:56.745524+00
bfceb0b6-f2f9-4ad5-a765-b079f465cf71	8fdcf1b2-90e8-4ec3-ad3f-fc3cc2d9e17a	50fe627b-25f4-4361-be50-c79294d8e9ca	Forecast IELTS in Q3	Buy forecast, contact me right now to get full information and new test!	forecast	forecast	{"route": "blog/forecast-ielts-in-q3"}	t	2026-05-18 14:09:04.51553+00	2026-05-18 14:08:56.745524+00
d0b9468f-1367-4385-a2f3-0d50fa096fa3	98fdafa6-5af0-4496-9d41-71074c7684cd	786aafa2-55c4-4d8d-b914-67d023690587	HỌc tiếng việt	alo alo	forecast	forecast	{"route": "blog/hc-ting-vit"}	f	\N	2026-05-18 14:22:18.120972+00
2313d3df-15c2-4be4-b053-95b00808f048	34081509-7190-4e7f-9d4b-f27af82ebea8	786aafa2-55c4-4d8d-b914-67d023690587	HỌc tiếng việt	alo alo	forecast	forecast	{"route": "blog/hc-ting-vit"}	f	\N	2026-05-18 14:22:18.120972+00
73a069e6-4a5b-4ab0-b1ba-996066bcdd29	7ccf2c86-7304-4b6b-bf31-089d97813ab2	786aafa2-55c4-4d8d-b914-67d023690587	HỌc tiếng việt	alo alo	forecast	forecast	{"route": "blog/hc-ting-vit"}	f	\N	2026-05-18 14:22:18.120972+00
77f2fbbb-dfdb-4bbb-9f8d-c4c1a6951f62	9637c189-68a4-4878-b23e-fa0415f058c1	786aafa2-55c4-4d8d-b914-67d023690587	HỌc tiếng việt	alo alo	forecast	forecast	{"route": "blog/hc-ting-vit"}	f	\N	2026-05-18 14:22:18.120972+00
1006829b-99ea-466c-a7f3-4e34b65e1e82	da74a312-081a-4403-83a3-a3d3bc43fc0c	786aafa2-55c4-4d8d-b914-67d023690587	HỌc tiếng việt	alo alo	forecast	forecast	{"route": "blog/hc-ting-vit"}	f	\N	2026-05-18 14:22:18.120972+00
ae8cbe4c-187e-4834-b898-1d97cf83cb75	26b52365-6979-452d-9899-9606ed772ff6	786aafa2-55c4-4d8d-b914-67d023690587	HỌc tiếng việt	alo alo	forecast	forecast	{"route": "blog/hc-ting-vit"}	f	\N	2026-05-18 14:22:18.120972+00
ebc0dda7-fbf7-4f4c-8bd2-4b645efe0956	17964b0e-ba35-4c9f-b101-7c9e48e3b920	786aafa2-55c4-4d8d-b914-67d023690587	HỌc tiếng việt	alo alo	forecast	forecast	{"route": "blog/hc-ting-vit"}	f	\N	2026-05-18 14:22:18.120972+00
da4edde8-8bc9-4782-88d7-0dcef2c89a04	4574e198-338f-4aba-8fc0-e0c0d8ef7dce	786aafa2-55c4-4d8d-b914-67d023690587	HỌc tiếng việt	alo alo	forecast	forecast	{"route": "blog/hc-ting-vit"}	f	\N	2026-05-18 14:22:18.120972+00
08432321-caad-4f92-a195-a835c8e2b2a6	12064a1b-59cf-43ef-9096-faf8a672ffdb	786aafa2-55c4-4d8d-b914-67d023690587	HỌc tiếng việt	alo alo	forecast	forecast	{"route": "blog/hc-ting-vit"}	f	\N	2026-05-18 14:22:18.120972+00
fe5ef2ce-05eb-44b7-af17-ea2ec0a55ad7	8fdcf1b2-90e8-4ec3-ad3f-fc3cc2d9e17a	786aafa2-55c4-4d8d-b914-67d023690587	HỌc tiếng việt	alo alo	forecast	forecast	{"route": "blog/hc-ting-vit"}	t	2026-05-18 14:22:33.884069+00	2026-05-18 14:22:18.120972+00
d19d22d7-398b-4880-aa1c-d3b8d3a939eb	98fdafa6-5af0-4496-9d41-71074c7684cd	2e708d25-2209-4323-b267-6f70e5b6137d	KKK	Học học nx học mãi	news	news	{"route": "blog/kkk"}	f	\N	2026-05-18 14:37:37.567164+00
926e219b-a58d-4023-9954-0af16a7fe611	34081509-7190-4e7f-9d4b-f27af82ebea8	2e708d25-2209-4323-b267-6f70e5b6137d	KKK	Học học nx học mãi	news	news	{"route": "blog/kkk"}	f	\N	2026-05-18 14:37:37.567164+00
7fc4f81d-79dd-459d-a75e-4fc4c32a9b02	7ccf2c86-7304-4b6b-bf31-089d97813ab2	2e708d25-2209-4323-b267-6f70e5b6137d	KKK	Học học nx học mãi	news	news	{"route": "blog/kkk"}	f	\N	2026-05-18 14:37:37.567164+00
73f5630d-740c-4935-a1d9-513dc3176611	9637c189-68a4-4878-b23e-fa0415f058c1	2e708d25-2209-4323-b267-6f70e5b6137d	KKK	Học học nx học mãi	news	news	{"route": "blog/kkk"}	f	\N	2026-05-18 14:37:37.567164+00
5b22dec7-751d-4399-89f1-62908e90dd48	da74a312-081a-4403-83a3-a3d3bc43fc0c	2e708d25-2209-4323-b267-6f70e5b6137d	KKK	Học học nx học mãi	news	news	{"route": "blog/kkk"}	f	\N	2026-05-18 14:37:37.567164+00
635a3eb5-9396-4f4c-a591-57b2e5991f75	26b52365-6979-452d-9899-9606ed772ff6	2e708d25-2209-4323-b267-6f70e5b6137d	KKK	Học học nx học mãi	news	news	{"route": "blog/kkk"}	f	\N	2026-05-18 14:37:37.567164+00
e23e269e-d8c4-4f29-bc7c-a6a672fe0914	17964b0e-ba35-4c9f-b101-7c9e48e3b920	2e708d25-2209-4323-b267-6f70e5b6137d	KKK	Học học nx học mãi	news	news	{"route": "blog/kkk"}	f	\N	2026-05-18 14:37:37.567164+00
14eafaa3-7d23-4510-a3ca-31e0da0a3759	4574e198-338f-4aba-8fc0-e0c0d8ef7dce	2e708d25-2209-4323-b267-6f70e5b6137d	KKK	Học học nx học mãi	news	news	{"route": "blog/kkk"}	f	\N	2026-05-18 14:37:37.567164+00
df7831a2-ee8f-41fc-8969-afc9571b5fd8	12064a1b-59cf-43ef-9096-faf8a672ffdb	2e708d25-2209-4323-b267-6f70e5b6137d	KKK	Học học nx học mãi	news	news	{"route": "blog/kkk"}	f	\N	2026-05-18 14:37:37.567164+00
a802fe46-5b29-4ba2-af7c-d5ddb0280f4b	98fdafa6-5af0-4496-9d41-71074c7684cd	399969c8-883c-44c1-9be6-f1a01a30db97	Good job	Fighting	event	event	{}	f	\N	2026-05-18 14:37:54.996933+00
d0a2420e-eb14-4121-a624-7461d54cc3af	34081509-7190-4e7f-9d4b-f27af82ebea8	399969c8-883c-44c1-9be6-f1a01a30db97	Good job	Fighting	event	event	{}	f	\N	2026-05-18 14:37:54.996933+00
3a71ba9f-ab22-407a-b49b-48a92addf183	7ccf2c86-7304-4b6b-bf31-089d97813ab2	399969c8-883c-44c1-9be6-f1a01a30db97	Good job	Fighting	event	event	{}	f	\N	2026-05-18 14:37:54.996933+00
a952d680-a99b-40bc-9f67-fe778f008905	8fdcf1b2-90e8-4ec3-ad3f-fc3cc2d9e17a	2e708d25-2209-4323-b267-6f70e5b6137d	KKK	Học học nx học mãi	news	news	{"route": "blog/kkk"}	t	2026-05-18 14:38:04.330026+00	2026-05-18 14:37:37.567164+00
7e1451f1-f8a9-44a9-bdf9-6e505c4eae68	9637c189-68a4-4878-b23e-fa0415f058c1	399969c8-883c-44c1-9be6-f1a01a30db97	Good job	Fighting	event	event	{}	f	\N	2026-05-18 14:37:54.996933+00
819b9892-6667-48fc-999d-0c3d1583fe2b	da74a312-081a-4403-83a3-a3d3bc43fc0c	399969c8-883c-44c1-9be6-f1a01a30db97	Good job	Fighting	event	event	{}	f	\N	2026-05-18 14:37:54.996933+00
6a885a18-ed09-4b8a-836a-938c8bedacbd	26b52365-6979-452d-9899-9606ed772ff6	399969c8-883c-44c1-9be6-f1a01a30db97	Good job	Fighting	event	event	{}	f	\N	2026-05-18 14:37:54.996933+00
34dcb594-b798-40c5-9aaa-bc7cd8f36744	17964b0e-ba35-4c9f-b101-7c9e48e3b920	399969c8-883c-44c1-9be6-f1a01a30db97	Good job	Fighting	event	event	{}	f	\N	2026-05-18 14:37:54.996933+00
b2258e3f-e32b-42ca-bde3-878cd9e20b45	4574e198-338f-4aba-8fc0-e0c0d8ef7dce	399969c8-883c-44c1-9be6-f1a01a30db97	Good job	Fighting	event	event	{}	f	\N	2026-05-18 14:37:54.996933+00
08089dc7-3f50-4740-93ab-ec99488343f7	12064a1b-59cf-43ef-9096-faf8a672ffdb	399969c8-883c-44c1-9be6-f1a01a30db97	Good job	Fighting	event	event	{}	f	\N	2026-05-18 14:37:54.996933+00
efb12912-64de-4431-9734-23d905b7671e	8fdcf1b2-90e8-4ec3-ad3f-fc3cc2d9e17a	399969c8-883c-44c1-9be6-f1a01a30db97	Good job	Fighting	event	event	{}	t	2026-05-18 14:38:03.508961+00	2026-05-18 14:37:54.996933+00
4caf039e-4348-4577-b382-98a190d607ee	98fdafa6-5af0-4496-9d41-71074c7684cd	31512a0f-c111-4d18-b566-f999e54f053c	kkkkk	kkkkk	event	event	{}	f	\N	2026-05-18 15:21:23.833601+00
4a20f745-ebc4-43f0-818d-e6f8e5dda286	34081509-7190-4e7f-9d4b-f27af82ebea8	31512a0f-c111-4d18-b566-f999e54f053c	kkkkk	kkkkk	event	event	{}	f	\N	2026-05-18 15:21:23.833601+00
25915808-fff9-43d6-9914-52ea0603ca78	7ccf2c86-7304-4b6b-bf31-089d97813ab2	31512a0f-c111-4d18-b566-f999e54f053c	kkkkk	kkkkk	event	event	{}	f	\N	2026-05-18 15:21:23.833601+00
d2321e05-9ec9-4d01-9dfa-d720afcc7032	9637c189-68a4-4878-b23e-fa0415f058c1	31512a0f-c111-4d18-b566-f999e54f053c	kkkkk	kkkkk	event	event	{}	f	\N	2026-05-18 15:21:23.833601+00
d386016e-672d-4b77-9ab2-f99aab588780	da74a312-081a-4403-83a3-a3d3bc43fc0c	31512a0f-c111-4d18-b566-f999e54f053c	kkkkk	kkkkk	event	event	{}	f	\N	2026-05-18 15:21:23.833601+00
61b87860-fb84-41e6-a501-7e7221426764	26b52365-6979-452d-9899-9606ed772ff6	31512a0f-c111-4d18-b566-f999e54f053c	kkkkk	kkkkk	event	event	{}	f	\N	2026-05-18 15:21:23.833601+00
6d7b3b03-0bca-4b46-881f-3a49b11c4545	17964b0e-ba35-4c9f-b101-7c9e48e3b920	31512a0f-c111-4d18-b566-f999e54f053c	kkkkk	kkkkk	event	event	{}	f	\N	2026-05-18 15:21:23.833601+00
0fa4316f-1386-4edc-8b0d-732bd5d026ae	4574e198-338f-4aba-8fc0-e0c0d8ef7dce	31512a0f-c111-4d18-b566-f999e54f053c	kkkkk	kkkkk	event	event	{}	f	\N	2026-05-18 15:21:23.833601+00
0b24b769-da2a-4b72-b3cb-9c7553201c3c	12064a1b-59cf-43ef-9096-faf8a672ffdb	31512a0f-c111-4d18-b566-f999e54f053c	kkkkk	kkkkk	event	event	{}	f	\N	2026-05-18 15:21:23.833601+00
d2f580b5-e84e-47f2-8154-e51666126d1a	8fdcf1b2-90e8-4ec3-ad3f-fc3cc2d9e17a	31512a0f-c111-4d18-b566-f999e54f053c	kkkkk	kkkkk	event	event	{}	f	\N	2026-05-18 15:21:23.833601+00
34c04596-6bb5-4ce4-8f5d-74936c6e0428	98fdafa6-5af0-4496-9d41-71074c7684cd	e2c3a808-fae5-42c3-b804-9aefbb0a84fe	hihi	hi	event	event	{}	f	\N	2026-05-18 15:21:48.949555+00
ebcc3966-866a-439d-a224-f8c6e0d62c1e	34081509-7190-4e7f-9d4b-f27af82ebea8	e2c3a808-fae5-42c3-b804-9aefbb0a84fe	hihi	hi	event	event	{}	f	\N	2026-05-18 15:21:48.949555+00
3db4509e-f161-4c6d-9e06-6d6d68b759d0	7ccf2c86-7304-4b6b-bf31-089d97813ab2	e2c3a808-fae5-42c3-b804-9aefbb0a84fe	hihi	hi	event	event	{}	f	\N	2026-05-18 15:21:48.949555+00
17f02c02-d5c9-4b79-a78e-ffa570b9ff9b	9637c189-68a4-4878-b23e-fa0415f058c1	e2c3a808-fae5-42c3-b804-9aefbb0a84fe	hihi	hi	event	event	{}	f	\N	2026-05-18 15:21:48.949555+00
601f0d59-5016-4fb9-bb3b-dfa7d1fac843	da74a312-081a-4403-83a3-a3d3bc43fc0c	e2c3a808-fae5-42c3-b804-9aefbb0a84fe	hihi	hi	event	event	{}	f	\N	2026-05-18 15:21:48.949555+00
1f6f196a-bb5c-4ba4-9c57-80d6e65401d6	26b52365-6979-452d-9899-9606ed772ff6	e2c3a808-fae5-42c3-b804-9aefbb0a84fe	hihi	hi	event	event	{}	f	\N	2026-05-18 15:21:48.949555+00
a2876d54-4e7b-4136-b29d-a101b6053979	17964b0e-ba35-4c9f-b101-7c9e48e3b920	e2c3a808-fae5-42c3-b804-9aefbb0a84fe	hihi	hi	event	event	{}	f	\N	2026-05-18 15:21:48.949555+00
ec2d5a56-fc97-43b3-8495-3cf572906977	4574e198-338f-4aba-8fc0-e0c0d8ef7dce	e2c3a808-fae5-42c3-b804-9aefbb0a84fe	hihi	hi	event	event	{}	f	\N	2026-05-18 15:21:48.949555+00
150a89b9-1dd5-4d31-b333-935cd2a92e28	12064a1b-59cf-43ef-9096-faf8a672ffdb	e2c3a808-fae5-42c3-b804-9aefbb0a84fe	hihi	hi	event	event	{}	f	\N	2026-05-18 15:21:48.949555+00
f9807b7f-8428-4c06-aa82-ec7508eb9428	8fdcf1b2-90e8-4ec3-ad3f-fc3cc2d9e17a	e2c3a808-fae5-42c3-b804-9aefbb0a84fe	hihi	hi	event	event	{}	f	\N	2026-05-18 15:21:48.949555+00
e653e167-b858-4d56-91cb-51179328a266	98fdafa6-5af0-4496-9d41-71074c7684cd	3c1f442a-8678-49a0-8700-f02dbdf7f68d	hiiiiokkl	A new IELTS article is available in Unilingo.	forecast	forecast	{"route": "blog/hiiiiokkl"}	f	\N	2026-05-18 15:22:12.956996+00
56bfdf02-c85d-455e-9fa6-41da1861c26f	34081509-7190-4e7f-9d4b-f27af82ebea8	3c1f442a-8678-49a0-8700-f02dbdf7f68d	hiiiiokkl	A new IELTS article is available in Unilingo.	forecast	forecast	{"route": "blog/hiiiiokkl"}	f	\N	2026-05-18 15:22:12.956996+00
e485eb2f-8a03-4d93-afe7-1a6d75f5ef10	7ccf2c86-7304-4b6b-bf31-089d97813ab2	3c1f442a-8678-49a0-8700-f02dbdf7f68d	hiiiiokkl	A new IELTS article is available in Unilingo.	forecast	forecast	{"route": "blog/hiiiiokkl"}	f	\N	2026-05-18 15:22:12.956996+00
b5055203-6c17-4931-ad89-16b386799641	9637c189-68a4-4878-b23e-fa0415f058c1	3c1f442a-8678-49a0-8700-f02dbdf7f68d	hiiiiokkl	A new IELTS article is available in Unilingo.	forecast	forecast	{"route": "blog/hiiiiokkl"}	f	\N	2026-05-18 15:22:12.956996+00
2c518319-3644-4802-9765-9f409401b135	da74a312-081a-4403-83a3-a3d3bc43fc0c	3c1f442a-8678-49a0-8700-f02dbdf7f68d	hiiiiokkl	A new IELTS article is available in Unilingo.	forecast	forecast	{"route": "blog/hiiiiokkl"}	f	\N	2026-05-18 15:22:12.956996+00
09b2b7fc-eb1b-48de-815e-05050d799b27	26b52365-6979-452d-9899-9606ed772ff6	3c1f442a-8678-49a0-8700-f02dbdf7f68d	hiiiiokkl	A new IELTS article is available in Unilingo.	forecast	forecast	{"route": "blog/hiiiiokkl"}	f	\N	2026-05-18 15:22:12.956996+00
d3ac44eb-ad84-4342-83b6-7c4924efc53d	17964b0e-ba35-4c9f-b101-7c9e48e3b920	3c1f442a-8678-49a0-8700-f02dbdf7f68d	hiiiiokkl	A new IELTS article is available in Unilingo.	forecast	forecast	{"route": "blog/hiiiiokkl"}	f	\N	2026-05-18 15:22:12.956996+00
2051d838-7af9-4536-9229-3ea9da88b139	4574e198-338f-4aba-8fc0-e0c0d8ef7dce	3c1f442a-8678-49a0-8700-f02dbdf7f68d	hiiiiokkl	A new IELTS article is available in Unilingo.	forecast	forecast	{"route": "blog/hiiiiokkl"}	f	\N	2026-05-18 15:22:12.956996+00
12038eb2-c070-458e-acee-5c7d73587159	12064a1b-59cf-43ef-9096-faf8a672ffdb	3c1f442a-8678-49a0-8700-f02dbdf7f68d	hiiiiokkl	A new IELTS article is available in Unilingo.	forecast	forecast	{"route": "blog/hiiiiokkl"}	f	\N	2026-05-18 15:22:12.956996+00
e268097b-2e5d-471f-ab49-8194d25d29ae	8fdcf1b2-90e8-4ec3-ad3f-fc3cc2d9e17a	3c1f442a-8678-49a0-8700-f02dbdf7f68d	hiiiiokkl	A new IELTS article is available in Unilingo.	forecast	forecast	{"route": "blog/hiiiiokkl"}	f	\N	2026-05-18 15:22:12.956996+00
5e89fe3d-4fdc-4e10-a16c-b271ff73b941	98fdafa6-5af0-4496-9d41-71074c7684cd	5d129b5d-e0b2-4018-89d9-142785d393fa	thien kun 	hihi	event	event	{}	f	\N	2026-05-18 15:32:36.409872+00
bc65186c-eaa2-4fe0-a394-4327c4dc1896	34081509-7190-4e7f-9d4b-f27af82ebea8	5d129b5d-e0b2-4018-89d9-142785d393fa	thien kun 	hihi	event	event	{}	f	\N	2026-05-18 15:32:36.409872+00
2cd08463-2caa-4c56-ba34-bebd8c2c1b78	7ccf2c86-7304-4b6b-bf31-089d97813ab2	5d129b5d-e0b2-4018-89d9-142785d393fa	thien kun 	hihi	event	event	{}	f	\N	2026-05-18 15:32:36.409872+00
eae7bb71-c887-4a44-9834-3a02c3f9ef21	9637c189-68a4-4878-b23e-fa0415f058c1	5d129b5d-e0b2-4018-89d9-142785d393fa	thien kun 	hihi	event	event	{}	f	\N	2026-05-18 15:32:36.409872+00
6aa737d2-720c-434b-a1df-f18ba7fcfe37	da74a312-081a-4403-83a3-a3d3bc43fc0c	5d129b5d-e0b2-4018-89d9-142785d393fa	thien kun 	hihi	event	event	{}	f	\N	2026-05-18 15:32:36.409872+00
9437c165-b118-4987-96a4-605d21695a46	26b52365-6979-452d-9899-9606ed772ff6	5d129b5d-e0b2-4018-89d9-142785d393fa	thien kun 	hihi	event	event	{}	f	\N	2026-05-18 15:32:36.409872+00
5135a88f-813e-4ed7-8477-20803ae5af02	17964b0e-ba35-4c9f-b101-7c9e48e3b920	5d129b5d-e0b2-4018-89d9-142785d393fa	thien kun 	hihi	event	event	{}	f	\N	2026-05-18 15:32:36.409872+00
c1e291da-f370-47fe-80c7-a6ebf29ff418	4574e198-338f-4aba-8fc0-e0c0d8ef7dce	5d129b5d-e0b2-4018-89d9-142785d393fa	thien kun 	hihi	event	event	{}	f	\N	2026-05-18 15:32:36.409872+00
425eb4af-7aa5-4965-8ab9-b3d327104533	12064a1b-59cf-43ef-9096-faf8a672ffdb	5d129b5d-e0b2-4018-89d9-142785d393fa	thien kun 	hihi	event	event	{}	f	\N	2026-05-18 15:32:36.409872+00
bfee0d6c-0ff0-4f2a-8d92-2e1c633e2d67	8fdcf1b2-90e8-4ec3-ad3f-fc3cc2d9e17a	5d129b5d-e0b2-4018-89d9-142785d393fa	thien kun 	hihi	event	event	{}	t	2026-05-18 15:32:42.933896+00	2026-05-18 15:32:36.409872+00
d3b169f1-1f4f-44a0-955f-ac7a6a67ba73	98fdafa6-5af0-4496-9d41-71074c7684cd	7275703b-37f3-4e00-b580-49e5e8102b41	kkk	123	forecast	forecast	{"route": "blog/kkk-7c2e5c"}	f	\N	2026-05-18 15:33:59.42712+00
44adb2e6-7d5b-48c4-a2cd-f6ab022f9dc2	34081509-7190-4e7f-9d4b-f27af82ebea8	7275703b-37f3-4e00-b580-49e5e8102b41	kkk	123	forecast	forecast	{"route": "blog/kkk-7c2e5c"}	f	\N	2026-05-18 15:33:59.42712+00
d6c514d0-1607-48c7-8ff6-5fe6f10e2faf	7ccf2c86-7304-4b6b-bf31-089d97813ab2	7275703b-37f3-4e00-b580-49e5e8102b41	kkk	123	forecast	forecast	{"route": "blog/kkk-7c2e5c"}	f	\N	2026-05-18 15:33:59.42712+00
765d5a7e-3f46-4d3e-b93b-2bc6cc3db129	9637c189-68a4-4878-b23e-fa0415f058c1	7275703b-37f3-4e00-b580-49e5e8102b41	kkk	123	forecast	forecast	{"route": "blog/kkk-7c2e5c"}	f	\N	2026-05-18 15:33:59.42712+00
48caeaa9-1533-442d-b73f-c9fd6c812784	da74a312-081a-4403-83a3-a3d3bc43fc0c	7275703b-37f3-4e00-b580-49e5e8102b41	kkk	123	forecast	forecast	{"route": "blog/kkk-7c2e5c"}	f	\N	2026-05-18 15:33:59.42712+00
6ce747c8-4fce-4d58-80e6-14383f679c41	26b52365-6979-452d-9899-9606ed772ff6	7275703b-37f3-4e00-b580-49e5e8102b41	kkk	123	forecast	forecast	{"route": "blog/kkk-7c2e5c"}	f	\N	2026-05-18 15:33:59.42712+00
ca797099-24a4-429a-b6e2-c8d33f46dd45	17964b0e-ba35-4c9f-b101-7c9e48e3b920	7275703b-37f3-4e00-b580-49e5e8102b41	kkk	123	forecast	forecast	{"route": "blog/kkk-7c2e5c"}	f	\N	2026-05-18 15:33:59.42712+00
ed2170e5-391c-473b-804e-b67dcb2d3aa3	98fdafa6-5af0-4496-9d41-71074c7684cd	8bb175bd-3bff-4572-a16c-fc9f1e9bda75	saiksđ	jfhekdnwkfw	event	event	{}	f	\N	2026-05-18 16:19:34.990881+00
29c64e36-15b9-44ef-82f2-8439c792cfcc	34081509-7190-4e7f-9d4b-f27af82ebea8	8bb175bd-3bff-4572-a16c-fc9f1e9bda75	saiksđ	jfhekdnwkfw	event	event	{}	f	\N	2026-05-18 16:19:34.990881+00
2679b71a-d26f-4057-a8c5-e5f006ecc2d7	4574e198-338f-4aba-8fc0-e0c0d8ef7dce	7275703b-37f3-4e00-b580-49e5e8102b41	kkk	123	forecast	forecast	{"route": "blog/kkk-7c2e5c"}	f	\N	2026-05-18 15:33:59.42712+00
34712af2-cc40-4a11-9da7-cd34d32cd5b7	12064a1b-59cf-43ef-9096-faf8a672ffdb	7275703b-37f3-4e00-b580-49e5e8102b41	kkk	123	forecast	forecast	{"route": "blog/kkk-7c2e5c"}	f	\N	2026-05-18 15:33:59.42712+00
8fca4715-1287-4147-b6b6-57ffc99f0c7d	8fdcf1b2-90e8-4ec3-ad3f-fc3cc2d9e17a	7275703b-37f3-4e00-b580-49e5e8102b41	kkk	123	forecast	forecast	{"route": "blog/kkk-7c2e5c"}	f	\N	2026-05-18 15:33:59.42712+00
e4751374-56ce-4d67-8f82-72dccd340b99	98fdafa6-5af0-4496-9d41-71074c7684cd	99f3cbbb-51f8-45f4-8968-fe4c16aed498	kkk	12334	forecast	forecast	{"route": "blog/kkk-7c2e5c"}	f	\N	2026-05-18 16:18:47.949737+00
f4d39815-42d3-45f5-b472-e7ec5141a1f2	34081509-7190-4e7f-9d4b-f27af82ebea8	99f3cbbb-51f8-45f4-8968-fe4c16aed498	kkk	12334	forecast	forecast	{"route": "blog/kkk-7c2e5c"}	f	\N	2026-05-18 16:18:47.949737+00
847c01a1-be4a-42d9-ac7b-0358e5e12cb7	7ccf2c86-7304-4b6b-bf31-089d97813ab2	99f3cbbb-51f8-45f4-8968-fe4c16aed498	kkk	12334	forecast	forecast	{"route": "blog/kkk-7c2e5c"}	f	\N	2026-05-18 16:18:47.949737+00
903f87f4-3060-481e-8b1c-e29cd925b2ee	9637c189-68a4-4878-b23e-fa0415f058c1	99f3cbbb-51f8-45f4-8968-fe4c16aed498	kkk	12334	forecast	forecast	{"route": "blog/kkk-7c2e5c"}	f	\N	2026-05-18 16:18:47.949737+00
5c0df579-ed75-447e-a884-a2235c112faa	da74a312-081a-4403-83a3-a3d3bc43fc0c	99f3cbbb-51f8-45f4-8968-fe4c16aed498	kkk	12334	forecast	forecast	{"route": "blog/kkk-7c2e5c"}	f	\N	2026-05-18 16:18:47.949737+00
8055bb24-0d2f-465a-af6c-ab162d602cef	26b52365-6979-452d-9899-9606ed772ff6	99f3cbbb-51f8-45f4-8968-fe4c16aed498	kkk	12334	forecast	forecast	{"route": "blog/kkk-7c2e5c"}	f	\N	2026-05-18 16:18:47.949737+00
2d09ea9a-a8f5-4845-9fb6-0a456c87ad55	17964b0e-ba35-4c9f-b101-7c9e48e3b920	99f3cbbb-51f8-45f4-8968-fe4c16aed498	kkk	12334	forecast	forecast	{"route": "blog/kkk-7c2e5c"}	f	\N	2026-05-18 16:18:47.949737+00
d901ba9c-77a5-4a59-9ddb-627a69dcdbf9	4574e198-338f-4aba-8fc0-e0c0d8ef7dce	99f3cbbb-51f8-45f4-8968-fe4c16aed498	kkk	12334	forecast	forecast	{"route": "blog/kkk-7c2e5c"}	f	\N	2026-05-18 16:18:47.949737+00
7ab36efc-bd62-4e90-b00f-76749f2d751c	12064a1b-59cf-43ef-9096-faf8a672ffdb	99f3cbbb-51f8-45f4-8968-fe4c16aed498	kkk	12334	forecast	forecast	{"route": "blog/kkk-7c2e5c"}	f	\N	2026-05-18 16:18:47.949737+00
95dba26f-93b7-4210-9b14-f2b79a987926	8fdcf1b2-90e8-4ec3-ad3f-fc3cc2d9e17a	99f3cbbb-51f8-45f4-8968-fe4c16aed498	kkk	12334	forecast	forecast	{"route": "blog/kkk-7c2e5c"}	f	\N	2026-05-18 16:18:47.949737+00
bb2fc71d-eedb-4c99-a909-3d9189f6f0a9	7ccf2c86-7304-4b6b-bf31-089d97813ab2	8bb175bd-3bff-4572-a16c-fc9f1e9bda75	saiksđ	jfhekdnwkfw	event	event	{}	f	\N	2026-05-18 16:19:34.990881+00
d3bb49ba-32d2-4d54-beb9-15340229917a	9637c189-68a4-4878-b23e-fa0415f058c1	8bb175bd-3bff-4572-a16c-fc9f1e9bda75	saiksđ	jfhekdnwkfw	event	event	{}	f	\N	2026-05-18 16:19:34.990881+00
5d47036f-052e-465e-98d6-cbe743af19cb	da74a312-081a-4403-83a3-a3d3bc43fc0c	8bb175bd-3bff-4572-a16c-fc9f1e9bda75	saiksđ	jfhekdnwkfw	event	event	{}	f	\N	2026-05-18 16:19:34.990881+00
f6a18b89-1fbb-4c59-9ea8-3f5b2e1f02ae	26b52365-6979-452d-9899-9606ed772ff6	8bb175bd-3bff-4572-a16c-fc9f1e9bda75	saiksđ	jfhekdnwkfw	event	event	{}	f	\N	2026-05-18 16:19:34.990881+00
956f05d1-3d71-4d16-b7cb-4f0fdbc342fd	17964b0e-ba35-4c9f-b101-7c9e48e3b920	8bb175bd-3bff-4572-a16c-fc9f1e9bda75	saiksđ	jfhekdnwkfw	event	event	{}	f	\N	2026-05-18 16:19:34.990881+00
68b914fa-f66a-471c-8722-f43c438e1142	4574e198-338f-4aba-8fc0-e0c0d8ef7dce	8bb175bd-3bff-4572-a16c-fc9f1e9bda75	saiksđ	jfhekdnwkfw	event	event	{}	f	\N	2026-05-18 16:19:34.990881+00
a5c7b2bb-b5cf-4ce5-b0e6-8e0b8de90bb7	12064a1b-59cf-43ef-9096-faf8a672ffdb	8bb175bd-3bff-4572-a16c-fc9f1e9bda75	saiksđ	jfhekdnwkfw	event	event	{}	f	\N	2026-05-18 16:19:34.990881+00
75d28b7a-c2ab-4401-ba8c-c8e2031eb72f	8fdcf1b2-90e8-4ec3-ad3f-fc3cc2d9e17a	8bb175bd-3bff-4572-a16c-fc9f1e9bda75	saiksđ	jfhekdnwkfw	event	event	{}	f	\N	2026-05-18 16:19:34.990881+00
3dd712aa-9c75-426d-8e10-ecf1d11d8891	9637c189-68a4-4878-b23e-fa0415f058c1	94009a2c-5a6f-4b5b-9e45-db6eede6e1d0	Your streak is waiting	Complete one short speaking practice today to keep your streak alive.	streak	system	{"route": "practice"}	f	\N	2026-05-18 18:00:00.183468+00
e9f35a77-211f-48dd-88e8-8a1c7c3b67ed	17964b0e-ba35-4c9f-b101-7c9e48e3b920	94009a2c-5a6f-4b5b-9e45-db6eede6e1d0	Your streak is waiting	Complete one short speaking practice today to keep your streak alive.	streak	system	{"route": "practice"}	f	\N	2026-05-18 18:00:00.183468+00
bd3ecb3e-aca3-4e18-bc96-4c421508ec51	26b52365-6979-452d-9899-9606ed772ff6	94009a2c-5a6f-4b5b-9e45-db6eede6e1d0	Your streak is waiting	Complete one short speaking practice today to keep your streak alive.	streak	system	{"route": "practice"}	f	\N	2026-05-18 18:00:00.183468+00
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, email, username, full_name, hashed_password, avatar_url, auth_provider, firebase_uid, target_band_score, target_exam_date, current_level, total_xp, current_streak, longest_streak, is_active, is_admin, created_at, updated_at, goal_target, goal_start_date) FROM stdin;
98fdafa6-5af0-4496-9d41-71074c7684cd	demo@unilingo.com	\N	Thiên Ngọc	$2b$12$DfOTr4meGnk2g6ngPJvLi.g.UgmRmOmTxLbub4WwwCqVAchLz.akK	\N	email	\N	7	\N	intermediate	0	0	0	t	f	2026-04-24 07:05:27.563813+00	2026-04-24 07:05:27.563813+00	\N	\N
7ccf2c86-7304-4b6b-bf31-089d97813ab2	thien@gmail.com	\N	Thien Pham	$2b$12$OWF.ONAdWvEOyiZAOSygJ.D5Jjc4bhkDzZiOeDyVEE.1erIV0pcMG	\N	email	\N	9	\N	advanced	0	0	0	t	f	2026-05-03 12:26:24.307869+00	2026-05-03 12:27:59.805816+00	\N	\N
9637c189-68a4-4878-b23e-fa0415f058c1	phamngocthienpy2005@gmail.com	\N	Thien Pham Ngoc	$2b$12$CLZvbwrlK/YTjwsbDLqxn.VyhHelEpykPbym0JWE5KwSwShpn2axG	\N	email	\N	6	\N	intermediate	850	1	3	t	f	2026-05-09 08:31:58.02018+00	2026-05-17 11:15:16.040908+00	14	2026-05-09
34081509-7190-4e7f-9d4b-f27af82ebea8	burizamon@gmail.com	\N	Phạm Thiện	$2b$12$nTEATfCNvZzENmscNBHDoeY.FZl2FxT78hvRWVksIar3E.JJ2GYhK	\N	email	\N	7.5	\N	elementary	0	0	0	t	t	2026-04-24 11:19:52.289477+00	2026-04-24 11:41:06.757028+00	\N	\N
da74a312-081a-4403-83a3-a3d3bc43fc0c	baochau@gmail.com	\N	Bao Chau	$2b$12$kPNjyw4hblvVvUJbqRE6q.Bi/YW0o8H3L2qa7wBkRPGqlew5VXtd2	\N	email	\N	6	\N	intermediate	70	0	0	t	f	2026-05-09 08:34:59.547483+00	2026-05-09 09:52:11.337604+00	7	2026-05-09
17964b0e-ba35-4c9f-b101-7c9e48e3b920	kimquan287@gmail.com	\N	Dang Ngoc Khieu	$2b$12$4XOw9G3vx5s09cC4UGXTyuhvs3bPThebJtX6XfD4GWNCc80S8Goh2	\N	email	\N	7	\N	intermediate	650	1	1	t	f	2026-05-10 15:21:20.022439+00	2026-05-10 17:40:56.07261+00	14	2026-05-10
8fdcf1b2-90e8-4ec3-ad3f-fc3cc2d9e17a	thienmapu2085@gmail.com	\N	Thien Pham	$2b$12$5QQz6wbSXZWdVXsalFHIj.vbEUXYg7Ol2NvQ7cFsumTlLWiGC3XZW	\N	email	\N	7	\N	intermediate	120	1	1	t	f	2026-05-18 13:26:31.716113+00	2026-05-18 16:10:05.139847+00	7	2026-05-18
4574e198-338f-4aba-8fc0-e0c0d8ef7dce	hahuytoan2006@gmail.com	\N	Ha Huy Toan	$2b$12$e1LAVuR4D.uUNl.MowQIbu4yrxT1xmWD4b4CACM672CnxgNymqVSq	\N	email	\N	7	\N	intermediate	20	0	0	t	f	2026-05-10 19:37:30.976214+00	2026-05-10 19:38:01.8018+00	7	2026-05-10
26b52365-6979-452d-9899-9606ed772ff6	23521485@gm.uit.edu.vn	\N	Thien UIT	$2b$12$RoSpe9fFX/.MJ7mcpmKOEexMcVSKuymulBHqCEr1iNpb8hlyCd.AO	\N	email	\N	6.5	\N	intermediate	180	1	1	t	f	2026-05-10 11:32:57.577908+00	2026-05-10 15:10:31.106295+00	7	2026-05-10
12064a1b-59cf-43ef-9096-faf8a672ffdb	baochaune21@gmail.com	\N	CHAU BAO	$2b$12$/FabwTyo358hg/rRzGTJr.t77.umd9AL9nbxzx02XAO4/JlElUJzC	\N	email	\N	7	\N	intermediate	120	0	0	t	f	2026-05-11 07:13:41.651758+00	2026-05-11 07:14:47.380684+00	30	2026-05-11
\.


--
-- Data for Name: vocabulary_notes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.vocabulary_notes (id, user_id, word, phonetic, audio_url, definitions, examples, user_note, source_context, source_attempt_id, mastery_level, review_count, next_review_at, created_at, updated_at) FROM stdin;
73be108d-ef05-4fa1-947e-963b217e620d	34081509-7190-4e7f-9d4b-f27af82ebea8	push	[pʷʊʃ]	https://api.dictionaryapi.dev/media/pronunciations/en/push-1-us.mp3	[{"definition": "A short, directed application of force; an act of pushing.", "part_of_speech": "noun"}, {"definition": "An act of tensing the muscles of the abdomen in order to expel its contents.", "part_of_speech": "noun"}, {"definition": "A great effort (to do something).", "part_of_speech": "noun"}, {"definition": "To apply a force to (an object) such that it moves away from the person or thing applying the force.", "part_of_speech": "verb"}, {"definition": "To continually attempt to persuade (a person) into a particular course of action.", "part_of_speech": "verb"}, {"definition": "To press or urge forward; to drive.", "part_of_speech": "verb"}]	["Give the door a hard push if it sticks."]	\N	\N	\N	new	0	\N	2026-04-24 11:43:09.646217+00	2026-04-24 11:43:09.646217+00
e5ce9d9d-e102-4f80-86c2-7879e86dea80	34081509-7190-4e7f-9d4b-f27af82ebea8	haptic	\N	https://api.dictionaryapi.dev/media/pronunciations/en/haptic-au.mp3	[{"definition": "Of or relating to the sense of touch.", "part_of_speech": "adjective"}, {"definition": "Of or relating to haptics.", "part_of_speech": "adjective"}]	null	\N	\N	\N	new	0	\N	2026-04-24 11:43:28.222202+00	2026-04-24 11:43:28.222202+00
deec6bce-4205-4769-b0cb-f75425b44d70	7ccf2c86-7304-4b6b-bf31-089d97813ab2	accumulate	/əˈkjuːmjʊˌleɪt/	https://api.dictionaryapi.dev/media/pronunciations/en/accumulate-us.mp3	[{"definition": "To heap up in a mass; to pile up; to collect or bring together (either literally or figuratively)", "part_of_speech": "verb"}, {"definition": "To grow or increase in quantity or number; to increase greatly.", "part_of_speech": "verb"}, {"definition": "To take a higher degree at the same time with a lower degree, or at a shorter interval than usual.", "part_of_speech": "verb"}, {"definition": "Collected; accumulated.", "part_of_speech": "adjective"}]	["He wishes to accumulate a sum of money."]	\N	\N	\N	new	0	\N	2026-05-03 12:26:55.769023+00	2026-05-03 12:26:55.769023+00
748dc73c-3ef6-4af1-920d-985df048afaa	7ccf2c86-7304-4b6b-bf31-089d97813ab2	cat	/kat/	https://api.dictionaryapi.dev/media/pronunciations/en/cat-uk.mp3	[{"definition": "An animal of the family Felidae:", "part_of_speech": "noun"}, {"definition": "A person:", "part_of_speech": "noun"}, {"definition": "A strong tackle used to hoist an anchor to the cathead of a ship.", "part_of_speech": "noun"}, {"definition": "To hoist (the anchor) by its ring so that it hangs at the cathead.", "part_of_speech": "verb"}, {"definition": "To flog with a cat-o'-nine-tails.", "part_of_speech": "verb"}, {"definition": "To vomit.", "part_of_speech": "verb"}]	null	\N	\N	\N	new	0	\N	2026-05-03 12:27:47.47495+00	2026-05-03 12:27:47.47495+00
c46f45d1-6139-4cf3-b4b8-fac5c157f16d	9637c189-68a4-4878-b23e-fa0415f058c1	thank	[θaŋk]	https://api.dictionaryapi.dev/media/pronunciations/en/thank-us.mp3	[{"definition": "An expression of appreciation; a thought.", "part_of_speech": "noun"}]	null	\N	\N	\N	new	0	\N	2026-05-09 09:56:43.524053+00	2026-05-09 09:56:43.524053+00
6d0018e2-224d-4948-a7c0-5aaa03223f9c	9637c189-68a4-4878-b23e-fa0415f058c1	tulip	/ˈt(j)uːlɪp/	https://api.dictionaryapi.dev/media/pronunciations/en/tulip-us.mp3	[{"definition": "A type of flowering plant, genus Tulipa.", "part_of_speech": "noun"}, {"definition": "The flower of this plant.", "part_of_speech": "noun"}]	null	\N	\N	\N	new	0	\N	2026-05-10 07:12:38.496567+00	2026-05-10 07:12:38.496567+00
f3abfd8c-c73e-4a16-97b0-9892b0a8de9c	9637c189-68a4-4878-b23e-fa0415f058c1	hi	/haɪ/	https://api.dictionaryapi.dev/media/pronunciations/en/hi-1-uk.mp3	[{"definition": "The word \\"hi\\" used as a greeting.", "part_of_speech": "noun"}, {"definition": "A friendly, informal, casual greeting said when meeting someone.", "part_of_speech": "interjection"}, {"definition": "An exclamation to call attention.", "part_of_speech": "interjection"}, {"definition": "Expressing wonder or derision.", "part_of_speech": "interjection"}]	["I didn't even get a hi."]	\N	\N	\N	learning	0	\N	2026-05-10 09:01:10.468324+00	2026-05-10 11:30:02.477833+00
538844ef-5c5c-4779-89d0-c5a5ce19188b	9637c189-68a4-4878-b23e-fa0415f058c1	deduplicate	/diːˈdʒuːplɪkeɪt/	\N	[{"definition": "To eliminate redundant duplicate data from.", "part_of_speech": "verb"}]	null	\N	\N	\N	learning	0	\N	2026-05-10 09:01:21.866713+00	2026-05-10 09:54:08.798283+00
ffb0742a-0b0b-4ecb-aa59-fd9f0a86b5b2	9637c189-68a4-4878-b23e-fa0415f058c1	meet	/miːt/	https://api.dictionaryapi.dev/media/pronunciations/en/meet-uk.mp3	[{"definition": "A sports competition, especially for track and field (a track meet) or swimming (a swim meet).", "part_of_speech": "noun"}, {"definition": "A gathering of riders, horses and hounds for foxhunting; a field meet for hunting.", "part_of_speech": "noun"}, {"definition": "A meeting of two trains in opposite directions on a single track, when one is put into a siding to let the other cross.", "part_of_speech": "noun"}, {"definition": "To make contact (with) while in proximity.", "part_of_speech": "verb"}, {"definition": "(Of groups) To come together.", "part_of_speech": "verb"}, {"definition": "To make physical or perceptual contact.", "part_of_speech": "verb"}]	null	\N	\N	\N	mastered	0	\N	2026-05-09 09:56:59.867814+00	2026-05-10 11:29:56.885342+00
c542edb4-9541-43a1-8ed3-84ab1cf5a9e1	26b52365-6979-452d-9899-9606ed772ff6	hey	/heɪ/	https://api.dictionaryapi.dev/media/pronunciations/en/hey-au.mp3	[{"definition": "An exclamation to get attention.", "part_of_speech": "interjection"}, {"definition": "A protest or reprimand.", "part_of_speech": "interjection"}, {"definition": "An expression of surprise.", "part_of_speech": "interjection"}]	["Hey! Listen!"]	\N	\N	\N	new	0	\N	2026-05-10 11:33:45.496044+00	2026-05-10 15:18:02.242526+00
2e96fef0-5110-42a1-989a-ffebb85d9898	26b52365-6979-452d-9899-9606ed772ff6	circumstance	/-æns/	https://api.dictionaryapi.dev/media/pronunciations/en/circumstance-us.mp3	[{"definition": "That which attends, or relates to, or in some way affects, a fact or event; an attendant thing or state of things.", "part_of_speech": "noun"}, {"definition": "An event; a fact; a particular incident.", "part_of_speech": "noun"}, {"definition": "Circumlocution; detail.", "part_of_speech": "noun"}, {"definition": "To place in a particular situation, especially with regard to money or other resources.", "part_of_speech": "verb"}]	null	\N	\N	\N	new	0	\N	2026-05-10 11:36:41.993476+00	2026-05-10 15:18:01.142797+00
31c539bf-58a2-460a-9338-911796f2fea9	9637c189-68a4-4878-b23e-fa0415f058c1	sin	/sɪn/	https://api.dictionaryapi.dev/media/pronunciations/en/sin-1-us.mp3	[{"definition": "A violation of God's will or religious law.", "part_of_speech": "noun"}, {"definition": "A misdeed.", "part_of_speech": "noun"}, {"definition": "A sin offering; a sacrifice for sin.", "part_of_speech": "noun"}, {"definition": "To commit a sin.", "part_of_speech": "verb"}]	["As a Christian, I think this is a sin against God."]	\N	\N	\N	mastered	0	\N	2026-05-10 11:29:50.263748+00	2026-05-18 12:21:13.551968+00
1c7c94f7-f4b1-45e8-89ff-7b1f6e7c255c	9637c189-68a4-4878-b23e-fa0415f058c1	eat	/iːt/	https://api.dictionaryapi.dev/media/pronunciations/en/eat-uk.mp3	[{"definition": "Something to be eaten; a meal; a food item.", "part_of_speech": "noun"}, {"definition": "To ingest; to be ingested.", "part_of_speech": "verb"}, {"definition": "To use up.", "part_of_speech": "verb"}, {"definition": "To cause (someone) to worry.", "part_of_speech": "verb"}]	null	\N	\N	\N	mastered	0	\N	2026-05-10 10:01:32.862707+00	2026-05-18 12:21:15.291745+00
fd7df8ab-a0b4-4598-afb9-39fdc94d798f	9637c189-68a4-4878-b23e-fa0415f058c1	work	/wɜːk/	https://api.dictionaryapi.dev/media/pronunciations/en/work-uk.mp3	[{"definition": "(heading) Employment.", "part_of_speech": "noun"}, {"definition": "(heading) Effort.", "part_of_speech": "noun"}, {"definition": "Sustained effort to achieve a goal or result, especially overcoming obstacles.", "part_of_speech": "noun"}]	null	\N	\N	\N	mastered	0	\N	2026-05-10 19:34:10.524835+00	2026-05-18 12:21:12.540263+00
04dc59d6-a051-4bf9-a6fe-b5786ed4e4f4	26b52365-6979-452d-9899-9606ed772ff6	love	/lʊv/	https://api.dictionaryapi.dev/media/pronunciations/en/love-uk.mp3	[{"definition": "Strong affection.", "part_of_speech": "noun"}, {"definition": "A person who is the object of romantic feelings; a darling, a sweetheart, a beloved.", "part_of_speech": "noun"}, {"definition": "A term of friendly address, regardless of feelings.", "part_of_speech": "noun"}, {"definition": "(usually transitive, sometimes intransitive, stative) To have a strong affection for (someone or something).", "part_of_speech": "verb"}, {"definition": "To need, thrive on.", "part_of_speech": "verb"}, {"definition": "To be strongly inclined towards something; an emphatic form of like.", "part_of_speech": "verb"}]	null	\N	\N	\N	new	0	\N	2026-05-10 15:11:57.44446+00	2026-05-10 15:17:59.501779+00
deb0ca16-5ca5-4d25-b613-233d4eb928de	26b52365-6979-452d-9899-9606ed772ff6	crook	/kɹʊk/	https://api.dictionaryapi.dev/media/pronunciations/en/crook-au.mp3	[{"definition": "A bend; turn; curve; curvature; a flexure.", "part_of_speech": "noun"}, {"definition": "A bending of the knee; a genuflection.", "part_of_speech": "noun"}, {"definition": "A bent or curved part; a curving piece or portion (of anything).", "part_of_speech": "noun"}, {"definition": "To bend, or form into a hook.", "part_of_speech": "verb"}, {"definition": "To become bent or hooked.", "part_of_speech": "verb"}, {"definition": "To turn from the path of rectitude; to pervert; to misapply; to twist.", "part_of_speech": "verb"}]	["She held the baby in the crook of her arm."]	\N	\N	\N	new	0	\N	2026-05-10 15:18:16.996444+00	2026-05-10 15:18:16.996444+00
7b54a7c1-b25f-4372-a442-9e7715772427	26b52365-6979-452d-9899-9606ed772ff6	fuck	/fʊk/	https://api.dictionaryapi.dev/media/pronunciations/en/fuck-uk.mp3	[{"definition": "An act of sexual intercourse.", "part_of_speech": "noun"}, {"definition": "A sexual partner, especially a casual one.", "part_of_speech": "noun"}, {"definition": "A highly contemptible person.", "part_of_speech": "noun"}, {"definition": "To have sexual intercourse, to copulate.", "part_of_speech": "verb"}, {"definition": "To have sexual intercourse with.", "part_of_speech": "verb"}, {"definition": "To insert one’s penis, a dildo or other phallic object, into a specified orifice or cleft.", "part_of_speech": "verb"}, {"definition": "Used as an intensifier for the words \\"yes\\" and \\"no\\".", "part_of_speech": "adverb"}, {"definition": "Expressing dismay or discontent.", "part_of_speech": "interjection"}, {"definition": "Expressing surprise.", "part_of_speech": "interjection"}]	null	\N	\N	\N	new	0	\N	2026-05-10 15:18:31.588629+00	2026-05-10 15:18:31.588629+00
72204100-f65b-4a1a-b699-253e6b8d4ff8	17964b0e-ba35-4c9f-b101-7c9e48e3b920	forward	/ˈfoːwəd/	https://api.dictionaryapi.dev/media/pronunciations/en/forward-us.mp3	[{"definition": "One of the eight players (comprising two props, one hooker, two locks, two flankers and one number eight, collectively known as the pack) whose primary task is to gain and maintain possession of the ball (compare back).", "part_of_speech": "noun"}, {"definition": "A player on a team in football (soccer) in the row nearest to the opposing team's goal, who are therefore principally responsible for scoring goals.", "part_of_speech": "noun"}, {"definition": "An umbrella term for a centre or winger in ice hockey.", "part_of_speech": "noun"}, {"definition": "To advance, promote.", "part_of_speech": "verb"}, {"definition": "To send (a letter, email etc.) to a third party.", "part_of_speech": "verb"}, {"definition": "To assemble (a book) by sewing sections, attaching cover boards, and so on.", "part_of_speech": "verb"}, {"definition": "Toward the front or at the front.", "part_of_speech": "adjective"}, {"definition": "Without customary restraint or modesty; bold, cheeky, pert, presumptuous or pushy.", "part_of_speech": "adjective"}, {"definition": "Expected in the future.", "part_of_speech": "adjective"}, {"definition": "Towards the front or from the front.", "part_of_speech": "adverb"}, {"definition": "In the usual direction of travel.", "part_of_speech": "adverb"}, {"definition": "Into the future.", "part_of_speech": "adverb"}]	null	\N	\N	\N	new	0	\N	2026-05-10 15:23:08.512738+00	2026-05-10 15:23:08.512738+00
\.


--
-- Data for Name: vocabulary_tags; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.vocabulary_tags (id, vocabulary_id, tag) FROM stdin;
\.


--
-- Name: ai_scoring_results ai_scoring_results_attempt_part_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_scoring_results
    ADD CONSTRAINT ai_scoring_results_attempt_part_id_key UNIQUE (attempt_part_id);


--
-- Name: ai_scoring_results ai_scoring_results_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_scoring_results
    ADD CONSTRAINT ai_scoring_results_pkey PRIMARY KEY (id);


--
-- Name: attempt_parts attempt_parts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attempt_parts
    ADD CONSTRAINT attempt_parts_pkey PRIMARY KEY (id);


--
-- Name: blog_posts blog_posts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_pkey PRIMARY KEY (id);


--
-- Name: daily_streaks daily_streaks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_streaks
    ADD CONSTRAINT daily_streaks_pkey PRIMARY KEY (id);


--
-- Name: flashcard_decks flashcard_decks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.flashcard_decks
    ADD CONSTRAINT flashcard_decks_pkey PRIMARY KEY (id);


--
-- Name: flashcard_reviews flashcard_reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.flashcard_reviews
    ADD CONSTRAINT flashcard_reviews_pkey PRIMARY KEY (id);


--
-- Name: flashcards flashcards_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.flashcards
    ADD CONSTRAINT flashcards_pkey PRIMARY KEY (id);


--
-- Name: leaderboard_cache leaderboard_cache_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leaderboard_cache
    ADD CONSTRAINT leaderboard_cache_pkey PRIMARY KEY (id);


--
-- Name: notification_campaigns notification_campaigns_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_campaigns
    ADD CONSTRAINT notification_campaigns_pkey PRIMARY KEY (id);


--
-- Name: notification_settings notification_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_settings
    ADD CONSTRAINT notification_settings_pkey PRIMARY KEY (id);


--
-- Name: notification_settings notification_settings_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_settings
    ADD CONSTRAINT notification_settings_user_id_key UNIQUE (user_id);


--
-- Name: questions questions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_pkey PRIMARY KEY (id);


--
-- Name: test_attempts test_attempts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.test_attempts
    ADD CONSTRAINT test_attempts_pkey PRIMARY KEY (id);


--
-- Name: topics topics_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.topics
    ADD CONSTRAINT topics_pkey PRIMARY KEY (id);


--
-- Name: user_devices user_devices_fcm_token_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_devices
    ADD CONSTRAINT user_devices_fcm_token_key UNIQUE (fcm_token);


--
-- Name: user_devices user_devices_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_devices
    ADD CONSTRAINT user_devices_pkey PRIMARY KEY (id);


--
-- Name: user_notifications user_notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_notifications
    ADD CONSTRAINT user_notifications_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: vocabulary_notes vocabulary_notes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vocabulary_notes
    ADD CONSTRAINT vocabulary_notes_pkey PRIMARY KEY (id);


--
-- Name: vocabulary_tags vocabulary_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vocabulary_tags
    ADD CONSTRAINT vocabulary_tags_pkey PRIMARY KEY (id);


--
-- Name: ix_attempt_parts_attempt_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_attempt_parts_attempt_id ON public.attempt_parts USING btree (attempt_id);


--
-- Name: ix_blog_posts_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_blog_posts_category ON public.blog_posts USING btree (category);


--
-- Name: ix_blog_posts_is_published; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_blog_posts_is_published ON public.blog_posts USING btree (is_published);


--
-- Name: ix_blog_posts_slug; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX ix_blog_posts_slug ON public.blog_posts USING btree (slug);


--
-- Name: ix_daily_streaks_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_daily_streaks_user_id ON public.daily_streaks USING btree (user_id);


--
-- Name: ix_flashcard_decks_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_flashcard_decks_user_id ON public.flashcard_decks USING btree (user_id);


--
-- Name: ix_flashcard_reviews_flashcard_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_flashcard_reviews_flashcard_id ON public.flashcard_reviews USING btree (flashcard_id);


--
-- Name: ix_flashcard_reviews_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_flashcard_reviews_user_id ON public.flashcard_reviews USING btree (user_id);


--
-- Name: ix_flashcards_deck_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_flashcards_deck_id ON public.flashcards USING btree (deck_id);


--
-- Name: ix_leaderboard_cache_period_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_leaderboard_cache_period_type ON public.leaderboard_cache USING btree (period_type);


--
-- Name: ix_leaderboard_cache_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_leaderboard_cache_user_id ON public.leaderboard_cache USING btree (user_id);


--
-- Name: ix_notification_campaigns_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_notification_campaigns_category ON public.notification_campaigns USING btree (category);


--
-- Name: ix_notification_campaigns_notification_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_notification_campaigns_notification_type ON public.notification_campaigns USING btree (notification_type);


--
-- Name: ix_questions_ielts_part; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_questions_ielts_part ON public.questions USING btree (ielts_part);


--
-- Name: ix_questions_topic_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_questions_topic_id ON public.questions USING btree (topic_id);


--
-- Name: ix_test_attempts_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_test_attempts_status ON public.test_attempts USING btree (status);


--
-- Name: ix_test_attempts_topic_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_test_attempts_topic_id ON public.test_attempts USING btree (topic_id);


--
-- Name: ix_test_attempts_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_test_attempts_user_id ON public.test_attempts USING btree (user_id);


--
-- Name: ix_topics_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_topics_category ON public.topics USING btree (category);


--
-- Name: ix_topics_ielts_part; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_topics_ielts_part ON public.topics USING btree (ielts_part);


--
-- Name: ix_user_devices_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_user_devices_user_id ON public.user_devices USING btree (user_id);


--
-- Name: ix_user_notifications_campaign_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_user_notifications_campaign_id ON public.user_notifications USING btree (campaign_id);


--
-- Name: ix_user_notifications_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_user_notifications_category ON public.user_notifications USING btree (category);


--
-- Name: ix_user_notifications_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_user_notifications_created_at ON public.user_notifications USING btree (created_at);


--
-- Name: ix_user_notifications_is_read; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_user_notifications_is_read ON public.user_notifications USING btree (is_read);


--
-- Name: ix_user_notifications_notification_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_user_notifications_notification_type ON public.user_notifications USING btree (notification_type);


--
-- Name: ix_user_notifications_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_user_notifications_user_id ON public.user_notifications USING btree (user_id);


--
-- Name: ix_users_email; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX ix_users_email ON public.users USING btree (email);


--
-- Name: ix_users_firebase_uid; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX ix_users_firebase_uid ON public.users USING btree (firebase_uid);


--
-- Name: ix_users_username; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX ix_users_username ON public.users USING btree (username);


--
-- Name: ix_vocabulary_notes_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_vocabulary_notes_user_id ON public.vocabulary_notes USING btree (user_id);


--
-- Name: ix_vocabulary_notes_word; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_vocabulary_notes_word ON public.vocabulary_notes USING btree (word);


--
-- Name: ix_vocabulary_tags_tag; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_vocabulary_tags_tag ON public.vocabulary_tags USING btree (tag);


--
-- Name: ix_vocabulary_tags_vocabulary_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_vocabulary_tags_vocabulary_id ON public.vocabulary_tags USING btree (vocabulary_id);


--
-- Name: ai_scoring_results ai_scoring_results_attempt_part_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_scoring_results
    ADD CONSTRAINT ai_scoring_results_attempt_part_id_fkey FOREIGN KEY (attempt_part_id) REFERENCES public.attempt_parts(id) ON DELETE CASCADE;


--
-- Name: attempt_parts attempt_parts_attempt_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attempt_parts
    ADD CONSTRAINT attempt_parts_attempt_id_fkey FOREIGN KEY (attempt_id) REFERENCES public.test_attempts(id) ON DELETE CASCADE;


--
-- Name: attempt_parts attempt_parts_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attempt_parts
    ADD CONSTRAINT attempt_parts_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(id) ON DELETE SET NULL;


--
-- Name: daily_streaks daily_streaks_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_streaks
    ADD CONSTRAINT daily_streaks_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: flashcard_decks flashcard_decks_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.flashcard_decks
    ADD CONSTRAINT flashcard_decks_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: flashcard_reviews flashcard_reviews_flashcard_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.flashcard_reviews
    ADD CONSTRAINT flashcard_reviews_flashcard_id_fkey FOREIGN KEY (flashcard_id) REFERENCES public.flashcards(id) ON DELETE CASCADE;


--
-- Name: flashcard_reviews flashcard_reviews_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.flashcard_reviews
    ADD CONSTRAINT flashcard_reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: flashcards flashcards_deck_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.flashcards
    ADD CONSTRAINT flashcards_deck_id_fkey FOREIGN KEY (deck_id) REFERENCES public.flashcard_decks(id) ON DELETE CASCADE;


--
-- Name: flashcards flashcards_vocabulary_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.flashcards
    ADD CONSTRAINT flashcards_vocabulary_id_fkey FOREIGN KEY (vocabulary_id) REFERENCES public.vocabulary_notes(id) ON DELETE SET NULL;


--
-- Name: leaderboard_cache leaderboard_cache_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leaderboard_cache
    ADD CONSTRAINT leaderboard_cache_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: notification_campaigns notification_campaigns_created_by_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_campaigns
    ADD CONSTRAINT notification_campaigns_created_by_id_fkey FOREIGN KEY (created_by_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: notification_settings notification_settings_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_settings
    ADD CONSTRAINT notification_settings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: questions questions_topic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.topics(id) ON DELETE CASCADE;


--
-- Name: test_attempts test_attempts_topic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.test_attempts
    ADD CONSTRAINT test_attempts_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.topics(id) ON DELETE SET NULL;


--
-- Name: test_attempts test_attempts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.test_attempts
    ADD CONSTRAINT test_attempts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_devices user_devices_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_devices
    ADD CONSTRAINT user_devices_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_notifications user_notifications_campaign_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_notifications
    ADD CONSTRAINT user_notifications_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.notification_campaigns(id) ON DELETE SET NULL;


--
-- Name: user_notifications user_notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_notifications
    ADD CONSTRAINT user_notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: vocabulary_notes vocabulary_notes_source_attempt_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vocabulary_notes
    ADD CONSTRAINT vocabulary_notes_source_attempt_id_fkey FOREIGN KEY (source_attempt_id) REFERENCES public.test_attempts(id) ON DELETE SET NULL;


--
-- Name: vocabulary_notes vocabulary_notes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vocabulary_notes
    ADD CONSTRAINT vocabulary_notes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: vocabulary_tags vocabulary_tags_vocabulary_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vocabulary_tags
    ADD CONSTRAINT vocabulary_tags_vocabulary_id_fkey FOREIGN KEY (vocabulary_id) REFERENCES public.vocabulary_notes(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict 2hXrKRBQzmZqVhI1adYq5pWib4afXjd8n7dsrdEEReyDANTaA9JWdhlUSKd616T

