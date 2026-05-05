"""
Traffic Sign Recognition System - Flask Backend
================================================
Loads a pre-trained CNN model and serves predictions via a REST API.
"""

import os
import io
import base64
import numpy as np
from flask import Flask, request, jsonify, render_template
from werkzeug.utils import secure_filename
from PIL import Image

# ── TensorFlow / Keras ──────────────────────────────────────────────────────
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"          # silence TF noise
import tensorflow as tf

# ── App configuration ────────────────────────────────────────────────────────
app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 8 * 1024 * 1024   # 8 MB upload limit
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "bmp", "webp"}

# ── Model configuration ──────────────────────────────────────────────────────
MODEL_PATH = r"C:\Users\Admin\Downloads\Traffic_sign_classification_app\model.keras"         
IMG_SIZE   = (32, 32)              
# German Traffic Sign Recognition Benchmark (GTSRB) class names
CLASS_NAMES = [
    "Speed limit (20km/h)",   "Speed limit (30km/h)",   "Speed limit (50km/h)",
    "Speed limit (60km/h)",   "Speed limit (70km/h)",   "Speed limit (80km/h)",
    "End of speed limit (80km/h)", "Speed limit (100km/h)", "Speed limit (120km/h)",
    "No passing",             "No passing (>3.5t)",     "Right-of-way at intersection",
    "Priority road",          "Yield",                  "Stop",
    "No vehicles",            "No vehicles (>3.5t)",    "No entry",
    "General caution",        "Dangerous curve (left)", "Dangerous curve (right)",
    "Double curve",           "Bumpy road",             "Slippery road",
    "Road narrows (right)",   "Road work",              "Traffic signals",
    "Pedestrians",            "Children crossing",      "Bicycles crossing",
    "Beware of ice/snow",     "Wild animals crossing",  "End of all restrictions",
    "Turn right ahead",       "Turn left ahead",        "Ahead only",
    "Go straight or right",   "Go straight or left",    "Keep right",
    "Keep left",              "Roundabout mandatory",   "End of no passing",
    "End of no passing (>3.5t)"
]

# ── Load model at startup ────────────────────────────────────────────────────
model = None

def load_model():
    """Load the Keras model once when the server starts."""
    global model
    if os.path.exists(MODEL_PATH):
        print(f"[INFO] Loading model from '{MODEL_PATH}' …")
        model = tf.keras.models.load_model(MODEL_PATH)
        print("[INFO] Model loaded successfully.")
    else:
        print(f"[WARNING] Model file '{MODEL_PATH}' not found. "
              "Predictions will use a dummy response until the file is present.")

# ── Helper functions ─────────────────────────────────────────────────────────
def allowed_file(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def preprocess_image(pil_image: Image.Image) -> np.ndarray:
    """Resize, convert to RGB, and normalise to [0, 1]."""
    img = pil_image.convert("RGB").resize(IMG_SIZE)
    arr = np.array(img, dtype=np.float32) / 255.0
    return np.expand_dims(arr, axis=0)          # shape: (1, H, W, 3)


def image_to_data_url(pil_image: Image.Image) -> str:
    """Convert a PIL image to a base-64 data URL for inline display."""
    buffer = io.BytesIO()
    pil_image.save(buffer, format="PNG")
    encoded = base64.b64encode(buffer.getvalue()).decode("utf-8")
    return f"data:image/png;base64,{encoded}"


# ── Routes ────────────────────────────────────────────────────────────────────
@app.route("/")
def index():
    """Serve the main upload page."""
    return render_template("index.html")


@app.route("/predict", methods=["POST"])
def predict():
    """
    Accept a multipart/form-data POST with an 'image' field.
    Returns JSON: { predicted_class, confidence, top5, image_data_url }
    """
    # ── Validate file ────────────────────────────────────────────────────────
    if "image" not in request.files:
        return jsonify({"error": "No image file provided."}), 400

    file = request.files["image"]

    if file.filename == "":
        return jsonify({"error": "No file selected."}), 400

    if not allowed_file(file.filename):
        return jsonify({"error": "Unsupported file type. Please upload a PNG, JPG, BMP, or WebP image."}), 415

    # ── Open & preprocess ────────────────────────────────────────────────────
    try:
        pil_image = Image.open(file.stream)
    except Exception:
        return jsonify({"error": "Could not read the image. The file may be corrupted."}), 422

    tensor      = preprocess_image(pil_image)
    data_url    = image_to_data_url(pil_image)

    # ── Run inference ────────────────────────────────────────────────────────
    if model is None:
        # ── Dummy response when model file is absent (dev/demo mode) ─────────
        import random
        pred_idx    = random.randint(0, len(CLASS_NAMES) - 1)
        confidence  = round(random.uniform(0.70, 0.99), 4)
        scores      = np.random.dirichlet(np.ones(len(CLASS_NAMES))).tolist()
    else:
        raw         = model.predict(tensor, verbose=0)[0]   # shape: (num_classes,)
        scores      = raw.tolist()
        pred_idx    = int(np.argmax(raw))
        confidence  = float(raw[pred_idx])

    # ── Build top-5 list ─────────────────────────────────────────────────────
    top5_indices = np.argsort(scores)[::-1][:5]
    top5 = [
        {
            "class_id":   int(i),
            "class_name": CLASS_NAMES[i] if i < len(CLASS_NAMES) else f"Class {i}",
            "confidence": round(float(scores[i]) * 100, 2),
        }
        for i in top5_indices
    ]

    return jsonify({
        "predicted_class": CLASS_NAMES[pred_idx] if pred_idx < len(CLASS_NAMES) else f"Class {pred_idx}",
        "class_id":        pred_idx,
        "confidence":      round(confidence * 100, 2),
        "top5":            top5,
        "image_data_url":  data_url,
    })


# ── Entry point ───────────────────────────────────────────────────────────────
if __name__ == "__main__":
    load_model()
    app.run(debug=True, host="0.0.0.0", port=5000)
else:
    # Invoked via `flask run` or a WSGI server
    load_model()
