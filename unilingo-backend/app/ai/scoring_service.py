"""
AI Scoring Service - Orchestrates the AI pipeline for IELTS Speaking assessment.

Pipeline: Audio → [Whisper STT] → Transcript
         Audio → [Azure Speech] → Pronunciation Score
         Transcript + Pronunciation → [Gemini LLM] → Band Scores + Feedback
"""
import json
from app.config import get_settings

settings = get_settings()


SCORING_PROMPT_TEMPLATE = """You are an expert IELTS Speaking examiner. Evaluate the following IELTS Speaking response according to the official IELTS Band Descriptors.

## Context
- IELTS Part: {ielts_part}
- Question: {question_text}
- Candidate's Response (Transcript): {transcript}
- Pronunciation Assessment Data: {pronunciation_data}

## Evaluation Criteria
Score each criterion on the IELTS band scale (0.0 to 9.0, in 0.5 increments):

1. **Fluency and Coherence**: Assess the flow of speech, use of discourse markers, coherence of ideas, self-correction ability, and hesitation patterns.
2. **Lexical Resource**: Evaluate vocabulary range, precision, use of collocations, idiomatic expressions, and ability to paraphrase.
3. **Grammatical Range and Accuracy**: Analyze sentence structure variety, complexity, accuracy, and error frequency.
4. **Pronunciation**: Consider clarity, intonation, stress patterns, individual sound production, and overall intelligibility.

## Output Format
Respond ONLY with a valid JSON object in the following format:
{{
    "fluency_band": <float>,
    "lexical_band": <float>,
    "grammar_band": <float>,
    "pronunciation_band": <float>,
    "overall_band": <float>,
    "feedback": {{
        "summary": "<2-3 sentence overall assessment>",
        "detailed": "<paragraph with detailed analysis>"
    }},
    "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
    "weaknesses": ["<weakness 1>", "<weakness 2>"],
    "suggested_improvements": ["<improvement 1>", "<improvement 2>", "<improvement 3>"],
    "sample_better_answer": {{
        "text": "<a Band 7.5+ level sample answer for the same question>",
        "explanation": "<brief explanation of why this answer scores higher>"
    }},
    "grammar_errors": [
        {{"original": "<incorrect phrase>", "corrected": "<correct phrase>", "rule": "<grammar rule>"}}
    ],
    "vocabulary_suggestions": [
        {{"basic_word": "<word used>", "better_alternatives": ["<better word 1>", "<better word 2>"]}}
    ]
}}
"""


async def transcribe_audio(audio_url: str) -> str:
    """
    Transcribe audio using OpenAI Whisper API.
    
    Args:
        audio_url: URL or path to the audio file
        
    Returns:
        Transcribed text
    """
    if not settings.OPENAI_API_KEY:
        # Mock response for development
        return "[Mock transcript] I would like to talk about a place I visited recently. It was a beautiful beach in Da Nang, Vietnam. I went there last summer with my family. We spent three days there and it was really wonderful."

    from openai import AsyncOpenAI

    client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

    # Download audio file from storage
    # TODO: Implement actual file download from S3/MinIO
    # For now, assume local file path
    with open(audio_url, "rb") as audio_file:
        response = await client.audio.transcriptions.create(
            model="whisper-1",
            file=audio_file,
            language="en",
            response_format="text",
        )

    return response


async def assess_pronunciation(audio_url: str, reference_text: str = "") -> dict:
    """
    Assess pronunciation using Azure Speech Service.
    
    Args:
        audio_url: URL or path to the audio file
        reference_text: Optional reference text for scripted assessment
        
    Returns:
        Dictionary with pronunciation assessment scores
    """
    if not settings.AZURE_SPEECH_KEY:
        # Mock response for development
        return {
            "accuracy_score": 78.5,
            "fluency_score": 72.3,
            "prosody_score": 68.9,
            "completeness_score": 95.0,
            "pronunciation_score": 73.2,
        }

    import azure.cognitiveservices.speech as speechsdk

    speech_config = speechsdk.SpeechConfig(
        subscription=settings.AZURE_SPEECH_KEY,
        region=settings.AZURE_SPEECH_REGION,
    )

    pronunciation_config = speechsdk.PronunciationAssessmentConfig(
        grading_system=speechsdk.PronunciationAssessmentGradingSystem.HundredMark,
        granularity=speechsdk.PronunciationAssessmentGranularity.Phoneme,
        enable_miscue=True,
    )
    pronunciation_config.enable_prosody_assessment()

    # TODO: Set up audio config from file/URL
    audio_config = speechsdk.audio.AudioConfig(filename=audio_url)

    recognizer = speechsdk.SpeechRecognizer(
        speech_config=speech_config,
        audio_config=audio_config,
    )
    pronunciation_config.apply_to(recognizer)

    result = recognizer.recognize_once()

    if result.reason == speechsdk.ResultReason.RecognizedSpeech:
        pron_result = speechsdk.PronunciationAssessmentResult(result)
        return {
            "accuracy_score": pron_result.accuracy_score,
            "fluency_score": pron_result.fluency_score,
            "prosody_score": getattr(pron_result, "prosody_score", 0),
            "completeness_score": pron_result.completeness_score,
            "pronunciation_score": pron_result.pronunciation_score,
        }
    else:
        return {"error": f"Speech recognition failed: {result.reason}"}


