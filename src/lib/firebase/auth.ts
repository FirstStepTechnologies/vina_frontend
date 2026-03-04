import {
    getAuth,
    signInWithPopup,
    GoogleAuthProvider,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    UserCredential,
} from "firebase/auth";
import { firebaseApp } from "./config";

const auth = getAuth(firebaseApp);

/**
 * Sign in with Google (popup flow).
 * Returns the Firebase ID token to exchange with the Vina backend.
 */
export async function signInWithGoogle(): Promise<string> {
    const provider = new GoogleAuthProvider();
    provider.addScope("email");
    provider.addScope("profile");
    const result: UserCredential = await signInWithPopup(auth, provider);
    return result.user.getIdToken();
}

/**
 * Register a new user with email + password via Firebase.
 * Returns the Firebase ID token to exchange with the Vina backend.
 */
export async function registerWithEmail(email: string, password: string): Promise<string> {
    const result: UserCredential = await createUserWithEmailAndPassword(auth, email, password);
    return result.user.getIdToken();
}

/**
 * Sign in an existing user with email + password via Firebase.
 * Returns the Firebase ID token to exchange with the Vina backend.
 */
export async function loginWithEmail(email: string, password: string): Promise<string> {
    const result: UserCredential = await signInWithEmailAndPassword(auth, email, password);
    return result.user.getIdToken();
}

/**
 * Sign out from Firebase (clears Firebase session).
 * The Vina backend JWT is cleared separately via UserContext.logout().
 */
export async function signOutFromFirebase(): Promise<void> {
    await signOut(auth);
}
