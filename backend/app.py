"""
AI Study Assistant - Flask backend

IMPORTANT: despite the name, this backend does NOT use a real AI model.
Everything here is basic text processing (counting words, scoring sentences,
matching simple patterns). It is free, runs offline, and needs no API keys.

Endpoints
    GET  /api/health
    POST /api/summarize           body: {"text": "...", "sentences": 3}   (sentences optional)
    POST /api/generate-quiz       body: {"text": "...", "count": 5}       (count optional)
    POST /api/generate-flashcards body: {"text": "...", "count": 8}       (count optional)
"""

import os
import random
import re
from collections import Counter

from flask import Flask, jsonify, request
from flask_cors import CORS

# ----------------------------------------------------------------------------
# App setup
# ----------------------------------------------------------------------------
app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 1_000_000  # reject request bodies over ~1 MB

# CORS lets the React app (a different origin) call this API.
# Locally "*" (allow everyone) is fine. In production set CORS_ORIGINS on Render
# to your Vercel URL, e.g.  https://my-study-app.vercel.app
_raw_origins = os.environ.get("CORS_ORIGINS", "*").strip()
if _raw_origins == "*":
    ALLOWED_ORIGINS = "*"
else:
    ALLOWED_ORIGINS = [o.strip().rstrip("/") for o in _raw_origins.split(",") if o.strip()]
CORS(app, resources={r"/api/*": {"origins": ALLOWED_ORIGINS}})

MIN_CHARS = 50
MAX_CHARS = 20_000

NOTICE = (
    "Generated with basic text-processing logic (word counting and pattern "
    "matching), not a real AI model. Always double-check against your notes."
)

STOPWORDS = set(
    """
    a about above after again against all also am an and any are aren't as at be because
    been before being below between both but by can can't cannot could couldn't did didn't
    do does doesn't doing don't down during each either else even ever every few for from
    further had hadn't has hasn't have haven't having he her here hers herself him himself
    his how however i if in into is isn't it its itself just least less let like made make
    many may me might more most much must my myself no nor not now of off on once one only
    onto or other others our ours ourselves out over own per rather same shall she should
    shouldn't since so some such than that the their theirs them themselves then there
    these they this those though through thus to too under until up upon us use used uses
    using very was wasn't we were weren't what when where whether which while who whom
    whose why will with within without won't would wouldn't yet you your yours yourself
    yourselves often called known usually generally several certain various
    """.split()
)

PRONOUN_STARTS = {
    "it", "this", "that", "these", "those", "they", "there", "he", "she", "we", "i",
    "you", "which", "what", "who", "here",
}


# ----------------------------------------------------------------------------
# Error handling
# ----------------------------------------------------------------------------
class ApiError(Exception):
    """An error we want to send back to the browser as JSON."""

    def __init__(self, message, status=400):
        super().__init__(message)
        self.message = message
        self.status = status


@app.errorhandler(ApiError)
def handle_api_error(err):
    return jsonify({"error": err.message}), err.status


@app.errorhandler(404)
def handle_404(_err):
    return jsonify({"error": "That endpoint does not exist."}), 404


@app.errorhandler(405)
def handle_405(_err):
    return jsonify({"error": "That HTTP method is not allowed for this endpoint."}), 405


@app.errorhandler(413)
def handle_413(_err):
    return jsonify({"error": "The request is too large. Please send shorter notes."}), 413


@app.errorhandler(500)
def handle_500(_err):
    return jsonify({"error": "Something went wrong on the server. Please try again."}), 500


# ----------------------------------------------------------------------------
# Input helpers
# ----------------------------------------------------------------------------
def read_json_body():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        raise ApiError("Send a JSON body, for example: {\"text\": \"your notes\"}.")
    return data


def read_text(data):
    text = data.get("text")
    if not isinstance(text, str):
        raise ApiError("The 'text' field is required and must be a string.")
    text = text.strip()
    if len(text) < MIN_CHARS:
        raise ApiError(f"Your notes are too short. Please enter at least {MIN_CHARS} characters.")
    if len(text) > MAX_CHARS:
        raise ApiError(f"Your notes are too long. The limit is {MAX_CHARS:,} characters.")
    return text


