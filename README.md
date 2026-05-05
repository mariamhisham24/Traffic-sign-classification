
# 🚦 Traffic Sign Classification System

A production-grade web application that uses a **Convolutional Neural Network (CNN)** to classify traffic signs from uploaded images — built with **Flask**, **TensorFlow/Keras**, and a polished glassmorphism UI.

---

## ✨ Features

| Feature | Details |
|---|---|
| 🧠 AI Inference | Pre-trained CNN (43 GTSRB classes) |
| 🖼️ Image Preview | Instant client-side preview before prediction |
| 📊 Confidence Score | Animated progress bar + percentage |
| 🏆 Top-5 Results | Ranked alternative predictions with mini bar charts |
| 🌙 Dark Mode | Toggle with system preference detection & localStorage |
| 📂 Drag & Drop | Drag files directly onto the upload zone |
| 📱 Responsive | Mobile-first grid layout |
| ⚠️ Error Handling | Client + server side validation with friendly messages |
| ⚡ Loading Spinner | Visual feedback during async inference |

---

## 🗂️ Project Structure

```
traffic-sign-app/
│
├── app.py                  # Flask backend – routes, model loading, inference
│
├── model.keras             # ← Place your trained model here
│
├── templates/
│   └── index.html          # Single-page Jinja2 template
│
├── static/
│   ├── style.css           # Glassmorphism UI, dark mode, animations
│   └── script.js           # Drag-drop, preview, fetch, results rendering
│
├── requirements.txt        # Python dependencies
└── README.md
```

---

## 🚀 Quick Start

### 1. Clone / copy the project

```bash
git clone <your-repo-url>
cd traffic-sign-app
```

### 2. Create a virtual environment

```bash
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Add your model

Copy your trained Keras model file to the project root and name it **`model.keras`**:

```bash
cp /path/to/your/trained_model.keras ./model.keras
```

> **Model not ready yet?** The app runs in **demo mode** — it returns random predictions so you can verify the UI works correctly without a real model.

### 5. Run the server

```bash
python app.py
```

Open **http://localhost:5000** in your browser.

---

## 🧠 Model Details

### Expected Input
| Property | Value |
|---|---|
| Input shape | `(32, 32, 3)` — RGB image |
| Normalisation | Pixel values divided by 255 → `[0.0, 1.0]` |
| Output | Softmax vector of length **43** |

### Adjusting image size
If your model uses a different input resolution, update `IMG_SIZE` in `app.py`:

```python
IMG_SIZE = (64, 64)   # or (48, 48), (224, 224), etc.
```

### Adjusting class names
The default class list matches the **GTSRB (German Traffic Sign Recognition Benchmark)** dataset (43 classes). If your model was trained on a different set, replace the `CLASS_NAMES` list in `app.py`.

---

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python 3.10+, Flask 3 |
| ML Framework | TensorFlow 2 / Keras |
| Image Processing | Pillow (PIL) |
| Frontend | Vanilla HTML5, CSS3, ES2022 JS |
| Icons | Phosphor Icons (CDN, no build step) |
| Fonts | Syne (display) + DM Sans (body) via Google Fonts |

---

## 🔌 API Reference

### `GET /`
Returns the main upload page.

### `POST /predict`
**Request:** `multipart/form-data` with field `image` (PNG/JPG/BMP/WebP, ≤ 8 MB)

**Response (200 OK):**
```json
{
  "predicted_class": "Stop",
  "class_id": 14,
  "confidence": 98.73,
  "top5": [
    { "class_id": 14, "class_name": "Stop",         "confidence": 98.73 },
    { "class_id": 17, "class_name": "No entry",      "confidence":  0.82 },
    { "class_id": 13, "class_name": "Yield",          "confidence":  0.27 },
    { "class_id": 15, "class_name": "No vehicles",    "confidence":  0.11 },
    { "class_id": 12, "class_name": "Priority road",  "confidence":  0.07 }
  ],
  "image_data_url": "data:image/png;base64,..."
}
```

**Error responses:**
| Code | Reason |
|---|---|
| 400 | No image field in request |
| 415 | Unsupported file type |
| 422 | Corrupted / unreadable image |

---

## 🎨 UI Design System

```
Color palette
  Primary     #4A90E2  (soft blue)
  Accent      #50E3C2  (soft green)
  Background  #F0F4FF  (light blue tint)
  Text        #1E293B  (dark slate)

Typography
  Display     Syne 800  (headings)
  Body        DM Sans 400/500/600

Effects
  Glassmorphism cards  (backdrop-filter: blur + rgba backgrounds)
  Animated blobs       (CSS keyframe float)
  Gradient confidence bar  (animated width transition)
  Smooth dark mode     (CSS variable swap)
```

---

## ⚙️ Configuration Reference

All tunable constants live at the top of `app.py`:

```python
MODEL_PATH  = "model.keras"    # path to your model file
IMG_SIZE    = (32, 32)         # resize target before inference
CLASS_NAMES = [...]            # list of human-readable class labels
```

And in `app.py` Flask config:

```python
app.config["MAX_CONTENT_LENGTH"] = 8 * 1024 * 1024  # 8 MB upload limit
```

---

## 🐳 Docker (optional)

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 5000
CMD ["python", "app.py"]
```

```bash
docker build -t traffic-sign-app .
docker run -p 5000:5000 traffic-sign-app
```

---

## 📸 Screenshots

| Light Mode | Dark Mode |
|---|---|
| Upload screen with drag & drop zone | Same UI with dark glassmorphism cards |
| Prediction results with confidence bar | Top-5 alternative predictions |

---

## 📄 License

MIT — free to use, modify, and distribute.

---

## 🙏 Acknowledgements

- [GTSRB Dataset](https://benchmark.ini.rub.de/) — German Traffic Sign Recognition Benchmark
- [TensorFlow / Keras](https://tensorflow.org/)
- [Phosphor Icons](https://phosphoricons.com/)
- [Google Fonts](https://fonts.google.com/)
=======
🚦 Traffic Sign Classification using Deep Learning

This repository presents an end-to-end implementation of a Traffic Sign Classification system using deep learning techniques. The project leverages the GTSRB (German Traffic Sign Recognition Benchmark) dataset to build, train, and evaluate multiple state-of-the-art convolutional neural network (CNN) models.

🔍 Project Overview

The goal of this project is to accurately classify traffic signs from images, which is a crucial component in Intelligent Transportation Systems (ITS) and autonomous driving applications. The system is designed with a focus on high accuracy, robustness, and generalization.

⚙️ Key Features

📂 Dataset Handling & Preprocessing

Data loading and integrity checks
Image resizing, normalization, and augmentation
Handling corrupted or mislabeled images

🧠 Deep Learning Models

Custom CNN architecture
ResNet (Residual Networks)
EfficientNet

🏋️ Training Pipeline
GPU-based training using Tensorflow
Train/validation/test split
Overfitting prevention (dropout, regularization, augmentation)

📊 Evaluation & Results

Accuracy, loss curves
Visualization of predictions before and after training

📈 Results

The models achieve strong classification performance on the GTSRB dataset, with careful tuning to ensure reliable and consistent results without overfitting.

🛠️ Technologies Used

Python
Tensorflow
NumPy / Pandas
Matplotlib / Seaborn

🎯 Purpose

This project is part of a research effort to better understand and compare deep learning architectures for image classification tasks, particularly in real-world scenarios like traffic sign recognition.
>>>>>>> cdecb9983e3bcdc03c057b0c3fe0008be365e883