async def score_with_llm(
    transcript: str,
    question_text: str,
    ielts_part: str,
    pronunciation_data: dict,
) -> dict:
    """
    Score the response using Google Gemini (or OpenAI GPT).
    
    Args:
        transcript: The transcribed text
        question_text: The original question
        ielts_part: "part1", "part2", or "part3"
        pronunciation_data: Results from pronunciation assessment
        
    Returns:
        Structured scoring result as dictionary
    """
    prompt = SCORING_PROMPT_TEMPLATE.format(
        ielts_part=ielts_part,
        question_text=question_text,
        transcript=transcript,
        pronunciation_data=json.dumps(pronunciation_data),
    )

    if not settings.GOOGLE_GEMINI_API_KEY:
        # Mock response for development
        return {
            "fluency_band": 6.5,
            "lexical_band": 6.0,
            "grammar_band": 6.5,
            "pronunciation_band": 6.0,
            "overall_band": 6.5,
            "feedback": {
                "summary": "Good attempt with clear communication of ideas. Some areas for improvement in vocabulary range and pronunciation.",
                "detailed": "The candidate demonstrated a reasonable level of fluency with some natural hesitation. Ideas were generally coherent and well-organized.",
            },
            "strengths": [
                "Good topic development",
                "Natural speaking pace",
                "Clear main ideas",
            ],
            "weaknesses": [
                "Limited vocabulary range",
                "Some grammatical errors with articles",
            ],
            "suggested_improvements": [
                "Expand vocabulary with more descriptive adjectives",
                "Practice using complex sentence structures",
                "Work on word stress in multi-syllable words",
            ],
            "sample_better_answer": {
                "text": "I'd love to tell you about a stunning coastal destination I explored last summer...",
                "explanation": "This answer uses more sophisticated vocabulary and complex structures.",
            },
            "grammar_errors": [
                {"original": "It was really wonderful", "corrected": "It was truly remarkable", "rule": "Use varied adverbs and adjectives"},
            ],
            "vocabulary_suggestions": [
                {"basic_word": "beautiful", "better_alternatives": ["breathtaking", "picturesque", "stunning"]},
                {"basic_word": "good", "better_alternatives": ["exceptional", "outstanding", "remarkable"]},
            ],
        }

    from google import genai

    client = genai.Client(api_key=settings.GOOGLE_GEMINI_API_KEY)
    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=prompt,
        config={
            "response_mime_type": "application/json",
            "temperature": 0.3,
        },
    )

    try:
        result = json.loads(response.text)
        return result
    except json.JSONDecodeError:
        # Try to extract JSON from the response
        text = response.text
        start = text.find("{")
        end = text.rfind("}") + 1
        if start != -1 and end > start:
            return json.loads(text[start:end])
        raise ValueError(f"Failed to parse LLM response as JSON: {text[:200]}")


async def run_scoring_pipeline(
    audio_url: str,
    question_text: str,
    ielts_part: str,
) -> dict:
    """
    Run the complete AI scoring pipeline.
    
    Returns:
        Complete scoring result with transcript, pronunciation, and LLM scoring.
    """
    # Step 1: Speech-to-Text
    transcript = await transcribe_audio(audio_url)

    # Step 2: Pronunciation Assessment
    pronunciation_data = await assess_pronunciation(audio_url)

    # Step 3: LLM Scoring
    scoring_result = await score_with_llm(
        transcript=transcript,
        question_text=question_text,
        ielts_part=ielts_part,
        pronunciation_data=pronunciation_data,
    )

    return {
        "transcript": transcript,
        "pronunciation_details": pronunciation_data,
        **scoring_result,
    }
