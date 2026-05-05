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
