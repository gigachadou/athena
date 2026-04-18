/**
 * Custom Auth Service — replaces Supabase Auth
 * 
 * - Password hashing with bcryptjs
 * - Session management via localStorage
 * - Email verification via EmailJS
 */

import bcrypt from 'bcryptjs';
import emailjs from '@emailjs/browser';
import { supabase } from './supabaseClient';

// ============ EmailJS Configuration ============
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID?.trim();
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID?.trim();
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY?.trim();

// ============ Session Keys ============
const SESSION_KEY = 'athena_session';
const VERIFY_KEY = 'athena_verify_pending';

// ============ Generate 6-digit code ============
function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ============ Hash password ============
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

// ============ Compare password ============
async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

// ============ SESSION MANAGEMENT ============

/**
 * Save session to localStorage
 */
export function saveSession(userData) {
  const session = {
    userId: userData.id,
    email: userData.email,
    name: userData.name,
    loginAt: Date.now(),
    // 30 kun expired
    expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

/**
 * Get current session
 * @returns {Object|null} session or null if expired/not found
 */
export function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;

    const session = JSON.parse(raw);

    // Check expiry
    if (Date.now() > session.expiresAt) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }

    return session;
  } catch {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

/**
 * Clear session (logout)
 */
export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(VERIFY_KEY);
}

// ============ EMAIL VERIFICATION ============

export async function sendVerificationCode(email, name) {
  if (!email || !name) {

    throw new Error("Email and Name are required to send verification code.");
  }

  const code = generateCode();

  // Store pending verification data
  const pendingData = {
    code,
    email,
    name,
    createdAt: Date.now(),
    // Code expires in 10 minutes
    expiresAt: Date.now() + 10 * 60 * 1000
  };
  localStorage.setItem(VERIFY_KEY, JSON.stringify(pendingData));

  // Send email via EmailJS
  try {
    const templateParams = {
      to_name: name,
      to_email: email,
      verification_code: code
    };


    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams,
      {
        publicKey: EMAILJS_PUBLIC_KEY,
      }
    );
    

    return code;
  } catch (error) {

    localStorage.removeItem(VERIFY_KEY);
    throw new Error(error.text || 'Failed to send verification email. Please try again.');
  }
}

/**
 * Verify the code entered by user
 * @param {string} enteredCode 
 * @returns {boolean}
 */
export function verifyCode(enteredCode) {
  try {
    const raw = localStorage.getItem(VERIFY_KEY);
    if (!raw) return false;

    const pending = JSON.parse(raw);

    // Check expiry
    if (Date.now() > pending.expiresAt) {
      localStorage.removeItem(VERIFY_KEY);
      return false;
    }

    return pending.code === enteredCode.trim();
  } catch {
    return false;
  }
}

/**
 * Get pending verification data
 */
export function getPendingVerification() {
  try {
    const raw = localStorage.getItem(VERIFY_KEY);
    if (!raw) return null;
    const pending = JSON.parse(raw);
    if (Date.now() > pending.expiresAt) {
      localStorage.removeItem(VERIFY_KEY);
      return null;
    }
    return pending;
  } catch {
    return null;
  }
}

// ============ AUTH FUNCTIONS ============

/**
 * Register new user — called AFTER email verification is confirmed
 * @param {string} name
 * @param {string} email 
 * @param {string} password 
 * @returns {Object} user data
 */
export async function registerUser(name, email, password) {
  // 1. Check if email already exists
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single();

  if (existingUser) {
    throw new Error('This email is already registered!');
  }

  // 2. Hash password
  const hashedPassword = await hashPassword(password);

  // 3. Create user in Supabase
  const newUserId = Date.now();
  const { data, error } = await supabase
    .from('users')
    .insert([{
      id: newUserId,
      name: name,
      email: email,
      password: hashedPassword,
      status: "user",
      bio: "",
      posts: [],
      followers: [],
      followings: [],
      avatar: ""
    }])
    .select()
    .single();

  if (error) throw error;

  // 4. Save session
  saveSession(data);

  // 5. Clean up verification data
  localStorage.removeItem(VERIFY_KEY);

  return data;
}

/**
 * Login — check email/password against Supabase users table
 * @param {string} email 
 * @param {string} password 
 * @returns {Object} user data
 */
export async function loginUser(email, password) {
  // 1. Find user by email
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error || !user) {
    throw new Error('Incorrect email or password!');
  }

  // 2. Compare password
  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    throw new Error('Incorrect email or password!');
  }

  // 3. Save session
  saveSession(user);

  return user;
}

/**
 * Logout — clear session
 */
export function logoutUser() {
  clearSession();
  location.reload();
}

/**
 * Get current authenticated user data from Supabase
 * @returns {Object|null} user data or null
 */
export async function getCurrentUser() {
  const session = getSession();
  if (!session) return null;

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', session.email)
    .single();

  if (error || !data) {
    clearSession();
    return null;
  }

  return data;
}