def read_int(data, key, default, low, high):
    value = data.get(key, default)
    if value is None:
        return default
    if isinstance(value, bool) or not isinstance(value, int):
        raise ApiError(f"'{key}' must be a whole number.")
    if value < low or value > high:
        raise ApiError(f"'{key}' must be between {low} and {high}.")
    return value


# ----------------------------------------------------------------------------
# Text-processing building blocks
# ----------------------------------------------------------------------------
def split_sentences(text):
    """Split text into sentences. Bullet points and lines each count as a sentence."""
    lines = []
    for line in text.splitlines():
        line = re.sub(r"^\s*(?:[-*\u2022]+|\d+[.)])\s+", "", line).strip()  # remove bullets
        if not line:
            continue
        if line[-1] not in ".!?:":
            line += "."
        lines.append(line)
    joined = " ".join(lines)
    parts = re.split(r"(?<=[.!?])\s+(?=[\"'(\[]?[A-Z0-9])", joined)
    # Ignore fragments that are too short to be useful (headings, stray words)
    return [p.strip() for p in parts if len(p.split()) >= 4]


def tokenize(sentence):
    """Return the words of a sentence, keeping the original capitalisation."""
    return [w.strip("'-") for w in re.findall(r"[^\W\d_][\w'-]*", sentence) if w.strip("'-")]


def is_content_word(word, min_len):
    return len(word) >= min_len and word.lower() not in STOPWORDS


def word_frequencies(sentences, min_len=3):
    """Count how often each meaningful word appears (case-insensitive)."""
    counter = Counter()
    for sentence in sentences:
        for word in tokenize(sentence):
            if is_content_word(word, min_len):
                counter[word.lower()] += 1
    return counter


def score_sentences(sentences, freq):
    """Give each sentence a score: sentences full of frequent words score higher."""
    scores = []
    for index, sentence in enumerate(sentences):
        words = [w.lower() for w in tokenize(sentence) if w.lower() in freq]
        if not words:
            scores.append(0.0)
            continue
        score = sum(freq[w] for w in words) / len(words)  # average word importance
        length = len(sentence.split())
        if length > 40:
            score *= 0.7  # very long sentences make poor summaries
        elif length < 6:
            score *= 0.6
        if index == 0:
            score *= 1.2  # the opening sentence often introduces the topic
        scores.append(score)
    return scores


def clean_sentence_end(text):
    text = text.strip()
    if text and text[-1] not in ".!?":
        text += "."
    return text[:1].upper() + text[1:]


# ----------------------------------------------------------------------------
# Feature 1: summary
# ----------------------------------------------------------------------------
def build_summary(text, wanted):
    sentences = split_sentences(text)
    if len(sentences) < 2:
        raise ApiError("Add at least two full sentences so there is something to summarize.", 422)

    if wanted is None:  # automatic length: about 30% of the notes, between 2 and 5 sentences
        wanted = max(2, min(5, round(len(sentences) * 0.3)))
    wanted = min(wanted, len(sentences))

    freq = word_frequencies(sentences)
    scores = score_sentences(sentences, freq)
    best = sorted(range(len(sentences)), key=lambda i: scores[i], reverse=True)[:wanted]
    chosen = [sentences[i] for i in sorted(best)]  # restore the original order

    summary = " ".join(chosen)
    return {
        "summary": summary,
        "summary_sentences": len(chosen),
        "original_sentences": len(sentences),
        "summary_words": len(summary.split()),
        "original_words": len(text.split()),
        "method": "Extractive summary: picks the sentences with the most frequent key words.",
        "notice": NOTICE,
    }


