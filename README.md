# Blog App – Backend

This is the **backend** of a full-stack Blog App built with Node.js, MongoDB, and Express. It handles authentication, API endpoints, email verification, image uploads, and error handling.

## 🌟 Features

* User registration and login with **JWT-based authentication**
* **Email verification** using **Nodemailer** before account activation
* **Create, edit, delete** blog posts (protected routes)
* **Image upload** and cloud storage via **Cloudinary**
* **error handling** for all operations
* Environment-based configuration for secure deployments

## 🛠️ Tech Stack

* **Node.js**, **Express.js**
* **MongoDB** with **Mongoose** ODM
* **JWT** for authentication
* **Nodemailer** for email verification
* **Cloudinary** for image uploads
* **dotenv** for environment variables

## 🔐 Authentication Flow

1. User registers -> Verification email sent
2. User clicks verification link -> Account activated
3. Login -> JWT token issued
4. Token used for protected routes (post creation, editing, etc.)

## ☁️ Image Upload

* Accepts images from the frontend
* Uploads to **Cloudinary**
* Stores image URL in the database

## 🚀 Deployment

* **Backend** hosted on [Render](https://render.com/)