# ----------------------------------------------------------------------------
# Feature 2: quiz (fill-in-the-blank multiple choice)
# ----------------------------------------------------------------------------
def pick_blank_word(sentence, freq, used):
    """Choose the most important word in the sentence to hide."""
    candidates = {}
    for word in tokenize(sentence):
        lower = word.lower()
        if lower in freq and is_content_word(word, 5) and lower not in used:
            candidates[lower] = word
    if not candidates:
        return None
    best = max(candidates, key=lambda w: (freq[w], len(w)))
    return candidates[best]


def match_case(word, like):
    """Make `word` look like `like` (Capitalised or lowercase)."""
    return word.capitalize() if like[:1].isupper() else word.lower()


def build_quiz(text, count):
    sentences = split_sentences(text)
    freq = word_frequencies(sentences, min_len=4)
    pool = [w for w, _ in freq.most_common(40)]
    if len(sentences) < 2 or len(pool) < 4:
        raise ApiError(
            "There is not enough content to make a quiz. Add more notes with several different key terms.",
            422,
        )

    scores = score_sentences(sentences, freq)
    ranked = sorted(range(len(sentences)), key=lambda i: scores[i], reverse=True)

    questions = []
    used_answers = set()
    for i in ranked:
        if len(questions) >= count:
            break
        sentence = sentences[i]
        if not 6 <= len(sentence.split()) <= 40:
            continue
        answer = pick_blank_word(sentence, freq, used_answers)
        if answer is None:
            continue

        in_sentence = {w.lower() for w in tokenize(sentence)}
        stem = answer.lower()[:5]
        distractors = [w for w in pool if w not in in_sentence and not w.startswith(stem)]
        if len(distractors) < 3:  # relax the rules if the notes are small
            distractors = [w for w in pool if w != answer.lower() and not w.startswith(stem)]
        if len(distractors) < 3:
            continue

        # Wrong answers: prefer words of a similar length, so the right answer
        # does not stand out, and avoid near-duplicates like "main" / "mainly".
        distractors.sort(key=lambda w: abs(len(w) - len(answer)))
        chosen = []
        for w in random.sample(distractors[:10], min(10, len(distractors))):
            if all(w[:5] != c[:5] for c in chosen):
                chosen.append(w)
            if len(chosen) == 3:
                break
        if len(chosen) < 3:
            continue

        options = [match_case(w, answer) for w in chosen]
        options.append(answer)
        random.shuffle(options)

        # Hide every occurrence so the answer can't leak from the same sentence
        blanked = re.sub(rf"\b{re.escape(answer)}\b", "_____", sentence, flags=re.IGNORECASE)
        used_answers.add(answer.lower())
        questions.append(
            {
                "question": f"Fill in the blank: {blanked}",
                "options": options,
                "correct_index": options.index(answer),
                "explanation": sentence,
            }
        )

    if not questions:
        raise ApiError("Could not build any questions from these notes. Try adding more detail.", 422)

    for number, q in enumerate(questions, start=1):
        q["id"] = number
    return {"questions": questions, "count": len(questions), "notice": NOTICE}


# ----------------------------------------------------------------------------
# Feature 3: flashcards
# ----------------------------------------------------------------------------
# Matches sentences like "Photosynthesis is the process of ..." or "X means ..."
DEFINITION_RE = re.compile(
    r"^(?P<term>[A-Z0-9][^,;:()]{1,60}?)\s+"
    r"(?P<verb>(?:is|are|was|were)(?:\s+(?:defined as|called|known as))?|means|refers to|can be defined as)\s+"
    r"(?P<definition>.{8,})$"
)
# Matches lines like "Mitochondria: the part of the cell that makes energy"
COLON_RE = re.compile(r"^(?P<term>[^:]{2,50}):\s+(?P<definition>.{10,})$")


def lower_article(term):
    return re.sub(r"^(The|A|An)\s", lambda m: m.group(1).lower() + " ", term)


def definition_card(sentence):
    """Return (front, back) if the sentence looks like a definition, otherwise None."""
    sentence = sentence.strip()

    match = COLON_RE.match(sentence)
    if match and len(match.group("term").split()) <= 6:
        term = match.group("term").strip()
        return f"What is {lower_article(term)}?", clean_sentence_end(match.group("definition"))

    match = DEFINITION_RE.match(sentence)
    if not match:
        return None
    term = match.group("term").strip()
    words = term.split()
    if len(words) > 6 or words[0].lower() in PRONOUN_STARTS:
        return None

    verb = match.group("verb")
    term = lower_article(term)
    first = verb.split()[0]
    if verb == "means":
        front = f"What does {term} mean?"
    elif verb == "refers to":
        front = f"What does {term} refer to?"
    elif verb == "can be defined as":
        front = f"What is {term}?"
    elif "called" in verb:
        front = f"What {first} {term} called?"
    elif "known as" in verb:
        front = f"What {first} {term} known as?"
    else:
        front = f"What {first} {term}?"
    return front, clean_sentence_end(match.group("definition"))


def build_flashcards(text, count):
    sentences = split_sentences(text)
    if len(sentences) < 2:
        raise ApiError("Add at least two full sentences to create flashcards.", 422)

    cards = []
    seen_fronts = set()
    used_sentences = set()

    def add_card(front, back, sentence_index):
        key = front.lower()
        if key in seen_fronts:
            return
        seen_fronts.add(key)
        used_sentences.add(sentence_index)
        cards.append({"front": front, "back": back})

    # Pass 1: definition-style sentences make the best flashcards
    for i, sentence in enumerate(sentences):
        if len(cards) >= count:
            break
        result = definition_card(sentence)
        if result:
            add_card(result[0], result[1], i)

    # Pass 2: fill the remaining slots with "key idea" cards, best sentences first
    if len(cards) < count:
        freq = word_frequencies(sentences, min_len=4)
        scores = score_sentences(sentences, freq)
        ranked = sorted(range(len(sentences)), key=lambda i: scores[i], reverse=True)
        for i in ranked:
            if len(cards) >= count:
                break
            if i in used_sentences:
                continue
            words = [w.lower() for w in tokenize(sentences[i]) if w.lower() in freq]
            if not words:
                continue
            term = max(words, key=lambda w: (freq[w], len(w)))
            add_card(f"What does your text say about \u201c{term}\u201d?", sentences[i], i)

    if not cards:
        raise ApiError("Could not build any flashcards from these notes.", 422)

    for number, card in enumerate(cards, start=1):
        card["id"] = number
    return {"flashcards": cards, "count": len(cards), "notice": NOTICE}


# ----------------------------------------------------------------------------
# Routes
# ----------------------------------------------------------------------------
@app.get("/")
def index():
    return jsonify(
        {
            "name": "AI Study Assistant API",
            "message": "The API is running. See the README for how to use it.",
            "endpoints": [
                "GET /api/health",
                "POST /api/summarize",
                "POST /api/generate-quiz",
                "POST /api/generate-flashcards",
            ],
        }
    )


@app.get("/api/health")
def health():
    return jsonify({"status": "ok", "service": "AI Study Assistant API", "version": "1.0.0"})


@app.post("/api/summarize")
def summarize():
    data = read_json_body()
    text = read_text(data)
    sentences = read_int(data, "sentences", None, 1, 10)
    return jsonify(build_summary(text, sentences))


@app.post("/api/generate-quiz")
def generate_quiz():
    data = read_json_body()
    text = read_text(data)
    count = read_int(data, "count", 5, 1, 10)
    return jsonify(build_quiz(text, count))


@app.post("/api/generate-flashcards")
def generate_flashcards():
    data = read_json_body()
    text = read_text(data)
    count = read_int(data, "count", 8, 1, 20)
    return jsonify(build_flashcards(text, count))


if __name__ == "__main__":
    # Port 5001 (not 5000) because macOS uses 5000 for AirPlay.
    # Render provides its own PORT value automatically.
    port = int(os.environ.get("PORT", 5001))
    debug = os.environ.get("FLASK_DEBUG", "0") == "1"
    app.run(host="0.0.0.0", port=port, debug=debug)
